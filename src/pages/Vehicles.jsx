import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { vehiclesApi } from '../api/vehicles';
import { clientsApi } from '../api/clients';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';

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
    vehicle_type: 'Automobil',
  });

  const loadData = async () => {
    try {
      const [v, c] = await Promise.all([vehiclesApi.getAll(), clientsApi.getAll()]);
      setVehicles(v);
      setClients(c);
    } catch (err) {
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ client_id: '', brand: '', model: '', license_plate: '', vehicle_type: 'Automobil' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingId(v.vehicle_id);
    setFormData({
      client_id: v.client_id || '',
      brand: v.brand || '',
      model: v.model || '',
      license_plate: v.license_plate || '',
      vehicle_type: v.vehicle_type || 'Automobil',
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
    } catch (err) {
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Vozila</h1>
          <p className="text-slate-400 mt-1">
            Ukupno: <span className="text-white font-semibold">{filtered.length}</span> od {vehicles.length}
          </p>
        </div>
        <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center gap-2">
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
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Vozilo</th>
                <th className="p-4">Tablice</th>
                <th className="p-4">Tip</th>
                <th className="p-4">Vlasnik</th>
                <th className="p-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.length > 0 ? (
                filtered.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 text-white font-semibold text-sm">{v.brand} {v.model}</td>
                    <td className="p-4">
                      <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded font-mono text-yellow-400 text-xs">
                        {v.license_plate}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">{v.vehicle_type}</td>
                    <td className="p-4">
                      <div className="text-slate-300 text-sm">{v.owner_name || '-'}</div>
                      <div className="text-slate-500 text-xs">{v.owner_phone || ''}</div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleOpenEdit(v)} className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => setDeleteId(v.vehicle_id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10">
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
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Vlasnik</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Bez vlasnika</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>{c.full_name} ({c.phone})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Marka *</label>
              <input type="text" required value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Model *</label>
              <input type="text" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Tablice *</label>
              <input type="text" required value={formData.license_plate} onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">Tip *</label>
              <select value={formData.vehicle_type} onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500">
                <option>Automobil</option>
                <option>Motor</option>
                <option>Kombi</option>
                <option>Kamion</option>
                <option>SUV</option>
              </select>
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
        title="Brisanje vozila"
        message="Da li si siguran? Brišu se i termini vezani za vozilo."
      />
    </div>
  );
}