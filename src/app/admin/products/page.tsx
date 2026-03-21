'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Search, Pencil, Trash2, Package, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/layout/Navbar';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils/format';
import type { Product, Category } from '@/types';

interface ProductFormData {
  name: string; price: number; compare_at_price?: number;
  category_id: string; unit: string; stock_quantity: number;
  low_stock_threshold: number; description?: string; is_organic: boolean; is_featured: boolean; is_active: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: '', price: 0, category_id: '', unit: '1 kg', stock_quantity: 100, low_stock_threshold: 10,
    is_organic: false, is_featured: false, is_active: true,
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/products?limit=100').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.data || []); setCategories(c.data || []); setLoading(false);
    });
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: '', price: 0, category_id: '', unit: '1 kg', stock_quantity: 100, low_stock_threshold: 10, is_organic: false, is_featured: false, is_active: true });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, price: p.price, compare_at_price: p.compare_at_price,
      category_id: p.category_id, unit: p.unit, stock_quantity: p.stock_quantity,
      low_stock_threshold: p.low_stock_threshold, description: p.description,
      is_organic: p.is_organic, is_featured: p.is_featured, is_active: p.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const url = editProduct ? `/api/products/${editProduct.slug}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editProduct ? 'Product updated!' : 'Product created!');
      setShowModal(false);
      // Refresh
      const updated = await fetch('/api/products?limit=100').then(r => r.json());
      setProducts(updated.data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    const res = await fetch(`/api/products/${product.slug}`, { method: 'DELETE' });
    if (res.ok) {
      setProducts(ps => ps.filter(p => p.id !== product.id));
      toast.success('Product deleted');
    }
  };

  return (
    <><Navbar /><CartDrawer />
    <main className="container-max py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products ({products.length})</h1>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Product</Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search products..." leftIcon={<Search className="h-4 w-4" />} value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {['Product','Category','Price','Stock','Status','Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? Array.from({length:6}).map((_,i) => (
                <tr key={i}><td colSpan={6} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
              )) : filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image src={product.images[0]} alt={product.name} width={40} height={40} className="object-cover w-full h-full" />
                        ) : <Package className="h-5 w-5 m-2.5 text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{(product as any).category?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                    {product.compare_at_price && <span className="ml-2 text-xs text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.stock_quantity === 0 ? 'danger' : product.stock_quantity <= product.low_stock_threshold ? 'warning' : 'success'}>
                      {product.stock_quantity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant={product.is_active ? 'success' : 'default'}>{product.is_active ? 'Active' : 'Hidden'}</Badge>
                      {product.is_featured && <Badge variant="info">Featured</Badge>}
                      {product.is_organic && <Badge variant="organic">Organic</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-brand-600 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(product)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-500 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProduct ? 'Edit Product' : 'Add Product'} size="xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><Input label="Product Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
        <Input label="Price (₹)" type="number" value={form.price} onChange={e => setForm(f => ({...f, price: Number(e.target.value)}))} />
        <Input label="Compare Price (₹)" type="number" value={form.compare_at_price || ''} onChange={e => setForm(f => ({...f, compare_at_price: e.target.value ? Number(e.target.value) : undefined}))} />
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
          <select value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))}
            className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Input label="Unit" value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))} placeholder="1 kg, 500g, 1 dozen" />
        <Input label="Stock Quantity" type="number" value={form.stock_quantity} onChange={e => setForm(f => ({...f, stock_quantity: Number(e.target.value)}))} />
        <Input label="Low Stock Threshold" type="number" value={form.low_stock_threshold} onChange={e => setForm(f => ({...f, low_stock_threshold: Number(e.target.value)}))} />
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea value={form.description || ''} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <div className="col-span-2 flex gap-6">
          {[['is_active','Active'],['is_featured','Featured'],['is_organic','Organic']].map(([k,l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!form[k as keyof ProductFormData]} onChange={e => setForm(f => ({...f, [k]: e.target.checked}))} className="accent-brand-500 w-4 h-4" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{l}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => setShowModal(false)} fullWidth>Cancel</Button>
        <Button onClick={handleSave} fullWidth>{editProduct ? 'Update' : 'Create'} Product</Button>
      </div>
    </Modal>
    </>
  );
}
