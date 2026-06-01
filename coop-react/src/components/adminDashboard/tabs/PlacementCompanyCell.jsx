function PlacementCompanyCell({ placement, emptyLabel = '-' }) {
  if (!placement) {
    return <span style={{ color: '#cbd5e1' }}>{emptyLabel}</span>;
  }

  const previousCompanies = placement.previousCompanies || [];

  return (
    <div style={{ minWidth: 0 }}>
      <strong style={{ color: '#111827', fontSize: '13px', fontWeight: '800' }}>
        {placement.company_name || emptyLabel}
      </strong>
      {previousCompanies.length > 0 && (
        <div style={{ marginTop: '5px', color: '#64748b', fontSize: '11px', lineHeight: 1.45 }}>
          Perusahaan lama: {previousCompanies.join(', ')}
        </div>
      )}
    </div>
  );
}

export default PlacementCompanyCell;
