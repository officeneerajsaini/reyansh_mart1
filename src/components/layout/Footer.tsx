import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
                <span className="text-white">🌿</span>
              </div>
              <span className="text-xl font-bold text-white">Fresh<span className="text-brand-400">Mart</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Your one-stop destination for fresh groceries and daily essentials. Delivered fast, right to your door.
            </p>
            <div className="flex gap-3">
              {['📘','🐦','📸','▶️'].map((icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-brand-600 flex items-center justify-center transition-colors text-sm">
                  {icon}
                </a>
              ))}
            </div>
          </div>
          {[
            {
              title: 'Shop',
              links: [
                { label: 'All Products', href: '/products' },
                { label: 'Fruits & Veggies', href: '/products?category=fruits-veggies' },
                { label: 'Dairy & Eggs', href: '/products?category=dairy-eggs' },
                { label: 'Snacks', href: '/products?category=snacks' },
                { label: 'Beverages', href: '/products?category=beverages' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Register', href: '/auth/signup' },
                { label: 'My Orders', href: '/orders' },
                { label: 'Wishlist', href: '/wishlist' },
                { label: 'Profile', href: '/profile' },
              ],
            },
            {
              title: 'Help',
              links: [
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'FAQs', href: '/faqs' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ],
            },
          ].map(section => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:text-brand-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>© {currentYear} FreshMart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>🔒 Secure Payments</span>
            <span>🚚 Fast Delivery</span>
            <span>✅ Quality Assured</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
