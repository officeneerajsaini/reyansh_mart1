'use client';
import { useState } from 'react';
import { User, Mail, Phone, Shield, Package, Heart, LogOut } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, phone }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card">
        <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
          <span className="text-4xl font-bold text-brand-600 dark:text-brand-400">
            {user?.full_name?.[0]?.toUpperCase() ?? 'U'}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.full_name || 'User'}</h2>
          <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
          {user?.role === 'admin' && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-lg">
              <Shield size={11} />Admin
            </span>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">Edit</button>
          )}
        </div>

        <div className="space-y-4">
          <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} disabled={!editing} leftIcon={<User size={15} />} />
          <Input label="Email" value={user?.email || ''} disabled leftIcon={<Mail size={15} />} hint="Email cannot be changed" />
          <Input label="Phone" value={phone} onChange={e => setPhone(e.target.value)} disabled={!editing} leftIcon={<Phone size={15} />} />
        </div>

        {editing && (
          <div className="flex gap-3 mt-5">
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { href: '/orders', icon: Package, label: 'My Orders', desc: 'Track your orders' },
          { href: '/wishlist', icon: Heart, label: 'Wishlist', desc: 'Saved items' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href}
            className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card hover:border-brand-200 dark:hover:border-brand-800 transition-all">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-950 rounded-xl flex items-center justify-center">
              <Icon size={18} className="text-brand-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <Button variant="danger" fullWidth className="gap-2" onClick={signOut}>
        <LogOut size={16} />Sign Out
      </Button>
    </div>
  );
}
