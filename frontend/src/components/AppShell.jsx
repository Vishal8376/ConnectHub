import { Compass, Home, MessageCircle, Search, Sparkles, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

const desktopLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/communities', label: 'Communities', icon: Compass },
  { to: '/explore', label: 'Explore', icon: Sparkles },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/network', label: 'Connections', icon: Users },
  { to: '/messages', label: 'Chat', icon: MessageCircle },
]

const mobileLinks = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Sparkles },
  { to: '/communities', label: 'Communities', icon: Compass },
  { to: '/network', label: 'Connections', icon: Users },
  { to: '/messages', label: 'Chat', icon: MessageCircle },
]

export default function AppShell() {
  const { user } = useAuth()

  return (
    <div className="app-root">
      <header className="topbar">
        <NavLink to="/" className="wordmark">
          Connect<span>Hub</span>
        </NavLink>
        <nav className="topbar-links">
          {desktopLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-end">
          <NavLink to="/search" className="icon-link search-mobile" title="Search">
            <Search size={20} />
          </NavLink>
          <NavLink to="/me" className="icon-link" title="Your profile">
            <Avatar src={user?.profilePicture} name={user?.fullName} />
          </NavLink>
        </div>
      </header>

      <Outlet />

      <nav className="bottom-nav">
        {mobileLinks.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              <Icon size={20} />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
