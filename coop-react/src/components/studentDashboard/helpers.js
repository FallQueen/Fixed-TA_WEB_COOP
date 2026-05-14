import { getPlacementId } from '../constants';
import { INDONESIAN_DATE_FORMAT, MOBILE_BREAKPOINT } from './styles';

export const getEvaluation = (evaluations, placementId, evalType) =>
  evaluations.find(
    (evaluation) => getPlacementId(evaluation.placement) === placementId && evaluation.eval_type === evalType
  );

export const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

export const formatSubmissionDate = (submittedAt) =>
  new Date(submittedAt).toLocaleDateString('id-ID', INDONESIAN_DATE_FORMAT);

export const getPlacementOptionLabel = (placement) =>
  `${placement.company_name} - ${placement.position}`;

export const getPlacementState = (placements) => {
  const approvedPlacement = placements.find((placement) => placement.is_approved);

  return {
    approvedPlacement,
    approvedPlacementId: approvedPlacement?.id,
    approvedPlacements: placements.filter((placement) => placement.is_approved),
    currentPlacement: placements[0] ?? null,
    hasAnyPlacement: placements.length > 0,
    hasApprovedPlacement: Boolean(approvedPlacement),
    hasPendingPlacement: placements.length > 0 && !approvedPlacement,
    historyPlacements: placements.slice(1),
  };
};

export const getIsFirstMonthReport = (monthlyReports, editingReportId) => {
  if (!editingReportId) {
    return monthlyReports.length === 0;
  }

  const oldestReport = [...monthlyReports].sort(
    (a, b) => new Date(a.submitted_at) - new Date(b.submitted_at)
  )[0];

  return oldestReport?.id === editingReportId;
};

export const buildSupervisorReminderLink = (placement, evaluationType) => {
  if (!placement?.supervisor_phone) {
    return '#';
  }

  const evaluationLabel = evaluationType === 'UAS' ? 'UAS (Akhir)' : evaluationType;
  const message = `Halo Bapak/Ibu ${placement.supervisor_name}, mohon kesediaannya untuk mengisi form evaluasi ${evaluationLabel} magang saya yang telah dikirim ke email Bapak/Ibu. Terima kasih.`;

  return `https://wa.me/${placement.supervisor_phone}?text=${encodeURIComponent(message)}`;
};
