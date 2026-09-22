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
    } catch (err) {
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
    } catch (err) {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Radnici</h1>
          <p className="text-slate-400 mt-1">Ukupno: <span className="text-white font-semibold">{filtered.length}</span> od {workers.length}</p>
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">
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
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((w) => (
            <div key={w.worker_id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                  {w.full_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <button onClick={() => handleOpenEdit(w)} className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/10">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteId(w.worker_id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-bold text-lg">{w.full_name}</h3>
              <div className="space-y-1.5 mt-3 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Briefcase size={14} /> {w.position}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone size={14} /> {w.phone}
                </div>
              </div>
              {w.hire_date && (
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
                  Zaposlen: {formatDate(w.hire_date)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            Nema radnika.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Izmeni radnika' : 'Novi radnik'} maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Ime i prezime *</label>
            <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Telefon *</label>
            <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Pozicija *</label>
            <input type="text" required placeholder="npr. Perač, Vođa smene..." value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Datum zaposlenja</label>
            <input type="date" value={formData.hire_date} onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
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
        title="Brisanje radnika"
        message="Da li si siguran? Brišu se i termini vezani za radnika."
      />
    </div>
  );
}