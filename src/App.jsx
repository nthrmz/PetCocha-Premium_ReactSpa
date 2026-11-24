import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import ProductCatalog from './components/ProductCatalog.jsx'
import ComparisonBar from './components/ComparisonBar.jsx'
import { CartDialog, CompareDialog, ConfirmationDialog } from './components/Dialogs.jsx'
import HeartCursor from './components/HeartCursor.jsx'
import NotFoundPage from './components/NotFoundPage.jsx'
import Toast from './components/Toast.jsx'
import {
  AboutSection,
  CategorySection,
  ContactSection,
  Footer,
  GuideSection,
  HeroSection,
  PromoSection,
} from './components/ContentSections.jsx'
import {
  getCartRestoreWarning,
  resolveCartItems,
  restoreSavedCart,
  shouldImportLegacyCart,
} from './lib/cart.js'
import { isSupabaseConfigured, supabase } from './lib/supabase.js'
import { products as localProducts } from './data/products.js'
import './petcocha.css'

const CART_STORAGE_KEY = 'petcocha-premium-cart-v1'
const CART_IMPORT_KEY_PREFIX = `${CART_STORAGE_KEY}:import-pending:`
const CART_ITEM_SELECT = 'product_id, quantity, product:products!cart_items_product_id_fkey(id, name, category, animal, price, image)'
const ROUTE_CATEGORIES = ['Todos', 'Alimentos', 'Juguetes', 'Accesorios', 'Higiene']
const EMPTY_PRODUCTS = []
let anonymousSignInPromise

async function getAuthenticatedUser() {
  if (!supabase) throw new Error('Configura Supabase para habilitar el carrito sincronizado.')
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (sessionData.session?.user) return sessionData.session.user

  if (!anonymousSignInPromise) {
    anonymousSignInPromise = supabase.auth.signInAnonymously()
  }
  const signInPromise = anonymousSignInPromise
  try {
    const { data, error } = await signInPromise
    if (error) throw error
    if (!data.user) throw new Error('Supabase Auth no devolvió un usuario para el carrito.')
    return data.user
  } finally {
    if (anonymousSignInPromise === signInPromise) anonymousSignInPromise = null
  }
}

function cartImportKey(userId) {
  return `${CART_IMPORT_KEY_PREFIX}${userId}`
}

function normalizeCartItem(row) {
  if (!row.product) {
    throw new Error(`El producto ${row.product_id} ya no está disponible en el catálogo.`)
  }
  return {
    id: Number(row.product_id),
    qty: row.quantity,
    product: {
      ...row.product,
      id: Number(row.product.id),
      price: Number(row.product.price),
    },
  }
}

async function loadCartItems(cartId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select(CART_ITEM_SELECT)
    .eq('cart_id', cartId)
    .order('product_id')

  if (error) throw error
  return data.map(normalizeCartItem)
}

async function findOrCreateCart(userId, beforeCreate) {
  const { data: existingCart, error: findError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (findError) throw findError
  if (existingCart) return { cart: existingCart, created: false }

  beforeCreate()
  const { data: newCart, error: createError } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (!createError) return { cart: newCart, created: true }
  if (createError.code !== '23505') throw createError

  const { data: racedCart, error: raceError } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (raceError) throw raceError
  return { cart: racedCart, created: false }
}

function getCartErrorMessage(error) {
  const detail = error instanceof Error ? error.message : String(error)
  if (/anonymous sign-ins? (are )?disabled/i.test(detail)) {
    return `La sesión anónima está deshabilitada. Actívala en Supabase Dashboard → Authentication → Sign In / Providers → Anonymous Sign-Ins. Detalle: ${detail}`
  }
  return `No se pudo sincronizar el carrito con Supabase. Detalle: ${detail || 'Error desconocido.'}`
}

function readLocation() {
  const hash = window.location.hash
  const legacyRoutes = {
    '#inicio': '/inicio',
    '#productos': '/productos',
    '#nosotros': '/nosotros',
    '#guia': '/elige-mejor',
    '#contacto': '/contacto',
  }
  const destination = hash.startsWith('#/') ? hash.slice(1) : legacyRoutes[hash] || '/inicio'
  const parsed = new URL(destination, window.location.origin)
  return { pathname: parsed.pathname === '/' ? '/inicio' : parsed.pathname, search: parsed.search }
}

function readProductFilters(location) {
  const params = new URLSearchParams(location.search)
  const requestedCategory = params.get('categoria') || 'Todos'
  const requestedAnimal = params.get('animal') || ''
  return {
    category: ROUTE_CATEGORIES.includes(requestedCategory) ? requestedCategory : 'Todos',
    animal: ['Perros', 'Gatos'].includes(requestedAnimal) ? requestedAnimal : '',
  }
}

function readSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
    return restoreSavedCart(saved)
  } catch (error) {
    console.error('No se pudo leer el carrito guardado.', error)
    return { cart: [], rejectedProducts: [] }
  }
}

