import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Compass,
  Users,
  Building2,
  MessageSquare,
  User,
  LogOut,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import BrandLogo from '../common/BrandLogo';
import Avatar from '../common/Avatar';

const AppLayout = ({ children, rightRail = null, onOpenCreatePost = null }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home Feed', path: '/', icon: Home },
    { label: 'Discover People', path: '/discover', icon: Compass },
    { label: 'My Network', path: '/connections', icon: Users },
    { label: 'Communities', path: '/communities', icon: Building2 },
    { label: 'Messages', path: '/chat', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col">
      {/* Mobile Top Header (<768px) */}
      <header className="md:hidden sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center justify-between">
        <BrandLogo size="sm" />
        <div className="flex items-center gap-2">
          {onOpenCreatePost && (
            <button
              onClick={onOpenCreatePost}
              className="p-2 rounded-control bg-clay text-white shadow-sm"
              title="Create Post"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-control text-ink-muted hover:bg-surface-recessed"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-canvas h-full p-5 flex flex-col justify-between border-l border-hairline shadow-modal" onClick={e => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-hairline pb-4">
                <BrandLogo size="sm" />
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-ink-muted" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-control font-medium text-sm transition-colors ${
                        isActive
                          ? 'bg-clay/10 text-clay font-semibold'
                          : 'text-ink-muted hover:bg-surface-recessed hover:text-ink-primary'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-clay' : 'text-ink-subtle'}`} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {currentUser && (
              <div className="pt-4 border-t border-hairline space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar src={currentUser.profilePicture} name={currentUser.fullName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate text-ink-primary">{currentUser.fullName}</p>
                    <p className="text-xs text-ink-muted truncate">{currentUser.profession || currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-control text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 max-w-layout mx-auto w-full flex">
        {/* Left Column Desktop (1024px+ 240px wide) / Tablet Rail (768-1023px 72px wide) */}
        <aside className="hidden md:flex flex-col justify-between w-18 lg:w-60 shrink-0 border-r border-hairline p-4 lg:p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-8">
            <div className="hidden lg:block">
              <BrandLogo size="md" />
            </div>
            <div className="lg:hidden flex justify-center">
              <BrandLogo size="sm" link={true} />
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3.5 px-3 py-3 lg:px-4 rounded-control font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-clay/10 text-clay font-semibold shadow-xs'
                        : 'text-ink-muted hover:bg-surface-recessed hover:text-ink-primary'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-clay' : 'text-ink-subtle'}`} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {onOpenCreatePost && (
              <div className="pt-2">
                <button
                  onClick={onOpenCreatePost}
                  className="w-full bg-clay text-white font-semibold py-3 px-4 rounded-control hover:bg-clay-hover transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden lg:inline">Create Post</span>
                </button>
              </div>
            )}
          </div>

          {/* Left Navigation Footer User Identity */}
          {currentUser && (
            <div className="pt-4 border-t border-hairline flex flex-col gap-2">
              <NavLink
                to="/profile"
                className="flex items-center gap-3 p-2 rounded-control hover:bg-surface-recessed transition-colors min-w-0"
              >
                <Avatar src={currentUser.profilePicture} name={currentUser.fullName} size="md" />
                <div className="hidden lg:block min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate text-ink-primary leading-snug">
                    {currentUser.fullName}
                  </p>
                  <p className="text-xs text-ink-muted truncate">
                    {currentUser.profession || currentUser.college || 'View Profile'}
                  </p>
                </div>
              </NavLink>

              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-control text-xs font-medium text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </aside>

        {/* Center Feed / Content Column */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 flex justify-center">
          <div className="w-full max-w-feed">
            {children}
          </div>
        </main>

        {/* Right Rail Column (Desktop 1024px+ 320px wide) */}
        {rightRail && (
          <aside className="hidden lg:block w-80 shrink-0 border-l border-hairline p-6 sticky top-0 h-screen overflow-y-auto space-y-6">
            {rightRail}
          </aside>
        )}
      </div>

      {/* Mobile Bottom Navigation (<768px) */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-canvas/95 backdrop-blur-md border-t border-hairline px-2 py-2 flex items-center justify-around">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-control text-xs ${
                isActive ? 'text-clay font-semibold' : 'text-ink-subtle'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-clay' : 'text-ink-subtle'}`} />
              <span className="text-[10px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
