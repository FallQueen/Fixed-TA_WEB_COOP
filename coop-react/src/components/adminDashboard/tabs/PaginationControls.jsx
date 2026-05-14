const buttonStyle = (disabled) => ({
  border: '1px solid #edf2f7',
  backgroundColor: disabled ? '#f8fafc' : '#ffffff',
  color: disabled ? '#cbd5e1' : '#334155',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '10px',
  fontWeight: '900',
  cursor: disabled ? 'not-allowed' : 'pointer',
});

function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
  isMobile,
  itemLabel = 'data',
}) {
  if (totalItems === 0) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : ((page - 1) * pageSize) + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexDirection: isMobile ? 'column' : 'row', marginTop: '16px', color: '#94a3b8', fontSize: '11px', fontWeight: '700' }}>
      <div>
        Menampilkan {startItem}-{endItem} dari {totalItems} {itemLabel}.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={buttonStyle(page <= 1)}
        >
          Prev
        </button>
        <span style={{ color: '#334155', fontWeight: '900' }}>Halaman {page} / {totalPages}</span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={buttonStyle(page >= totalPages)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;
