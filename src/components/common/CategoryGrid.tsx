import Link from 'next/link';

const categories = [
  { name: 'Fruits & Veggies', slug: 'fruits-veggies', emoji: '🥦', color: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', emoji: '🥛', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' },
  { name: 'Snacks', slug: 'snacks', emoji: '🍿', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400' },
  { name: 'Beverages', slug: 'beverages', emoji: '☕', color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400' },
  { name: 'Bakery', slug: 'bakery', emoji: '🍞', color: 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400' },
  { name: 'Meat & Fish', slug: 'meat-fish', emoji: '🐟', color: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' },
  { name: 'Household', slug: 'household', emoji: '🧹', color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400' },
  { name: 'Personal Care', slug: 'personal-care', emoji: '🧴', color: 'bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400' },
];

export function CategoryGrid() {
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Shop by Category</h2>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {categories.map(cat => (
          <Link key={cat.slug} href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:scale-105 transition-all duration-200">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${cat.color} group-hover:shadow-md transition-shadow`}>
              {cat.emoji}
            </div>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
