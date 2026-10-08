import { imageUrl, money } from '../data/products.js'

const categories = [
  ['Alimentos', 'Nutrición para cada día', 'comidapremium-perro.avif'],
  ['Juguetes', 'Curiosidad en movimiento', 'juguete1-gato.jpg'],
  ['Accesorios', 'Paseo, descanso y compañía', 'conjunto de correa-verde.jpg'],
  ['Higiene', 'Pequeños rituales de cuidado', 'limpiapatita-perro.jpg'],
]

export function HeroSection() {
  return (
    <>
      <section id="inicio" className="hero">
        <div className="hero-copy">
          <p className="eyebrow">PEQUEÑOS COMPAÑEROS. GRANDES ALEGRÍAS.</p>
          <h1>Todo para su<br />vida contigo<span>.</span></h1>
          <p>Alimento, juego y cuidado para acompañar cada etapa de tu mascota.</p>
          <div className="actions">
            <a className="button coral" href="#/productos">Explorar productos ↗</a>
            <a className="text-link" href="#/elige-mejor">Ayúdame a elegir →</a>
          </div>
          <div className="hero-note">
            <span className="paw">♡</span>
            <span>Un mundo pensado<br /><strong>para perros y gatos</strong></span>
          </div>
        </div>
        <img src={imageUrl('portadaprincipal-perro.avif')} alt="Perro sobre un fondo azul" fetchPriority="high" />
        <div className="hero-label">Más momentos juntos.</div>
      </section>
      <div className="benefits">
        <span>♡ Cuidado con cariño</span><span>◇ Precios en bolivianos</span><span>↗ Consulta personalizada</span>
      </div>
    </>
  )
}

export function CategorySection({ onChooseCategory }) {
  return (
    <section className="section categories">
      <div className="section-head">
        <div><p className="eyebrow">SU MUNDO, EN CUATRO CATEGORÍAS</p><h2>¿Qué necesita hoy?</h2></div>
        <p>Desde su plato favorito<br />hasta su próximo juguete.</p>
      </div>
      <div id="categories" className="category-grid">
        {categories.map(([name, description, image]) => (
          <button className="category-card" data-category={name} key={name} type="button" onClick={() => onChooseCategory(name)}>
            <img src={imageUrl(image)} alt={`${name} para mascotas`} loading="lazy" />
            <div><span><strong>{name}</strong><small>{description}</small></span><span>↗</span></div>
          </button>
        ))}
      </div>
    </section>
  )
}

export function AboutSection() {
  return (
    <section id="nosotros" className="section about">
      <div className="about-image">
        <img src={imageUrl('portada1-sobrenosotros.avif')} alt="Persona compartiendo un momento de cariño con su perro" loading="lazy" />
        <span>El cariño está en los detalles.</span>
      </div>
      <div>
        <p className="eyebrow">HOLA, SOMOS PETCOCHA</p>
        <h2>Para ellos.<br />Para ti.<br />Para cada día.</h2>
        <p>Sabemos que una mascota es parte de la familia. Por eso reunimos opciones para alimentar, entretener y cuidar a tu compañero, en un lugar sencillo de explorar.</p>
        <p>Desde Cochabamba, queremos ayudarte a elegir con calma y encontrar lo que se adapta a su rutina.</p>
        <a className="text-link" href="#/contacto">Conversemos sobre tu mascota →</a>
      </div>
    </section>
  )
}

export function GuideSection({ message, onSubmit }) {
  return (
    <section id="guia" className="section guide">
      <div>
        <p className="eyebrow">UNA ELECCIÓN MÁS SENCILLA</p>
        <h2>Cada mascota<br />tiene su mundo.</h2>
        <p>Cuéntanos un poco sobre tu compañero para explorar opciones de alimento.</p>
        <form id="guide-form" onSubmit={onSubmit}>
          <div className="field-row">
            <label>Mi mascota es<select name="pet" required defaultValue=""><option value="">Seleccionar</option><option>Perros</option><option>Gatos</option></select></label>
            <label>Etapa<select name="stage" required defaultValue=""><option value="">Seleccionar</option><option>Cachorro</option><option>Adulto</option><option>Senior</option></select></label>
          </div>
          <button className="button coral">Explorar opciones →</button>
        </form>
        <p id="guide-result" role="status">{message}</p>
      </div>
      <img src={imageUrl('portada-cuidados.avif')} alt="Gato recibiendo cuidados" loading="lazy" />
    </section>
  )
}

export function PromoSection({ onChooseCategory }) {
  return (
    <section className="section promo">
      <img src={imageUrl('portada-gatitojugando.avif')} alt="Gato jugando al aire libre" loading="lazy" />
      <div>
        <p className="eyebrow">TIEMPO DE JUGAR</p>
        <h2>Su momento favorito<br />puede empezar aquí.</h2>
        <p>Descubre juguetes para estimular su curiosidad y compartir más momentos juntos.</p>
        <button className="button coral" type="button" data-category="Juguetes" onClick={() => onChooseCategory('Juguetes')}>Encontrar juguetes ↗</button>
      </div>
    </section>
  )
}

