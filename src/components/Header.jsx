import { useState } from 'react'
import { imageUrl } from '../data/products.js'

const navigation = [
  ['Inicio', '/inicio'],
  ['Productos', '/productos'],
  ['Nosotros', '/nosotros'],
  ['Elige mejor', '/elige-mejor'],
  ['Contacto', '/contacto'],
]

export default function Header({ cartCount, onOpenCart, currentPath }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <a
        className="skip"
        href="#contenido"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('contenido')?.focus()
        }}
      >Saltar al contenido</a>
      <header>
        <a className="brand" href="#/inicio" onClick={closeMenu}>
          <img src={imageUrl('logo-página.png')} alt="" />
          <span>Pet<span>Cocha</span><small>Su bienestar, nuestra alegría</small></span>
        </a>
        <button
          id="menu"
          type="button"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? '×' : '☰'}
        </button>
        <nav id="main-nav" className={menuOpen ? 'open' : ''} aria-label="Principal">
          {navigation.map(([label, path]) => (
            <a
              href={`#${path}`}
              onClick={closeMenu}
              aria-current={currentPath === path ? 'page' : undefined}
              key={path}
            >{label}</a>
          ))}
        </nav>
        <button type="button" className="cart-button" onClick={onOpenCart}>
          Carrito <span id="cart-count">{cartCount}</span>
        </button>
      </header>
    </>
  )
}
