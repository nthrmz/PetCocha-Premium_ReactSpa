import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import ProductCatalog from './components/ProductCatalog.jsx'
import { CartDialog, CompareDialog, ConfirmationDialog } from './components/Dialogs.jsx'
import {
  AboutSection,
  CategorySection,
  ContactSection,
  Footer,
  GuideSection,
  HeroSection,
  PromoSection,
} from './components/ContentSections.jsx'
import { products } from './data/products.js'
import './petcocha.css'

const CART_STORAGE_KEY = 'petcocha-premium-cart-v1'
const ROUTE_CATEGORIES = ['Todos', 'Alimentos', 'Juguetes', 'Accesorios', 'Higiene']

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
    if (!Array.isArray(saved)) return []
    return saved
      .filter((item) => products.some((product) => product.id === item.id)
        && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 99)
      .map(({ id, qty }) => ({ id, qty }))
  } catch (error) {
    console.error('No se pudo leer el carrito guardado.', error)
    return []
  }
}

function HeartCursor() {
  const cursorRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const finePointer = window.matchMedia('(pointer:fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)')
    if (!finePointer.matches || reducedMotion.matches) return undefined

    let x = 0
    let y = 0
    let cursorX = 0
    let cursorY = 0
    let animationFrame
    const move = (event) => {
      x = event.clientX
      y = event.clientY
      cursor.style.opacity = '1'
      cursor.classList.toggle('hover', Boolean(event.target.closest('a,button,input,select,textarea,summary')))
    }
    const leave = () => { cursor.style.opacity = '0' }
    const animate = () => {
      cursorX += (x - cursorX) * 0.18
      cursorY += (y - cursorY) * 0.18
      cursor.style.transform = `translate(${cursorX - 15}px,${cursorY - 15}px)`
      animationFrame = window.requestAnimationFrame(animate)
    }

    document.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    animationFrame = window.requestAnimationFrame(animate)
    return () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <div className="cursor" aria-hidden="true" ref={cursorRef}>♡</div>
}

function App() {
  const [location, setLocation] = useState(readLocation)
  const [cart, setCart] = useState(readSavedCart)
  const [category, setCategory] = useState(() => readProductFilters(readLocation()).category)
  const [search, setSearch] = useState('')
  const [animal, setAnimal] = useState(() => readProductFilters(readLocation()).animal)
  const [sort, setSort] = useState('default')
  const [limit, setLimit] = useState(12)
  const [comparison, setComparison] = useState([])
  const [toast, setToast] = useState('')
  const [guideMessage, setGuideMessage] = useState('La orientación no sustituye la evaluación de un veterinario.')
  const [formReason, setFormReason] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [request, setRequest] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [requestCode, setRequestCode] = useState('')
  const cartDialogRef = useRef(null)
  const compareDialogRef = useRef(null)
  const confirmationDialogRef = useRef(null)
  const toastTimeout = useRef(null)

  const cartItems = useMemo(() => cart.map((entry) => ({
    ...products.find((product) => product.id === entry.id),
    qty: entry.qty,
  })), [cart])
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])
  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0), [cartItems])
  const comparedProducts = useMemo(
    () => comparison.map((id) => products.find((product) => product.id === id)).filter(Boolean),
    [comparison],
  )
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    const matches = products.filter((product) => (
      (category === 'Todos' || product.category === category)
      && (!animal || product.animal.includes(animal))
      && `${product.name} ${product.category} ${product.animal}`.toLocaleLowerCase().includes(term)
    ))
    if (sort === 'low') matches.sort((first, second) => first.price - second.price)
    if (sort === 'high') matches.sort((first, second) => second.price - first.price)
    return matches
  }, [animal, category, search, sort])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('No se pudo guardar el carrito en este navegador.', error)
    }
  }, [cart])

  useEffect(() => () => window.clearTimeout(toastTimeout.current), [])

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

  const openCart = useCallback(() => {
    if (!cartDialogRef.current?.open) cartDialogRef.current?.showModal()
  }, [])

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
    setCart((current) => {
      const existing = current.find((item) => item.id === id)
      if (existing) {
        return current.map((item) => item.id === id ? { ...item, qty: Math.min(99, item.qty + 1) } : item)
      }
      return [...current, { id, qty: 1 }]
    })
    showToast('Producto añadido a tu carrito')
  }, [showToast])

  const changeQuantity = (id, delta) => {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, qty: Math.min(99, item.qty + delta) } : item)
      .filter((item) => item.qty > 0))
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
    if (data.reason === 'Realizar pedido' && cartCount === 0) {
      showToast('Añade un producto al carrito para realizar un pedido.')
      return
    }
    setRequest({
      ...data,
      name: data.name.trim(),
      message: data.message.trim(),
      items: cartItems,
      total: cartTotal,
    })
    setConfirmed(false)
    setRequestCode('')
    confirmationDialogRef.current?.showModal()
  }

  const prepareRequest = () => {
    const code = `PC-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    setRequestCode(code)
    setConfirmed(true)
    if (request?.reason === 'Realizar pedido') setCart([])
    document.getElementById('contact-form')?.reset()
    setFormReason('')
    setFormMessage('')
  }

  const handleConfirmationClose = () => {
    setRequest(null)
    setConfirmed(false)
    setRequestCode('')
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
        comparison={comparison}
        onCategoryChange={handleFilterChange(setCategory)}
        onSearchChange={handleSearchChange}
        onAnimalChange={handleFilterChange(setAnimal)}
        onSortChange={handleFilterChange(setSort)}
        onLoadMore={() => setLimit((current) => current + 12)}
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
        {pageViews[location.pathname] || (
          <section className="section not-found">
            <p className="eyebrow">404 · PÁGINA NO ENCONTRADA</p>
            <h1>No encontramos este lugar.</h1>
            <p>Puede que el enlace haya cambiado o que la dirección no sea correcta.</p>
            <a className="button coral" href="#/inicio">Volver al inicio</a>
          </section>
        )}
      </main>
      <Footer onOpenCart={openCart} onChooseCategory={chooseCategory} />
      <CartDialog
        dialogRef={cartDialogRef}
        items={cartItems}
        total={cartTotal}
        onChangeQuantity={changeQuantity}
        onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))}
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
        code={requestCode}
        onConfirm={prepareRequest}
        onClose={() => confirmationDialogRef.current?.close()}
        onDialogClose={handleConfirmationClose}
      />
      <div id="compare-bar" className="compare-bar" aria-label="Productos seleccionados para comparar" hidden={comparison.length === 0}>
        <span id="compare-count" aria-live="polite">{comparison.length} de 3 productos seleccionados</span>
        <button
          id="show-comparison"
          className="button coral"
          type="button"
          disabled={comparison.length < 2}
          onClick={() => {
            if (comparison.length >= 2 && !compareDialogRef.current?.open) compareDialogRef.current?.showModal()
          }}
        >Comparar selección</button>
        <button id="clear-comparison" className="compare-clear" type="button" onClick={clearComparison}>Limpiar</button>
      </div>
      <CompareDialog
        dialogRef={compareDialogRef}
        products={comparedProducts}
        onRemove={toggleComparison}
        onAdd={addToCart}
        onClose={() => compareDialogRef.current?.close()}
      />
      <div id="toast" role="status" className={toast ? 'show' : ''}>{toast}</div>
    </>
  )
}

export default App
