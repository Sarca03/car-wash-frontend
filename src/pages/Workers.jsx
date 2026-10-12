import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { workersApi } from '../api/workers';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import { formatDate } from '../utils/formatters';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    position: '',
    hire_date: '',
  });

  const loadData = async () => {
    try {
      setWorkers(await workersApi.getAll());
    } catch {
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ full_name: '', phone: '', position: '', hire_date: new Date().toISOString().slice(0, 10) });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w) => {
    setEditingId(w.worker_id);
    setFormData({
      full_name: w.full_name || '',
      phone: w.phone || '',
      position: w.position || '',
      hire_date: w.hire_date ? w.hire_date.slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await workersApi.update(editingId, formData);
        toast.success('Radnik izmenjen');
      } else {
        await workersApi.create(formData);
        toast.success('Radnik dodat');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Greška');
    }
  };

  const handleDelete = async () => {
    try {
      await workersApi.remove(deleteId);
      toast.success('Radnik obrisan');
      loadData();
    } catch {
      toast.error('Greška pri brisanju');
    }
  };

  const filtered = workers.filter((w) =>
    !search ||
    w.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.position?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-6 lg:p-8">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Radnici</h1>
          <p className="text-slate-500 mt-1">Ukupno: <span className="text-slate-900 font-semibold">{filtered.length}</span> od {workers.length}</p>
        </div>
        <button onClick={handleOpenAdd} className="edit-only bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
          <Plus size={18} /> Novi radnik
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Pretraži po imenu ili poziciji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((w) => (
            <div key={w.worker_id} className="card p-5 hover:border-brand-200 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                  {w.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <button onClick={() => handleOpenEdit(w)} aria-label="Izmeni" title="Izmeni" className="edit-only text-slate-400 hover:text-brand-600 p-1.5 rounded-lg hover:bg-brand-50">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteId(w.worker_id)} aria-label="Obriši" title="Obriši" className="edit-only text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-slate-900 font-bold text-lg">{w.full_name}</h3>
              <div className="space-y-1.5 mt-3 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Briefcase size={14} /> {w.position}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone size={14} /> {w.phone}
                </div>
              </div>
              {w.hire_date && (
                <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  Zaposlen: {formatDate(w.hire_date)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full card p-12 text-center text-slate-500">
            Nema radnika.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Izmeni radnika' : 'Novi radnik'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Ime i prezime *</label>
            <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Telefon *</label>
            <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Pozicija *</label>
            <input type="text" required placeholder="npr. Perač, Vođa smene..." value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Datum zaposlenja</label>
            <input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
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
        title="Brisanje radnika"
        message="Obrisati radnika? Njegovi termini ostaju, ali bez radnika."
      />
    </div>
  );
}