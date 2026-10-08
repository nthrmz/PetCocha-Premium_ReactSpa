import { imageUrl, money } from '../data/products.js'

const categories = ['Todos', 'Alimentos', 'Juguetes', 'Accesorios', 'Higiene']

export default function ProductCatalog({
  products,
  category,
  search,
  animal,
  sort,
  limit,
  comparison,
  onCategoryChange,
  onSearchChange,
  onAnimalChange,
  onSortChange,
  onLoadMore,
  onAdd,
  onToggleCompare,
}) {
  const visibleProducts = products.slice(0, limit)

  return (
    <section id="productos" className="section catalog">
      <div className="section-head">
        <div><p className="eyebrow">CATÁLOGO PETCOCHA</p><h2>Encuentra su próximo favorito</h2></div>
        <span id="results" aria-live="polite">{products.length} productos</span>
      </div>
      <div className="filters">
        <div id="filter-buttons" role="group" aria-label="Categoría">
          {categories.map((item) => (
            <button
              className={`filter${category === item ? ' active' : ''}`}
              data-filter={item}
              aria-pressed={category === item}
              type="button"
              key={item}
              onClick={() => onCategoryChange(item)}
            >{item}</button>
          ))}
        </div>
        <label className="search"><span>Buscar</span><input id="search" type="search" placeholder="Producto o marca…" value={search} onChange={(event) => onSearchChange(event.target.value)} /></label>
        <label>Mascota<select id="animal" value={animal} onChange={(event) => onAnimalChange(event.target.value)}><option value="">Todas</option><option>Perros</option><option>Gatos</option></select></label>
        <label>Ordenar<select id="sort" value={sort} onChange={(event) => onSortChange(event.target.value)}><option value="default">Recomendados</option><option value="low">Menor precio</option><option value="high">Mayor precio</option></select></label>
      </div>
      <p className="demo-note">Precios sujetos a confirmación de disponibilidad.</p>
      <p className="compare-intro">¿Entre dos favoritos? Marca hasta 3 productos y compáralos antes de elegir.</p>
      <div id="product-grid" className="product-grid">
        {visibleProducts.length > 0 ? visibleProducts.map((product) => {
          const selected = comparison.includes(product.id)
          return (
            <article className="product-card" key={product.id}>
              <div className="product-picture"><img src={imageUrl(product.image)} alt={product.name} loading="lazy" /></div>
              <div className="product-info">
                <p className="eyebrow">{product.category} · {product.animal}</p>
                <h3>{product.name}</h3>
                <p>Consulta las variantes disponibles.</p>
                <div className="product-bottom">
                  <strong>{money(product.price)}</strong>
                  <button className="add" data-add={product.id} type="button" aria-label={`Añadir ${product.name} al carrito`} onClick={() => onAdd(product.id)}>Añadir +</button>
                </div>
                <button className="compare-toggle" data-compare={product.id} type="button" aria-pressed={selected} onClick={() => onToggleCompare(product.id)}>{selected ? '✓ Seleccionado' : '⇄ Comparar'}</button>
              </div>
            </article>
          )
        }) : <p className="empty">No encontramos productos con estos filtros. Prueba otra búsqueda.</p>}
      </div>
      {products.length > limit && <button id="load-more" className="button outline" type="button" onClick={onLoadMore}>Ver más productos</button>}
    </section>
  )
}
