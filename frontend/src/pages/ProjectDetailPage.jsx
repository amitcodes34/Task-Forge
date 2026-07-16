import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, bidsAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useProjectSocket from '../hooks/useProjectSocket';
import Toast from '../components/Toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentModal from '../components/StripePaymentModal';
import StatusBadge from '../components/StatusBadge';
import AIScoreBadge from '../components/AIScoreBadge';
import DeliveryModal from '../components/DeliveryModal';

const stripePromise = loadStripe('pk_test_12345');

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user, isClient, isFreelancer } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Bid form
  const [bidForm, setBidForm] = useState({ amount: '', proposal: '', deliveryDays: '' });
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError, setBidError] = useState('');

  // Delivery form
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ note: '', attachmentUrl: '' });
  const [deliverLoading, setDeliverLoading] = useState(false);

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewDone, setReviewDone] = useState(false);
  const [toast, setToast] = useState('');

  // Stripe
  const [clientSecret, setClientSecret] = useState('');
  const [paymentBidInfo, setPaymentBidInfo] = useState(null);

  const isOwner = user?.userId === project?.client?.id || user?.id === project?.client?.id;

  const handleNewBid = useCallback((newBid) => {
    setBids((prev) => {
      if (prev.some((b) => b.id === newBid.id)) return prev;
      return [newBid, ...prev];
    });
    setProject((prev) =>
      prev ? { ...prev, _count: { ...prev._count, bids: (prev._count?.bids ?? 0) + 1 } } : prev
    );
    const freelancerName = newBid.freelancer
      ? `${newBid.freelancer.firstName} ${newBid.freelancer.lastName}`
      : 'A freelancer';
    setToast(`🔔 ${freelancerName} placed a bid of $${parseFloat(newBid.amount).toLocaleString()}!`);
  }, []);

  const token = localStorage.getItem('accessToken');
  const { isLive } = useProjectSocket({
    projectId: id,
    token,
    onNewBid: handleNewBid,
    enabled: !!token,
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await projectsAPI.getById(id);
      setProject(data.data.project);
      if (isClient) {
        try {
          const bData = await bidsAPI.list(id);
          setBids(bData.data.data.bids || []);
        } catch {}
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidError('');
    setBidLoading(true);
    try {
      await bidsAPI.create(id, {
        amount: Number(bidForm.amount),
        proposal: bidForm.proposal,
        deliveryDays: Number(bidForm.deliveryDays),
      });
      setActionMsg('Your bid was placed successfully!');
      setBidForm({ amount: '', proposal: '', deliveryDays: '' });
      load();
    } catch (err) {
      setBidError(err.response?.data?.message || 'Failed to place bid.');
    } finally {
      setBidLoading(false);
    }
  };

  const handleAcceptBid = async (bidId, bidAmount) => {
    if (!window.confirm('Accept this bid? You will be asked to pay to an escrow account.')) return;
    try {
      const { data } = await bidsAPI.accept(bidId);
      if (data.data && data.data.client_secret) {
        setClientSecret(data.data.client_secret);
        setPaymentBidInfo({ id: bidId, amount: bidAmount });
      } else {
        setActionMsg('Bid accepted! Project is now in progress.');
        load();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept bid.');
    }
  };

  const handlePaymentSuccess = () => {
    setClientSecret('');
    setPaymentBidInfo(null);
    setActionMsg('Payment successful! Project is now in progress (funds in escrow).');
    load();
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    setDeliverLoading(true);
    try {
      await projectsAPI.deliver(id, {
        note: deliveryForm.note || 'Work delivered.',
        attachmentUrl: deliveryForm.attachmentUrl || null,
      });
      setActionMsg('Project marked as delivered! Awaiting client confirmation.');
      setShowDeliverModal(false);
      setDeliveryForm({ note: '', attachmentUrl: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deliver.');
    } finally {
      setDeliverLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Confirm this project is completed?')) return;
    try {
      await projectsAPI.complete(id);
      setActionMsg('Project completed! You can now leave a review.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete project.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewLoading(true);
    const targetId = isClient ? project.winningBid?.freelancer?.id : project.client?.id;
    try {
      await reviewsAPI.create({
        projectId: id,
        targetId,
        ...reviewForm,
        rating: Number(reviewForm.rating),
      });
      setReviewDone(true);
      setActionMsg('Review submitted successfully!');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  if (error) return <div className="p-8"><div className="alert alert--error">{error}</div></div>;
  if (!project) return null;

  const budget = parseFloat(project.budget).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const isAcceptedFreelancer = isFreelancer && project.winningBid?.freelancer?.id === (user?.userId || user?.id);
  const clientStats = project.client;

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen selection:bg-secondary-container selection:text-on-secondary-container">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 pb-32">
        
        {/* Back Navigation & Alerts */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary hover:text-secondary transition-colors font-label-md group">
            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
            Back to Search
          </button>
          
          {actionMsg && <div className="mt-4 p-4 bg-secondary-container/30 text-secondary-container-on rounded-lg border border-secondary-container">{actionMsg}</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Main Content Area (8 Columns) */}
          <div className="lg:col-span-8 space-y-gutter">
            
            {/* Job Overview Card */}
            <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-label-md">
                    <StatusBadge status={project.status} />
                  </div>
                  <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary leading-tight">
                    {project.title}
                  </h2>
                  <p className="text-on-surface-variant text-body-md flex items-center gap-2">
                    Posted {new Date(project.createdAt).toLocaleDateString()}
                    {clientStats?.location && (
                      <> • <span className="material-symbols-outlined text-[16px]">location_on</span> {clientStats.location}</>
                    )}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button className="p-3 rounded-xl border border-outline-variant text-primary hover:bg-surface-container-low transition-all active:scale-95">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-outline-variant/30 mb-8">
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Budget</p>
                  <p className="font-headline-md text-primary">{budget}</p>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Duration</p>
                  <p className="font-headline-md text-primary">Fixed</p>
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Bids</p>
                  <p className="font-headline-md text-primary">{project._count?.bids ?? 0}</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none space-y-4">
                <h3 className="font-headline-md text-primary">Job Description</h3>
                <p className="text-body-md text-on-surface leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </section>

            {/* Requirements & Skills (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30">
                <h3 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">psychology</span>
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skillsRequired?.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-surface-container text-primary font-label-md rounded-full border border-primary-container/20">
                      {skill}
                    </span>
                  ))}
                  {(!project.skillsRequired || project.skillsRequired.length === 0) && (
                    <p className="text-on-surface-variant">No specific skills listed.</p>
                  )}
                </div>
              </section>

              {/* Action specific sections (Bids form, deliver, review) */}
              {(isFreelancer || isAcceptedFreelancer || (isOwner && project.status === 'COMPLETED')) && (
                <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col justify-center">
                  
                  {isAcceptedFreelancer && project.status === 'IN_PROGRESS' && (
                    <div className="text-center">
                      <h3 className="font-headline-md text-primary mb-2">Ready to Deliver?</h3>
                      <button className="btn btn--success" onClick={() => setShowDeliverModal(true)}>
                        📦 Submit Delivery
                      </button>
                    </div>
                  )}
                  {isOwner && project.status === 'DELIVERED' && (
                    <div className="text-center">
                      <h3 className="font-headline-md text-primary mb-2">Work Delivered</h3>
                      <button className="btn btn--primary" onClick={handleComplete}>
                        ✅ Confirm Completion
                      </button>
                    </div>
                  )}

                  {project.status === 'COMPLETED' && !reviewDone && (isOwner || isAcceptedFreelancer) && (
                    <div>
                      <h3 className="font-headline-md text-primary mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">star_rate</span>
                        Leave a Review
                      </h3>
                      {reviewError && <div className="text-error mb-2 text-sm">{reviewError}</div>}
                      <form onSubmit={handleReviewSubmit}>
                        <div className="mb-4">
                          <div className="flex gap-1 text-2xl">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                                className="cursor-pointer"
                                style={{ color: s <= reviewForm.rating ? 'var(--color-warning)' : 'var(--color-bg-overlay)' }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <textarea
                            className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none"
                            rows={3}
                            placeholder="Share your experience..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            required
                            minLength={10}
                          />
                        </div>
                        <button type="submit" className={`w-full py-2 bg-primary text-white rounded-lg font-bold ${reviewLoading ? 'opacity-70' : 'hover:bg-primary-container transition-colors'}`} disabled={reviewLoading}>
                          {reviewLoading ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  )}

                  {isFreelancer && project.status === 'OPEN' && !isAcceptedFreelancer && (
                    <div>
                      <h3 className="font-headline-md text-primary mb-4">💡 Place Your Bid</h3>
                      {bidError && <div className="text-error mb-2 text-sm">{bidError}</div>}
                      <form onSubmit={handleBidSubmit}>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-label-sm text-on-surface-variant mb-1">Amount ($)</label>
                            <input
                              type="number"
                              className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest"
                              value={bidForm.amount}
                              onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                              required
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-label-sm text-on-surface-variant mb-1">Days</label>
                            <input
                              type="number"
                              className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest"
                              value={bidForm.deliveryDays}
                              onChange={(e) => setBidForm({ ...bidForm, deliveryDays: e.target.value })}
                              required
                              min="1"
                            />
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-label-sm text-on-surface-variant mb-1">Proposal</label>
                          <textarea
                            className="w-full p-2 border border-outline-variant rounded-lg bg-surface-container-lowest"
                            rows={3}
                            value={bidForm.proposal}
                            onChange={(e) => setBidForm({ ...bidForm, proposal: e.target.value })}
                            required
                            minLength={50}
                          />
                        </div>
                        <button type="submit" className={`w-full py-2 bg-primary text-white rounded-lg font-bold ${bidLoading ? 'opacity-70' : 'hover:bg-primary-container transition-colors'}`} disabled={bidLoading}>
                          {bidLoading ? 'Submitting...' : 'Submit Bid'}
                        </button>
                      </form>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Bids List for Client */}
            {isOwner && (
              <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 mt-6">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="font-headline-md text-primary m-0">📋 Bids ({bids.length})</h3>
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 border border-green-300 text-xs font-bold text-green-600 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500" /> Offline
                    </span>
                  )}
                </div>

                {bids.length === 0 ? (
                  <p className="text-on-surface-variant text-center py-8">No bids yet. Waiting for freelancers...</p>
                ) : (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div key={bid.id} className="p-4 border border-outline-variant/50 rounded-xl bg-surface">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-headline-md text-primary">${parseFloat(bid.amount).toLocaleString()}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {bid.status}
                          </span>
                        </div>
                        <p className="font-bold text-on-surface">{bid.freelancer?.firstName} {bid.freelancer?.lastName}</p>
                        <div className="my-2"><AIScoreBadge bid={bid} /></div>
                        <p className="text-sm text-on-surface-variant mt-2 line-clamp-3">{bid.proposal}</p>
                        <p className="text-xs text-outline mt-2">🗓 {bid.deliveryDays} days delivery</p>
                        
                        {project.status === 'OPEN' && bid.status === 'PENDING' && (
                          <button
                            className="mt-4 w-full py-2 bg-secondary text-white rounded-lg font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-colors"
                            onClick={() => handleAcceptBid(bid.id, bid.amount)}
                          >
                            ✓ Accept This Bid
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 space-y-gutter">
            
            {/* Client Statistics Card */}
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30 sticky top-24">
              <h3 className="font-headline-md text-primary mb-6">About the Client</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-bold text-headline-md overflow-hidden">
                  {clientStats?.avatarUrl ? (
                    <img src={clientStats.avatarUrl} alt="Client" className="w-full h-full object-cover" />
                  ) : (
                    clientStats?.firstName?.[0]
                  )}
                </div>
                <div>
                  <p className="font-headline-md text-primary">{clientStats?.firstName} {clientStats?.lastName}</p>
                  <p className="text-label-sm text-on-surface-variant">Client</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Hiring rate</span>
                  <span className="font-label-md text-on-surface">{clientStats?.hiringRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Total spent</span>
                  <span className="font-label-md text-on-surface">${Number(clientStats?.totalSpent || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Avg. hourly rate</span>
                  <span className="font-label-md text-on-surface">${clientStats?.avgHourlyRatePaid || 0}/hr</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Location</span>
                  <span className="font-label-md text-on-surface">{clientStats?.location || 'Unspecified'}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-label-md text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  Client Reviews ({clientStats?.avgRating || 0}/5.0)
                </p>
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <p className="text-label-sm text-on-surface-variant mb-2">Based on {clientStats?.reviewCount || 0} reviews.</p>
                </div>
              </div>
            </section>

            {/* Activity Map (Visual Interest) */}
            <section className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30">
              <div className="h-40 bg-slate-200">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC224mAgG5YmnZqy8edMNF9udepi26Hul_opRGX1-1z-ucqApV1YSIwsNrDlDtU-rGu-argX1qbE5SiarJ67dnRwOlz3HmZFS6yenKoKG_DRmgR4uLHLPjcR9tMwhj5pqZMFq-jp_cJb1STtRyIMagBCsnSrJYk5--QgZabzozOiToPEhsB7wsSq0_0mWgw1CUoZhIGbyjqUgGwmK_YDvgoKuZ_vSRaLw8r5YHrXeu8_TZlaY70tpOBj-PI2FKR4IKiBUx2rPvY8Guu" 
                  alt="Map"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-4">
                <p className="text-label-sm text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  Client's local time: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Bottom Action Bar (Mobile Responsive / Fixed) */}
      <div className="fixed bottom-0 md:bottom-auto md:sticky md:bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-outline-variant shadow-[0_-10px_20px_rgba(0,0,0,0.05)] px-margin-mobile md:px-margin-desktop py-4 mb-16 md:mb-0">
        <div className="max-w-container-max mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="text-label-sm text-on-surface-variant uppercase font-bold tracking-widest">Estimated Value</p>
            <p className="font-headline-md text-primary">{budget}</p>
          </div>
          <div className="flex w-full sm:w-auto gap-4">
            <button className="flex-1 sm:flex-none px-8 py-3 rounded-xl border-2 border-primary text-primary font-bold hover:bg-surface-container-low transition-all active:scale-95 duration-150">
              Save for Later
            </button>
            {isFreelancer && project.status === 'OPEN' && !isAcceptedFreelancer && (
              <button 
                onClick={() => document.querySelector('form').scrollIntoView({ behavior: 'smooth' })}
                className="flex-1 sm:flex-none px-12 py-3 rounded-xl bg-secondary text-white font-bold shadow-lg shadow-secondary/20 hover:bg-on-secondary-container transition-all active:scale-95 duration-150 flex items-center justify-center gap-2 group"
              >
                Submit Proposal
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <DeliveryModal 
        showDeliverModal={showDeliverModal}
        setShowDeliverModal={setShowDeliverModal}
        handleDeliver={handleDeliver}
        deliveryForm={deliveryForm}
        setDeliveryForm={setDeliveryForm}
        deliverLoading={deliverLoading}
      />
      <Toast message={toast} type="bid" onClose={() => setToast('')} />

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <StripePaymentModal
            clientSecret={clientSecret}
            amount={paymentBidInfo?.amount}
            onClose={() => { setClientSecret(''); setPaymentBidInfo(null); }}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default ProjectDetailPage;
