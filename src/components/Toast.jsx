export default function Toast({ message }) {
  return <div id="toast" role="status" className={message ? 'show' : ''}>{message}</div>
}
