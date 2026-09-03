import { initials } from '../utils/format'

export default function Avatar({ src, name, size = 'md' }) {
  return (
    <div className={`avatar ${size === 'lg' ? 'avatar--lg' : ''}`} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(name)}
    </div>
  )
}
