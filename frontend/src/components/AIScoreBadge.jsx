const AIScoreBadge = ({ bid }) => {
  const getProps = (score) => {
    if (score === null || score === undefined)
      return { color: '#666660', bg: 'rgba(160, 160, 154, 0.1)', text: 'Not scored' };
    if (score >= 70)
      return { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', text: `AI Score: ${score}` };
    if (score >= 40)
      return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: `AI Score: ${score}` };
    return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: `AI Score: ${score}` };
  };
  const props = getProps(bid.aiScore);

  return (
    <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
      <span
        title={bid.aiReason || 'AI has not scored this bid yet.'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '4px',
          background: props.bg,
          color: props.color,
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'help',
        }}
      >
        ✨ {props.text}
        {bid.aiReason && <span style={{ opacity: 0.7, marginLeft: '2px' }}>ℹ️</span>}
      </span>
      {bid.aiFlags && bid.aiFlags.includes('generic_message') && (
        <span
          style={{
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          ⚠️ Generic Message
        </span>
      )}
    </div>
  );
};

export default AIScoreBadge;
