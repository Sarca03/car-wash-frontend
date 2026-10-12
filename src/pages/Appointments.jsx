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
import {
  formatDateTime,
  formatPrice,
  statusLabel,
  STATUSES,
  toLocalInputValue,
  fromLocalInputValue,
} from '../utils/formatters';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter i pretraga
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [deleteId, setDeleteId] = useState(null);

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
    } catch {
      toast.error('Greška pri učitavanju');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Kad se promeni klijent, učitaj njegova vozila
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

  const handleOpenEdit = (appt) => {
    setEditingId(appt.appointment_id);
    setFormData({
      client_id: appt.client_id || '',
      vehicle_id: appt.vehicle_id || '',
      service_id: appt.service_id || '',
      worker_id: appt.worker_id || '',
      appointment_time: toLocalInputValue(appt.appointment_time),
      total_price: appt.total_price || '',
      status: appt.status || 'Pending',
    });
    setIsModalOpen(true);
  };

  // Izbor usluge popunjava cenu
  const handleServiceChange = (serviceId) => {
    const service = services.find((s) => s.service_id == serviceId);
    setFormData({
      ...formData,
      service_id: serviceId,
      total_price: service ? service.price : formData.total_price,
    });
  };

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
        appointment_time: fromLocalInputValue(formData.appointment_time),
      };

      if (editingId) {
        await appointmentsApi.update(editingId, payload);
        toast.success('Termin izmenjen');
      } else {
        await appointmentsApi.create(payload);
        toast.success('Termin zakazan');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Greška');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      toast.success(`Status: ${statusLabel(status)}`);
      loadData();
    } catch {
      toast.error('Greška pri promeni statusa');
    }
  };

  const handleDelete = async () => {
    try {
      await appointmentsApi.remove(deleteId);
      toast.success('Termin obrisan');
      loadData();
    } catch {
      toast.error('Greška pri brisanju');
    }
  };

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
    <div className="p-4 md:p-6 lg:p-8">
     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Termini</h1>
          <p className="text-slate-500 mt-1">
            Ukupno: <span className="text-slate-900 font-semibold">{filtered.length}</span> od {appointments.length}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="edit-only w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-5 py-3 rounded-full font-semibold text-sm shadow-lg flex items-center justify-center gap-2"
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
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
        >
          <option value="all">Svi statusi</option>
          {STATUSES.map((st) => (
            <option key={st} value={st}>{statusLabel(st)}</option>
          ))}
        </select>
      </div>

      {/* Telefon: kartice umesto tabele */}
      <ul className="md:hidden space-y-3">
        {filtered.length > 0 ? (
          filtered.map((a) => (
            <li key={a.appointment_id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-brand-600 tabular">{formatDateTime(a.appointment_time)}</p>
                  <p className="font-bold text-slate-900 mt-1 truncate">{a.client_name}</p>
                  <p className="text-xs text-slate-500">{a.client_phone}</p>
                </div>
                <p className="tabular font-bold text-slate-900 whitespace-nowrap">{formatPrice(a.total_price)}</p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                <span>{a.service_name}</span>
                <span className="text-slate-300">·</span>
                <span>{a.vehicle}</span>
                <span className="plate">{a.license_plate}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Radnik: {a.worker_name || '-'}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="demo-only"><StatusBadge status={a.status} /></span>
                <select
                  value={a.status}
                  onChange={(e) => handleStatusChange(a.appointment_id, e.target.value)}
                  aria-label="Status termina"
                  className="edit-only bg-page rounded-full px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-brand-100"
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>{statusLabel(st)}</option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenEdit(a)}
                    className="edit-only w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                    aria-label="Izmeni"
                    title="Izmeni"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(a.appointment_id)}
                    className="edit-only w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50"
                    aria-label="Obriši"
                    title="Obriši"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="card p-8 text-center text-slate-500 text-sm">Nema termina za prikaz.</li>
        )}
      </ul>

      {/* Desktop: tabela */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-page text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="p-4">Datum i vreme</th>
                <th className="p-4">Klijent</th>
                <th className="p-4">Vozilo</th>
                <th className="p-4">Usluga</th>
                <th className="p-4">Radnik</th>
                <th className="p-4">Cena</th>
                <th className="p-4">Status</th>
                <th className="edit-only p-4 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((a) => (
                  <tr key={a.appointment_id} className="hover:bg-page transition">
                    <td className="p-4 text-slate-700 text-sm whitespace-nowrap">
                      {formatDateTime(a.appointment_time)}
                    </td>
                    <td className="p-4">
                      <div className="text-slate-900 font-semibold text-sm">{a.client_name}</div>
                      <div className="text-slate-500 text-xs">{a.client_phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 text-sm">{a.vehicle}</div>
                      <div className="plate mt-1">{a.license_plate}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-700 text-sm">{a.service_name}</div>
                      <div className="text-slate-500 text-xs">{a.duration_minutes} min</div>
                    </td>
                    <td className="p-4 text-slate-700 text-sm">{a.worker_name || '-'}</td>
                    <td className="p-4 text-slate-900 font-bold text-sm whitespace-nowrap">
                      {formatPrice(a.total_price)}
                    </td>
                    <td className="p-4">
                      <span className="demo-only"><StatusBadge status={a.status} /></span>
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.appointment_id, e.target.value)}
                        className="edit-only bg-page border border-transparent rounded-lg px-2 py-1 text-xs text-slate-900 cursor-pointer focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>{statusLabel(st)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="edit-only p-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(a)}
                        className="edit-only text-slate-400 hover:text-brand-600 p-2 rounded-lg hover:bg-brand-50 transition"
                        title="Izmeni"
                        aria-label="Izmeni"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteId(a.appointment_id)}
                        className="edit-only text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                        title="Obriši"
                        aria-label="Obriši"
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

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Izmeni termin' : 'Novi termin'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">
              Klijent *
            </label>
            <select
              required
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value, vehicle_id: '' })}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
            >
              <option value="">Izaberi klijenta...</option>
              {clients.map((c) => (
                <option key={c.client_id} value={c.client_id}>
                  {c.full_name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">
              Vozilo *
            </label>
            <select
              required
              value={formData.vehicle_id}
              onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
              disabled={!formData.client_id}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white disabled:opacity-50"
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

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">
              Usluga *
            </label>
            <select
              required
              value={formData.service_id}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
            >
              <option value="">Izaberi uslugu...</option>
              {services.map((s) => (
                <option key={s.service_id} value={s.service_id}>
                  {s.service_name}, {formatPrice(s.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">
              Radnik *
            </label>
            <select
              required
              value={formData.worker_id}
              onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
              className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
            >
              <option value="">Izaberi radnika...</option>
              {workers.map((w) => (
                <option key={w.worker_id} value={w.worker_id}>
                  {w.full_name}, {w.position}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">
                Datum i vreme *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">
                Cena (RSD) *
              </label>
              <input
                type="number"
                required
                value={formData.total_price}
                onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
                className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
              />
            </div>
          </div>

          {/* Status (samo pri izmeni) */}
          {editingId && (
            <div>
              <label className="block text-xs uppercase font-semibold text-slate-500 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-page border border-transparent rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 focus:bg-white"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>{statusLabel(st)}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition"
            >
              Otkaži
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-semibold text-sm shadow-lg transition"
            >
              {editingId ? 'Sačuvaj izmene' : 'Zakaži termin'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Brisanje termina"
        message="Obrisati ovaj termin? Ovo ne može da se vrati."
      />
    </div>
  );
}