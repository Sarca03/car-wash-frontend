import Modal from './Modal';
import { Trash2 } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 mb-4">
          <Trash2 className="text-red-500" size={24} />
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition"
          >
            Otkaži
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition"
          >
            Obriši
          </button>
        </div>
      </div>
    </Modal>
  );
}
