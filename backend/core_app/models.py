from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Field bawaan Django (username, email, password, first_name, last_name) sudah otomatis ada.

    # Identitas Microsoft disimpan terpisah agar login SSO tidak hanya mengandalkan teks email.
    microsoft_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    microsoft_email = models.EmailField(blank=True, default='')
    
    # Field Khusus Mahasiswa Prasmul (Sesuai PDF)
    nim = models.CharField(max_length=20, null=True, blank=True)
    program_studi = models.CharField(max_length=100, null=True, blank=True)
    angkatan = models.CharField(max_length=10, null=True, blank=True)
    
    GENDER_CHOICES = [('L', 'Laki-laki'), ('P', 'Perempuan')]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    
    # Dokumen Registrasi Awal (Wajib saat daftar)
    bukti_konsul_file = models.FileField(upload_to='dokumen_registrasi/', null=True, blank=True)
    sptjm_file = models.FileField(upload_to='dokumen_registrasi/', null=True, blank=True)
    
    # Dokumen Pelengkap (Diisi di dalam Dashboard / Profil nanti)
    cv_file = models.FileField(upload_to='dokumen_profil/', null=True, blank=True)
    portofolio_file = models.FileField(upload_to='dokumen_profil/', null=True, blank=True)
    
    # Penanda role
    is_mahasiswa = models.BooleanField(default=True)
    REGISTRATION_STATUS_CHOICES = [
        ('pending', 'Menunggu Persetujuan'),
        ('approved', 'Disetujui'),
        ('rejected', 'Ditolak'),
    ]
    registration_status = models.CharField(
        max_length=20,
        choices=REGISTRATION_STATUS_CHOICES,
        default='pending',
    )
    registration_rejection_reason = models.TextField(blank=True, default='')

    def __str__(self):
        return self.email # Tampilkan email sebagai nama utama di sistem
    
    # ... (class User biarkan di atas) ...

# ==========================================
# FITUR 2: LOWONGAN & LAMARAN
# ==========================================
class Vacancy(models.Model):
    title = models.CharField(max_length=255) # Posisi, ex: Frontend Developer
    company_name = models.CharField(max_length=255) # Nama Perusahaan
    description = models.TextField() # Deskripsi Pekerjaan
    requirements = models.TextField() # Syarat (Bisa CV/Portofolio)
    
    # [BARU] Field untuk link lamaran eksternal (JobStreet, LinkedIn, form perusahaan, dll)
    external_apply_link = models.URLField(max_length=500, null=True, blank=True)

    # Kontak supervisor/HRD untuk lowongan internal. Jika kosong, frontend memakai kontak Admin Co-op.
    supervisor_name = models.CharField(max_length=255, blank=True, default='')
    supervisor_email = models.EmailField(blank=True, default='')
    supervisor_phone = models.CharField(max_length=20, blank=True, default='')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.company_name}"

