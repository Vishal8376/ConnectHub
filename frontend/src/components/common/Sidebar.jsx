import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../context/WebSocketContext';
import Avatar from './Avatar';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const { unreadConversationCount } = useWebSocket();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'Home', path: '/', icon: 'home' },
    { label: 'Explore & Search', path: '/explore', icon: 'search' },
    { label: 'Network', path: '/network', icon: 'group' },
    { label: 'Communities', path: '/communities', icon: 'forum' },
    { label: 'Messages', path: '/messages', icon: 'chat_bubble' },
    { label: 'Recommendations', path: '/recommendations', icon: 'stars' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Interests', path: '/admin/interests', icon: 'admin_panel_settings' });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-surface border-r border-outline-variant/30 p-4 justify-between select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col gap-5">
        {/* Brand Logo & Collapse Toggle Header */}
        <div className="flex items-center justify-between px-1 py-1">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden min-w-0"
          >
            <span className="w-10 h-10 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-center text-xl shadow-sm flex-shrink-0">
              C
            </span>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline-sm text-lg font-bold tracking-tight text-on-surface truncate">
                  Connect<span className="text-primary">Hub</span>
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium truncate">
                  Professional Network
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex-shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        {/* Logged-in User Card in Expanded Sidebar */}
        {user && !isCollapsed && (
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container cursor-pointer transition-all shadow-xs"
          >
            <Avatar src={user.profilePicture} name={user.fullName} size="md" />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-bold text-on-surface truncate leading-tight">
                {user.fullName}
              </span>
              <span className="text-xs text-on-surface-variant truncate mt-0.5">
                {user.profession || user.college || user.email}
              </span>
            </div>
          </div>
        )}

        {/* Collapsed Avatar Icon */}
        {user && isCollapsed && (
          <div
            onClick={() => navigate('/profile')}
            className="flex justify-center cursor-pointer p-1 py-2 hover:bg-surface-container rounded-2xl transition-colors"
            title={user.fullName}
          >
            <Avatar src={user.profilePicture} name={user.fullName} size="md" />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center flex-shrink-0">
                    <span className={`material-symbols-outlined text-[22px] ${isActive ? 'fill-1' : ''}`}>
                      {item.icon}
                    </span>
                    {isCollapsed && item.path === '/messages' && unreadConversationCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-error text-on-error rounded-full text-[10px] font-bold flex items-center justify-center">
                        {unreadConversationCount > 99 ? '99+' : unreadConversationCount}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                  {!isCollapsed && item.path === '/messages' && unreadConversationCount > 0 && (
                    <span className="ml-auto bg-error text-on-error rounded-full px-2 py-0.5 text-[11px] font-bold shadow-2xs flex-shrink-0">
                      {unreadConversationCount > 99 ? '99+' : unreadConversationCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Sign Out */}
      {user && (
        <div className="pt-3 border-t border-outline-variant/30">
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold text-error hover:bg-error-container/30 transition-colors w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">logout</span>
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
