import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { appointmentsApi } from '../api/appointments';
import { clientsApi } from '../api/clients';
import { vehiclesApi } from '../api/vehicles';
import { servicesApi } from '../api/services';
import { workersApi } from '../api/workers';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import { formatDateTime, formatPrice } from '../utils/formatters';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter i pretraga
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal za dodavanje/izmenu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Modal za brisanje
  const [deleteId, setDeleteId] = useState(null);

  // Forma
  const [formData, setFormData] = useState({
    client_id: '',
    vehicle_id: '',
    service_id: '',
    worker_id: '',
    appointment_time: '',
    total_price: '',
    status: 'Pending',
  });

  // Vozila za izabranog klijenta
  const [clientVehicles, setClientVehicles] = useState([]);

  // ============================================
  // Učitavanje podataka
  // ============================================
  const loadData = async () => {
    try {
      const [a, c, s, w] = await Promise.all([
        appointmentsApi.getAll(),
        clientsApi.getAll(),
        servicesApi.getAll(),
        workersApi.getAll(),
      ]);
      setAppointments(a);
      setClients(c);
      setServices(s);
      setWorkers(w);
    } catch (err) {
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // Kad se promeni klijent, učitaj njegova vozila
  // ============================================
  useEffect(() => {
    if (!formData.client_id) {
      setClientVehicles([]);
      return;
    }
    vehiclesApi
      .getByClient(formData.client_id)
      .then(setClientVehicles)
      .catch(() => setClientVehicles([]));
  }, [formData.client_id]);

  // ============================================
  // Otvori modal za dodavanje
  // ============================================
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      client_id: '',
      vehicle_id: '',
      service_id: '',
      worker_id: '',
      appointment_time: '',
      total_price: '',
      status: 'Pending',
    });
    setClientVehicles([]);
    setIsModalOpen(true);
  };

  // ============================================
  // Otvori modal za izmenu
  // ============================================
  const handleOpenEdit = (appt) => {
    setEditingId(appt.appointment_id);
    setFormData({
      client_id: appt.client_id || '',
      vehicle_id: appt.vehicle_id || '',
      service_id: appt.service_id || '',
      worker_id: appt.worker_id || '',
      appointment_time: appt.appointment_time
        ? new Date(appt.appointment_time).toISOString().slice(0, 16)
        : '',
      total_price: appt.total_price || '',
      status: appt.status || 'Pending',
    });
    setIsModalOpen(true);
  };

  // ============================================
  // Promena usluge — auto-popuni cenu
  // ============================================
  const handleServiceChange = (serviceId) => {
    const service = services.find((s) => s.service_id == serviceId);
    setFormData({
      ...formData,
      service_id: serviceId,
      total_price: service ? service.price : formData.total_price,
    });
  };

  // ============================================
  // Submit forme
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        client_id: Number(formData.client_id),
        vehicle_id: Number(formData.vehicle_id),
        service_id: Number(formData.service_id),
        worker_id: Number(formData.worker_id),
        total_price: Number(formData.total_price),
      };

      if (editingId) {
        await appointmentsApi.update(editingId, payload);
        toast.success('Termin izmenjen');
      } else {
        await appointmentsApi.create(payload);
        toast.success('Termin kreiran');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Greška');
    }
  };

  // ============================================
  // Promena statusa
  // ============================================
  const handleStatusChange = async (id, status) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      toast.success(`Status promenjen na ${status}`);
      loadData();
    } catch (err) {
      toast.error('Greška pri promeni statusa');
    }
  };

  // ============================================
  // Brisanje
  // ============================================
  const handleDelete = async () => {
    try {
      await appointmentsApi.remove(deleteId);
      toast.success('Termin obrisan');
      loadData();
    } catch (err) {
      toast.error('Greška pri brisanju');
    }
  };

  // ============================================
  // Filtriranje
  // ============================================
  const filtered = appointments.filter((a) => {
    const matchesSearch =
      !search ||
      a.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
      a.client_phone?.includes(search);

    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <Loading />;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Termini</h1>
          <p className="text-slate-400 mt-1">
            Ukupno: <span className="text-white font-semibold">{filtered.length}</span> od {appointments.length}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg transition flex items-center gap-2"
        >
          <Plus size={18} /> Novi termin
        </button>
      </div>

      {/* Filteri */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Pretraži po klijentu, tablicama ili telefonu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        >
          <option value="all">Svi statusi</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Datum i vreme</th>
                <th className="p-4">Klijent</th>
                <th className="p-4">Vozilo</th>
                <th className="p-4">Usluga</th>
                <th className="p-4">Radnik</th>
                <th className="p-4">Cena</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filtered.length > 0 ? (
                filtered.map((a) => (
                  <tr key={a.appointment_id} className="hover:bg-slate-800/30 transition">
                    <td className="p-4 text-slate-300 text-sm whitespace-nowrap">
                      {formatDateTime(a.appointment_time)}
                    </td>
                    <td className="p-4">
                      <div className="text-white font-semibold text-sm">{a.client_name}</div>
                      <div className="text-slate-500 text-xs">{a.client_phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 text-sm">{a.vehicle}</div>
                      <div className="text-yellow-400 font-mono text-xs">{a.license_plate}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 text-sm">{a.service_name}</div>
                      <div className="text-slate-500 text-xs">{a.duration_minutes} min</div>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">{a.worker_name}</td>
                    <td className="p-4 text-emerald-400 font-bold text-sm whitespace-nowrap">
                      {formatPrice(a.total_price)}
                    </td>
                    <td className="p-4">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.appointment_id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white cursor-pointer focus:outline-none focus:border-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(a)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition"
                        title="Izmeni"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(a.appointment_id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
                        title="Obriši"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-500">
                    Nema termina za prikaz.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ZA DODAVANJE/IZMENU */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Izmeni termin' : 'Novi termin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Klijent */}
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
              Klijent *
            </label>
            <select
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value, vehicle_id: '' })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Izaberi klijenta...</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Vozilo */}
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
              Vozilo *
            </label>
            <select
              required
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              disabled={!formData.client_id}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">
                {!formData.client_id
                  ? 'Prvo izaberi klijenta'
                  : clientVehicles.length === 0
                  ? 'Klijent nema vozila'
                  : 'Izaberi vozilo...'}
              </option>
              {clientVehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.brand} {v.model} ({v.license_plate})
                </option>
              ))}
            </select>
          </div>

          {/* Usluga */}
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
              Usluga *
            </label>
            <select
              required
              value={formData.service_id}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Izaberi uslugu...</option>
              {services.map((s) => (
                <option key={s.service_id} value={s.service_id}>
                  {s.service_name} — {formatPrice(s.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Radnik */}
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
              Radnik *
            </label>
            <select
              required
              value={formData.worker_id}
              onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">Izaberi radnika...</option>
              {workers.map((w) => (
                <option key={w.worker_id} value={w.worker_id}>
                  {w.full_name} — {w.position}
                </option>
              ))}
            </select>
          </div>

          {/* Datum i vreme + Cena */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
                Datum i vreme *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
                Cena (RSD) *
              </label>
              <input
                type="number"
                required
                value={formData.total_price}
                onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status (samo pri izmeni) */}
          {editingId && (
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-400 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {/* Dugmadi */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium text-sm transition"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg transition"
            >
              {editingId ? 'Sačuvaj izmene' : 'Kreiraj termin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* POTVRDA BRISANJA */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Brisanje termina"
        message="Da li si siguran da želiš da obrišeš ovaj termin? Ova akcija se ne može poništiti."
      />
    </div>
  );
}