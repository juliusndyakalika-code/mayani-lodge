import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, BedDouble, Users, Maximize2, X, Check, AlertCircle } from 'lucide-react';
import client from '../../api/client';
import { fmtTZS } from '../../utils/price';
import { Room } from '../../types';

const EMPTY_FORM = {
  name: '', type: 'STANDARD', description: '', price: '',
  capacity: '', size: '', bedType: '', featured: false,
  amenities: '', images: '',
};

const TYPE_COLOR: Record<string, string> = {
  STANDARD:  'bg-slate-100 text-slate-600',
  DELUXE:    'bg-blue-50 text-blue-600',
  SUITE:     'bg-purple-50 text-purple-600',
  PENTHOUSE: 'bg-amber-50 text-amber-700',
};

export function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => { fetchRooms(); }, []);

  async function fetchRooms() {
    setLoading(true);
    const r = await client.get('/admin/rooms');
    setRooms(r.data);
    setLoading(false);
  }

  function openAdd() {
    setEditRoom(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  }

  function openEdit(room: Room) {
    setEditRoom(room);
    setForm({
      name: room.name, type: room.type, description: room.description,
      price: String(room.price), capacity: String(room.capacity),
      size: String(room.size), bedType: room.bedType,
      featured: room.featured,
      amenities: room.amenities.join('\n'),
      images: room.images.join('\n'),
    });
    setError('');
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.capacity) { setError('Name, price and capacity are required'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        capacity: Number(form.capacity),
        size: Number(form.size),
        amenities: form.amenities.split('\n').map((s) => s.trim()).filter(Boolean),
        images:    form.images.split('\n').map((s) => s.trim()).filter(Boolean),
        available: true,
      };
      if (editRoom) {
        const r = await client.put(`/admin/rooms/${editRoom.id}`, { ...payload, available: editRoom.available });
        setRooms((prev) => prev.map((rm) => (rm.id === editRoom.id ? r.data : rm)));
      } else {
        const r = await client.post('/admin/rooms', payload);
        setRooms((prev) => [...prev, r.data]);
      }
      setShowForm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id: string) {
    setToggling(id);
    try {
      const r = await client.patch(`/admin/rooms/${id}/availability`);
      setRooms((prev) => prev.map((rm) => (rm.id === id ? r.data : rm)));
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await client.delete(`/admin/rooms/${id}`);
      setRooms((prev) => prev.filter((rm) => rm.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete room');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Rooms</h1>
          <p className="text-gray-500 text-sm mt-1">{rooms.length} room{rooms.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm shadow-sm">
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div key={room.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${room.available ? 'border-gray-100' : 'border-red-200 opacity-80'}`}>
              <div className="relative h-44 overflow-hidden">
                {room.images[0] ? (
                  <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <BedDouble className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLOR[room.type] || TYPE_COLOR.STANDARD}`}>
                    {room.type}
                  </span>
                  {!room.available && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600">UNAVAILABLE</span>
                  )}
                </div>
                {room.featured && (
                  <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500 text-white">Featured</span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-[#1a2f4e] mb-1" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{room.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{room.description}</p>

                <div className="flex gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3 text-amber-500" /> {room.capacity}</span>
                  <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3 text-amber-500" /> {room.size}m²</span>
                  <span className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-amber-500" /> {room.bedType}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{fmtTZS(room.price)}</span>
                    <span className="text-gray-400 text-xs"> /night</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleToggle(room.id)} disabled={toggling === room.id}
                      title={room.available ? 'Mark unavailable' : 'Mark available'}
                      className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
                      {room.available
                        ? <ToggleRight className="h-5 w-5 text-green-500" />
                        : <ToggleLeft  className="h-5 w-5 text-gray-400" />}
                    </button>
                    <button onClick={() => openEdit(room)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(room.id, room.name)} disabled={deleting === room.id}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors disabled:opacity-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1a2f4e]" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                {editRoom ? `Edit — ${editRoom.name}` : 'Add New Room'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Name *</span>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                    placeholder="e.g. Deluxe Room"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type *</span>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    {['STANDARD', 'DELUXE', 'SUITE', 'PENTHOUSE'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price (TZS) *</span>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required
                    placeholder="45000"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity *</span>
                  <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} required
                    placeholder="2"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Size (m²)</span>
                  <input type="number" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}
                    placeholder="35"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bed Type</span>
                  <input value={form.bedType} onChange={(e) => setForm({ ...form, bedType: e.target.value })}
                    placeholder="King Bed"
                    className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</span>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  placeholder="Describe the room..."
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Amenities (one per line)</span>
                <textarea value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} rows={4}
                  placeholder={"Free WiFi\nAir Conditioning\nFlat-screen TV"}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-mono" />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Image URLs (one per line)</span>
                <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={3}
                  placeholder={"/images/mayani-hero.jpeg\nhttps://example.com/room.jpg"}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none font-mono" />
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="w-4 h-4 accent-amber-500" />
                <span className="text-sm font-medium text-gray-700">Mark as featured room</span>
              </label>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Saving...</>
                    : <><Check className="h-4 w-4" /> {editRoom ? 'Save Changes' : 'Add Room'}</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
