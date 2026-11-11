import { products } from '../data/products.js'

export function restoreSavedCart(saved, catalog = products) {
  if (!Array.isArray(saved)) return { cart: [], rejectedProducts: [] }

  const quantities = new Map()
  saved.forEach((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return
    const product = catalog.find((candidate) => candidate.id === item.id)
    if (!product || !Number.isInteger(item.qty) || item.qty <= 0) return
    quantities.set(product.id, (quantities.get(product.id) || 0) + item.qty)
  })

  const cart = []
  const rejectedProducts = []
  quantities.forEach((qty, id) => {
    const product = catalog.find((candidate) => candidate.id === id)
    if (qty > 99) {
      rejectedProducts.push(product)
    } else {
      cart.push({ id, qty })
    }
  })

  return { cart, rejectedProducts }
}

export function resolveCartItems(cart, catalog = products) {
  return cart
    .map((item) => {
      const product = catalog.find((candidate) => candidate.id === item.id)
      return product ? { ...product, qty: item.qty } : null
    })
    .filter(Boolean)
}

export function getCartRestoreWarning(rejectedProducts) {
  if (!rejectedProducts.length) return ''
  const rejectedNames = rejectedProducts
    .map(({ id, name }) => `${name} (ID ${id})`)
    .join(', ')
  return `Se rechazó ${rejectedNames}: el límite es de 99 unidades por producto.`
}
