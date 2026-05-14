import { getMergedProgramStudiOptions } from '../../constants/programStudi';

export const getPlacementId = (item) => item?.placement?.id || item?.placement;

export const getStudentRefId = (studentRef) => (
  studentRef && typeof studentRef === 'object' ? studentRef.id : studentRef
);

export const isSameStudent = (studentRef, studentId) => {
  const normalizedStudentRef = getStudentRefId(studentRef);

  return normalizedStudentRef !== undefined
    && normalizedStudentRef !== null
    && String(normalizedStudentRef) === String(studentId);
};

export const isPendingPlacementApproval = (placement) => (
  placement
  && !placement.is_approved
  && !['rejected', 'resigned', 'finished'].includes(placement.status)
);

const getPlacementTimestamp = (placement) => {
  const rawValue = placement?.updated_at || placement?.created_at || placement?.start_date || placement?.end_date;
  const parsed = rawValue ? new Date(rawValue).getTime() : 0;
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const getLatestPlacementsByStudent = (placements) => {
  const latestPlacements = new Map();

  placements.forEach((placement, index) => {
    const existing = latestPlacements.get(placement.student);

    if (!existing) {
      latestPlacements.set(placement.student, { placement, index });
      return;
    }

    const currentTimestamp = getPlacementTimestamp(placement);
    const existingTimestamp = getPlacementTimestamp(existing.placement);

    if (currentTimestamp > existingTimestamp || (currentTimestamp === existingTimestamp && index < existing.index)) {
      latestPlacements.set(placement.student, { placement, index });
    }
  });

  return [...latestPlacements.values()]
    .sort((a, b) => a.index - b.index)
    .map((item) => item.placement);
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

export const buildPlacementFromApplicationData = (studentId, vacancy) => {
  const today = new Date().toISOString().split('T')[0];
  const formData = new FormData();

  formData.append('student', studentId);
  formData.append('company_name', vacancy.company_name);
  formData.append('position', vacancy.title);
  formData.append('business_sector', 'Bursa Magang Kampus');
  formData.append('company_address', 'Alamat mengikuti perusahaan');
  formData.append('start_date', today);
  formData.append('end_date', today);
  formData.append('supervisor_name', 'Belum Diisi');
  formData.append('supervisor_email', 'admin@coop.com');
  formData.append('supervisor_phone', '-');
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
      message: `Yth. Bapak/Ibu ${targetName || 'Supervisor'},\n\nMohon kesediaannya mengisi form Evaluasi ${typeName} mahasiswa kami. Tautan: [Otomatis]\n\nTerima kasih,\nAdmin Unit Co-op`,
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

  const student = students.find((item) => item.id === studentId);
  return student?.program_studi === filterProdi;
};

export const getOverviewStudentsFiltered = (students, placements, filterStatusMagang, lowerQuery) => (
  students.filter((student) => {
    const studentPlacement = placements.find((placement) => placement.student === student.id);
    if (!matchesSearchQuery(lowerQuery, student.first_name, student.last_name, student.nim, student.program_studi, studentPlacement?.company_name)) return false;
    if (!filterStatusMagang) return true;

    if (filterStatusMagang === 'menunggu') return studentPlacement && !studentPlacement.is_approved;
    if (filterStatusMagang === 'terverifikasi') return studentPlacement && studentPlacement.is_approved;
    if (filterStatusMagang === 'belum_input') return !studentPlacement;
    return true;
  })
);

export const getApprovalDataFiltered = (filteredPending, filteredActive, filterStatusAkun) => (
  [...filteredPending, ...filteredActive].filter((user) => {
    if (!filterStatusAkun) return !user.is_active;
    if (filterStatusAkun === 'pending') return !user.is_active;
    if (filterStatusAkun === 'aktif') return user.is_active;
    if (filterStatusAkun === 'semua') return true;
    return true;
  })
);

export const getApplicationsFiltered = (applications, students, vacancies, filterStatusPelamar, filterProdi, lowerQuery) => (
  applications.filter((application) => {
    const studentId = application.student?.id || application.student;
    const vacancyId = application.vacancy?.id || application.vacancy;
    const student = application.student?.id ? application.student : students.find((item) => item.id === studentId);
    const vacancy = application.vacancy?.id ? application.vacancy : vacancies.find((item) => item.id === vacancyId);

    if (!matchesStudentProdi(studentId, students, filterProdi)) return false;
    if (!matchesSearchQuery(lowerQuery, student?.first_name, student?.last_name, student?.nim, student?.program_studi, vacancy?.title, vacancy?.company_name)) return false;
    if (!filterStatusPelamar) return true;
    if (filterStatusPelamar === 'review') return application.status === 'pending';
    if (filterStatusPelamar === 'diterima') return application.status === 'accepted';
    if (filterStatusPelamar === 'ditolak') return application.status === 'rejected';
    return true;
  })
);

export const getEvaluasiFiltered = (placements, evaluations, students, filterStatusEvaluasi, filterProdi, lowerQuery) => (
  placements.filter((placement) => {
    const student = students.find((item) => item.id === placement.student);

    if (!matchesStudentProdi(placement.student, students, filterProdi)) return false;
    if (!matchesSearchQuery(lowerQuery, student?.first_name, student?.last_name, student?.nim, student?.program_studi, placement.company_name, placement.supervisor_name)) return false;
    if (!filterStatusEvaluasi) return true;

    const evalUTS = evaluations.find((evaluation) => getPlacementId(evaluation) === placement.id && evaluation.eval_type === 'UTS');
    const evalUAS = evaluations.find((evaluation) => getPlacementId(evaluation) === placement.id && evaluation.eval_type === 'UAS');

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
    const student = students.find((item) => item.id === placement.student);

    if (!matchesStudentProdi(placement.student, students, filterProdi)) return false;
    if (!matchesSearchQuery(lowerQuery, student?.first_name, student?.last_name, student?.nim, student?.program_studi, placement.company_name)) return false;
    if (!filterStatusBerkas) return true;

    const studentCertificate = certificates.find((certificate) => getPlacementId(certificate) === placement.id);
    if (filterStatusBerkas === 'lulus') return studentCertificate !== undefined;
    if (filterStatusBerkas === 'menunggu') return studentCertificate === undefined;
    return true;
  })
);

export const getCertificateIssueMissingFields = (placementId, monthlyReports, finalReports, evaluations) => {
  const monthlyCount = monthlyReports.filter((report) => report.placement === placementId).length;
  const finalReport = finalReports.find((report) => report.placement === placementId);
  const evalUTS = evaluations.find((evaluation) => getPlacementId(evaluation) === placementId && evaluation.eval_type === 'UTS');
  const evalUAS = evaluations.find((evaluation) => getPlacementId(evaluation) === placementId && evaluation.eval_type === 'UAS');

  const missing = [];
  if (monthlyCount === 0) missing.push('- Laporan Bulanan (Belum ada sama sekali)');
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
) => ({
  placement,
  student,
  historyPlacements: placements
    .filter((item) => item.student === student.id && item.id !== placement.id),
  historyPlacementDetails: placements
    .filter((item) => item.student === student.id && item.id !== placement.id)
    .map((item) => ({
      ...item,
      monthlyReports: monthlyReports
        .filter((report) => report.placement === item.id)
        .sort((a, b) => a.report_month.localeCompare(b.report_month)),
    })),
  mhsMonthly: monthlyReports
    .filter((report) => report.placement === placement.id)
    .sort((a, b) => a.report_month.localeCompare(b.report_month)),
  mhsUts: utsReports.find((report) => report.placement === placement.id),
  mhsFinal: finalReports.find((report) => report.placement === placement.id),
  evalUTS: evaluations.find((evaluation) => getPlacementId(evaluation) === placement.id && evaluation.eval_type === 'UTS'),
  evalUAS: evaluations.find((evaluation) => getPlacementId(evaluation) === placement.id && evaluation.eval_type === 'UAS'),
  mhsCert: certificates.find((certificate) => getPlacementId(certificate) === placement.id),
});

export const getFileName = (url) => {
  if (!url) return '';

  const parts = url.split('/');
  return parts[parts.length - 1];
};

export const buildEvaluationExportData = (placements, students, evaluations) => (
  placements
    .map((placement) => {
      const student = students.find((item) => item.id === placement.student);
      const evalUTS = evaluations.find((evaluation) => getPlacementId(evaluation) === placement.id && evaluation.eval_type === 'UTS');
      const evalUAS = evaluations.find((evaluation) => getPlacementId(evaluation) === placement.id && evaluation.eval_type === 'UAS');

      if (!student) return null;

      return {
        NIM: student.nim,
        'Nama Mahasiswa': `${student.first_name} ${student.last_name}`,
        'Program Studi': student.program_studi,
        'Nama Perusahaan': placement.company_name,
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

export const getDashboardBadges = (pendingUsers, placements, evaluations, applications, finalReports, certificates) => ({
  approval: pendingUsers.length,
  overview: placements.filter((placement) => !placement.is_approved).length,
  evaluasi: evaluations.filter((evaluation) => !evaluation.is_filled).length,
  pelamar: applications.filter((application) => application.status === 'pending').length,
  berkas: placements.filter((placement) => {
    const hasFinalReport = finalReports.some((report) => report.placement === placement.id);
    const hasCertificate = certificates.some((certificate) => getPlacementId(certificate) === placement.id);
    return hasFinalReport && !hasCertificate;
  }).length,
});
