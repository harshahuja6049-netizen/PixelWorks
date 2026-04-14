import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (isMounted && session) {
        router.replace('/');
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage('Error: ' + error.message);
        return;
      }
      if (!data?.session) {
        setMessage('Signed in, but no session was created. If this is a new account, confirm your email in Supabase and try again.');
        return;
      }
      setMessage('Success! Redirecting…');
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="pw-container flex min-h-screen items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-linear-to-br from-secondary to-primary shadow-sm" />
            <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in to PixelWorks</h1>
            <p className="mt-1 text-sm text-white/70">Manage orders faster with a clean dashboard.</p>
          </div>

          <form onSubmit={handleLogin} className="pw-card p-6">
            {message && (
              <div className="mb-4 rounded-xl border border-border bg-black/20 px-4 py-3 text-sm text-white/80">
                {message}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-white/80">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pw-input"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-white/80">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pw-input"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="pw-btn-primary w-full py-2.5">
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-white/60">
            Tip: if you just logged in and it still bounces, hard refresh once.
          </p>
        </div>
      </div>
    </div>
  );
}