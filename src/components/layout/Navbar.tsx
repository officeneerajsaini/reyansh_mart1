'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon,
  ChevronDown, MapPin, Bell, Package
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils/cn';

const categories = [
  { name: 'Fruits & Veggies', slug: 'fruits-veggies', emoji: '🥦' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', emoji: '🥛' },
  { name: 'Snacks', slug: 'snacks', emoji: '🍿' },
  { name: 'Beverages', slug: 'beverages', emoji: '☕' },
  { name: 'Bakery', slug: 'bakery', emoji: '🍞' },
  { name: 'Meat & Fish', slug: 'meat-fish', emoji: '🐟' },
  { name: 'Household', slug: 'household', emoji: '🧹' },
  { name: 'Personal Care', slug: 'personal-care', emoji: '🧴' },
];

export function Navbar() {
  const router = useRouter();
  const { user, signOut, isAdmin } = useAuth();
  const { isDarkMode, toggleDarkMode, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { getItemCount, toggleCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const itemCount = getItemCount();

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full transition-all duration-300',
      scrolled
        ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800'
        : 'bg-white dark:bg-gray-950'
    )}>
      {/* Top bar */}
      <div className="bg-brand-600 text-white text-xs py-1.5 px-4 text-center hidden md:block">
        🚚 Free delivery on orders above ₹499 &nbsp;|&nbsp; 🕐 Express delivery in 2 hours
      </div>

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-brand">
              <span className="text-white text-lg">🌿</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Fresh<span className="text-brand-500">Mart</span>
            </span>
          </Link>

          {/* Location */}
          <button className="hidden lg:flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-brand-500 transition-colors text-sm flex-shrink-0">
            <MapPin size={15} className="text-brand-500" />
            <span>Jaipur, RJ</span>
            <ChevronDown size={13} />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for groceries, fresh produce, snacks..."
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:text-white placeholder-gray-400 transition-all"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Dark mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors hidden sm:flex"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors hidden sm:flex">
              <Heart size={18} />
            </Link>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-medium px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                    <span className="text-brand-600 dark:text-brand-400 text-xs font-semibold">
                      {user.full_name?.[0]?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="text-gray-500 hidden sm:block" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-modal border border-gray-100 dark:border-gray-800 py-2 animate-slide-down">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {[
                      { href: '/profile', icon: User, label: 'My Profile' },
                      { href: '/orders', icon: Package, label: 'My Orders' },
                      { href: '/wishlist', icon: Heart, label: 'Wishlist' },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Icon size={15} />{label}
                      </Link>
                    ))}
                    {isAdmin && (
                      <Link href="/admin/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 transition-colors">
                        <Bell size={15} />Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login"
                className="hidden sm:flex items-center gap-2 h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors">
                <User size={15} />Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors lg:hidden"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Category bar */}
        <div className="hidden lg:flex items-center gap-1 pb-2 border-t border-gray-100 dark:border-gray-800 pt-2 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-brand-600 dark:hover:text-brand-400 transition-colors whitespace-nowrap flex-shrink-0">
              <span>{cat.emoji}</span>{cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4 space-y-2 animate-slide-down">
          {categories.map(cat => (
            <Link key={cat.slug} href={`/products?category=${cat.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
              <span className="text-lg">{cat.emoji}</span>{cat.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex items-center gap-3">
            <button onClick={toggleDarkMode} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              {isDarkMode ? 'Light' : 'Dark'} Mode
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
