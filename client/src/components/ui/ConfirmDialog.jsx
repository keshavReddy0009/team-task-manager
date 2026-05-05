import Modal from './Modal.jsx';
import Button from './button.jsx';
import Spinner from './Spinner.jsx';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  isLoading
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
