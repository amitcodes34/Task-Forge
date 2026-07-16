const StatusBadge = ({ status }) => {
  const map = {
    OPEN: 'open',
    IN_PROGRESS: 'in-progress',
    DELIVERED: 'delivered',
    COMPLETED: 'completed',
  };
  return (
    <span className={`badge badge--${map[status] || 'open'}`}>{status?.replace('_', ' ')}</span>
  );
};

export default StatusBadge;
