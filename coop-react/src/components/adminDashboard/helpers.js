import { getMergedProgramStudiOptions } from '../../constants/programStudi';
import { ADMIN_COOP_CONTACT } from './constants';
import { getMinimumInternshipEndDate } from '../constants';

export const getPlacementId = (item) => item?.placement?.id || item?.placement;

const getEntityId = (ref) => (ref && typeof ref === 'object' ? ref.id : ref);

export const getStudentRefId = (studentRef) => getEntityId(studentRef);

const getPlacementStudentKey = (placement) => {
  const studentId = getStudentRefId(placement?.student);

  return studentId === undefined || studentId === null ? null : String(studentId);
};

export const isSameStudent = (studentRef, studentId) => {
  const normalizedStudentRef = getStudentRefId(studentRef);

  return normalizedStudentRef !== undefined
    && normalizedStudentRef !== null
    && String(normalizedStudentRef) === String(studentId);
};

export const isPendingPlacementApproval = (placement) => (
  placement
  && !placement.is_approved
  && !['rejected', 'resigned', 'finished', 'completed'].includes(placement.status)
);

const hasActiveOrCompletedPlacement = (studentId, placements) => (
  placements.some((placement) => (
    isSameStudent(placement.student, studentId)
    && (placement.is_approved || ['verified', 'completed', 'finished'].includes(placement.status))
  ))
);

const hasIssuedCertificate = (studentId, certificates, placements) => (
  certificates.some((certificate) => {
    const certificateStudentId = getStudentRefId(certificate.student);

    if (certificateStudentId !== undefined && certificateStudentId !== null) {
      return String(certificateStudentId) === String(studentId);
    }

    const placementId = getPlacementId(certificate);
    const certificatePlacement = placements.find((placement) => String(placement.id) === String(placementId));

    return certificatePlacement && isSameStudent(certificatePlacement.student, studentId);
  })
);

export const isStudentInterningOrGraduated = (studentId, placements, certificates) => (
  hasActiveOrCompletedPlacement(studentId, placements)
  || hasIssuedCertificate(studentId, certificates, placements)
);

