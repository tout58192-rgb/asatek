import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export default function AdminLogin() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void import('./Dashboard');
    document.title = 'Admin Sign In — ASATEK';
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex, nofollow');
  }, []);

  useEffect(() => {
    if (admin) {
      navigate(from, { replace: true });
    }
  }, [admin, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError(
        'Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      );
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter your admin email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div dir="ltr" lang="en" className="min-h-screen bg-[var(--bg-alt)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-[var(--line)] bg-white p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-red-light)] text-[var(--brand-red)]">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-[var(--ink)]">
            ASATEK Admin Portal
          </h1>
          <p className="text-sm text-[var(--ink-soft)]">
            Sign in with your Supabase Auth admin account to manage products, wholesale slabs, orders, and settings.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-[var(--warn)]">
            Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then sign in with an account that has role = &apos;admin&apos; in the profiles table.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Admin Email"
            type="email"
            required
            disabled={!isSupabaseConfigured}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Supabase email"
          />

          <Input
            label="Password"
            type="password"
            required
            disabled={!isSupabaseConfigured}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p className="text-xs font-medium text-[var(--brand-red)]" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isSupabaseConfigured}
            loading={submitting}
            className="w-full"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--line)]">
          <Link
            to="/"
            className="text-xs font-medium text-[var(--ink-soft)] hover:text-[var(--brand-red)]"
          >
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
