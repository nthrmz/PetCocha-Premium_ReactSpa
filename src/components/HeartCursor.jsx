import { useEffect, useRef } from 'react'

export default function HeartCursor() {
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
