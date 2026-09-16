import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';

export default function BottomNav() {
  const { user } = useAuth();
  const { unreadConversationCount } = useWebSocket();

  const navItems = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Explore', path: '/explore', icon: 'search' },
    { label: 'Network', path: '/network', icon: 'group' },
    { label: 'Groups', path: '/communities', icon: 'forum' },
    { label: 'Messages', path: '/messages', icon: 'chat_bubble' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/30 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[11px] font-medium transition-colors relative ${
              isActive
                ? 'text-primary-container font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="relative flex items-center justify-center">
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                {item.path === '/messages' && unreadConversationCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-error text-on-error rounded-full px-1.5 py-0.2 text-[9px] font-bold shadow-xs">
                    {unreadConversationCount > 99 ? '99+' : unreadConversationCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
