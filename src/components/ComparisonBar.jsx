export default function ComparisonBar({ count, onOpen, onClear }) {
  return (
    <div id="compare-bar" className="compare-bar" aria-label="Productos seleccionados para comparar" hidden={count === 0}>
      <span id="compare-count" aria-live="polite">{count} de 3 productos seleccionados</span>
      <button
        id="show-comparison"
        className="button coral"
        type="button"
        disabled={count < 2}
        onClick={onOpen}
      >Comparar selección</button>
      <button id="clear-comparison" className="compare-clear" type="button" onClick={onClear}>Limpiar</button>
    </div>
  )
}
