import Link from 'next/link';

export function PromoSection() {
  return (
    <section className="py-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 p-8 text-white">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-30">🥗</div>
          <p className="text-sm font-semibold opacity-80 mb-2">Limited Time</p>
          <h3 className="text-2xl font-extrabold mb-2">20% Off<br/>Fresh Salads</h3>
          <p className="text-sm opacity-80 mb-4">Use code: FRESH20</p>
          <Link href="/products?category=fruits-veggies"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-50 transition-colors">
            Shop Now →
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 p-8 text-white">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-30">🛒</div>
          <p className="text-sm font-semibold opacity-80 mb-2">New Members</p>
          <h3 className="text-2xl font-extrabold mb-2">Free Delivery<br/>on First Order</h3>
          <p className="text-sm opacity-80 mb-4">No minimum order value</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 bg-white text-orange-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors">
            Sign Up →
          </Link>
        </div>
      </div>
    </section>
  );
}
