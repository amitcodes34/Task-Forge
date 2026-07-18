import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, bidsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DeliveryModal from '../components/DeliveryModal';
import StripePaymentModal from '../components/StripePaymentModal';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isClient, token } = useAuth();
  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Bid placement state
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Delivery Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  // Stripe Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [acceptedBidAmount, setAcceptedBidAmount] = useState(0);

  const loadData = async () => {
    try {
      const { data } = await projectsAPI.getById(id);
      setProject(data?.data?.project);
      
      // If user is client, fetch bids
      if (isClient) {
        const { data: bidsData } = await bidsAPI.list(id);
        setBids(bidsData?.data?.bids || []);
      }
    } catch (err) {
      setError('Could not load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isClient]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBid(true);
    try {
      await bidsAPI.create(id, { amount: Number(bidAmount), proposal: bidProposal, deliveryDays: Number(deliveryDays) });
      setBidSuccess(true);
      setBidAmount('');
      setBidProposal('');
      setDeliveryDays('');
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorDetails = err.response.data.errors.map(e => e.message).join('\n');
        alert(`Failed to submit bid:\n${errorDetails}`);
      } else {
        alert(err.response?.data?.message || 'Failed to submit bid');
      }
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleAcceptBid = async (bidId, bidAmount) => {
    try {
      const { data } = await bidsAPI.accept(bidId);
      
      // 2. Open Stripe modal with the client secret
      const secret = data?.data?.result?.client_secret || data?.data?.client_secret;
      if (secret) {
        setClientSecret(secret);
        setAcceptedBidAmount(bidAmount);
        setIsPaymentModalOpen(true);
      } else {
        handlePaymentSuccess();
      }
      
    } catch (err) {
      console.error(err);
      alert('Failed to initiate payment.');
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    alert('Payment successful and funds held in escrow. Bid accepted!');
    loadData(); // Refresh project to show IN_PROGRESS status
  };

  if (loading) return <div className="py-12 flex justify-center"><div className="spinner"></div></div>;
  if (error || !project) return <div className="p-6"><div className="alert alert--danger">{error || 'Project not found'}</div></div>;

  return (
    <div className="bg-surface-low text-on-surface" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div className="container py-12">
        <div className="grid-12">
          
          {/* Main Content Area */}
          <div className="lg-col-8">
            <div className="bg-surface-lowest p-8 rounded-xl shadow-sm border-outline mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-headline-xl text-primary mb-2">{project.title}</h1>
                  <div className="flex items-center gap-4 text-label-md text-on-surface-variant">
                    <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span> Worldwide
                    </span>
                  </div>
                </div>
                <span className={`badge ${project.status === 'OPEN' ? 'badge--open' : 'badge--warning'}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>

              <div className="border-t border-outline py-6 mb-6">
                <p className="text-body-md" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>{project.description}</p>
              </div>

              <div className="border-t border-outline py-6 mb-6">
                <h3 className="text-headline-md text-primary mb-4">Skills and Expertise</h3>
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                  {project.skillsRequired?.map(skill => (
                    <span key={skill} className="badge" style={{ background: 'var(--color-bg-overlay)', color: 'var(--color-text-secondary)', padding: '8px 16px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Freelancer View: Bidding Form */}
              {!isClient && project.status === 'OPEN' && (
                <div className="border-t border-outline pt-6">
                  <h3 className="text-headline-md text-primary mb-4">Submit a Proposal</h3>
                  {bidSuccess && <div className="alert alert--success mb-4">Your proposal has been successfully submitted!</div>}
                  
                  <form onSubmit={handleBidSubmit} className="flex-col gap-4">
                    <div>
                      <label className="text-label-md text-on-surface-variant mb-2" style={{ display: 'block' }}>Bid Amount ($)</label>
                      <input 
                        type="number" 
                        required 
                        min="5"
                        className="search-input" 
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        placeholder="e.g. 500"
                      />
                    </div>
                    <div>
                      <label className="text-label-md text-on-surface-variant mb-2" style={{ display: 'block' }}>Delivery Time (Days)</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        max="365"
                        className="search-input" 
                        value={deliveryDays}
                        onChange={e => setDeliveryDays(e.target.value)}
                        placeholder="e.g. 14"
                      />
                    </div>
                    <div>
                      <label className="text-label-md text-on-surface-variant mb-2" style={{ display: 'block' }}>Cover Letter</label>
                      <textarea 
                        required 
                        minLength={50}
                        rows="5"
                        className="search-input" 
                        style={{ height: 'auto', resize: 'vertical' }}
                        value={bidProposal}
                        onChange={e => setBidProposal(e.target.value)}
                        placeholder="Introduce yourself and explain why you're a great fit for this job..."
                      />
                    </div>
                    <button type="submit" disabled={submittingBid} className="btn btn--primary lg-col-3" style={{ width: 'fit-content' }}>
                      {submittingBid ? 'Submitting...' : 'Submit Proposal'}
                    </button>
                  </form>
                </div>
              )}

              {/* Deliverable Section for Freelancer */}
              {!isClient && project.status === 'IN_PROGRESS' && project.freelancerId === user?.id && (
                <div className="border-t border-outline pt-6 mt-6">
                  <h3 className="text-headline-md text-primary mb-4">Workspace</h3>
                  <button onClick={() => setIsDeliveryModalOpen(true)} className="btn btn--primary">
                    Submit Final Work
                  </button>
                </div>
              )}
            </div>

            {/* Client View: Review Bids */}
            {isClient && project.status === 'OPEN' && bids.length > 0 && (
              <div className="bg-surface-lowest p-8 rounded-xl shadow-sm border-outline">
                <h3 className="text-headline-lg text-primary mb-6">Proposals ({bids.length})</h3>
                <div className="flex-col gap-4">
                  {bids.map(bid => (
                    <div key={bid.id} className="card p-6 border-outline">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary text-on-primary flex items-center justify-center rounded-full text-headline-md" style={{ width: '48px', height: '48px' }}>
                            {bid.freelancer?.firstName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="text-headline-md text-primary">{bid.freelancer?.firstName} {bid.freelancer?.lastName}</h4>
                            <div className="flex items-center gap-1 text-secondary">
                              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span className="text-label-sm">{bid.freelancer?.avgRating > 0 ? bid.freelancer?.avgRating : 'New'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-headline-md text-on-surface">
                          ${Number(bid.amount).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="text-label-md mb-2">Cover Letter</h5>
                        <p className="text-body-md text-on-surface-variant" style={{ whiteSpace: 'pre-wrap' }}>{bid.proposal}</p>
                      </div>
                      
                      {bid.aiScore && (
                        <div className="bg-surface-container p-4 rounded-md mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary">smart_toy</span>
                          <span className="text-label-md">AI Match Score: <strong>{bid.aiScore}/100</strong></span>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button onClick={() => handleAcceptBid(bid.id, bid.amount)} className="btn btn--primary flex-grow">
                          Accept Proposal & Pay
                        </button>
                        <button className="btn btn--outline flex-grow">
                          Message
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg-col-4">
            <div className="sticky top-24 flex-col gap-6">
              {/* Project Details Box */}
              <div className="bg-surface-lowest p-6 rounded-xl shadow-sm border-outline">
                <div className="mb-6">
                  <h3 className="text-label-md text-on-surface-variant mb-1">Fixed Price</h3>
                  <div className="text-headline-xl text-primary">${Number(project.budget).toLocaleString()}</div>
                </div>
                
                <div className="flex-col gap-4 border-t border-outline pt-6">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">work_history</span>
                    <div>
                      <h4 className="text-label-md">Experience Level</h4>
                      <p className="text-body-md text-on-surface-variant">Intermediate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">calendar_today</span>
                    <div>
                      <h4 className="text-label-md">Project Length</h4>
                      <p className="text-body-md text-on-surface-variant">Less than 1 month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About the Client Box */}
              <div className="bg-surface-lowest p-6 rounded-xl shadow-sm border-outline">
                <h3 className="text-headline-md text-primary mb-4">About the Client</h3>
                <div className="flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">verified</span>
                    <span className="text-label-md">Payment verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-label-md">{project.client?.avgRating > 0 ? project.client?.avgRating : 'New Client'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                    <span className="text-body-md text-on-surface-variant">United States</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {isDeliveryModalOpen && (
        <DeliveryModal 
          projectId={id} 
          onClose={() => setIsDeliveryModalOpen(false)}
          onSuccess={() => {
            setIsDeliveryModalOpen(false);
            loadData();
          }}
        />
      )}

      {isPaymentModalOpen && clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentModal
            clientSecret={clientSecret}
            amount={acceptedBidAmount}
            onSuccess={handlePaymentSuccess}
            onClose={() => setIsPaymentModalOpen(false)}
          />
        </Elements>
      )}
    </div>
  );
};

export default ProjectDetailPage;
