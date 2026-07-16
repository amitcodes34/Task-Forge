const DeliveryModal = ({
  showDeliverModal,
  setShowDeliverModal,
  handleDeliver,
  deliveryForm,
  setDeliveryForm,
  deliverLoading,
}) => {
  if (!showDeliverModal) return null;

  return (
    <div className="modal-backdrop" onClick={() => setShowDeliverModal(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">📦 Submit Your Delivery</h2>
        <form onSubmit={handleDeliver}>
          <div className="form-group">
            <label className="form-label">Delivery Note *</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Describe what you've built, any instructions, or notes for the client..."
              value={deliveryForm.note}
              onChange={(e) => setDeliveryForm({ ...deliveryForm, note: e.target.value })}
              required
              minLength={10}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Attachment URL (optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://github.com/yourname/project or https://drive.google.com/..."
              value={deliveryForm.attachmentUrl}
              onChange={(e) =>
                setDeliveryForm({ ...deliveryForm, attachmentUrl: e.target.value })
              }
            />
            <span className="form-hint">
              Link to GitHub, Google Drive, Dropbox, or any public URL
            </span>
          </div>
          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setShowDeliverModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn--success ${deliverLoading ? 'btn--loading' : ''}`}
              disabled={deliverLoading}
            >
              {deliverLoading ? 'Submitting...' : '📦 Confirm Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryModal;
