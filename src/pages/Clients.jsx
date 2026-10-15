import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { clientsApi } from '../api/clients';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  const loadData = async () => {
    try {
      const data = await clientsApi.getAll();
      setClients(data);
    } catch {
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ full_name: '', phone: '', email: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.client_id);
    setFormData({
      full_name: c.full_name || '',
      phone: c.phone || '',
      email: c.email || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await clientsApi.update(editingId, formData);
        toast.success('Klijent izmenjen');
      } else {
        await clientsApi.create(formData);
        toast.success('Klijent dodat');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Greška');
    }
  };

  const handleDelete = async () => {
    try {
      await clientsApi.remove(deleteId);
      toast.success('Klijent obrisan');
      loadData();
    } catch {
      toast.error('Greška pri brisanju');
    }
  };

  const filtered = clients.filter((c) =>
    !search ||
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Klijenti</h1>
          <p className="text-slate-500 mt-1">
            Prikazano: <span className="text-slate-900 font-semibold">{filtered.length}</span> od {clients.length}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="edit-only w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-full font-semibold text-sm shadow-lg flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Novi klijent
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Pretraži po imenu, telefonu ili email-u..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-page text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Ime i prezime</th>
                <th className="p-4">Telefon</th>
                <th className="p-4">Email</th>
                <th className="p-4">Broj vozila</th>
                <th className="edit-only p-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr key={c.client_id} className="hover:bg-page transition">
                    <td className="p-4 text-slate-900 font-semibold text-sm">{c.full_name}</td>
                    <td className="p-4 text-slate-700 text-sm">{c.phone}</td>
                    <td className="p-4 text-slate-500 text-sm">{c.email || '-'}</td>
                    <td className="p-4">
                      <span className="bg-brand-50 text-brand-700 border border-brand-100 px-2.5 py-1 rounded-full text-xs font-bold">
                        {c.vehicle_count || 0}
                      </span>
                    </td>
                    <td className="edit-only p-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)} aria-label="Izmeni" title="Izmeni"
                        className="edit-only text-slate-400 hover:text-brand-600 p-2 rounded-lg hover:bg-brand-50 transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(c.client_id)} aria-label="Obriši" title="Obriši"
                        className="edit-only text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500">Nema klijenata.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Izmeni klijenta' : 'Novi klijent'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Ime i prezime *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Telefon *</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-semibold text-sm shadow-lg"
            >
              {editingId ? 'Sačuvaj' : 'Dodaj klijenta'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Brisanje klijenta"
        message="Obrisati klijenta? Obrisaće se i sva njegova vozila i termini."
      />
    </div>
  );
}