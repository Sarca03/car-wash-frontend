import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { servicesApi } from '../api/services';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import { formatPrice } from '../utils/formatters';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    service_name: '',
    description: '',
    price: '',
    duration_minutes: '',
  });

  const loadData = async () => {
    try {
      setServices(await servicesApi.getAll());
    } catch (err) {
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ category: '', service_name: '', description: '', price: '', duration_minutes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingId(s.service_id);
    setFormData({
      category: s.category || '',
      service_name: s.service_name || '',
      description: s.description || '',
      price: s.price || '',
      duration_minutes: s.duration_minutes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        duration_minutes: Number(formData.duration_minutes),
      };
      if (editingId) {
        await servicesApi.update(editingId, payload);
        toast.success('Usluga izmenjena');
      } else {
        await servicesApi.create(payload);
        toast.success('Usluga dodata');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Greška');
    }
  };

  const handleDelete = async () => {
    try {
      await servicesApi.remove(deleteId);
      toast.success('Usluga obrisana');
      loadData();
    } catch (err) {
      toast.error('Greška pri brisanju');
    }
  };

  const filtered = services.filter((s) =>
    !search ||
    s.service_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Usluge</h1>
          <p className="text-slate-400 mt-1">Ukupno: <span className="text-white font-semibold">{filtered.length}</span> od {services.length}</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">
          <Plus size={18} /> Nova usluga
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Pretraži po nazivu ili kategoriji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <div key={s.service_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs uppercase font-bold tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full">
                  {s.category}
                </span>
                <div>
                  <button onClick={() => handleOpenEdit(s)} className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/10">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteId(s.service_id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{s.service_name}</h3>
              {s.description && <p className="text-slate-400 text-xs mb-3 line-clamp-2">{s.description}</p>}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock size={14} /> {s.duration_minutes} min
                </div>
                <span className="text-emerald-400 font-bold text-lg">{formatPrice(s.price)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            Nema usluga.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Izmeni uslugu' : 'Nova usluga'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Kategorija *</label>
            <input type="text" required placeholder="npr. Pranje, Poliranje..." value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Naziv usluge *</label>
            <input type="text" required value={formData.service_name} onChange={(e) => setFormData({ ...formData, service_name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Opis</label>
            <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Cena (RSD) *</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Trajanje (min) *</label>
              <input type="number" required value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm">Otkaži</button>
            <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg">{editingId ? 'Sačuvaj' : 'Dodaj'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Brisanje usluge"
        message="Da li si siguran da želiš da obrišeš ovu uslugu?"
      />
    </div>
  );
}