function App() {
  const [location, setLocation] = useState(readLocation)
  const [savedCart] = useState(readSavedCart)
  const [cart, setCart] = useState([])
  const [cartRetry, setCartRetry] = useState(0)
  const [cartResult, setCartResult] = useState(null)
  const [cartMutationStatus, setCartMutationStatus] = useState('')
  const [cartMutationError, setCartMutationError] = useState('')
  const [category, setCategory] = useState(() => readProductFilters(readLocation()).category)
  const [search, setSearch] = useState('')
  const [animal, setAnimal] = useState(() => readProductFilters(readLocation()).animal)
  const [sort, setSort] = useState('default')
  const [limit, setLimit] = useState(12)
  const [catalogRetry, setCatalogRetry] = useState(0)
  const [catalogResult, setCatalogResult] = useState(null)
  const [comparison, setComparison] = useState([])
  const [toast, setToast] = useState(() => getCartRestoreWarning(savedCart.rejectedProducts))
  const [guideMessage, setGuideMessage] = useState('La orientación no sustituye la evaluación de un veterinario.')
  const [formReason, setFormReason] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSubmitError, setContactSubmitError] = useState('')
  const [request, setRequest] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const cartDialogRef = useRef(null)
  const compareDialogRef = useRef(null)
  const confirmationDialogRef = useRef(null)
  const toastTimeout = useRef(null)
  const contactSubmittingRef = useRef(false)
  const cartIdRef = useRef('')
  const cartRef = useRef([])
  const cartWriteQueue = useRef(Promise.resolve())

  const cartRequestKey = String(cartRetry)
  const currentCartResult = cartResult?.key === cartRequestKey ? cartResult : null
  const cartId = currentCartResult?.cartId ?? ''
  const cartReady = Boolean(cartId)
  const cartStatus = currentCartResult?.status === 'error'
    ? 'error'
    : cartMutationStatus || currentCartResult?.status || 'loading'
  const cartError = currentCartResult?.status === 'error'
    ? currentCartResult.error
    : cartMutationError
  const catalogRequestKey = `${location.pathname}:${catalogRetry}`
  const currentCatalogResult = catalogResult?.key === catalogRequestKey ? catalogResult : null
  const catalogProducts = currentCatalogResult ? currentCatalogResult.products : EMPTY_PRODUCTS
  const catalogError = currentCatalogResult?.error ?? ''
  const catalogStatus = location.pathname !== '/productos'
    ? 'idle'
    : currentCatalogResult?.status ?? 'loading'

  const cartItems = useMemo(
    () => cart.map(({ id, qty, product }) => ({ ...product, id, qty })),
    [cart],
  )
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0), [cartItems])
  const comparedProducts = useMemo(
    () => comparison.map((id) => catalogProducts.find((product) => product.id === id)).filter(Boolean),
    [catalogProducts, comparison],
  )
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    const matches = catalogProducts.filter((product) => (
      (category === 'Todos' || product.category === category)
      && (!animal || product.animal.includes(animal))
      && `${product.name} ${product.category} ${product.animal}`.toLocaleLowerCase().includes(term)
    ))
    if (sort === 'low') matches.sort((first, second) => first.price - second.price)
    if (sort === 'high') matches.sort((first, second) => second.price - first.price)
    return matches
  }, [animal, catalogProducts, category, search, sort])

  useEffect(() => {
    if (savedCart.rejectedProducts.length) {
      toastTimeout.current = window.setTimeout(() => setToast(''), 2400)
    }
    return () => window.clearTimeout(toastTimeout.current)
  }, [savedCart])

  useEffect(() => {
    if (location.pathname !== '/productos') return undefined

    let active = true

    const loadCatalog = async () => {
      if (!isSupabaseConfigured) {
        setCatalogResult({ key: catalogRequestKey, status: 'local', products: localProducts, error: '' })
        return
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, category, animal, price, image')
          .order('id')

        if (error) throw error
        if (!active) return

        setCatalogResult({
          key: catalogRequestKey,
          status: 'success',
          products: data.map((product) => ({
            ...product,
            id: Number(product.id),
            price: Number(product.price),
          })),
          error: '',
        })
      } catch (error) {
        if (!active) return
        console.error('No se pudo cargar el catálogo desde Supabase.', error)
        setCatalogResult({
          key: catalogRequestKey,
          status: 'error',
          products: [],
          error: error instanceof Error && error.message
            ? error.message
            : String(error) || 'Error desconocido al consultar Supabase.',
        })
      }
    }

    loadCatalog()
    return () => {
      active = false
    }
  }, [catalogRequestKey, location.pathname])

  useEffect(() => {
    const handleHashChange = () => {
      const nextLocation = readLocation()
      setLocation(nextLocation)
      if (nextLocation.pathname === '/productos') {
        const filters = readProductFilters(nextLocation)
        setCategory(filters.category)
        setAnimal(filters.animal)
        setSearch('')
        setLimit(12)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const titles = {
      '/inicio': 'Inicio',
      '/productos': 'Productos',
      '/nosotros': 'Nosotros',
      '/elige-mejor': 'Elige mejor',
      '/contacto': 'Contacto',
    }
    document.title = titles[location.pathname]
      ? `PetCocha · ${titles[location.pathname]}`
      : 'PetCocha · Página no encontrada'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname, location.search])

  useEffect(() => {
    if (comparison.length < 2 && compareDialogRef.current?.open) {
      compareDialogRef.current.close()
    }
  }, [comparison])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)')
    if (!('IntersectionObserver' in window) || reducedMotion.matches) return undefined
    const elements = document.querySelectorAll('.section-head,.about>div,.guide>div,.promo>div,.contact>div,.form-card')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08 })
    elements.forEach((element) => {
      element.classList.add('reveal')
      observer.observe(element)
    })
    return () => observer.disconnect()
  }, [location.pathname])

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(toastTimeout.current)
    toastTimeout.current = window.setTimeout(() => setToast(''), 2400)
  }, [])

  useEffect(() => {
    let active = true

    const loadUserCart = async () => {
      if (!isSupabaseConfigured) {
        const localItems = resolveCartItems(savedCart.cart).map(({ id, qty, ...product }) => ({
          id,
          qty,
          product,
        }))
        cartIdRef.current = 'local'
        cartRef.current = localItems
        setCart(localItems)
        setCartResult({ key: cartRequestKey, status: 'local', cartId: 'local', error: '' })
        return
      }

      try {
        const user = await getAuthenticatedUser()

        const importKey = cartImportKey(user.id)
        const { cart: remoteCart, created } = await findOrCreateCart(user.id, () => {
          if (savedCart.cart.length) localStorage.setItem(importKey, 'true')
        })
        let remoteItems = await loadCartItems(remoteCart.id)
        const importPending = localStorage.getItem(importKey) === 'true'

        if (savedCart.cart.length > 0 && shouldImportLegacyCart({
          remoteCartExists: !created,
          remoteItemCount: remoteItems.length,
          pendingImport: importPending,
        })) {
          const { error } = await supabase
            .from('cart_items')
            .upsert(
              savedCart.cart.map(({ id, qty }) => ({
                cart_id: remoteCart.id,
                product_id: id,
                quantity: qty,
              })),
              { onConflict: 'cart_id,product_id', ignoreDuplicates: true },
            )
          if (error) throw error
          remoteItems = await loadCartItems(remoteCart.id)
        }

        if (!active) return
        if (savedCart.cart.length && remoteItems.length && !created && !importPending) {
          showToast('Se conservó el carrito remoto; el carrito local no se importó para evitar sobrescribirlo.')
        }
        cartIdRef.current = remoteCart.id
        cartRef.current = remoteItems
        setCart(remoteItems)
        setCartResult({ key: cartRequestKey, status: 'ready', cartId: remoteCart.id, error: '' })
        setCartMutationStatus('')
        setCartMutationError('')

        try {
          localStorage.removeItem(CART_STORAGE_KEY)
          localStorage.removeItem(importKey)
        } catch (error) {
          console.error('No se pudo limpiar el respaldo local del carrito.', error)
        }
      } catch (error) {
        if (!active) return
        console.error('No se pudo cargar el carrito desde Supabase.', error)
        const localItems = resolveCartItems(savedCart.cart).map(({ id, qty, ...product }) => ({
          id,
          qty,
          product,
        }))
        cartIdRef.current = ''
        cartRef.current = localItems
        setCart(localItems)
        setCartResult({
          key: cartRequestKey,
          status: 'error',
          cartId: '',
          error: getCartErrorMessage(error),
        })
        showToast('No se pudo conectar el carrito con Supabase. Revisa el aviso en el carrito.')
      }
    }

    loadUserCart()
    return () => {
      active = false
    }
  }, [cartRequestKey, savedCart, showToast])

  const enqueueCartMutation = useCallback((mutate) => {
    const operation = cartWriteQueue.current.then(async () => {
      const remoteCartId = cartIdRef.current
      if (!remoteCartId) throw new Error('El carrito de Supabase todavía no está disponible.')

      setCartMutationStatus('saving')
      setCartMutationError('')
      const nextCart = await mutate(cartRef.current, remoteCartId)
      if (remoteCartId === 'local') {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart.map(({ id, qty }) => ({ id, qty }))))
      }
      cartRef.current = nextCart
      setCart(nextCart)
      setCartMutationStatus(remoteCartId === 'local' ? 'local' : 'ready')
      return true
    })

    cartWriteQueue.current = operation.catch((error) => {
      console.error('No se pudo guardar el carrito en Supabase.', error)
      setCartMutationError(getCartErrorMessage(error))
      setCartMutationStatus('error')
      showToast('No se pudo guardar el carrito en Supabase. Revisa el aviso en el carrito.')
      return false
    })
    return cartWriteQueue.current
  }, [showToast])

  const refreshCart = useCallback(async () => {
    await cartWriteQueue.current
    const remoteCartId = cartIdRef.current
    if (!remoteCartId) return false
    if (remoteCartId === 'local') {
      setCart([...cartRef.current])
      return true
    }

    setCartMutationStatus('saving')
    setCartMutationError('')
    try {
      const remoteItems = await loadCartItems(remoteCartId)
      if (cartIdRef.current !== remoteCartId) return false
      cartRef.current = remoteItems
      setCart(remoteItems)
      setCartMutationStatus('ready')
      return true
    } catch (error) {
      console.error('No se pudo actualizar el carrito desde Supabase.', error)
      setCartMutationError(getCartErrorMessage(error))
      setCartMutationStatus('error')
      showToast('No se pudo actualizar el carrito. Revisa el aviso en el carrito.')
      return false
    }
  }, [showToast])

  const openCart = useCallback(() => {
    if (!cartDialogRef.current?.open) cartDialogRef.current?.showModal()
    refreshCart()
  }, [refreshCart])

  const navigate = useCallback((destination) => {
    const nextHash = `#${destination}`
    if (window.location.hash === nextHash) {
      setLocation(readLocation())
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      window.location.hash = destination
    }
  }, [])

  const chooseCategory = useCallback((nextCategory) => {
    const selectedCategory = ROUTE_CATEGORIES.includes(nextCategory) ? nextCategory : 'Todos'
    setCategory(selectedCategory)
    setSearch('')
    setAnimal('')
    setLimit(12)
    navigate(selectedCategory === 'Todos'
      ? '/productos'
      : `/productos?categoria=${encodeURIComponent(selectedCategory)}`)
  }, [navigate])

  const addToCart = useCallback((id) => {
    return enqueueCartMutation(async (current, remoteCartId) => {
      const existing = current.find((item) => item.id === id)
      if (existing?.qty >= 99) {
        showToast('El máximo permitido por producto es 99 unidades.')
        return current
      }

      if (remoteCartId === 'local') {
        const product = localProducts.find((item) => item.id === id)
        if (!product) return current
        showToast('Producto aÃ±adido al carrito de este dispositivo')
        return existing
          ? current.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item)
          : [...current, { id, qty: 1, product }]
      }

      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          { cart_id: remoteCartId, product_id: id, quantity: (existing?.qty || 0) + 1 },
          { onConflict: 'cart_id,product_id' },
        )
        .select(CART_ITEM_SELECT)
        .single()
      if (error) throw error

      const savedItem = normalizeCartItem(data)
      showToast('Producto añadido a tu carrito')
      return existing
        ? current.map((item) => item.id === id ? savedItem : item)
        : [...current, savedItem]
    })
  }, [enqueueCartMutation, showToast])

  const changeQuantity = (id, delta) => {
    return enqueueCartMutation(async (current, remoteCartId) => {
      const existing = current.find((item) => item.id === id)
      if (!existing) return current

      const quantity = Math.min(99, existing.qty + delta)
      if (quantity === existing.qty) return current
      if (quantity === 0) {
        if (remoteCartId === 'local') return current.filter((item) => item.id !== id)
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', remoteCartId)
          .eq('product_id', id)
        if (error) throw error
        return current.filter((item) => item.id !== id)
      }

      if (remoteCartId === 'local') {
        return current.map((item) => item.id === id ? { ...item, qty: quantity } : item)
      }

      const { data, error } = await supabase
        .from('cart_items')
        .upsert(
          { cart_id: remoteCartId, product_id: id, quantity },
          { onConflict: 'cart_id,product_id' },
        )
        .select(CART_ITEM_SELECT)
        .single()
      if (error) throw error
      const savedItem = normalizeCartItem(data)
      return current.map((item) => item.id === id ? savedItem : item)
    })
  }

  const removeFromCart = (id) => enqueueCartMutation(async (current, remoteCartId) => {
    if (remoteCartId === 'local') return current.filter((item) => item.id !== id)
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', remoteCartId)
      .eq('product_id', id)
    if (error) throw error
    return current.filter((item) => item.id !== id)
  })

  const clearCart = () => enqueueCartMutation(async (current, remoteCartId) => {
    if (!current.length) return current
    if (remoteCartId === 'local') {
      showToast('Carrito vacÃ­o; cambios guardados en este dispositivo.')
      return []
    }
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', remoteCartId)
    if (error) throw error
    showToast('Carrito vacío; cambios guardados en Supabase.')
    return []
  })

  const retryCart = () => {
    cartIdRef.current = ''
    cartRef.current = []
    setCart([])
    setCartMutationStatus('')
    setCartMutationError('')
    setCartRetry((current) => current + 1)
  }

  const toggleComparison = (id) => {
    setComparison((current) => {
      if (current.includes(id)) return current.filter((itemId) => itemId !== id)
      if (current.length >= 3) {
        showToast('Puedes comparar hasta 3 productos. Quita uno para elegir otro.')
        return current
      }
      return [...current, id]
    })
  }

  const handleGuideSubmit = (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const pet = form.get('pet')
    const stage = form.get('stage')
    setCategory('Alimentos')
    setAnimal(pet)
    setSearch('')
    setLimit(12)
    setGuideMessage(`Mostramos alimentos para ${pet.toLowerCase()}. Confirma que el envase sea adecuado para la etapa ${stage.toLowerCase()} con el proveedor o veterinario.`)
    navigate(`/productos?categoria=Alimentos&animal=${encodeURIComponent(pet)}`)
  }

  const handleContactSubmit = (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (data.name.trim().length < 2 || data.message.trim().length < 10) {
      showToast('Completa tu nombre y una consulta de al menos 10 caracteres.')
      return
    }
    setRequest({
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim() || null,
      reason: data.reason,
      message: data.message.trim(),
      consent: data.consent === 'on',
      items: cartItems,
      total: cartTotal,
    })
    setConfirmed(false)
    setContactSubmitError('')
    confirmationDialogRef.current?.showModal()
  }

  const sendContactRequest = async () => {
    if (!request || contactSubmittingRef.current) return

    contactSubmittingRef.current = true
    setContactSubmitting(true)
    setContactSubmitError('')
    try {
      if (!supabase) throw new Error('Configura Supabase para enviar consultas desde la página publicada.')
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          request_type: request.reason === 'Realizar pedido' ? 'Pedido' : 'Consulta',
          name: request.name,
          phone: request.phone,
          email: request.email,
          reason: request.reason,
          message: request.message,
          consent: request.consent,
          cart_items: request.items.map((item) => ({
            product_id: item.id,
            name: item.name,
            quantity: item.qty,
            unit_price: item.price,
          })),
          cart_total: request.total,
        })

      if (error) throw error

      if (request.reason === 'Realizar pedido' && request.items.length > 0 && !await clearCart()) {
        setContactSubmitError('La solicitud se guardó, pero no se pudo vaciar el carrito. Revisa el estado de sincronización del carrito.')
      }

      setConfirmed(true)
      document.getElementById('contact-form')?.reset()
      setFormReason('')
      setFormMessage('')
    } catch (error) {
      console.error('No se pudo guardar el mensaje de contacto en Supabase.', error)
      const detail = error instanceof Error && error.message ? error.message : String(error)
      setContactSubmitError(`No se pudo enviar la solicitud. Tus datos siguen en el formulario para que puedas reintentar. Detalle: ${detail || 'Error desconocido.'}`)
    } finally {
      contactSubmittingRef.current = false
      setContactSubmitting(false)
    }
  }

  const handleConfirmationClose = () => {
    setRequest(null)
    setConfirmed(false)
    setContactSubmitError('')
  }

  const clearComparison = () => {
    setComparison([])
    if (compareDialogRef.current?.open) compareDialogRef.current.close()
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setLimit(12)
  }

  const handleFilterChange = (setter) => (value) => {
    setter(value)
    setLimit(12)
  }

  const pageViews = {
    '/inicio': (
      <>
        <HeroSection />
        <CategorySection onChooseCategory={chooseCategory} />
        <PromoSection onChooseCategory={chooseCategory} />
      </>
    ),
    '/productos': (
      <ProductCatalog
        products={filteredProducts}
        category={category}
        search={search}
        animal={animal}
        sort={sort}
        limit={limit}
        catalogStatus={catalogStatus}
        catalogError={catalogError}
        cartReady={cartReady}
        cartStatus={cartStatus}
        cartError={cartError}
        comparison={comparison}
        onCategoryChange={handleFilterChange(setCategory)}
        onSearchChange={handleSearchChange}
        onAnimalChange={handleFilterChange(setAnimal)}
        onSortChange={handleFilterChange(setSort)}
        onLoadMore={() => setLimit((current) => current + 12)}
        onRetryCatalog={() => setCatalogRetry((current) => current + 1)}
        onRetryCart={retryCart}
        onAdd={addToCart}
        onToggleCompare={toggleComparison}
      />
    ),
    '/nosotros': <AboutSection />,
    '/elige-mejor': <GuideSection message={guideMessage} onSubmit={handleGuideSubmit} />,
    '/contacto': (
      <ContactSection
        cartItems={cartItems}
        cartTotal={cartTotal}
        onEditCart={openCart}
        onSubmit={handleContactSubmit}
        formReason={formReason}
        onReasonChange={setFormReason}
        formMessage={formMessage}
        onMessageChange={setFormMessage}
      />
    ),
  }

  return (
    <>
      <HeartCursor />
      <Header key={location.pathname} cartCount={cartCount} onOpenCart={openCart} currentPath={location.pathname} />
      <main id="contenido" tabIndex={-1}>
        {pageViews[location.pathname] || <NotFoundPage />}
      </main>
      <Footer onOpenCart={openCart} onChooseCategory={chooseCategory} />
      <CartDialog
        dialogRef={cartDialogRef}
        items={cartItems}
        total={cartTotal}
        cartReady={cartReady}
        cartStatus={cartStatus}
        cartError={cartError}
        onRetry={retryCart}
        onChangeQuantity={changeQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={() => {
          cartDialogRef.current?.close()
          setFormReason('Realizar pedido')
          setFormMessage((current) => current || 'Quisiera consultar la disponibilidad de los productos de mi carrito.')
          navigate('/contacto')
        }}
        onClose={() => cartDialogRef.current?.close()}
      />
      <ConfirmationDialog
        dialogRef={confirmationDialogRef}
        request={request}
        confirmed={confirmed}
        submitting={contactSubmitting}
        submitError={contactSubmitError}
        cartError={cartError}
        onConfirm={sendContactRequest}
        onClose={() => confirmationDialogRef.current?.close()}
        onDialogClose={handleConfirmationClose}
      />
      <ComparisonBar
        count={comparison.length}
        onOpen={() => {
          if (comparison.length >= 2 && !compareDialogRef.current?.open) compareDialogRef.current?.showModal()
        }}
        onClear={clearComparison}
      />
      <CompareDialog
        dialogRef={compareDialogRef}
        products={comparedProducts}
        cartReady={cartReady}
        onRemove={toggleComparison}
        onAdd={addToCart}
        onClose={() => compareDialogRef.current?.close()}
      />
      <Toast message={toast} />
    </>
  )
}

export default App
