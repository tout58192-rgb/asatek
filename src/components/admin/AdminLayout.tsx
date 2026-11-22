import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  ExternalLink,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDashboardCounts } from '../../hooks/useInquiries';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

const SOUND_MUTED_KEY = 'asatek_admin_sound_muted';

interface AdminLayoutProps {
  title: string;
  children: React.ReactNode;
}

function playNotificationBeep(ctxRef: React.MutableRefObject<AudioContext | null>) {
  if (typeof window === 'undefined') return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioCtx) return;

  try {
    if (!ctxRef.current) {
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
    if (ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.24);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio context autoplay blocks
  }
}

export function AdminLayout({ title, children }: AdminLayoutProps) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: counts } = useDashboardCounts();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    return window.localStorage.getItem(SOUND_MUTED_KEY) === '1';
  });

  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const newOrdersCount = counts?.new_orders ?? counts?.new_inquiries ?? 0;

  useEffect(() => {
    document.title =
      newOrdersCount > 0
        ? `(${newOrdersCount}) ASATEK Admin`
        : `${title} — ASATEK Admin`;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');
  }, [title, newOrdersCount]);

  // Unlock AudioContext on first user gesture inside admin
  useEffect(() => {
    const unlock = () => {
      if (typeof window === 'undefined') return;
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        if (audioCtxRef.current.state === 'suspended') {
          void audioCtxRef.current.resume().catch(() => {});
        }
      } catch {
        // Ignore
      }
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Subscribe to Supabase Realtime on public.inquiries (INSERT & UPDATE)
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel('admin-inquiries-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inquiries' },
        (payload) => {
          const rec = payload.new as { reference?: string } | undefined;
          const refLabel = rec?.reference ? ` ${rec.reference}` : '';
          showToast(`New order${refLabel}`);
          if (!mutedRef.current) {
            playNotificationBeep(audioCtxRef);
          }
          void queryClient.invalidateQueries({ queryKey: ['inquiries'] });
          void queryClient.invalidateQueries({ queryKey: ['inquiry_status_counts'] });
          void queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
          void queryClient.invalidateQueries({ queryKey: ['sales_summary'] });
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inquiries' },
        (payload) => {
          const rec = payload.new as { id?: string } | undefined;
          void queryClient.invalidateQueries({ queryKey: ['inquiries'] });
          void queryClient.invalidateQueries({ queryKey: ['inquiry_status_counts'] });
          void queryClient.invalidateQueries({ queryKey: ['dashboard_counts'] });
          void queryClient.invalidateQueries({ queryKey: ['sales_summary'] });
          if (rec?.id) {
            void queryClient.invalidateQueries({ queryKey: ['inquiry', rec.id] });
          }
        },
      )
      .subscribe();

    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [queryClient, showToast]);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SOUND_MUTED_KEY, next ? '1' : '0');
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/management', label: 'Management', icon: BarChart3 },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/products', label: 'Products', icon: Package },
    {
      to: '/admin/inquiries',
      label: 'Orders / Inquiries',
      icon: Inbox,
      badge: newOrdersCount,
    },
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
                `flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--brand-red)] text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  data-testid="admin-new-orders-badge"
                  className="inline-flex min-w-[20px] h-5 px-1.5 items-center justify-center rounded-full bg-white text-[var(--brand-red)] text-xs font-bold tabular-nums"
                >
                  {item.badge}
                </span>
              )}
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
          <div className="flex items-center gap-3 min-w-0">
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

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute new order sound' : 'Mute new order sound'}
            title={muted ? 'Sound alerts muted' : 'Sound alerts enabled'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--bg-alt)] cursor-pointer shrink-0"
          >
            {muted ? (
              <>
                <VolumeX className="w-4 h-4 text-[var(--ink-soft)]" />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[var(--brand-red)]" />
                <span className="hidden sm:inline">Alerts On</span>
              </>
            )}
          </button>
        </header>

        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
