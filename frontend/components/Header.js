import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-black/30 backdrop-blur">
      <div className="pw-container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-linear-to-br from-secondary to-primary shadow-sm" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">PixelWorks</div>
            <div className="text-xs text-white/60">Order dashboard</div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/" className="pw-btn-ghost">Home</Link>
          <Link href="/add-order" className="pw-btn-ghost">Add Order</Link>
          <Link href="/pending" className="pw-btn-ghost">Pending</Link>
          <Link href="/in-progress" className="pw-btn-ghost">In Progress</Link>
          <Link href="/completed" className="pw-btn-ghost">Completed</Link>
          <button onClick={handleLogout} className="pw-btn bg-white/10 text-white ring-1 ring-border hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-secondary/25">
            Logout
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="pw-btn-ghost md:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-border bg-black/40 backdrop-blur md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="pw-container py-3">
            <div className="grid gap-2">
              <Link href="/" className="pw-btn-ghost" onClick={() => setIsOpen(false)}>Home</Link>
              <Link href="/add-order" className="pw-btn-ghost" onClick={() => setIsOpen(false)}>Add Order</Link>
              <Link href="/pending" className="pw-btn-ghost" onClick={() => setIsOpen(false)}>Pending</Link>
              <Link href="/in-progress" className="pw-btn-ghost" onClick={() => setIsOpen(false)}>In Progress</Link>
              <Link href="/completed" className="pw-btn-ghost" onClick={() => setIsOpen(false)}>Completed</Link>
              <button
                onClick={handleLogout}
                className="pw-btn bg-white/10 text-white ring-1 ring-border hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-secondary/25"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}