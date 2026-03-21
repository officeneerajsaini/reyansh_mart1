'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Truck, Shield, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const slides = [
  { bg: 'from-green-50 to-emerald-100 dark:from-green-950/40 dark:to-emerald-900/40', emoji: '🥦🍎🥕', headline: 'Farm-Fresh Vegetables', sub: 'Sourced daily from local farms', cta: 'Shop Produce', href: '/products?category=fruits-veggies', accent: 'text-emerald-600' },
  { bg: 'from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-900/40', emoji: '🥛🧀🥚', headline: 'Premium Dairy & Eggs', sub: 'Fresh every morning, guaranteed', cta: 'Shop Dairy', href: '/products?category=dairy-eggs', accent: 'text-amber-600' },
  { bg: 'from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-900/40', emoji: '🍿🧃🍫', headline: 'Snacks & Beverages', sub: 'Your favourite treats, delivered', cta: 'Shop Snacks', href: '/products?category=snacks', accent: 'text-blue-600' },
];

export function HeroSection() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const current = slides[slide];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className={cn('relative overflow-hidden transition-all duration-700 bg-gradient-to-br', current.bg)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/50 dark:border-gray-700/50">
              <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
              Fast delivery in 2 hours
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {current.headline.split(' ').slice(0, -1).join(' ')}{' '}
              <span className={current.accent}>{current.headline.split(' ').slice(-1)}</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{current.sub}</p>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search groceries..."
                  className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-white bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm focus:outline-none focus:border-brand-400 text-sm dark:text-white dark:placeholder-gray-500 transition-all"
                />
              </div>
              <button type="submit" className="h-12 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold transition-all shadow-brand hover:shadow-lg text-sm flex items-center gap-1.5">
                Search <ArrowRight size={16} />
              </button>
            </form>

            <Link href={current.href}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              {current.cta} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right – big emoji carousel */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-72 h-72">
              <div className="w-full h-full rounded-full bg-white/40 dark:bg-gray-900/40 backdrop-blur-sm flex items-center justify-center text-8xl animate-bounce-subtle shadow-xl border border-white/60 dark:border-gray-700/40">
                {current.emoji.split('').slice(0, 2).join('')}
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-900 rounded-2xl px-3 py-2 shadow-lg text-sm font-semibold border border-gray-100 dark:border-gray-800">
                🚀 2-hour delivery
              </div>
              <div className="absolute -bottom-4 -left-4 bg-brand-500 text-white rounded-2xl px-3 py-2 shadow-lg text-sm font-semibold">
                ✅ 100% Fresh
              </div>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex gap-1.5 mt-8">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={cn('h-1.5 rounded-full transition-all duration-300', i === slide ? 'w-6 bg-brand-500' : 'w-1.5 bg-gray-300 dark:bg-gray-700')}
            />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-white/40 dark:border-gray-800/60 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { icon: Truck, label: 'Free delivery above ₹499', val: '🚚' },
              { icon: Shield, label: '100% quality guaranteed', val: '🛡️' },
              { icon: Clock, label: 'Express 2-hour delivery', val: '⚡' },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-lg">{val}</span>
                <span className="hidden sm:block font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
