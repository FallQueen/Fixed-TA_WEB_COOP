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
  const pendingPlacement = placements.find((placement) => !placement.is_approved && placement.status === 'pending');
  const currentPlacement = approvedPlacement || placements[0] || null;

  return {
    approvedPlacement,
    approvedPlacementId: approvedPlacement?.id,
    approvedPlacements: placements.filter((placement) => placement.is_approved),
    currentPlacement,
    hasAnyPlacement: placements.length > 0,
    hasApprovedPlacement: Boolean(approvedPlacement),
    hasPendingPlacement: Boolean(pendingPlacement),
    historyPlacements: currentPlacement
      ? placements.filter((placement) => String(placement.id) !== String(currentPlacement.id))
      : [],
    pendingPlacement,
  };
};

const isSamePlacement = (report, placementId) => (
  placementId
  && String(getPlacementId(report.placement)) === String(placementId)
);

export const getIsFirstMonthReport = (monthlyReports, editingReportId, selectedPlacementId) => {
  if (!editingReportId) {
    if (!selectedPlacementId) {
      return monthlyReports.length === 0;
    }

    return !monthlyReports.some((report) => isSamePlacement(report, selectedPlacementId));
  }

  const editedReport = monthlyReports.find((report) => report.id === editingReportId);
  const editedPlacementId = getPlacementId(editedReport?.placement) || selectedPlacementId;
  const reportsForPlacement = monthlyReports.filter((report) => isSamePlacement(report, editedPlacementId));
  const oldestReport = reportsForPlacement.sort(
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
