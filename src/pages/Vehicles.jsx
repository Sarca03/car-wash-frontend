import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehiclesApi } from '../api/vehicles';
import { clientsApi } from '../api/clients';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';

const VEHICLE_TYPES = ['Limuzina', 'Hečbek', 'Karavan', 'SUV', 'Kombi', 'Motor'];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    brand: '',
    model: '',
    license_plate: '',
    vehicle_type: 'Limuzina',
  });

  const loadData = async () => {
    try {
      const [v, c] = await Promise.all([vehiclesApi.getAll(), clientsApi.getAll()]);
      setVehicles(v);
      setClients(c);
    } catch {
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ client_id: '', brand: '', model: '', license_plate: '', vehicle_type: 'Limuzina' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.vehicle_id);
    setFormData({
      client_id: v.client_id || '',
      brand: v.brand || '',
      model: v.model || '',
      license_plate: v.license_plate || '',
      vehicle_type: v.vehicle_type || 'Limuzina',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, client_id: formData.client_id ? Number(formData.client_id) : null };
      if (editingId) {
        await vehiclesApi.update(editingId, payload);
        toast.success('Vozilo izmenjeno');
      } else {
        await vehiclesApi.create(payload);
        toast.success('Vozilo dodato');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Greška');
    }
  };

  const handleDelete = async () => {
    try {
      await vehiclesApi.remove(deleteId);
      toast.success('Vozilo obrisano');
      loadData();
    } catch {
      toast.error('Greška pri brisanju');
    }
  };

  const filtered = vehicles.filter((v) =>
    !search ||
    v.brand?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase()) ||
    v.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
    v.owner_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-6 lg:p-8">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Vozila</h1>
          <p className="text-slate-500 mt-1">
            Ukupno: <span className="text-slate-900 font-semibold">{filtered.length}</span> od {vehicles.length}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="edit-only bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-full font-semibold text-sm shadow-lg flex items-center gap-2">
          <Plus size={18} /> Novo vozilo
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Pretraži po marki, modelu, tablicama ili vlasniku..."
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
                <th className="p-4">Vozilo</th>
                <th className="p-4">Tablice</th>
                <th className="p-4">Tip</th>
                <th className="p-4">Vlasnik</th>
                <th className="edit-only p-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-page transition">
                    <td className="p-4 text-slate-900 font-semibold text-sm">{v.brand} {v.model}</td>
                    <td className="p-4">
                      <span className="plate">
                        {v.license_plate}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">{v.vehicle_type}</td>
                    <td className="p-4">
                      <div className="text-slate-700 text-sm">{v.owner_name || '-'}</div>
                      <div className="text-slate-500 text-xs">{v.owner_phone || ''}</div>
                    </td>
                    <td className="edit-only p-4 text-right">
                      <button onClick={() => handleOpenEdit(v)} aria-label="Izmeni" title="Izmeni" className="edit-only text-slate-400 hover:text-brand-600 p-2 rounded-lg hover:bg-brand-50">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeleteId(v.vehicle_id)} aria-label="Obriši" title="Obriši" className="edit-only text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-12 text-center text-slate-500">Nema vozila.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Izmeni vozilo' : 'Novo vozilo'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Vlasnik</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
            >
              <option value="">Bez vlasnika</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>{c.full_name} ({c.phone})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Marka *</label>
              <input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Model *</label>
              <input type="text" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Tablice *</label>
              <input type="text" required value={formData.license_plate} onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">Tip *</label>
              <select value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white">
                {VEHICLE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
                {!VEHICLE_TYPES.includes(formData.vehicle_type) && (
                  <option>{formData.vehicle_type}</option>
                )}
              </select>
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
        title="Brisanje vozila"
        message="Obrisati vozilo? Obrisaće se i njegovi termini."
      />
    </div>
  );
}