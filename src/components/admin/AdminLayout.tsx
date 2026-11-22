import React, { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.title = `${title} — ASATEK Admin`;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');
  }, [title]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/inquiries', label: 'Orders / Inquiries', icon: Inbox },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--ink)] text-white w-64">
      <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
        <Link to="/admin" className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--accent-green)] bg-white text-[var(--brand-red)] font-heading font-bold text-xs">
            A
          </span>
          <span className="font-heading font-bold text-base tracking-tight">
            ASATEK Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--brand-red)] text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>View Public Site</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
        {admin?.email && (
          <p className="px-3.5 pt-2 text-xs text-gray-400 truncate">
            {admin.email}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div dir="ltr" lang="en" className="min-h-screen flex bg-[var(--bg-alt)] text-[var(--ink)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-black/50 flex"
          onClick={() => setSidebarOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>{sidebarContent}</div>
        </div>
      )}

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-medium text-[var(--warn)]">
            Supabase not configured. Showing sample fallback data.
          </div>
        )}

        <header className="h-16 bg-white border-b border-[var(--line)] px-4 md:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin sidebar"
              className="lg:hidden p-2 rounded-lg border border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg-alt)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-[var(--ink)] truncate">
              {title}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