export function ContactSection({ cartItems, cartTotal, onEditCart, onSubmit, formReason, onReasonChange, formMessage, onMessageChange }) {
  return (
    <section id="contacto" className="section contact">
      <div>
        <p className="eyebrow">ESTAMOS CERCA</p>
        <h2>Hablemos de<br />tu compañero.</h2>
        <p>Consulta por un producto o prepara tu pedido. Te mostraremos un resumen para que puedas revisar cada detalle.</p>
        <div className="contact-info">
          <span><strong>Ubicación</strong>Cochabamba, Bolivia</span>
          <span><strong>Horario de atención</strong>Lun–Sáb · 09:00–18:00</span>
        </div>
        <img src={imageUrl('portada de contacto.avif')} alt="Perro mirando hacia arriba" loading="lazy" />
        <details><summary>¿Cómo funciona el pedido?</summary><p>Añade productos al carrito y completa el formulario para preparar tu solicitud. El resumen queda listo para compartir; no se envía automáticamente.</p></details>
        <details><summary>¿Los precios son definitivos?</summary><p>Confirma el precio y la disponibilidad antes de finalizar tu compra.</p></details>
      </div>
      <form id="contact-form" className="form-card" onSubmit={onSubmit}>
        <h3>Tu consulta o pedido</h3>
        {cartItems.length > 0 && (
          <div id="order-summary" className="summary">
            <strong>Tu selección · {cartItems.reduce((total, item) => total + item.qty, 0)} artículos</strong>
            <p>{cartItems.map((item) => `${item.qty} × ${item.name}`).join('\n')}</p>
            <strong>{money(cartTotal)}</strong><br />
            <button type="button" className="text-link" id="edit-cart" onClick={onEditCart}>Editar carrito</button>
          </div>
        )}
        <label>Nombre completo<input name="name" autoComplete="name" required minLength="2" maxLength="80" /></label>
        <div className="field-row">
          <label>WhatsApp (Bolivia)<input name="phone" type="tel" autoComplete="tel" inputMode="numeric" pattern="[67][0-9]{7}" placeholder="Ej.: 70700000" required title="Ingresa 8 dígitos comenzando por 6 o 7" /></label>
          <label>Correo (opcional)<input name="email" type="email" autoComplete="email" maxLength="120" /></label>
        </div>
        <label>Motivo<select name="reason" required value={formReason} onChange={(event) => onReasonChange(event.target.value)}><option value="">Seleccionar</option><option>Consulta de producto</option><option>Realizar pedido</option><option>Asesoría de alimento</option></select></label>
        <label>¿Qué necesita tu mascota?<textarea name="message" rows="4" required minLength="10" maxLength="1000" placeholder="Cuéntanos un poco…" value={formMessage} onChange={(event) => onMessageChange(event.target.value)} /></label>
        <label className="consent"><input name="consent" type="checkbox" required />He revisado los datos de mi solicitud y entiendo que debo compartirla para completar el pedido.</label>
        <button className="button coral">Revisar y confirmar →</button>
        <p className="demo-note">Tus datos de contacto no se guardan al cerrar la página.</p>
      </form>
    </section>
  )
}

export function Footer({ onOpenCart, onChooseCategory }) {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <a className="brand" href="#/inicio"><img src={imageUrl('logo-página.png')} alt="" /><span>Pet<span>Cocha</span></span></a>
          <p>Pequeños compañeros.<br />Una vida llena de cariño.</p>
          <address className="footer-location">Cochabamba, Bolivia<br /><strong>Atención:</strong> Lun–Sáb · 09:00–18:00</address>
        </div>
        <div>
          <h3>Su mundo</h3>
          {categories.map(([name]) => (
            <a
              href={`#/productos?categoria=${encodeURIComponent(name)}`}
              data-category={name}
              key={name}
              onClick={(event) => {
                event.preventDefault()
                onChooseCategory(name)
              }}
            >{name}</a>
          ))}
        </div>
        <div>
          <h3>Te acompañamos</h3><a href="#/nosotros">Conoce PetCocha</a><a href="#/elige-mejor">Guía para elegir</a><a href="#/contacto">Consultas y pedidos</a>
          <button className="footer-button" id="footer-cart" type="button" onClick={onOpenCart}>Revisar mi carrito</button>
        </div>
        <div className="footer-callout">
          <p className="eyebrow">CADA DÍA CUENTA</p><h3>Más juego.<br />Más cariño.<br />Más momentos.</h3><a href="#/productos">Explora el catálogo ↗</a>
        </div>
      </div>
      <div className="footer-bottom"><span>Diseñado por <strong>Nathalie Ramírez</strong></span></div>
    </footer>
  )
}
