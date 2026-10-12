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
    } catch {
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
      toast.error(err.response?.data?.error || 'Greška pri brisanju');
    }
  };

  const filtered = services.filter((s) =>
    !search ||
    s.service_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-6 lg:p-8">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Usluge</h1>
          <p className="text-slate-500 mt-1">Ukupno: <span className="text-slate-900 font-semibold">{filtered.length}</span> od {services.length}</p>
        </div>
        <button onClick={handleOpenAdd} className="edit-only bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
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
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <div key={s.service_id} className="card p-5 hover:border-brand-200 transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs uppercase font-bold tracking-wide bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full">
                  {s.category}
                </span>
                <div>
                  <button onClick={() => handleOpenEdit(s)} aria-label="Izmeni" title="Izmeni" className="edit-only text-slate-400 hover:text-brand-600 p-1.5 rounded-lg hover:bg-brand-50">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteId(s.service_id)} aria-label="Obriši" title="Obriši" className="edit-only text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-1">{s.service_name}</h3>
              {s.description && <p className="text-slate-500 text-xs mb-3 line-clamp-2">{s.description}</p>}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                  <Clock size={14} /> {s.duration_minutes} min
                </div>
                <span className="text-slate-900 font-bold text-lg">{formatPrice(s.price)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card p-12 text-center text-slate-500">
            Nema usluga.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Izmeni uslugu' : 'Nova usluga'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Kategorija *</label>
            <input type="text" required placeholder="npr. Spolja, Unutra" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Naziv usluge *</label>
            <input type="text" required value={formData.service_name} onChange={(e) => setFormData({ ...formData, service_name: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Opis</label>
            <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Cena (RSD) *</label>
              <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Trajanje (min) *</label>
              <input type="number" required value={formData.duration_minutes} onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm">Otkaži</button>
            <button type="submit" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-semibold text-sm shadow-lg">{editingId ? 'Sačuvaj' : 'Dodaj'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Brisanje usluge"
        message="Obrisati ovu uslugu?"
      />
    </div>
  );
}