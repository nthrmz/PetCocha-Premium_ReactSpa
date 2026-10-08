import { imageUrl, money } from '../data/products.js'

export function CartDialog({ dialogRef, items, total, onChangeQuantity, onRemove, onCheckout, onClose }) {
  return (
    <dialog id="cart-dialog" ref={dialogRef}>
      <div className="dialog-head"><h2>Tu carrito</h2><button className="close" type="button" aria-label="Cerrar carrito" onClick={onClose}>×</button></div>
      <div id="cart-items">
        {items.length ? items.map((item) => (
          <div className="cart-item" key={item.id}>
            <img src={imageUrl(item.image)} alt={item.name} />
            <div>
              <strong>{item.name}</strong><div>{money(item.price * item.qty)}</div>
              <div className="quantity">
                <button type="button" data-change={item.id} data-delta="-1" aria-label={`Reducir cantidad de ${item.name}`} onClick={() => onChangeQuantity(item.id, -1)}>−</button>
                <span aria-label="Cantidad">{item.qty}</span>
                <button type="button" data-change={item.id} data-delta="1" aria-label={`Aumentar cantidad de ${item.name}`} disabled={item.qty === 99} onClick={() => onChangeQuantity(item.id, 1)}>+</button>
                <button className="remove" type="button" data-remove={item.id} onClick={() => onRemove(item.id)}>Quitar</button>
              </div>
            </div>
          </div>
        )) : <div className="empty"><h3>Aún hay espacio para su favorito.</h3><p>Explora el catálogo y añade un producto.</p></div>}
      </div>
      <div id="cart-total"><div className="total"><span>Total</span><strong>{money(total)}</strong></div></div>
      <button id="checkout" className="button coral" type="button" disabled={!items.length} onClick={onCheckout}>Continuar con mi pedido →</button>
      <p className="demo-note">Revisa tu selección antes de preparar el pedido.</p>
    </dialog>
  )
}

export function ConfirmationDialog({ dialogRef, request, confirmed, code, onConfirm, onClose, onDialogClose }) {
  return (
    <dialog id="confirmation" ref={dialogRef} onClose={onDialogClose}>
      <div className="dialog-head">
        <h2>{confirmed ? 'Gracias por elegir PetCocha' : 'Revisa tu solicitud'}</h2>
        <button className="close" type="button" aria-label="Cerrar resumen" onClick={onClose}>×</button>
      </div>
      {confirmed ? (
        <div id="confirmation-body" className="success">
          <h3>¡Tu solicitud está lista!</h3>
          <p>Código: {code}. Guarda este código y comparte tu solicitud para consultar disponibilidad. El formulario no realiza envíos automáticos.</p>
        </div>
      ) : request && (
        <div id="confirmation-body">
          <p className="confirmation-data">
            {`Nombre: ${request.name}\nWhatsApp: +591 ${request.phone}\n${request.email ? `Correo: ${request.email}\n` : ''}Motivo: ${request.reason}\n\n${request.message}`}
          </p>
          {request.reason === 'Realizar pedido' && (
            <div className="summary">{request.items.map((item) => `${item.qty} × ${item.name}`).join(' · ')} · Total: {money(request.total)}</div>
          )}
        </div>
      )}
      {!confirmed && <button id="confirm-order" className="button coral" type="button" onClick={onConfirm}>Preparar solicitud</button>}
    </dialog>
  )
}

export function CompareDialog({ dialogRef, products, onRemove, onAdd, onClose }) {
  return (
    <dialog id="compare-dialog" className="compare-dialog" ref={dialogRef}>
      <div className="dialog-head"><h2>Elige con más claridad</h2><button className="close" type="button" aria-label="Cerrar comparador" onClick={onClose}>×</button></div>
      <p>Compara los detalles del catálogo y añade tu favorito al carrito.</p>
      <div id="compare-content">
        {products.length > 0 && (
          <div className="comparison-scroll">
            <table className="comparison-table">
              <caption>Comparación de productos seleccionados</caption>
              <thead>
                <tr>
                  <th scope="col">Detalle</th>
                  {products.map((product) => (
                    <th scope="col" key={product.id}>
                      <img src={imageUrl(product.image)} alt={product.name} />
                      <strong>{product.name}</strong>
                      <button className="compare-clear" data-compare={product.id} type="button" aria-label={`Quitar ${product.name} de comparación`} onClick={() => onRemove(product.id)}>Quitar</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr><th scope="row">Categoría</th>{products.map((product) => <td key={product.id}>{product.category}</td>)}</tr>
                <tr><th scope="row">Para</th>{products.map((product) => <td key={product.id}>{product.animal}</td>)}</tr>
                <tr><th scope="row">Precio</th>{products.map((product) => <td key={product.id}>{money(product.price)}</td>)}</tr>
                <tr><th scope="row">Tu elección</th>{products.map((product) => <td key={product.id}><button className="button coral" data-add={product.id} type="button" onClick={() => onAdd(product.id)}>Añadir al carrito</button></td>)}</tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="demo-note">Esta comparación no evalúa calidad nutricional ni sustituye asesoría veterinaria.</p>
    </dialog>
  )
}