const getPlacementTimestamp = (placement) => {
  const rawValue = placement?.updated_at || placement?.created_at || placement?.start_date || placement?.end_date;
  const parsed = rawValue ? new Date(rawValue).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeCompanyName = (companyName) => (
  String(companyName || '').trim().replace(/\s+/g, ' ').toLowerCase()
);

const getCurrentPlacementPriority = (placement) => {
  if (isPendingPlacementApproval(placement)) return 4;
  if (placement?.is_approved || placement?.status === 'verified') return 3;
  if (['completed', 'finished'].includes(placement?.status)) return 2;
  if (placement?.status === 'resigned') return 1;
  if (placement?.status === 'rejected') return 0;
  return 1;
};

const shouldPreferPlacement = (candidate, existing, candidateIndex, existingIndex) => {
  const candidatePriority = getCurrentPlacementPriority(candidate);
  const existingPriority = getCurrentPlacementPriority(existing);

  if (candidatePriority !== existingPriority) {
    return candidatePriority > existingPriority;
  }

  const candidateTimestamp = getPlacementTimestamp(candidate);
  const existingTimestamp = getPlacementTimestamp(existing);

  if (candidateTimestamp !== existingTimestamp) {
    return candidateTimestamp > existingTimestamp;
  }

  return candidateIndex < existingIndex;
};

export const getPlacementHistoryForStudent = (placements, studentId, currentPlacementId = null) => (
  placements
    .filter((placement) => isSameStudent(placement.student, studentId))
    .filter((placement) => (
      currentPlacementId === null || String(placement.id) !== String(currentPlacementId)
    ))
    .sort((a, b) => getPlacementTimestamp(b) - getPlacementTimestamp(a))
);

export const getPlacementPreviousCompanies = (placement) => {
  const currentCompanyName = normalizeCompanyName(placement?.company_name);
  const seenCompanyNames = new Set();
  const companyNames = [];

  (placement?.historyPlacements || []).forEach((historyPlacement) => {
    const companyName = historyPlacement.company_name;
    const normalizedCompanyName = normalizeCompanyName(companyName);

    if (!normalizedCompanyName || normalizedCompanyName === currentCompanyName || seenCompanyNames.has(normalizedCompanyName)) {
      return;
    }

    seenCompanyNames.add(normalizedCompanyName);
    companyNames.push(companyName);
  });

  return companyNames;
};

const withPlacementHistory = (placement, placements) => {
  const studentId = getStudentRefId(placement?.student);
  const historyPlacements = getPlacementHistoryForStudent(placements, studentId, placement.id);

  return {
    ...placement,
    historyPlacements,
    previousCompanies: getPlacementPreviousCompanies({ ...placement, historyPlacements }),
  };
};

export const getLatestPlacementsByStudent = (placements) => {
  const latestPlacements = new Map();

  placements.forEach((placement, index) => {
    const studentKey = getPlacementStudentKey(placement);
    if (!studentKey) return;

    const existing = latestPlacements.get(studentKey);

    if (!existing) {
      latestPlacements.set(studentKey, { placement, index });
      return;
    }

    if (shouldPreferPlacement(placement, existing.placement, index, existing.index)) {
      latestPlacements.set(studentKey, { placement, index });
    }
  });

  return [...latestPlacements.values()]
    .sort((a, b) => a.index - b.index)
    .map((item) => withPlacementHistory(item.placement, placements));
};

export const getLatestPlacementForStudent = (placements, studentId) => (
  getLatestPlacementsByStudent(placements).find((placement) => isSameStudent(placement.student, studentId))
);

const getPlacementSearchValues = (placement) => [
  placement?.company_name,
  placement?.supervisor_name,
  ...getPlacementPreviousCompanies(placement),
];

export const getPendingPlacementApprovals = (placements) => (
  getLatestPlacementsByStudent(placements).filter(isPendingPlacementApproval)
);

export const getCertificateForPlacement = (certificates, placement) => (
  certificates.find((certificate) => String(getPlacementId(certificate)) === String(placement?.id))
);

const getRecordTimestamp = (record) => {
  const rawValue = record?.updated_at || record?.submitted_at || record?.created_at || record?.issued_date;
  const parsed = rawValue ? new Date(rawValue).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const findLatestRecordForPlacementIds = (records, placementIds, preferredPlacementId = null) => {
  const normalizedPlacementIds = placementIds.map(String);
  const matchingRecords = records
    .filter((record) => normalizedPlacementIds.includes(String(getPlacementId(record))))
    .sort((a, b) => getRecordTimestamp(b) - getRecordTimestamp(a));

  if (preferredPlacementId !== null && preferredPlacementId !== undefined) {
    const preferredRecord = matchingRecords.find((record) => String(getPlacementId(record)) === String(preferredPlacementId));
    if (preferredRecord) return preferredRecord;
  }

  return matchingRecords[0];
};

const findBestEvaluationForPlacementIds = (evaluations, placementIds, evalType, preferredPlacementId = null) => {
  const normalizedPlacementIds = placementIds.map(String);
  const matchingEvaluations = evaluations
    .filter((evaluation) => (
      normalizedPlacementIds.includes(String(getPlacementId(evaluation)))
      && evaluation.eval_type === evalType
    ))
    .sort((a, b) => {
      if (Boolean(a.is_filled) !== Boolean(b.is_filled)) {
        return Boolean(b.is_filled) - Boolean(a.is_filled);
      }

      const aIsPreferred = preferredPlacementId !== null
        && preferredPlacementId !== undefined
        && String(getPlacementId(a)) === String(preferredPlacementId);
      const bIsPreferred = preferredPlacementId !== null
        && preferredPlacementId !== undefined
        && String(getPlacementId(b)) === String(preferredPlacementId);

      if (aIsPreferred !== bIsPreferred) {
        return Number(bIsPreferred) - Number(aIsPreferred);
      }

      return getRecordTimestamp(b) - getRecordTimestamp(a);
    });

  return matchingEvaluations[0];
};

export const getEvaluationPairForPlacement = (evaluations, placement) => ({
  evalUTS: findBestEvaluationForPlacementIds(evaluations, [placement?.id], 'UTS', placement?.id),
  evalUAS: findBestEvaluationForPlacementIds(evaluations, [placement?.id], 'UAS', placement?.id),
});

export const isPlacementEvaluationComplete = (evaluations, placement) => {
  const { evalUTS, evalUAS } = getEvaluationPairForPlacement(evaluations, placement);

  return Boolean(evalUTS?.is_filled && evalUAS?.is_filled);
};

export const isMissingFile = (file) => !file || String(file).trim() === '' || String(file).includes('null');

export const getStudentApprovalMissingFields = (user) => {
  const missing = [];

  if (!user.nim) missing.push('- NIM belum diisi');
  if (!user.program_studi) missing.push('- Program Studi belum dipilih');
  if (isMissingFile(user.bukti_konsul_file)) missing.push('- File Bukti Konsultasi kosong');
  if (isMissingFile(user.sptjm_file)) missing.push('- File SPTJM kosong');

  return missing;
};

export const buildApprovalFormData = () => {
  const formData = new FormData();
  formData.append('is_approved', 'true');
  return formData;
};

export const buildPlacementFromApplicationData = (studentId, vacancy, application = null) => {
  const fallbackStartDate = new Date().toISOString().split('T')[0];
  const startDate = application?.internship_start_date || fallbackStartDate;
  const endDate = application?.internship_end_date || getMinimumInternshipEndDate(startDate);
  const supervisorName = String(vacancy.supervisor_name || '').trim() || ADMIN_COOP_CONTACT.name;
  const supervisorEmail = String(vacancy.supervisor_email || '').trim() || ADMIN_COOP_CONTACT.email;
  const supervisorPhone = String(vacancy.supervisor_phone || '').trim() || ADMIN_COOP_CONTACT.phone;
  const formData = new FormData();

  formData.append('student', studentId);
  formData.append('company_name', vacancy.company_name);
  formData.append('position', vacancy.title);
  formData.append('business_sector', 'Bursa Magang Kampus');
  formData.append('company_address', 'Alamat mengikuti perusahaan');
  formData.append('start_date', startDate);
  formData.append('end_date', endDate);
  formData.append('supervisor_name', supervisorName);
  formData.append('supervisor_email', supervisorEmail);
  formData.append('supervisor_phone', supervisorPhone);
  formData.append('is_approved', 'true');

  const dummyPdf = new Blob(['Dokumen otomatis'], { type: 'application/pdf' });
  formData.append('acceptance_letter', dummyPdf, 'Surat_Penerimaan.pdf');

  return formData;
};

export const getDefaultEmailContent = (actionType, targetName) => {
  if (actionType === 'job_seeker') {
    return {
      subject: 'PENGINGAT: Progress Laporan Magang',
      message: `Halo ${targetName || 'Mahasiswa'},\n\nAnda belum memiliki tempat magang. Silakan isi "Laporan Progress Mingguan".\n\nSalam,\nAdmin Unit Co-op`,
    };
  }

  if (actionType === 'mass_report_uts' || actionType === 'mass_report_uas') {
    const typeName = actionType === 'mass_report_uts' ? 'UTS' : 'UAS';
    return {
      subject: `PENGINGAT: Laporan ${typeName} Magang`,
      message: `Halo,\n\nMohon segera unggah dokumen Laporan ${typeName} Magang di sistem.\n\nTerima kasih,\nAdmin Unit Co-op`,
    };
  }

  if (actionType === 'student_report_uts' || actionType === 'student_report_uas') {
    const typeName = actionType === 'student_report_uts' ? 'UTS' : 'UAS';
    return {
      subject: `PENGINGAT: Laporan ${typeName} Magang`,
      message: `Halo ${targetName},\n\nSistem mencatat Anda belum mengumpulkan Laporan ${typeName} Magang. Mohon segera diunggah.\n\nTerima kasih,\nAdmin Unit Co-op`,
    };
  }

  if (actionType === 'send_eval_uts' || actionType === 'send_eval_uas') {
    const typeName = actionType === 'send_eval_uts' ? 'Kemajuan (UTS)' : 'Akhir (UAS)';
    return {
      subject: `Permohonan Pengisian Form Evaluasi ${typeName}`,
      message: `Yth. Bapak/Ibu ${targetName || 'Supervisor'},\n\nMohon kesediaannya mengisi form Evaluasi ${typeName} mahasiswa kami. Silakan klik tombol form evaluasi yang akan ditambahkan otomatis oleh sistem.\n\nTerima kasih,\nAdmin Unit Co-op`,
    };
  }

  return { subject: '', message: '' };
};

export const getUniqueProdis = (students, pendingUsers) => (
  getMergedProgramStudiOptions(students, pendingUsers)
);

export const filterUsersByProdi = (users, filterProdi) => (
  users.filter((user) => (filterProdi ? user.program_studi === filterProdi : true))
);

const getUserSortTimestamp = (user) => {
  const rawValue = user?.date_joined || user?.created_at;
  const parsed = rawValue ? new Date(rawValue).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortUsersNewestFirst = (users) => (
  [...users].sort((a, b) => {
    const idDiff = (Number(b?.id) || 0) - (Number(a?.id) || 0);
    if (idDiff !== 0) return idDiff;
    const timestampDiff = getUserSortTimestamp(b) - getUserSortTimestamp(a);
    if (timestampDiff !== 0) return timestampDiff;
    return 0;
  })
);

const matchesSearchQuery = (lowerQuery, ...values) => {
  if (!lowerQuery) return true;

  return values
    .filter((value) => value !== null && value !== undefined)
    .join(' ')
    .toLowerCase()
    .includes(lowerQuery);
};

const matchesStudentProdi = (studentId, students, filterProdi) => {
  if (!filterProdi) return true;

  const student = students.find((item) => isSameStudent(studentId, item.id));
  return student?.program_studi === filterProdi;
};

export const getOverviewStudentsFiltered = (students, placements, filterStatusMagang, lowerQuery) => {
  const latestPlacements = getLatestPlacementsByStudent(placements);

  return sortUsersNewestFirst(students.filter((student) => {
    const studentPlacement = latestPlacements.find((placement) => isSameStudent(placement.student, student.id));
    if (!matchesSearchQuery(lowerQuery, student.first_name, student.last_name, student.nim, student.program_studi, ...getPlacementSearchValues(studentPlacement))) return false;
    if (!filterStatusMagang) return true;

    if (filterStatusMagang === 'menunggu') return isPendingPlacementApproval(studentPlacement);
    if (filterStatusMagang === 'terverifikasi') return studentPlacement && studentPlacement.is_approved;
    if (filterStatusMagang === 'belum_input') return !studentPlacement;
    if (filterStatusMagang === 'ditolak') return studentPlacement?.status === 'rejected';
    return true;
  }));
};

export const getRegistrationStatus = (user) => (
  user?.registration_status || (user?.is_active ? 'approved' : 'pending')
);

export const getApprovalDataFiltered = (filteredPending, filteredActive, filterStatusAkun) => (
  sortUsersNewestFirst([...filteredPending, ...filteredActive].filter((user) => {
    const registrationStatus = getRegistrationStatus(user);

    if (!filterStatusAkun) return !user.is_active && registrationStatus !== 'rejected';
    if (filterStatusAkun === 'pending') return !user.is_active && registrationStatus !== 'rejected';
    if (filterStatusAkun === 'aktif') return user.is_active;
    if (filterStatusAkun === 'ditolak') return registrationStatus === 'rejected';
    if (filterStatusAkun === 'semua') return true;
    return true;
  }))
);

export const getApplicationsFiltered = (applications, students, vacancies, placements, certificates, filterStatusPelamar, filterProdi, lowerQuery) => (
  applications.filter((application) => {
    const studentId = application.student?.id || application.student;
    const vacancyId = application.vacancy?.id || application.vacancy;
    const student = application.student?.id ? application.student : students.find((item) => item.id === studentId);
    const vacancy = application.vacancy?.id ? application.vacancy : vacancies.find((item) => item.id === vacancyId);
    const isArchivedApplicant = isStudentInterningOrGraduated(studentId, placements, certificates);

    if (!student || !vacancy || application.is_archived_by_admin) return false;
    if (!matchesStudentProdi(studentId, students, filterProdi)) return false;
    if (!matchesSearchQuery(lowerQuery, student?.first_name, student?.last_name, student?.nim, student?.program_studi, vacancy?.title, vacancy?.company_name)) return false;
    if (isArchivedApplicant) return false;
    if (!filterStatusPelamar) return true;
    if (filterStatusPelamar === 'menunggu') return ['pending', 'reviewed'].includes(application.status);
    if (filterStatusPelamar === 'diterima') return application.status === 'accepted';
    if (filterStatusPelamar === 'ditolak') return application.status === 'rejected';
    if (filterStatusPelamar === 'ditarik') return application.status === 'withdrawn';
    return true;
  })
);

export const getEvaluasiFiltered = (placements, evaluations, students, filterStatusEvaluasi, filterProdi, lowerQuery) => (
  getLatestPlacementsByStudent(placements).filter((placement) => {
    const student = students.find((item) => isSameStudent(placement.student, item.id));

    if (!matchesStudentProdi(placement.student, students, filterProdi)) return false;
    if (!matchesSearchQuery(lowerQuery, student?.first_name, student?.last_name, student?.nim, student?.program_studi, ...getPlacementSearchValues(placement))) return false;
    if (!filterStatusEvaluasi) return true;

    const { evalUTS, evalUAS } = getEvaluationPairForPlacement(evaluations, placement);

    if (filterStatusEvaluasi === 'menunggu') return !evalUTS?.is_filled || !evalUAS?.is_filled;
    if (filterStatusEvaluasi === 'selesai') return evalUTS?.is_filled && evalUAS?.is_filled;
    return true;
  })
);

export const getJobSeekerFiltered = (students, placements, weeklyReports, filterStatusJobSeeker, lowerQuery) => (
  students.filter((student) => {
    const studentPlacements = placements.filter((placement) => isSameStudent(placement.student, student.id));
    const pendingPlacement = studentPlacements.find(isPendingPlacementApproval);
    const hasApprovedPlacement = studentPlacements.some((placement) => placement.is_approved);

    if (hasApprovedPlacement) return false;
    if (!matchesSearchQuery(lowerQuery, student.first_name, student.last_name, student.nim, student.program_studi, pendingPlacement?.company_name)) return false;
    if (!filterStatusJobSeeker) return true;

    const studentWeeklyReports = weeklyReports.filter((report) => isSameStudent(report.student, student.id));
    const hasWeeklyReports = studentWeeklyReports.length > 0;

    if (filterStatusJobSeeker === 'menunggu_acc') return Boolean(pendingPlacement);
    if (filterStatusJobSeeker === 'belum_lapor' || filterStatusJobSeeker === 'belum_pernah_lapor') return !hasWeeklyReports;
    if (filterStatusJobSeeker === 'sudah_lapor' || filterStatusJobSeeker === 'pernah_lapor') return hasWeeklyReports;
    return true;
  })
);

export const getBerkasFiltered = (placements, certificates, students, filterStatusBerkas, filterProdi, lowerQuery) => (
  getLatestPlacementsByStudent(placements).filter((placement) => {
    const student = students.find((item) => isSameStudent(placement.student, item.id));

    if (!matchesStudentProdi(placement.student, students, filterProdi)) return false;
    if (!matchesSearchQuery(lowerQuery, student?.first_name, student?.last_name, student?.nim, student?.program_studi, ...getPlacementSearchValues(placement))) return false;
    if (!filterStatusBerkas) return true;

    const studentCertificate = getCertificateForPlacement(certificates, placement);
    if (filterStatusBerkas === 'lulus') return studentCertificate !== undefined;
    if (filterStatusBerkas === 'menunggu') return studentCertificate === undefined;
    return true;
  })
);

const parseDateValue = (value) => {
  if (!value) return null;

  const [year, month, day] = String(value).split('T')[0].split('-').map(Number);
  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateValue = (date) => (
  date ? date.toISOString().split('T')[0] : null
);

const sortPlacementsByPeriod = (a, b) => {
  const aStart = parseDateValue(a?.start_date);
  const bStart = parseDateValue(b?.start_date);
  const startDiff = (aStart?.getTime() || 0) - (bStart?.getTime() || 0);

  if (startDiff !== 0) return startDiff;

  return getPlacementTimestamp(a) - getPlacementTimestamp(b);
};

export const calculateRequiredMonthlyReportCount = (startDate, endDate) => {
  const start = parseDateValue(startDate);
  const end = parseDateValue(endDate);

  if (!start || !end || end < start) return 0;

  let monthCount = (end.getUTCFullYear() - start.getUTCFullYear()) * 12
    + (end.getUTCMonth() - start.getUTCMonth());

  if (end.getUTCDate() >= start.getUTCDate()) {
    monthCount += 1;
  }

  return Math.max(1, monthCount);
};

export const getMonthlyReportSummary = (placement, monthlyReports, effectiveEndDate = placement?.end_date) => {
  const placementId = getEntityId(placement);
  const submittedCount = monthlyReports.filter((report) => (
    String(getPlacementId(report)) === String(placementId)
  )).length;
  const requiredCount = calculateRequiredMonthlyReportCount(placement?.start_date, effectiveEndDate);

  return {
    submittedCount,
    requiredCount,
    periodStartDate: placement?.start_date,
    periodEndDate: effectiveEndDate,
    isComplete: requiredCount > 0 && submittedCount >= requiredCount,
  };
};

const getTransferCutoffDateForPlacement = (placement, relatedPlacements) => {
  const placementStart = parseDateValue(placement?.start_date);
  const placementEnd = parseDateValue(placement?.end_date);

  if (!placementStart || !placementEnd) return null;

  const cutoffDates = relatedPlacements
    .filter((item) => String(item.id) !== String(placement.id))
    .map((item) => ({
      previousEndDate: parseDateValue(item.previous_placement_end_date),
      nextStartDate: parseDateValue(item.start_date),
    }))
    .filter(({ previousEndDate, nextStartDate }) => (
      previousEndDate
      && nextStartDate
      && previousEndDate >= placementStart
      && previousEndDate <= placementEnd
      && nextStartDate > previousEndDate
    ))
    .sort((a, b) => a.previousEndDate - b.previousEndDate);

  return cutoffDates[0]?.previousEndDate || null;
};

const getCertificatePlacementPeriod = (placement, relatedPlacements) => {
  const plannedEndDate = parseDateValue(placement?.end_date);
  const transferCutoffDate = getTransferCutoffDateForPlacement(placement, relatedPlacements);
  const shouldUseTransferCutoff = transferCutoffDate
    && plannedEndDate
    && transferCutoffDate < plannedEndDate;
  const effectiveEndDate = shouldUseTransferCutoff
    ? formatDateValue(transferCutoffDate)
    : placement?.end_date;

  return {
    periodStartDate: placement?.start_date,
    periodEndDate: effectiveEndDate,
    usesTransferEndDate: Boolean(shouldUseTransferCutoff),
  };
};

const getReportableCertificatePlacements = (placement, placements = []) => {
  const placementId = getEntityId(placement);
  const studentId = getStudentRefId(placement?.student);
  const nonReportableStatuses = ['pending', 'rejected'];
  const validHistoryStatuses = ['resigned', 'finished', 'completed', 'verified'];
  const relatedPlacements = placements.filter((item) => {
    const itemStudentId = getStudentRefId(item.student);
    const isSelectedPlacement = String(item.id) === String(placementId);
    const isSamePlacementStudent = studentId
      && itemStudentId !== undefined
      && itemStudentId !== null
      && String(itemStudentId) === String(studentId);
    const isValidHistory = !nonReportableStatuses.includes(item.status)
      && (item.is_approved || validHistoryStatuses.includes(item.status));

    return isSelectedPlacement || (isSamePlacementStudent && isValidHistory);
  });

  if (placement && !relatedPlacements.some((item) => String(item.id) === String(placementId))) {
    relatedPlacements.push(placement);
  }

  return relatedPlacements.sort(sortPlacementsByPeriod);
};

export const getCertificateMonthlyReportSummary = (placement, monthlyReports, placements = []) => {
  const relatedPlacements = getReportableCertificatePlacements(placement, placements);
  const placementSummaries = relatedPlacements
    .map((item) => {
      const period = getCertificatePlacementPeriod(item, relatedPlacements);

      return {
        placement: item,
        ...getMonthlyReportSummary(item, monthlyReports, period.periodEndDate),
        usesTransferEndDate: period.usesTransferEndDate,
      };
    });
  const submittedCount = placementSummaries.reduce((total, item) => total + item.submittedCount, 0);
  const requiredCount = placementSummaries.reduce((total, item) => total + item.requiredCount, 0);

  return {
    submittedCount,
    requiredCount,
    placementSummaries,
    isComplete: placementSummaries.length > 0
      && requiredCount > 0
      && submittedCount >= requiredCount,
  };
};

export const getCertificateIssueMissingFields = (placement, monthlyReports, utsReports, finalReports, evaluations, placements = []) => {
  if (!placement) {
    return ['- Data penempatan magang tidak ditemukan'];
  }

  const placementId = getEntityId(placement);
  const relatedPlacementIds = getReportableCertificatePlacements(placement, placements).map((item) => item.id);
  const monthlyReportSummary = getCertificateMonthlyReportSummary(placement, monthlyReports, placements);
  const utsReport = findLatestRecordForPlacementIds(utsReports, relatedPlacementIds, placementId);
  const finalReport = findLatestRecordForPlacementIds(finalReports, relatedPlacementIds, placementId);
  const evalUTS = findBestEvaluationForPlacementIds(evaluations, relatedPlacementIds, 'UTS', placementId);
  const evalUAS = findBestEvaluationForPlacementIds(evaluations, relatedPlacementIds, 'UAS', placementId);

  const missing = [];
  if (monthlyReportSummary.placementSummaries.some((summary) => summary.requiredCount === 0)) {
    missing.push('- Periode magang belum lengkap atau tanggal mulai/selesai tidak valid');
  } else if (!monthlyReportSummary.isComplete) {
    missing.push(`- Laporan Bulanan belum lengkap (${monthlyReportSummary.submittedCount}/${monthlyReportSummary.requiredCount} laporan terkumpul sesuai total durasi magang)`);
  }
  if (!utsReport) missing.push('- Dokumen Laporan Tengah Semester (UTS) belum diunggah');
  if (!finalReport) missing.push('- Dokumen Laporan Akhir (UAS) belum diunggah');
  if (!evalUTS?.is_filled) missing.push('- Nilai Evaluasi Kemajuan (UTS) dari Supervisor kosong');
  if (!evalUAS?.is_filled) missing.push('- Nilai Evaluasi Akhir (UAS) dari Supervisor kosong');

  return missing;
};

export const buildSelectedDetail = (
  placement,
  student,
  monthlyReports,
  utsReports,
  finalReports,
  evaluations,
  certificates,
  placements = []
) => {
  const placementMonthlyReports = monthlyReports
    .filter((report) => String(getPlacementId(report)) === String(placement.id))
    .sort((a, b) => a.report_month.localeCompare(b.report_month));
  const historyPlacements = getPlacementHistoryForStudent(placements, student.id, placement.id);
  const relatedPlacements = getReportableCertificatePlacements(placement, placements);
  const relatedPlacementIds = relatedPlacements.map((item) => item.id);
  const mhsUts = findLatestRecordForPlacementIds(utsReports, relatedPlacementIds, placement.id);
  const mhsFinal = findLatestRecordForPlacementIds(finalReports, relatedPlacementIds, placement.id);
  const evalUTS = findBestEvaluationForPlacementIds(evaluations, relatedPlacementIds, 'UTS', placement.id);
  const evalUAS = findBestEvaluationForPlacementIds(evaluations, relatedPlacementIds, 'UAS', placement.id);

  return {
    placement,
    student,
    monthlyReportSummary: getCertificateMonthlyReportSummary(placement, monthlyReports, placements),
    certificateMissingFields: getCertificateIssueMissingFields(placement, monthlyReports, utsReports, finalReports, evaluations, placements),
    historyPlacements,
    historyPlacementDetails: historyPlacements
      .map((item) => ({
        ...item,
        monthlyReports: monthlyReports
          .filter((report) => String(getPlacementId(report)) === String(item.id))
          .sort((a, b) => a.report_month.localeCompare(b.report_month)),
      })),
    mhsMonthly: placementMonthlyReports,
    mhsUts,
    mhsFinal,
    evalUTS,
    evalUAS,
    mhsUtsPlacement: relatedPlacements.find((item) => String(item.id) === String(getPlacementId(mhsUts))),
    mhsFinalPlacement: relatedPlacements.find((item) => String(item.id) === String(getPlacementId(mhsFinal))),
    evalUTSPlacement: relatedPlacements.find((item) => String(item.id) === String(getPlacementId(evalUTS))),
    evalUASPlacement: relatedPlacements.find((item) => String(item.id) === String(getPlacementId(evalUAS))),
    mhsCert: certificates.find((certificate) => String(getPlacementId(certificate)) === String(placement.id)),
  };
};

export const getFileName = (url) => {
  if (!url) return '';

  const parts = url.split('/');
  return parts[parts.length - 1];
};

export const buildEvaluationExportData = (placements, students, evaluations) => (
  getLatestPlacementsByStudent(placements)
    .map((placement) => {
      const student = students.find((item) => isSameStudent(placement.student, item.id));
      const { evalUTS, evalUAS } = getEvaluationPairForPlacement(evaluations, placement);

      if (!student) return null;

      return {
        NIM: student.nim,
        'Nama Mahasiswa': `${student.first_name} ${student.last_name}`,
        'Program Studi': student.program_studi,
        'Nama Perusahaan': placement.company_name,
        'Perusahaan Lama': getPlacementPreviousCompanies(placement).join(', ') || '-',
        Supervisor: placement.supervisor_name,
        'Nilai UTS': evalUTS?.is_filled ? evalUTS.score : 'Belum Dinilai',
        'Feedback UTS': evalUTS?.is_filled ? evalUTS.feedback : '-',
        'Nilai UAS': evalUAS?.is_filled ? evalUAS.score : 'Belum Dinilai',
        'Feedback UAS': evalUAS?.is_filled ? evalUAS.feedback : '-',
      };
    })
    .filter((item) => item !== null)
);

export const buildIndustryExportData = (industries) => (
  industries.map((item, index) => ({
    No: index + 1,
    'Nama Perusahaan': item.company_name,
    'Nama Supervisor': item.supervisor_name,
    'Email Supervisor': item.supervisor_email,
    'No. HP / WhatsApp': item.supervisor_phone || '-',
  }))
);

export const getDashboardBadges = (
  pendingUsers,
  placements,
  evaluations,
  applications,
  students,
  vacancies,
  monthlyReports,
  utsReports,
  finalReports,
  certificates
) => ({
  approval: pendingUsers.filter((user) => getRegistrationStatus(user) !== 'rejected').length,
  overview: getPendingPlacementApprovals(placements).length,
  evaluasi: getLatestPlacementsByStudent(placements).filter((placement) => !isPlacementEvaluationComplete(evaluations, placement)).length,
  pelamar: applications.filter((application) => {
    const studentId = application.student?.id || application.student;
    const vacancyId = application.vacancy?.id || application.vacancy;
    const student = application.student?.id ? application.student : students.find((item) => item.id === studentId);
    const vacancy = application.vacancy?.id ? application.vacancy : vacancies.find((item) => item.id === vacancyId);

    return application.status === 'pending'
      && !application.is_archived_by_admin
      && Boolean(student)
      && Boolean(vacancy)
      && !isStudentInterningOrGraduated(studentId, placements, certificates);
  }).length,
  berkas: getLatestPlacementsByStudent(placements).filter((placement) => {
    const hasCertificate = Boolean(getCertificateForPlacement(certificates, placement));
    return !hasCertificate
      && getCertificateIssueMissingFields(
        placement,
        monthlyReports,
        utsReports,
        finalReports,
        evaluations,
        placements
      ).length === 0;
  }).length,
});
