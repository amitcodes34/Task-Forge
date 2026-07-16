import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentModal = ({ clientSecret, onClose, onSuccess, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Normally you redirect, but we want to handle it on the same page
      },
      redirect: 'if_required', // Avoids immediate redirect so we can handle success state
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
    } else {
      setLoading(false);
      onSuccess();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <h2 className="modal__title">Secure Payment Escrow</h2>
        <p style={{ marginBottom: '20px', color: 'var(--color-text-secondary)' }}>
          Your payment of <strong>${amount}</strong> will be held securely in escrow until you mark
          the project as completed.
        </p>

        {error && (
          <div className="alert alert--error" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <PaymentElement />
          </div>

          <div className="modal__actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn btn--primary ${loading ? 'btn--loading' : ''}`}
              disabled={!stripe || loading}
            >
              {loading ? 'Processing...' : 'Pay to Escrow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripePaymentModal;
