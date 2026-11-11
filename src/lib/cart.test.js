import assert from 'node:assert/strict'
import test from 'node:test'
import { products } from '../data/products.js'
import { getCartRestoreWarning, resolveCartItems, restoreSavedCart } from './cart.js'

const productA = products[0]
const productB = products[1]

test('agrupa las líneas repetidas y conserva una cantidad total de hasta 99', () => {
  const restored = restoreSavedCart([
    { id: productA.id, qty: 60 },
    { id: productA.id, qty: 39 },
  ])

  assert.deepEqual(restored.cart, [{ id: productA.id, qty: 99 }])
  assert.deepEqual(restored.rejectedProducts, [])
  assert.equal(getCartRestoreWarning(restored.rejectedProducts), '')
  assert.deepEqual(resolveCartItems(restored.cart), [{ ...productA, qty: 99 }])
})

test('rechaza todas las líneas cuyo total excede 99 y conserva los otros productos', () => {
  const restored = restoreSavedCart([
    { id: productA.id, qty: 60 },
    { id: productA.id, qty: 40 },
    { id: productB.id, qty: 1 },
  ])

  assert.deepEqual(restored.cart, [{ id: productB.id, qty: 1 }])
  assert.deepEqual(restored.rejectedProducts.map(({ id }) => id), [productA.id])
  assert.equal(
    getCartRestoreWarning(restored.rejectedProducts),
    `Se rechazó ${productA.name} (ID ${productA.id}): el límite es de 99 unidades por producto.`,
  )
  assert.deepEqual(resolveCartItems(restored.cart), [{ ...productB, qty: 1 }])
})