class Application(models.Model):
    # Tabel ini mencatat mahasiswa mana melamar ke lowongan mana
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    vacancy = models.ForeignKey(Vacancy, on_delete=models.CASCADE)
    
    # [BARU] Field untuk menyimpan pesan tambahan dari mahasiswa
    cover_letter = models.TextField(blank=True, null=True)
    internship_start_date = models.DateField(null=True, blank=True)
    internship_end_date = models.DateField(null=True, blank=True)
    
    # [UPDATE] Status disesuaikan dengan alur Admin Dashboard
    STATUS_CHOICES = [
        ('pending', 'Menunggu Review'),
        ('reviewed', 'Telah Diteruskan ke HRD'),
        ('accepted', 'Diterima Perusahaan'),
        ('rejected', 'Ditolak Perusahaan'),
        ('withdrawn', 'Ditarik Mahasiswa')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    withdrawal_reason = models.TextField(blank=True, null=True)
    withdrawn_at = models.DateTimeField(blank=True, null=True)
    is_archived_by_admin = models.BooleanField(default=False)
    archived_at = models.DateTimeField(blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.vacancy.title}"

# ==========================================
# FITUR 3: KONFIRMASI PENERIMAAN MAGANG
# ==========================================
# ==========================================
# FITUR 3: KONFIRMASI PENERIMAAN MAGANG
# ==========================================
class Placement(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Data Perusahaan
    company_name = models.CharField(max_length=255)
    company_address = models.TextField()
    business_sector = models.CharField(max_length=100)
    position = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Data Supervisor
    supervisor_name = models.CharField(max_length=255)
    supervisor_email = models.EmailField()
    supervisor_phone = models.CharField(max_length=20, null=True, blank=True)
    SUPERVISOR_CHANGE_STATUS_CHOICES = [
        ('none', 'Tidak Ada Pengajuan'),
        ('pending', 'Menunggu Persetujuan'),
        ('rejected', 'Ditolak Admin'),
    ]
    pending_supervisor_name = models.CharField(max_length=255, blank=True, default='')
    pending_supervisor_email = models.EmailField(blank=True, default='')
    pending_supervisor_phone = models.CharField(max_length=20, blank=True, default='')
    supervisor_change_reason = models.TextField(blank=True, default='')
    supervisor_change_status = models.CharField(
        max_length=20,
        choices=SUPERVISOR_CHANGE_STATUS_CHOICES,
        default='none',
    )
    supervisor_change_rejection_reason = models.TextField(blank=True, default='')
    supervisor_change_requested_at = models.DateTimeField(null=True, blank=True)
    
    # File Bukti Diterima
    acceptance_letter = models.FileField(upload_to='dokumen_placement/')
    previous_placement_end_date = models.DateField(null=True, blank=True)
    transfer_reason = models.TextField(blank=True, default='')
    
    # [UPDATE] Penambahan status baru untuk mengakomodasi histori
    STATUS_CHOICES = [
        ('pending', 'Menunggu Verifikasi'),
        ('verified', 'Terverifikasi (Aktif)'),
        ('resigned', 'Pindah Tempat / Berhenti'), # [BARU] Histori tempat lama
        ('rejected', 'Ditolak Admin'),            # [BARU] Jika admin menolak pengajuan
        ('completed', 'Selesai Magang')
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Magang: {self.student.username} di {self.company_name} ({self.get_status_display()})"


# ==========================================
# FITUR 4: LAPORAN KEMAJUAN BULANAN
# ==========================================
class MonthlyReport(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    # Kita hubungkan laporan ini dengan data magang (Placement) mahasiswa tersebut
    placement = models.ForeignKey(Placement, on_delete=models.CASCADE) 
    
    # Keterangan bulan laporan (Misal: "Bulan 1 - Maret 2026")
    report_month = models.CharField(max_length=100) 
    
    # 5 Poin Laporan sesuai standar Unit Co-op
    company_profile = models.TextField(verbose_name="Profil Perusahaan")
    job_description = models.TextField(verbose_name="Jobdesk")
    work_environment = models.TextField(verbose_name="Suasana Lingkungan Pekerjaan")
    useful_courses = models.TextField(verbose_name="Apa yang didapatkan dari perkuliahan yang berguna")
    new_skills = models.TextField(verbose_name="Hal berguna di perusahaan tapi belum didapat di kampus")
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Laporan {self.student.username} - {self.report_month}"
    
# ==========================================
# FITUR 4B: LAPORAN KEMAJUAN (UTS)
# ==========================================
class UtsReport(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)
    
    # File dokumen Laporan UTS (PDF/Word)
    report_file = models.FileField(upload_to='laporan_uts/')
    description = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Laporan UTS {self.student.username} - {self.placement.company_name}"

# ==========================================
# FITUR 5: LAPORAN AKHIR (UAS)
# ==========================================
class FinalReport(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)
    
    # File dokumen Laporan Akhir (PDF/Word)
    report_file = models.FileField(upload_to='laporan_akhir/')
    
    # Keterangan tambahan (opsional, barangkali mahasiswa mau nambahin pesan)
    description = models.TextField(blank=True, null=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Laporan Akhir {self.student.username} - {self.placement.company_name}"
    

# ==========================================
# FITUR 6: SERTIFIKAT CO-OP
# ==========================================
class Certificate(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)
    
    # Nilai / Konversi ke Mata Kuliah Co-op (Misal: "A", "A-", atau "90")
    grade = models.CharField(max_length=10, verbose_name="Konversi Nilai")
    
    # Tanggal sertifikat diterbitkan
    issued_date = models.DateField(auto_now_add=True)
    
    # Jika sertifikat mau berupa file PDF asli yang diupload kampus (opsional)
    certificate_file = models.FileField(upload_to='certificates/', blank=True, null=True)

    def __str__(self):
        return f"Sertifikat {self.student.username} - {self.placement.company_name}"
    

# ==========================================
# FITUR 4 & 5: EVALUASI SUPERVISOR
# ==========================================
class SupervisorEvaluation(models.Model):
    EVAL_TYPES = (
        ('UTS', 'Laporan Kemajuan (UTS)'),
        ('UAS', 'Laporan Akhir (UAS)'),
    )
    # Menghubungkan evaluasi ini ke data magang mahasiswa
    placement = models.ForeignKey(Placement, on_delete=models.CASCADE)
    
    # Jenis evaluasinya: UTS atau UAS
    eval_type = models.CharField(max_length=3, choices=EVAL_TYPES)
    
    # Tracking status (Sudah diisi atau belum?)
    is_filled = models.BooleanField(default=False)
    
    # Kolom isian dari Supervisor (Baru terisi kalau is_filled = True)
    score = models.IntegerField(blank=True, null=True, verbose_name="Nilai (0-100)")
    feedback = models.TextField(blank=True, null=True, verbose_name="Komentar / Feedback")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evaluasi {self.eval_type} - Mahasiswa: {self.placement.student.username} | SPV: {self.placement.supervisor_name}"

class DocumentTemplate(models.Model):
    # Kita buat upload_to nya rapi di folder 'templates_doc/'
    uts_template = models.FileField(upload_to='templates_doc/', null=True, blank=True)
    uas_template = models.FileField(upload_to='templates_doc/', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Global Document Templates"  

# ==========================================
# FITUR 3B: LAPORAN MINGGUAN (BELUM DAPAT MAGANG)
# ==========================================
class WeeklyHuntReport(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    week_number = models.CharField(max_length=50) # Cth: "Minggu 1"
    companies_applied = models.TextField(verbose_name="Perusahaan yang dilamar minggu ini")
    challenges = models.TextField(verbose_name="Kendala yang dihadapi")
    next_plan = models.TextField(verbose_name="Rencana minggu depan")
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Hunting Report {self.student.email} - {self.week_number}"
    
class EmailSetting(models.Model):
    # Field di bawah ini juga wajib menjorok 4 spasi
    eval_subject = models.CharField(max_length=255, default="Mohon Evaluasi Kinerja Magang")
    eval_message = models.TextField(default="Halo Supervisor, mohon isi evaluasi mahasiswa kami.")
    
    def __str__(self):
        return "Konfigurasi Email Sistem"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('account', 'Aktivasi Akun'),
        ('certificate', 'Sertifikat'),
        ('reminder', 'Pengingat'),
        ('application', 'Lamaran'),
        ('general', 'Umum'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    title = models.CharField(max_length=255)
    message = models.TextField()
    target_tab = models.CharField(max_length=50, blank=True, null=True)
    action_url = models.URLField(blank=True, default='')
    action_label = models.CharField(max_length=100, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notif {self.student.email}: {self.title}"
