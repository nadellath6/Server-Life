| **GDD REVISI 8: SERVER LIFE: RUN TO ENTERPRISE**<br>Edisi Final Terverifikasi Simulasi, Restorasi Spesifikasi Engine & Validitas Metodologis (R1–R50) |

| --- |

**Catatan Revisi & Pengantar**

Dokumen ini merupakan GDD Revisi 8 yang menyatukan seluruh temuan terbuka pada Revisi 7 ke dalam satu paket perbaikan final. Berbeda dari revisi sebelumnya yang diverifikasi dengan hitungan manual, seluruh parameter kritis Revisi 8 diuji dengan simulator mesin gim berbasis bot (berkas serverlife_sim.py; ringkasan hasil pada Bagian 20): pemulihan saat Overload, kalibrasi DDoS dan Ransomware, perilaku suhu, syarat Subsidi Belajar, penyetaraan jadwal seed, serta pemulihan spesifikasi engine dan UI dari Revisi 5 yang sempat hilang pada Revisi 6 dan 7 (R43–R50).

**Peta Revisi Lengkap (R1–R50)**

| **Kode** | **Fokus Revisi** | **Bagian Terkait** |

| --- | --- | --- |

| **R1–R31** | Fondasi GDD Revisi 3 s.d. Revisi 6 (4 bar, K1–K4, Suhu, 16 Node, Fixed Timestep 60 Hz, Sub-Kuota, Ekonomi & Validitas) | 1–19 |

| **R32** | Perbaikan Overload State: Pemulihan Pasif Tetap Berjalan (50% pada R32; nilai final 70% pada R43) (100% jika Autoscaling aktif), Ambang Keluar <95,0%, & Shedding Khusus CPU/RAM/BW | 3.4, 3.5, 7.2, 11 |

| **R33** | Perbaikan Subsidi Belajar: Berbasis Keterlibatan agar Siswa Lemah Tidak Terjebak (aturan final ada pada R47) | 10, 16 |

| **R34** | Rekonsiliasi Aljabar Tabel Suhu: Rumus Aditif Konsisten (H_insiden +2,7°C/dtk + H_CPU {0,0 / +0,2 / +1,2}) & Verifikasi Durasi Eksak ≥85°C (≥3,0 dtk) | 5, 8 |

| **R35** | Kejelasan Syarat Kumulatif Era 3: Hardware Kumulatif (85 Credits) + 3 Node Pilihan Kumulatif = Total Minimum 165 Credits (dikoreksi pada R50: node ketiga termurah yang tersedia bernilai 30, bukan 25) | 10 |

| **R36** | Kalibrasi Insiden: DDoS dikalibrasi ulang ke +9,0%/dtk (R44) & Gelombang Ransomware 20 dtk dengan aturan residu final (R45) | 7.2, 8, 13, 14.2 |

| **R37** | Sinkronisasi Visual-Logis Dispatcher: Midpoint Logical Commit (Indeks jalur berpindah tepat di titik tengah 50% animasi geser 0,16 dtk / 80 ms) | 2, 3.5 |

| **R38** | 3 Jadwal Seed Paralel & Kenaikan Counter Percobaan Saat Start Era (Mencegah Intip Seed via Refresh); metode penyetaraan diganti jadwal independen terkalibrasi pada R48 | 2, 12, 16 |

| **R39** | Rumus Tunggal Pembulatan Sub-Kuota: floor(0,50 × Total_Kategori_Termasuk_HEAVY) secara konsisten di Era 1, 2, dan 3 (dengan pengecualian eksplisit 3 UPLOAD Era 2) | 6.2, 9 |

| **R40** | Koreksi Contoh K2 + K4 pada Tabel Keterhubungan: Penegasan kondisi RAM <65% (Normal) agar konsisten 100% dengan aturan Pemutus Siklus K1↔K4 | 4 |

| **R41** | Pemisahan Log Empiris C4: Skor Analisis Pra-Bermain Murni (snapshot konfigurasi saat pertama menekan Mulai Era — R50) vs Skor Adaptasi Pasca-Laporan (percobaan ulang) | 15, 16 |

| **R42** | Otentikasi Presensi Lab Bersama: Dropdown Kode Presensi + Token 4 Digit acak dari kartu meja (tanpa NISN — R50) untuk Mencegah Penyamaan Profil | 1, 16 |

| **R43** | Overload State Final: pemulihan teredam ×0,70 (100% jika Autoscaling aktif), keluar di <95,0%, Emergency Shedding −6,0 poin (CPU/RAM/BW). Simulasi: peluang Overload terselamatkan 99% / 70% / 72% (Era 1/2/3) dibanding 14% / 34% / 51% pada Revisi 7 | 3.3, 3.4, 11 |

| **R44** | Kalibrasi DDoS Final: +9,0%/dtk selama 12 dtk (tanpa node lulus 46%; Firewall/Rate Limiting/CDN ≥98%); jendela evaluasi "gagal ditangani" = durasi insiden + 5 dtk | 3.3, 3.4, 7.2, 8 |

| **R45** | Ransomware Final: sisa enkripsi di-reset di akhir gelombang (SLA −6% bila ≥50%), Patch Rutin menunda setiap gelombang, efek "K3 akibat berkas terkunci" dihapus, kriteria SLA seragam | 6.1, 7.2, 8 |

| **R46** | Penegasan Overheating: Pendingin/UPS praktis wajib di Era 3 (simulasi: 23% lulus tanpa keduanya, 99% dengan Pendingin Lv1 atau UPS); klaim "tidak Game Over" hanya berlaku bila CPU tetap Normal | 5, 8 |

| **R47** | Subsidi Belajar Final: sesi sah = bukan ABORTED DAN ≥30 dtk DAN ≥8/12 paket; aktif setelah 2 sesi sah gagal, atau 3 sesi non-ABORTED gagal, atau >30 menit; Kode Guru; syarat "90 dtk kumulatif" dihapus | 10, 16 |

| **R48** | Seed: 3 jadwal independen terkalibrasi (bukan permutasi jalur dari satu jadwal) dengan kriteria penerimaan ±1 simpangan baku hasil simulasi | 2, 12 |

| **R49** | Restorasi spesifikasi engine & UI dari Revisi 5: tata letak ponsel, Pause/anti-intip, antrean toast, pembulatan tampilan, batas dt 100 ms, debounce log, definisi penyebab utama Laporan Insiden | 3.4, 12, 13 |

| **R50** | Syarat gerbang Era 3 = 165 Credits; c4_first_attempt_match direkam saat pertama Mulai Era; token acak (tanpa NISN) & cadangan Salin/Unduh CSV; Era 1 sengaja ringan (data C3 dari Era 2–3); pernyataan verifikasi akurat & Lampiran 20 | 9, 10, 15, 16, 19, 20 |

**1. Ringkasan Konsep**

- Genre: Simulasi-arkade 3 jalur (3-lane catching), HTML Canvas, berjalan di peramban.

- Peran Pemain: System Administrator yang mengelola kapasitas, ketersediaan, dan keamanan server TokoKita.

- Aksi Utama: Menggeser Load Dispatcher antar-jalur (Jalur A, B, C) untuk menerima paket ke server atau menolaknya (load shedding / HTTP 503), serta menyusun konfigurasi node pada Skill Tree sebelum era dimulai (dilengkapi fitur Refund gratis untuk node pilihan bebas) (R1, R11, R27).

- Inti Edukasi: Memahami fungsi dan karakteristik sumber daya (C2), menerapkan strategi alokasi kapasitas serta memprediksi dampak beban berantai (C3), dan menganalisis gejala pada Log Diagnostik Pra-Era maupun rantai insiden untuk menentukan node penangkal yang tepat (C4).

- Modal Awal: 0 Credits.

- Core Loop: Pilih Kode Presensi + Input Token 4 Digit (R42, R50) → Tutorial Interaktif + Kuis Mikro C2 (sekali, wajib) → Beranda (Skill Tree + Refund Node Pilihan) → Briefing + Log Diagnostik Pra-Era → Arena (3 Jalur Diskrit) → Laporan Insiden (5 Elemen) → Perhitungan Credits → Beranda.

**2. Kontrol dan Spesifikasi Teknis Arena (R28, R37, R48)**

- PC/Laptop & Ponsel: PC: Tombol A/D, panah kiri/kanan, atau klik jalur. Ponsel: Tombol sentuh Kiri/Kanan di bawah canvas atau ketuk langsung pada kolom jalur (A, B, C).

- Discrete Lane Snapping dengan Midpoint Logical Commit (R28, R37): Load Dispatcher bergerak di antara 3 indeks jalur diskrit: Jalur A (indeks 0, X=20%), Jalur B (indeks 1, X=50%), dan Jalur C (indeks 2, X=80%). Menekan tombol geser menjalankan animasi perpindahan selama 0,16 detik (160 ms). Untuk mencegah ketidaksinkronan visual dan logika (R37), indeks logis dispatcher.lane berpindah tepat pada titik tengah animasi (t = 0,08 dtk / 80 ms, saat gambar Dispatcher melintasi garis batas antar-jalur). Deteksi tangkapan di garis tangkap (Y_catch = 82%..88%) hanya mengevaluasi paket dengan packet.lane === dispatcher.lane (maksimal 1 paket per frame).

- Tiga Jadwal Seed Independen Terkalibrasi & Anti-Peek (R48): Setiap era memiliki 3 jadwal urutan paket kanonis (Form_0, Form_1, Form_2) yang dibangkitkan secara independen (bukan permutasi jalur dari satu jadwal; permutasi jalur hanya menghasilkan 2 bentuk yang setara jaraknya). Komposisi paket, jadwal insiden, dan aturan jarak jalur (Fair Lane) sama, tetapi jenis dan waktu kedatangan paket berbeda sehingga bocoran antarsiswa tidak berguna. Kriteria penerimaan sebuah form: dari ≥40 kandidat yang disimulasikan dengan bot terampil pada konfigurasi acuan (Era 1 tanpa node; Era 2 dengan Firewall; Era 3 dengan Backup Lokal + Firewall + Pendingin Lv1), kredit, SLA minimum, dan status lulus harus berada dalam ±1 simpangan baku dari rata-rata (sebaran antar-seed terukur kecil: Era 3 SD = 3,9 Credits ≈ 2%). Saat tombol 'Mulai Era' ditekan, sistem langsung menambah attempt_counter di localStorage dan memilih jadwal dengan rumus Form_Index = (nomor_urut_presensi + indeks_era + attempt_counter) mod 3. Konsekuensi: (1) Bocoran antarsiswa tidak berguna karena jenis dan waktu paket berbeda antar-form (dokumen ini tidak menjanjikan bahwa teman sebangku selalu mendapat form berbeda); (2) Tingkat kesulitan setara dalam toleransi di atas; (3) Refresh (ABORTED) memajukan attempt_counter sehingga form berganti.

**3. Sumber Daya, Beban, Pemulihan, dan Rumus Engine (R16, R28, R30, R32, R43, R44)**

**3.1 Kapasitas Awal Era 1 dan Beban Per Paket**

Kapasitas Awal Era 1: CPU 2 vCPU, RAM 2 GB, Bandwidth 100 Mbps, Storage 16 GB.

| **Paket → Sumber Daya Dominan** | **Beban Mentah (Era 1 / Era 2 / Era 3)** | **Persentase Bar Acuan Era 1 (2C/2G/100M/16G)** | **Persentase Bar Acuan Era 2 (2C/4G/200M/16G)** | **Persentase Bar Acuan Era 3 (4C/4G/200M/32G)** |

| --- | --- | --- | --- | --- |

| **WEB → CPU** | 0,4 / 0,5 / 0,8 core | 20% | 25% | 20% |

| **DATA → RAM** | 0,4 / 1,0 / 1,0 GB | 20% | 25% | 25% |

| **MEDIA → Bandwidth** | 25 / 50 / 50 Mbps | 25% | 25% | 25% |

| **UPLOAD → Storage** | 3,6 / 3,6 / 3,6 GB | 22,5% | 22,5% | 11,25% |

Paket HEAVY (hanya untuk WEB, DATA, dan MEDIA) memberikan beban masuk 1,45x beban dasar dan debuff pemulihan ×0,70 selama 5,0 detik.

**3.2 Pemulihan Bar dan Lantai Minimum Berjenjang 25% (R28)**

| **Sumber Daya** | **Laju Turun Dasar** | **Lantai Minimum Normal (25% Laju Dasar)** | **Alasan Edukatif** |

| --- | --- | --- | --- |

| **CPU** | 6,0% / dtk | 1,50% / dtk | Eksekusi instruksi web sangat cepat, melambat saat thrashing/throttling |

| **RAM** | 3,0% / dtk | 0,75% / dtk | Pelepasan memori kerja melambat saat antrean jaringan & CPU padat |

| **Bandwidth** | 2,5% / dtk | 0,625% / dtk | Pipa transmisi jaringan menyempit saat antrean paket menumpuk |

| **Storage** | 0% / dtk | 0% / dtk (Hanya turun lewat node Backup) | Berkas tersimpan bersifat non-volatile di dalam disk |

**3.3 Zona Bar dan Mekanisme Overload State yang Dapat Dipulihkan (R32, R43)**

- Zona Bar & Histeresis ±2%: Normal: <65,0%. Waspada (Kuning): masuk di ≥65,0%, keluar di ≤63,0%. Kritis (Merah): masuk di ≥85,0%, keluar di ≤83,0%.

- Mekanisme Overload State 3,0 Detik (R32, R43 — Pemulihan Teredam 70%, Autoscaling, & Shedding): Saat salah satu bar menyentuh ≥100,0%, nilai bar di-clamp pada 100,0% dan masuk ke status OVERLOAD STATE (timer 3,0 detik menyala). Parameter final R43 diverifikasi simulasi (peluang Overload terselamatkan pada pemain ceroboh yang mengetahui aturan: 99% Era 1, 70% Era 2, 72–91% Era 3; pemain serakah tetap gagal karena kuota, SLA, atau bottleneck):
1. Pemulihan Pasif Teredam 70%: Selama Overload State, bar CPU, RAM, dan Bandwidth tetap dipulihkan sebesar 0,70 × Rec_base (dan 1,00 × Rec_base penuh apabila node Autoscaling sedang aktif pada bar tersebut).
2. Ambang Keluar di < 95,0%: Timer 3,0 detik TIDAK di-reset hanya karena bar turun ke 99,9%; timer baru dibatalkan (server selamat) ketika nilai bar turun ke < 95,0%. Bila pemain berhenti menangkap paket sejenis, bar keluar dari Overload dalam: CPU 5,0 ÷ (0,70 × 6,0) = 1,2 dtk; RAM 5,0 ÷ (0,70 × 3,0) = 2,4 dtk; BW 5,0 ÷ (0,70 × 2,5) = 2,9 dtk (semuanya < 3,0 dtk). Pada kondisi penalti menumpuk (K2, K4, HEAVY, termal) pemulihan lebih lambat sehingga pemain membutuhkan Emergency Shedding, Query Cache, CDN, atau Autoscaling.
3. Emergency Load Shedding Khusus Sumber Daya Dinamis (CPU, RAM, BW): Menolak/melewatkan 1 paket yang sesuai dengan bar dinamis yang sedang Overload mengurangi tekanan antrean sebesar −6,0 poin persentase. Menolak paket UPLOAD TIDAK mengurangi bar Storage (menolak unggahan baru tidak menghapus berkas lama di disk; Overload pada Storage hanya dapat diselamatkan oleh Backup Lokal / Backup Cloud).
4. Menangkap paket sejenis saat bar sedang Overload langsung memicu Game Over (R32, tetap berlaku).

| **Rumus Baku Engine (Load_in, DDoS_in, dan Rec_eff — R30, R32, R43, R44) — **1. Beban Paket Masuk (Load_in): Faktor_Penalti = 1 + Bonus_HEAVY[0,45] + Penalti_K3[0,25 atau 0,50]; Faktor_Diskon = max(0,40, (1 - LB[0,20]) × (1 - QueryCache_DATA[0,25]) × (1 - RateLimit_JamSibuk[0,40]) × (1 - Autoscaling[0,25])); Load_in = min(35%, Beban_Dasar × Faktor_Penalti × Faktor_Diskon).<br>2. Aliran Beban DDoS per Detik (DDoS_in — R36): DDoS_in = 9,0%/dtk × (1 - Firewall[0,60]) × (1 - RateLimit[0,40]) × (1 - Autoscaling_BW[0,25]).<br>3. Laju Pemulihan Efektif (Rec_eff — R32): Rec_base = max(Lantai_25%, (Laju_Dasar + Bonus_Node - Penalti_K1_K2) × Pengali_K4[0,85 atau 0,70] × Pengali_Termal[0,60] × Pengali_HEAVY[0,70]). Jika bar sedang dalam Overload State dan Autoscaling tidak aktif pada bar tersebut, maka Rec_eff = 0,70 × Rec_base; selain itu Rec_eff = Rec_base. |

| --- |

**3.4 Urutan Evaluasi Satu Frame (Fixed Timestep 60 Hz)**

| **Urutan** | **Tahap Evaluasi Engine** | **Deskripsi Teknis** |

| --- | --- | --- |

| **Langkah 1** | Input & Midpoint Commit | Baca input pemain, jalankan interpolasi geser (0,16 dtk), dan perbarui dispatcher.lane saat animasi melewati titik tengah 50% (0,08 dtk) (R37). |

| **Langkah 2** | Tangkapan (Maks 1) & Beban | Evaluasi maksimal 1 paket di garis tangkap pada jalur aktif; tambahkan Load_in (di-clamp ke 100% jika memicu Overload baru; jika menangkap paket sejenis saat sudah Overload, langsung Game Over). Jika melewatkan paket CPU/RAM/BW saat Overload, kurangi bar −6,0%. Tambahkan DDoS_in × dt. |

| **Langkah 3** | Aktivasi Node Otomatis | Evaluasi pemicu Backup Lokal, Backup Cloud, dan Autoscaling SEBELUM pengecekan timer Overload. |

| **Langkah 4** | Pemulihan & Efek K1–K4 | Kurangi bar sebesar Rec_eff × dt (termasuk 0,70 × Rec_base saat Overload), jalankan K1–K4, dan perbarui suhu serta enkripsi. |

| **Langkah 5** | Evaluasi Zona, SLA, & Overload | Perbarui zona bar (histeresis ±2%), hitung perubahan SLA, batalkan Overload State jika bar turun ke <95,0%, atau majukan timer Overload (+dt). |

| **Langkah 6** | Cek Akhir & Render UI | Jika timer Overload mencapai ≥3,0 dtk (atau syarat kalah lain terpenuhi), picu Game Over; jika waktu habis, evaluasi kelulusan; gambar ulang ke Canvas. |

- Batas Akumulasi dt (R49): Fixed Timestep dt = 1/60 detik (16,67 ms) dengan batas maksimum akumulasi dt = 100 ms agar simulasi tidak melompat pada PC lambat atau setelah tab kembali aktif.

- Pembulatan Tampilan (R49): Nilai internal dihitung dalam floating-point presisi ganda, sedangkan teks angka di layar memakai Math.floor() pada rentang 99,0%–99,99% agar angka '100%' hanya tampil ketika nilai internal benar-benar ≥ 100,0%.

- Debounce Notifikasi (R49): Pesan log/toast yang identik dibatasi maksimal 1× per 5 detik agar tidak berkedip berulang saat bar berada di sekitar ambang zona.

- Jendela Evaluasi Insiden (R44): Kriteria 'gagal ditangani' (Bagian 8) dievaluasi selama durasi insiden + 5,0 detik sesudahnya; untuk Ransomware dievaluasi saat gelombang berakhir (R45).

**4. Keterhubungan Sumber Daya (R2, R28, R40)**

| **Kode** | **Aturan Sebab-Akibat** | **Waspada (65–84%)** | **Kritis (≥85%)** | **Alasan Teknis & Contoh Diferensiasi Laju yang Konsisten (R40)** |

| --- | --- | --- | --- | --- |

| **K1** | RAM tinggi → CPU terbebani | Laju turun CPU −1,2%/dtk | Laju turun CPU −2,4%/dtk | RAM penuh memicu swapping. Contoh: CPU turun dari 6,0 menjadi 4,8 (Waspada) atau 3,6%/dtk (Kritis); ditambah Termal (×0,60) menjadi 2,16%/dtk; ditambah HEAVY (×0,70) menjadi 1,51%/dtk. |

| **K2** | Bandwidth tinggi → RAM terpakai | Laju turun RAM −0,4%/dtk | Laju turun RAM −1,0%/dtk | Antrean paket jaringan ditampung di buffer RAM. Contoh konsisten Pemutus Siklus (R40): Saat RAM masih Normal (<65%, sehingga K1 belum aktif), K2 Kritis menurunkan laju RAM dari 3,0 menjadi 2,0%/dtk, dan jika CPU sedang Kritis (K4 ×0,70), laju RAM menjadi 1,40%/dtk (ditambah HEAVY ×0,70 menjadi 0,98%/dtk). Begitu RAM naik mencapai ≥65% (K1 aktif), Pemutus Siklus menghentikan pengali K4 pada RAM (sehingga laju RAM kembali ke 2,0%/dtk, atau 1,40%/dtk dengan HEAVY). |

| **K3** | Storage penuh → penulisan gagal | Beban RAM paket DATA +25% (+0,25 aditif) | Penulisan DATA gagal: tidak dihitung kuota, Credits 0, beban RAM +50% (+0,50 aditif) | Dirty pages database tertahan di RAM karena gagal ditulis (flush) ke dalam disk. |

| **K4** | CPU tinggi → pemrosesan lambat | Laju turun RAM & BW ×0,85 | Laju turun RAM & BW ×0,70 | Pemutus Siklus: Apabila K1 sedang aktif (RAM ≥65%), pengali K4 HANYA dikenakan pada Bandwidth (tidak mengunci pemulihan RAM dua arah). |

**5. Mekanik Suhu dengan Rumus Aditif Terverifikasi (R6, R34, R46)**

Sensor suhu aktif mulai Era 3 (suhu awal 40,0°C). Rekonsiliasi Aljabar R34: Seluruh perubahan suhu menggunakan komponen panas CPU (H_CPU) yang 100% konsisten baik di luar insiden maupun saat insiden berlangsung:
• Kontribusi Panas CPU (H_CPU): CPU Normal (<65%) = +0,0°C/dtk · CPU Waspada (65–84%) = +0,2°C/dtk · CPU Kritis (≥85%) = +1,2°C/dtk.
• Faktor Reduksi Node Pendingin (M_cool): Tanpa Pendingin = 1,00 · Pendingin Lv1 (−30%) = 0,70 · Pendingin Lv2 (−60%) = 0,40.
• Di Luar Insiden (Sistem Pendingin Rak Aktif): Saat CPU Normal (<65%), pendinginan aktif menurunkan suhu sebesar −1,0°C/dtk (minimum 40,0°C). Saat CPU Waspada atau Kritis, laju perubahan suhu bersih = H_CPU × M_cool (+0,20°C/dtk pada Waspada; +1,20°C/dtk pada Kritis tanpa node).
• Saat Insiden 'Pendingin Gagal' (Durasi 20 dtk; atau 12 dtk dengan UPS): Pendinginan aktif (−1,0°C/dtk) mati sementara dan muncul beban panas darurat ruang server H_insiden = +2,70°C/dtk (atau +2,20°C/dtk jika memasang UPS yang memangkas −0,50°C/dtk). Rumus laju suhu saat insiden: Laju_Insiden = (H_insiden + H_CPU) × M_cool.

| **Kondisi CPU & Kontribusi H_CPU** | **Laju di Luar Insiden (Tanpa Node)** | **Konfigurasi Node Saat Insiden Pendingin Gagal** | **Laju Suhu Saat Insiden** | **Puncak Suhu (Dari 40°C)** | **Durasi Eksak di ≥85°C & Dampak SLA / Game Over (Terverifikasi — R34)** |

| --- | --- | --- | --- | --- | --- |

| **CPU Normal (<65%)<br>H_CPU = +0,0°C/dtk** | −1,00°C/dtk<br>(min 40°C) | Tanpa Node (20 dtk)<br>Pendingin Lv1 (20 dtk)<br>UPS Saja (12 dtk) | +2,70°C/dtk<br>+1,89°C/dtk<br>+2,20°C/dtk | 94,0°C<br>77,8°C<br>66,4°C | • Tanpa Node: 3,33 dtk di ≥85°C (≥3 dtk → Kena SLA −6%, Tidak Game Over)<br>• Dengan Lv1: 0 dtk di ≥85°C (Aman sepenuhnya)<br>• Dengan UPS: 0 dtk di ≥85°C (Aman sepenuhnya) |

| **CPU Waspada (65–84%)<br>H_CPU = +0,2°C/dtk** | +0,20°C/dtk | Tanpa Node (20 dtk)<br>Pendingin Lv1 (20 dtk)<br>UPS Saja (12 dtk) | +2,90°C/dtk<br>+2,03°C/dtk<br>+2,40°C/dtk | 98,0°C<br>80,6°C<br>68,8°C | • Tanpa Node: 4,48 dtk di ≥85°C (≥3 dtk → Kena SLA −6%, Tidak Game Over)<br>• Dengan Lv1: 0 dtk di ≥85°C (Aman sepenuhnya)<br>• Dengan UPS: 0 dtk di ≥85°C (Aman sepenuhnya) |

| **CPU Kritis (≥85%)<br>H_CPU = +1,2°C/dtk** | +1,20°C/dtk | Tanpa Node (20 dtk)<br>Pendingin Lv1 (20 dtk)<br>Pendingin Lv2 (20 dtk)<br>UPS Saja (12 dtk) | +3,90°C/dtk<br>+2,73°C/dtk<br>+1,56°C/dtk<br>+3,40°C/dtk | 100°C (dtk 15,38)<br>94,6°C<br>71,2°C<br>80,8°C | • Tanpa Node: Mencapai 100°C pada dtk 15,38 (GAME OVER!)<br>• Dengan Lv1: 3,52 dtk di ≥85°C (≥3 dtk → Kena SLA −6%, Tidak Game Over)<br>• Dengan Lv2 atau UPS: 0 dtk di ≥85°C (Aman sepenuhnya) |

- Ambang Dampak Suhu: ≥70,0°C: peringatan kuning. ≥85,0°C: Thermal Throttling (laju pemulihan CPU ×0,60) dan penalti SLA −6% apabila suhu berada di ≥85,0°C selama ≥3,0 detik kumulatif saat insiden berlangsung. ≥100,0°C: Game Over.

- Catatan Durasi & Jendela Evaluasi (R44, R46): Durasi di ≥85°C pada tabel dihitung selama insiden berlangsung. Jendela evaluasi +5 dtk (R44) hanya dapat menambah durasi di ≥85°C sehingga kesimpulan lulus/gagal pada tabel tidak berubah.

- Pendingin atau UPS Praktis Wajib di Era 3 (R46 — Hasil Simulasi): Di Era 3 CPU hampir selalu berada di Zona Waspada/Kritis, sehingga kasus 'CPU Normal tanpa node' pada tabel jarang terjadi. Simulasi bot terampil: tanpa Pendingin maupun UPS hanya 23% sesi lulus (±75% Game Over karena suhu ≥100°C); dengan Pendingin Lv1 99%; dengan UPS 99%; dengan Pendingin Lv2 99%. Karena itu GDD memperlakukan Pendingin atau UPS sebagai penangkal wajib untuk ancaman Overheating, bukan pilihan non-biner.

**6. Stabilitas Layanan (SLA) dan Rumus Konsisten Sub-Kuota (R29, R39, R44, R45)**

**6.1 Stabilitas Layanan (SLA)**

| **Kondisi Sistem** | **Perubahan Stabilitas Layanan (SLA)** | **Catatan Mekanik** |

| --- | --- | --- |

| **Ketiga bar dinamis (CPU, RAM, BW) di Zona Normal (<65%) & tanpa insiden aktif selama 3 dtk** | +0,5% / dtk (Maksimal 100%) | Tetap aktif meskipun Storage ≥65% (Storage dikecualikan secara konsisten). |

| **1 bar dinamis (CPU, RAM, atau BW) berada di Zona Kritis (≥85%)** | −0,8% / dtk | Storage ≥85% tidak menguras SLA pasif per detik (hukumannya melalui K3 Kritis). |

| **2 atau 3 bar dinamis (CPU, RAM, BW) berada di Zona Kritis (≥85%)** | −1,5% / dtk | Degradasi layanan saat terjadi kemacetan multi-komponen. |

| **Insiden operasional gagal ditangani (kriteria spesifik Bagian 8)** | −6% sekali per insiden | Berlaku pada Jam Sibuk, DDoS, dan Overheating (dievaluasi selama insiden + 5 dtk; R44) serta Ransomware dengan sisa enkripsi ≥50% saat gelombang berakhir (R45). Sisa enkripsi di-reset ke 0% setelah gelombang berakhir. |

**6.2 Kuota Total dan Rumus Pembulatan Tunggal Sub-Kuota (R39)**

Perbaikan Konsistensi R39: Seluruh angka Sub-Kuota untuk layanan WEB, DATA, dan MEDIA dihitung dengan satu rumus matematika tunggal yang seragam di semua era, yaitu pembulatan ke bawah dari 50% total paket kategori tersebut (termasuk paket HEAVY dari jenis dasar yang sama):
   Rumus Baku Sub-Kuota (W/D/M) = floor(0,50 × (Jumlah_Paket_Biasa + Jumlah_Paket_HEAVY_Sejenis))
Untuk kategori UPLOAD (yang tidak memiliki paket HEAVY), berlaku rumus yang sama (50% = 2 dari 4 di Era 1; 50% = 6 dari 12 di Era 3), KECUALI pada Era 2 yang secara eksplisit ditetapkan sebesar 3 dari 8 paket (37,5% = 67,5% keterisian pada Storage dasar 16 GB) agar siswa yang tidak membeli Storage Lv1 atau Backup Lokal di Era 2 tetap dapat lulus tanpa terkunci oleh efek K3 Kritis (≥85%).

| **Parameter Kuota** | **Era 1: Startup** | **Era 2: Tumbuh** | **Era 3: Enterprise** |

| --- | --- | --- | --- |

| **Total Paket per Kategori Dasar (Biasa + HEAVY)** | 20W, 14D, 10M, 4U<br>(Total: 48 paket) | 29W (28+1H), 21D (20+1H), 17M (16+1H), 8U<br>(Total: 75 paket) | 45W (40+5H), 35D (30+5H), 28M (24+4H), 12U<br>(Total: 120 paket) |

| **Kuota Total Terlayani (Wajib)** | 28 dari 48 (58%) | 45 dari 75 (60%) | 72 dari 120 (60%) |

| **Sub-Kuota Wajib per Jenis: floor(0,50 × Total_Kategori) (R39)** | Min: 10 WEB, 7 DATA, 5 MEDIA, 2 UPLOAD<br>(Jumlah Sub-Kuota = 24; sisa 4 bebas) | Min: 14 WEB, 10 DATA, 8 MEDIA, 3 UPLOAD*<br>(Jumlah Sub-Kuota = 35; sisa 10 bebas) | Min: 22 WEB, 17 DATA, 14 MEDIA, 6 UPLOAD<br>(Jumlah Sub-Kuota = 59; sisa 13 bebas) |

*Keterangan Era 2: 14 = floor(0,5 × 29); 10 = floor(0,5 × 21); 8 = floor(0,5 × 17); 3 UPLOAD = batas khusus 67,5% Storage dasar 16 GB.

**7. Sistem Ekonomi Credits dan Skill Tree (R10, R27, R28, R32, R36, R44, R45, R50)**

**7.1 Perolehan Credits dan Potensi Pendapatan**

| **WEB** | **DATA** | **MEDIA** | **UPLOAD** | **HEAVY WEB** | **HEAVY DATA** | **HEAVY MEDIA** |

| --- | --- | --- | --- | --- | --- | --- |

| **1 Credit** | 2 Credits | 3 Credits | 4 Credits | 3 Credits | 4 Credits | 5 Credits |

| **Kategori Potensi Pendapatan** | **Era 1** | **Era 2** | **Era 3** |

| --- | --- | --- | --- |

| **Maksimal Teoretis Paket (100% tertangkap)** | 94 Credits | 160 Credits | 275 Credits (220 biasa + 55 HEAVY) |

| **Tangkapan Realistis (~70% paket)** | ~65 Credits | ~112 Credits | ~193 Credits |

| **Bonus Lulus Pertama Kali (First-Clear Bonus)** | +25 Credits | +40 Credits | +60 Credits |

| **Total Realistis 1x Lulus** | ~90 Credits | ~152 Credits | ~253 Credits |

Catatan R50 (Hasil Simulasi): Baris 'Tangkapan Realistis' mengasumsikan pemain rata-rata (~70% paket). Bot terampil (memenuhi sub-kuota, menahan MEDIA sebelum DDoS) memperoleh rata-rata Era 1 ≈ 85, Era 2 ≈ 111 (dengan Firewall), dan Era 3 ≈ 161–259 Credits tergantung node. Era 1 sengaja ringan (pemain serakah lulus ≈70%, pemain terampil 100% dengan kredit sama), sehingga data C3 untuk analisis diambil dari Era 2–3.

**7.2 Spesifikasi 16 Node Skill Tree**

1. Cabang Hardware (Lv 2 wajib membeli Lv 1 terlebih dahulu):

| **Node** | **Lv 1** | **Lv 2 (Wajib Lv 1 dulu)** |

| --- | --- | --- |

| **CPU** | 2→4 vCPU (WEB Era 1: 20%→10%). Harga: 20 | 4→8 vCPU (WEB Era 1: 5%). Harga: 40 |

| **RAM** | 2→4 GB (DATA Era 1: 20%→10%). Harga: 20 | 4→8 GB (DATA Era 1: 5%). Harga: 40 |

| **Bandwidth** | 100→200 Mbps (MEDIA Era 1: 25%→12,5%). Harga: 25 | 200→500 Mbps (MEDIA Era 1: 5%). Harga: 50 |

| **Storage** | 16→32 GB (UPLOAD: 22,5%→11,25%). Harga: 20 | 32→80 GB (UPLOAD: 4,5%). Harga: 40 |

2. Cabang Performa (Autoscaling Menjaga Pemulihan 100% Penuh Saat Overload — R32):

| **Node** | **Efek Teknis & Mekanik** | **Harga** |

| --- | --- | --- |

| **Query Cache & Indexing** | Mempercepat eksekusi query: laju turun CPU 6→9%/dtk, laju turun RAM 3→4%/dtk, dan mengurangi beban masuk paket DATA ke RAM sebesar −25%. | 25 |

| **CDN** | Konten statis/media dilayani dari edge server: laju turun Bandwidth 2,5→4,0%/dtk. | 25 |

| **Load Balancer** | Mendistribusikan trafik secara merata: semua beban paket masuk berkurang −20%. | 40 |

| **Autoscaling (Global Cooldown — R28, R32)** | Berlaku untuk bar CPU, RAM, dan Bandwidth. Saat salah satu bar mencapai ≥85%, memulai booting (cold start 2 dtk), lalu aktif selama 6 dtk pada bar pemicu: memangkas beban masuk −25%, menambah laju pemulihan sebesar +35% dari laju dasar bar tersebut (+2,1%/dtk CPU, +1,05%/dtk RAM, +0,875%/dtk BW), DAN membebaskan bar tersebut dari peredaman pemulihan Overload (×0,70) apabila sedang berada dalam Overload State (pemulihan berjalan 100% penuh sehingga efektif menurunkan bar dari 100% ke <95%). Jeda Global: 25 dtk setelah efek berakhir. | 50 |

3. Cabang Keamanan (Mendukung Karantina Gelombang Ransomware 20 Detik — R36):

| **Node** | **Efek Teknis & Mekanik** | **Harga** |

| --- | --- | --- |

| **Firewall** | Menyaring paket botnet pada lapisan jaringan: memangkas laju beban serangan DDoS sebesar −60% (dari +9,0%/dtk menjadi +3,6%/dtk; R44). | 30 |

| **Rate Limiting** | Membatasi frekuensi request berlebih per IP: memangkas beban banjir paket (selama Jam Sibuk dan aliran DDoS) sebesar −40%. | 35 |

| **Antivirus** | Memindai signature malware: Ransomware terdeteksi 3 dtk lebih awal (dtk ke-3) dan laju enkripsi dipangkas −50% (dari +6,25%/dtk menjadi +3,125%/dtk sehingga gelombang 20 dtk berhenti pada 62,5%, tidak mencapai 100% Game Over meskipun tanpa Backup; sisa enkripsi di-reset ke 0% saat gelombang berakhir) (R36, R45). | 30 |

| **Patch Rutin** | Menutup celah kerentanan sistem: menunda kemunculan setiap gelombang Ransomware selama 10 dtk (R45) dan memangkas laju enkripsi −40% (dari +6,25%/dtk menjadi +3,75%/dtk sehingga gelombang 20 dtk berhenti pada 75,0%, tidak mencapai 100% Game Over) (R36). | 35 |

4. Cabang Ketahanan:

| **Node** | **Efek Teknis & Mekanik** | **Harga** |

| --- | --- | --- |

| **Pendingin (Lv 1 & Lv 2)** | Optimalisasi aliran udara data center: mengurangi seluruh laju kenaikan suhu sebesar −30% (Lv 1: 30 Credits) dan −60% (Lv 2: 50 Credits, wajib Lv 1 dulu). | 30 / 50 |

| **Backup Lokal (Auto-Archiving & Restore)** | Lapisan Pertama (Primary): (1) Saat Ransomware terdeteksi, melakukan System Restore (mereset enkripsi ke 0% + menurunkan Storage −25 poin persentase); ATAU (2) Saat Storage ≥85% tanpa Ransomware, melakukan Auto-Archive (menurunkan Storage −45 poin persentase). Jeda: 40 dtk. | 40 |

| **Backup Cloud (Cloud Offload & Failover)** | Lapisan Kedua (Failover): langsung mengeksekusi Restore (enkripsi ke 0% + Storage −35 poin) atau Cloud Offload (Storage langsung ke 20%) apabila Backup Lokal tidak terpasang atau sedang dalam masa jeda. Jeda: 50 dtk. | 60 |

| **UPS (Emergency Cooling Power)** | Menyuplai daya cadangan ke unit pendingin saat gangguan listrik: memangkas durasi insiden Pendingin Gagal dari 20 dtk menjadi 12 dtk dan mengurangi laju panas insiden sebesar −0,5°C/dtk. | 25 |

**8. Spesifikasi Insiden Operasional dan Hasil Kalibrasi Simulasi (R34, R36, R44, R45, R46)**

Perbaikan Final R44–R46 (Kalibrasi Insiden Berdasarkan Simulasi Bot):
1. Kalibrasi DDoS (+9,0%/dtk selama 12 dtk — R44): Laju bersih tanpa node = 9,0 − 2,5 (pemulihan dasar BW) = +6,5%/dtk, atau +78% selama 12 detik. Hasil simulasi (pemain terampil yang berhenti menangkap MEDIA 5 dtk sebelum serangan): tanpa node penangkal lulus 46%, dengan Query Cache 43%, Autoscaling 60%, CDN 99%, Rate Limiting 98%, Firewall 100%. Memilih node yang tepat sangat menentukan, tetapi siswa tanpa Firewall masih punya peluang bila Bandwidth dikosongkan sebelum serangan (Log Diagnostik Era 2 menyebut waktu serangan). Pada laju sebelumnya (+10,5%/dtk) klaim 'dapat selamat tanpa Firewall' hanya terwujud 11% dalam simulasi sehingga dikoreksi.
2. Gelombang Ransomware (Jendela Aktif 20 Detik, +6,25%/dtk — R45): Tanpa node keamanan/ketahanan sama sekali, enkripsi mencapai 100% pada detik ke-16,0 (Game Over; simulasi: 0% lulus bila tidak ada Antivirus, Patch Rutin, Backup Lokal, maupun Backup Cloud). Jika memiliki Backup Lokal/Cloud, enkripsi dipulihkan ke 0% (tanpa penalti). Antivirus (puncak 62,5%), Patch Rutin (75,0%), atau keduanya (37,5%) menghentikan gelombang tanpa Game Over; bila sisa enkripsi ≥50% saat gelombang berakhir berlaku SLA −6%. Setelah gelombang berakhir, sisa enkripsi di-reset ke 0% (karantina selesai) sehingga tidak menumpuk ke gelombang Hari Puncak (bila residu dibiarkan menumpuk, simulasi menunjukkan 0% lulus untuk konfigurasi tanpa Backup). Efek 'K3 Waspada akibat berkas terkunci' dihapus (K3 hanya berbasis keterisian Storage). Patch Rutin menunda setiap gelombang 10 dtk.
3. Overheating (R46): Lihat Bagian 5. Pendingin atau UPS praktis wajib di Era 3 (simulasi: 23% lulus tanpa keduanya).

| **Insiden** | **Jadwal & Durasi Aktif** | **Efek Otomatis Tanpa Node (R34, R36)** | **Efek Berjenjang Node Penangkal (R36)** | **Kriteria Spesifik Gagal Ditangani** |

| --- | --- | --- | --- | --- |

| **Jam Sibuk (Lonjakan Trafik Sah)** | Era 1: dtk 90–100 (8 paket dari 48 paket jatuh tiap 1,25 dtk) | 8 paket beruntun (4 MEDIA, 2 WEB, 2 DATA) jatuh cepat di jalur. | Era 1 (Tahap A): Rate Limiting (−40% beban banjir), Query Cache, CDN.<br>(Load Balancer tersedia mulai Era 2) | Bar Bandwidth ATAU bar CPU berada di Zona Kritis (≥85%) selama ≥3,0 dtk kumulatif selama insiden + 5 dtk sesudahnya → SLA −6% |

| **DDoS (Banjir Trafik Botnet)** | Era 2: dtk 110–122 (12 dtk).<br>Era 3: dtk 130–142 (12 dtk). | Beban Bandwidth +9,0%/dtk (naik bersih +6,5%/dtk → +78% dalam 12 dtk; Game Over bila BW mencapai 100% dan gagal turun ke <95% dalam 3 dtk, kecuali ada penangkal atau BW awal rendah). | • Firewall (−60% → +3,6%/dtk, bersih +1,1%/dtk → +13,2%)<br>• Rate Limiting (−40% → +5,4%/dtk, bersih +2,9%/dtk → +34,8%)<br>• CDN (pemulihan 4,0%/dtk, bersih +5,0%/dtk → +60%)<br>• Firewall + Rate Limiting (masuk 2,16%/dtk < pemulihan 2,5%/dtk → bar turun) | Bar Bandwidth berada di Zona Kritis (≥85%) selama ≥3,0 dtk kumulatif selama insiden + 5 dtk sesudahnya → SLA −6% |

| **Ransomware (Gelombang Enkripsi 20 dtk)** | Era 3: dtk 75–95 (20 dtk) & Hari Puncak dtk 130–150 (setiap gelombang +10 dtk jika Patch Rutin) | Deteksi dtk ke-6 (dtk ke-3 dgn AV). Laju enkripsi +6,25%/dtk → mencapai 100% pada dtk ke-16,0 (Game Over jika tanpa AV, Patch, maupun Backup). | • Backup Lokal/Cloud: Restore enkripsi ke 0% (Sempurna)<br>• Antivirus + Patch (tanpa Backup): Karantina di 37,5% (Selamat & bebas SLA −6%)<br>• AV saja / Patch saja: Karantina di 62,5% / 75% (Selamat dari Game Over, kena SLA −6%)<br>• Sisa enkripsi di-reset ke 0% di akhir gelombang (R45) | • Enkripsi mencapai 100% → Game Over<br>• Gelombang 20 dtk berakhir dgn sisa enkripsi ≥50% (tanpa Restore Backup) → SLA −6% |

| **Overheating (Pendingin Gagal)** | Era 3: dtk 40–60 (20 dtk) & Hari Puncak dtk 130–150 (12 dtk dgn UPS) | Pendinginan pasif mati; laju suhu +2,70°C/dtk (Normal → 94°C), +2,90°C/dtk (Waspada → 98°C), atau +3,90°C/dtk (Kritis → 100°C di dtk 15,38). | • Pendingin Lv1 (−30%): Aman di Normal/Waspada (77,8–80,6°C); 94,6°C saat CPU Kritis<br>• Pendingin Lv2 (−60%) atau UPS (12 dtk, −0,5°C/dtk): Aman di semua kondisi<br>• Tanpa Pendingin/UPS: ±75% sesi Game Over (simulasi, R46) | Suhu berada di ≥85,0°C selama ≥3,0 dtk kumulatif selama insiden + 5 dtk sesudahnya → SLA −6% |

**9. Struktur Era dan Verifikasi Eksak Rasio Beban ÷ Pemulihan (R27, R39, R50)**

| **Parameter** | **Era 1: Startup** | **Era 2: Tumbuh** | **Era 3: Enterprise** |

| --- | --- | --- | --- |

| **Durasi Total Era** | 120 detik | 150 detik | 180 detik |

| **Jendela Muncul Paket** | Detik 2 s.d. Detik 114 (Tiba dtk 117) | Detik 2 s.d. Detik 144 (Tiba dtk 146,5) | Detik 2 s.d. Detik 173 (Tiba dtk 175) |

| **Total & Komposisi Paket** | 48 paket: WEB 20, DATA 14, MEDIA 10, UPLOAD 4 | 75 paket: WEB 28, DATA 20, MEDIA 16, UPLOAD 8, HEAVY 3 (1W, 1D, 1M) | 120 paket: WEB 40, DATA 30, MEDIA 24, UPLOAD 12, HEAVY 14 (5W, 5D, 4M) |

| **Kuota Total & Sub-Kuota (R39)** | Total 28/48 (Min: 10W, 7D, 5M, 2U) | Total 45/75 (Min: 14W, 10D, 8M, 3U*) | Total 72/120 (Min: 22W, 17D, 14M, 6U) |

| **Insiden Terjadwal** | Jam Sibuk (dtk 90–100) | DDoS (dtk 110–122) | Overheating (dtk 40), Ransomware (dtk 75), Hari Puncak (dtk 130) |

| **Keterhubungan Aktif** | K1, K3 | K1, K2, K3 | K1, K2, K3, K4, Suhu |

**Tabel Verifikasi Eksak Rasio Beban ÷ Pemulihan**

| **Kategori Perhitungan & Spesifikasi Acuan** | **CPU** | **RAM** | **Bandwidth** | **Storage (Tanpa Auto-Archive)** |

| --- | --- | --- | --- | --- |

| **Era 1 (CPU 2, RAM 2, BW 100, St 16 — 0 HEAVY)** | 0,56 (400% ÷ 720%) | 0,78 (280% ÷ 360%) | 0,83 (250% ÷ 300%) | 90% (4 × 22,5%) |

| **Era 2 Mentah (CPU 2, RAM 4, BW 200, St 16 — +3 HEAVY)** | 0,82 (736,25% ÷ 900%) | 1,19 (536,25% ÷ 450%) | 1,16 (436,25% ÷ 375%) | 180% (8 × 22,5%) |

| **Era 2 Efektif (Termasuk Debuff Pemulihan 3 HEAVY)** | 0,83 (736,25% ÷ 891%) | 1,20 (536,25% ÷ 445,5%) | 1,18 (436,25% ÷ 371,25%) | 180% (3 UPLOAD Sub-Kuota = 67,5%) |

| **Era 3 Mentah (CPU 4, RAM 4, BW 200, St 32 — +14 HEAVY)** | 0,88 (945% ÷ 1080%) | 1,72 (931,25% ÷ 540%) | 1,66 (745% ÷ 450%) | 135% (12 × 11,25%) |

| **Era 3 Efektif (Termasuk Debuff Pemulihan 14 HEAVY)** | 0,91 (945% ÷ 1035%) | 1,80 (931,25% ÷ 517,5%) | 1,71 (745% ÷ 435%) | 135% (6 UPLOAD Sub-Kuota = 67,5%) |

| **Era 3 Efektif + Node Performa (Query Cache + CDN)** | 0,61 | 1,01 (698,4% ÷ 690%) | 1,07 (745% ÷ 696%) | Terkendali dgn Backup Lokal/Cloud |

Catatan R50: Era 1 sengaja ringan (rasio <1, tanpa HEAVY maupun DDoS) sebagai onboarding. Simulasi: pemain serakah lulus ≈70% dan pemain terampil 100% dengan Credits sama (≈85). Era 1 karena itu tidak dijadikan sumber data C3; analisis C3 memakai Era 2–3 (di Era 2 pemain serakah lulus 0%).

**10. Syarat Kesiapan Kumulatif Eksak dan Subsidi Belajar Final (R35, R47, R50)**

Perbaikan Final R47 & R50:
1. Biaya Kumulatif Era 3 (R50 — koreksi R35): Syarat Slot Node Pilihan Bebas menuju Era 3 bersifat KUMULATIF TOTAL (minimal 3 node pilihan bebas terpasang, yaitu 1 dari Era 2 ditambah minimal 2 node baru). Hardware Dasar Kumulatif = 85 Credits (RAM Lv1 20 + BW Lv1 25 + CPU Lv1 20 + Storage Lv1 20). Tiga node termurah yang TERSEDIA saat syarat dipenuhi adalah Query Cache (25), CDN (25), dan satu node bernilai 30 (Firewall / Antivirus / Pendingin Lv1), karena UPS (25) baru terbuka di Tahap C. Total investasi kumulatif minimum = 85 + 25 + 25 + 30 = 165 Credits (bukan 160). Catatan desain: agar lulus percobaan pertama Era 3, ketiga slot sebaiknya mencakup satu penangkal per ancaman: (a) Pendingin/UPS, (b) anti-Ransomware (Antivirus/Patch/Backup), (c) anti-DDoS (Firewall/Rate Limiting/CDN); set termurah yang mencakup ketiganya ± 90 Credits (total ± 175).
2. Subsidi Belajar Final (R47 — menggantikan R33): (a) Sesi SAH = bukan ABORTED DAN berlangsung ≥30 dtk DAN melayani ≥8 paket (Era 1) atau ≥12 paket (Era 2); syarat dihubungkan dengan AND, bukan ATAU. (b) Subsidi aktif setelah 2 sesi sah gagal (Game Over atau kuota tidak terpenuhi) di era yang sama. (c) Cadangan agar siswa lemah tidak terjebak: Subsidi juga aktif setelah 3 sesi non-ABORTED yang gagal dengan durasi berapa pun, atau bila total waktu fase gim melewati 30 menit tanpa Era 3 terbuka. (d) Peneliti dapat membuka era secara manual lewat tombol 'Kode Guru'. (e) Syarat 'akumulasi 90 dtk lintas percobaan' dihapus karena dapat tercapai dalam satu percobaan tanpa kelulusan. (f) Node bantuan berstatus [PINJAMAN TERKUNCI] (0 Credits saat Refund, assisted_mode=TRUE) dan sesi assisted dikeluarkan dari analisis C3/C4 utama. Dasar: dalam simulasi, Game Over pemain serakah paling awal terjadi pada detik ke-21 dengan minimal 9 paket terlayani (Era 2), sehingga sesi sah (≥30 dtk dan ≥12 paket) tidak menjangkau semua kegagalan; cadangan (c) menangkap sisanya.

| **Target Era** | **Syarat 1: Kelulusan & Hardware Dasar Kumulatif (Terkunci / Non-Refundable)** | **Syarat 2: Slot Mitigasi Pilihan Bebas Secara Kumulatif (R35)** | **Aturan Subsidi Belajar Final (R47)** |

| --- | --- | --- | --- |

| **Menuju Era 2** | • LULUS Era 1<br>• Memasang Hardware Dasar Era 2: RAM Lv1 (20) + Bandwidth Lv1 (25) = 45 Credits [Terkunci saat Era 2 terbuka]. | Memasang minimal 1 Node Pilihan Bebas dari cabang Performa / Keamanan / Ketahanan (Biaya kumulatif minimal: 45 + 25 = 70 Credits). | Aktif setelah 2 sesi SAH gagal di Era 1 (≥30 dtk DAN ≥8 paket, bukan ABORTED), ATAU 3 sesi non-ABORTED gagal berapa pun durasinya, ATAU total waktu fase gim >30 menit; atau dibuka manual lewat Kode Guru. Node bantuan berstatus [PINJAMAN TERKUNCI] (0 Credits saat Refund, assisted_mode=TRUE). |

| **Menuju Era 3** | • LULUS Era 2<br>• Mempertahankan Hardware Era 2 (45) + memasang CPU Lv1 (20) + Storage Lv1 (20) = 85 Credits Hardware Kumulatif [Terkunci]. | Memasang minimal 3 Node Pilihan Bebas Secara Kumulatif (1 dari Era 2 + min 2 tambahan; biaya kumulatif minimal: 85 + 25 + 25 + 30 = 165 Credits (R50)). | Aktif setelah 2 sesi SAH gagal di Era 2 (≥30 dtk DAN ≥12 paket, bukan ABORTED), ATAU 3 sesi non-ABORTED gagal berapa pun durasinya, ATAU total waktu fase gim >30 menit; atau dibuka manual lewat Kode Guru. Node bantuan berstatus [PINJAMAN TERKUNCI] (0 Credits saat Refund, assisted_mode=TRUE). |

**11. Kondisi Game Over dan Evaluasi Akhir Era (R32)**

| **Penyebab Game Over** | **Aturan Pemicu Pasti** |

| --- | --- |

| **1. Bottleneck Komponen (CPU / RAM / BW / Storage)** | Salah satu bar mencapai 100,0% (masuk Overload State) dan gagal turun ke <95,0% dalam 3,0 detik, ATAU pemain menangkap paket baru dari sumber daya yang sedang berada di 100,0% (R32). |

| **2. Pelanggaran Batas SLA (Service Health Habis)** | Stabilitas Layanan (SLA) turun menyentuh angka di bawah 70,0% (<70,0%). |

| **3. Overheating Kritis** | Suhu server mencapai ≥100,0°C. |

| **4. Enkripsi Ransomware Total** | Indikator Overlay Enkripsi merah mencapai 100,0% (terjadi pada dtk ke-16,0 gelombang serangan jika tanpa Backup, Antivirus, maupun Patch Rutin) (R36). |

**12. Antarmuka (3 Panel), Tata Letak Ponsel, Pause, dan Status ABORTED (R48, R49)**

- Panel Kiri (System Load): 4 bar sumber daya (ikon + nama + persentase + warna + indikator '[OVERLOAD 3.0s: Turunkan ke <95%!]' + overlay enkripsi Storage), Stabilitas Layanan (SLA), penghitung Kuota Total & 4 badge Sub-Kuota (W/D/M/U), serta indikator Suhu (mulai Era 3).

- Panel Tengah (Canvas Arena): Arena 3 jalur diskrit (Jalur A, B, C) dengan animasi perpindahan Midpoint Commit (0,16 dtk) dan banner peringatan Next Event 5 detik di bagian atas.

- Panel Kanan (Log & Cooldown): Server Log bergulir serta status kesiapan/jeda (cooldown) node otomatis.

- Konsekuensi Status ABORTED & Anti-Peek Seed (R48): Karena attempt_counter langsung dinaikkan dan disimpan ke localStorage saat 'Mulai Era' ditekan, memuat ulang halaman (refresh) atau menutup tab di tengah era akan: (1) Mencatat sesi tersebut sebagai 'ABORTED'; (2) Menghanguskan Credits sesi tersebut (0 Credits); (3) Tidak dihitung sebagai sesi sah untuk Subsidi Belajar (R47) dan tidak menambah waktu bermain; (4) Tidak memperbarui High-Water Mark; dan (5) Memajukan Form_Index sehingga percobaan berikutnya memakai jadwal paralel berikutnya.

- Tata Letak Responsif Ponsel (R49 — dipulihkan dari Revisi 5): Pada layar ponsel (<768px), tata letak berubah menjadi vertikal kompak: Panel Kiri diringkas menjadi 2 baris bar horizontal di atas Canvas, Server Log menjadi ticker 1 baris di bawah bar, Canvas menempati 65% tinggi layar tengah, dan tombol sentuh Kiri/Kanan berada di bagian bawah.

- Aturan Pause & Anti-Intip (R49 — dipulihkan dari Revisi 5): Saat tombol Pause/Panduan ditekan atau pengguna berpindah tab (visibilitychange), simulasi (timer era, jatuh paket, insiden, suhu) dihentikan sementara dan area Canvas ditutup dengan layar buram (Blur Overlay) sehingga posisi paket tidak dapat diamati secara curang. Saat dilanjutkan, hitung mundur 3-2-1 berjalan lebih dulu; waktu jeda tidak dihitung dalam durasi era maupun waktu bermain. Memuat ulang halaman di tengah era langsung dicatat sebagai 'ABORTED'.

- Aturan Antrean Toast (R49 — dipulihkan dari Revisi 5): Maksimal 2 toast tampil bersamaan di bagian atas Canvas selama 3 detik. Saat Hari Puncak (detik 130), pemicu yang terjadi dalam jendela 1 detik digabungkan menjadi satu banner komposit agar tidak menutupi jalur.

**13. Laporan Insiden Edukatif (5 Elemen — R36)**

Tampil setelah setiap sesi berakhir (Lulus, Tidak Lulus, atau Game Over) dengan memuat:

- 1. Apa yang Terjadi: Status akhir sesi dan penyebab utama berdasarkan pelacak kontributor beban terbesar. Penyebab utama (R49) = bar atau insiden dengan waktu terlama di Zona Kritis (≥85%) atau yang memicu Game Over; kontributor beban = paket yang ditangkap dalam 5 dtk terakhir sebelum bar menyentuh 100%.

- 2. Rantai Sebab-Akibat Teknis: Uraian maksimal 3 langkah berdasarkan kejadian aktual pada sesi tersebut.

- 3. Dampak Operasional: Stabilitas Layanan akhir, rincian pencapaian Kuota Total & Sub-Kuota (W/D/M/U), serta perolehan Credits.

- 4. Rekomendasi Cerdas Berjenjang (Strategi vs Node Utama vs Node Pendukung — R36): Memberikan umpan balik spesifik sesuai kondisi sesi: (a) Untuk Ransomware, menjelaskan perbedaan peran Antivirus/Patch Rutin (memperlambat & mengkarantina enkripsi agar server tidak mati, namun menyisakan berkas terkunci) dibandingkan Backup Lokal/Cloud (memulihkan berkas kembali ke 0%); (b) Membedakan kegagalan akibat kurangnya node vs kesalahan operasional (tidak menahan tangkapan saat peringatan 5 detik Next Event atau saat Overload State).

- 5. Praktik di Dunia Nyata: Kaitan insiden dengan manajemen server industri nyata (SLA 99,9%, aturan backup 3-2-1, WAF, defense-in-depth).

**14. Tutorial, Log Diagnostik Pra-Era (C4), dan Scaffolding (R36)**

**14.1 Tutorial 5 Langkah + Kuis Mikro C2 (Wajib Sekali, ±6–7 Menit)**

| **Langkah** | **Isi Materi** | **Interaksi & Pencatatan** |

| --- | --- | --- |

| **1. Peran & Tujuan** | Peran sebagai System Administrator TokoKita: menjaga stabilitas layanan dan memenuhi kuota trafik. | Kartu interaktif singkat. |

| **2. Empat Sumber Daya & Kuis Mikro C2** | Fungsi CPU, RAM, Bandwidth, dan Storage, konsep beban dominan, serta perbedaan sumber daya laju vs kapasitas. | Ketuk 4 sumber daya + Kuis Mikro mencocokkan 4 pasangan Sumber Daya ↔ Layanan (skor dicatat ke CSV). |

| **3. Dispatcher, Overload (<95%), & Kuota** | Menggeser Dispatcher antar-jalur (A/B/C), cara memulihkan Overload State (<95% dalam 3 dtk dengan berhenti menangkap atau menolak paket; menolak 1 paket sejenis = −6 poin), dan Sub-Kuota. | Latihan menangkap/menolak 6 paket terpandu. |

| **4. Credits, Skill Tree, & Refund** | Cara memperoleh Credits, membedakan Hardware Dasar Terkunci vs Node Pilihan Bebas, dan fitur Refund 100%. | Simulasi beli & refund node pilihan dengan Credits demo. |

| **5. Empat Insiden & Log Diagnostik** | Pengenalan empat jenis insiden (Jam Sibuk, DDoS, Overheating, Ransomware), cara menganalisis Log Diagnostik Pra-Era, dan Laporan Insiden. | Kartu pratinjau 4 insiden & contoh laporan. |

**14.2 Log Diagnostik Pra-Era pada Briefing (Petunjuk Gejala Jelas Tanpa Bocoran Nama Node — R27, R36)**

| **Era** | **Teks Log Diagnostik Pra-Era (Gejala Mentah yang Ditampilkan di Briefing — R36)** | **Analisis yang Diharapkan dari Siswa (C4)** |

| --- | --- | --- |

| **Era 1** | "[LOG SISTEM]: Jadwal promo makan siang aktif pada menit ke-1:30. Diprediksi terjadi lonjakan antrean request halaman web dan unduhan katalog gambar secara bersamaan dalam waktu singkat." | Siswa mengenali gejala lonjakan trafik sah pada CPU/Bandwidth → memilih Query Cache, CDN, atau Rate Limiting. |

| **Era 2** | "[PERINGATAN ISP]: Terdeteksi anomali ribuan paket SYN berukuran kecil dari ratusan alamat IP asing yang membanjiri pipa jaringan secara serentak pada menit ke-1:50 tanpa melakukan transaksi." | Siswa menganalisis gejala banjir trafik palsu (DDoS) pada Bandwidth → memilih Firewall dan/atau Rate Limiting. |

| **Era 3** | "[TELEMETRI DATA CENTER]: (1) Fluktuasi daya listrik pada kipas pendingin rak utama yang memicu lonjakan panas ruang server; (2) Peringatan keamanan adanya payload berbahaya yang mencoba mengenkripsi dan mengunci berkas di partisi penyimpanan hingga tidak dapat diakses tanpa salinan pemulihan; (3) Puncak trafik belanja nasional pada menit ke-2:10." | Siswa menganalisis 3 gejala: (1) Gangguan daya pendingin → Pendingin/UPS; (2) Ancaman penguncian/enkripsi berkas yang butuh pencegahan & salinan pemulihan → Antivirus/Patch + Backup Lokal/Cloud (R36); (3) Banjir trafik → Firewall. |

**14.3 Pengenalan Bertahap (Scaffolding) & Daftar Node Tahap A/B/C**

| **Elemen** | **Tutorial** | **Era 1 (Tahap A)** | **Era 2 (Tahap B)** | **Era 3 (Tahap C)** |

| --- | --- | --- | --- | --- |

| **Jenis Paket** | 4 jenis dasar | 4 jenis (WEB, DATA, MEDIA, UPLOAD) | +HEAVY (3 paket: 1W, 1D, 1M) | 5 jenis (HEAVY 14 paket: 5W, 5D, 4M) |

| **Indikator & Aturan K** | 4 bar + Demo K1 | 4 bar · K1, K3 | 4 bar · K1, K2, K3 | 4 bar + Suhu + Overlay Enkripsi · K1–K4 |

| **Insiden** | Pratinjau 4 insiden | Jam Sibuk | DDoS | Overheating, Ransomware, Hari Puncak |

| **Daftar Eksplisit Node Terbuka** | Demo terbatas | Tahap A (9 Node Dasar Lv1): CPU Lv1, RAM Lv1, BW Lv1, Storage Lv1, Query Cache, CDN, Rate Limiting, Firewall, Backup Lokal. | Tahap B (14 Node + Akses Lv2 Hardware): Seluruh Tahap A (beserta CPU/RAM/BW/St Lv2) + Load Balancer, Autoscaling, Antivirus, Patch Rutin, Pendingin Lv1. | Tahap C (Seluruh 16 Node Penuh): Seluruh Tahap B (beserta Pendingin Lv2) + Backup Cloud dan UPS. |

**15. Pemetaan Kompetensi dan Pemisahan Data C4 Percobaan Pertama (R41, R50)**

Perbaikan Metodologis R41: Agar data log gim untuk kompetensi Menganalisis (C4) tidak terkontaminasi oleh coba-coba (trial-and-error) setelah siswa membaca rekomendasi pada Laporan Insiden, sistem memisahkan pencatatan C4 menjadi dua variabel terpisah di dalam CSV:
1. c4_first_attempt_match (Indikator Utama C4 Murni): Direkam satu kali sebagai snapshot konfigurasi node pada saat siswa PERTAMA KALI menekan 'Mulai Era' di Era 2 dan Era 3 (walaupun sesi tersebut kemudian ABORTED; R50), mengukur murni ketepatan siswa dalam menganalisis Log Diagnostik Pra-Era sebelum pernah mengalami insiden atau membaca Laporan Insiden era tersebut.
2. c4_post_report_adaptation (Indikator Pembelajaran Formatif): Direkam pada percobaan ulang (Attempt ≥ 2) untuk melihat bagaimana siswa mengadaptasi konfigurasi node setelah membaca rantai sebab-akibat pada Laporan Insiden.
Catatan R50: Sesi dengan assisted_mode=TRUE dikeluarkan dari analisis C3/C4 utama, dan analisis C3 memakai data Era 2–3 saja karena Era 1 sengaja ringan.

| **Level Kognitif** | **Indikator Kompetensi** | **Fasilitas Belajar di Dalam Gim** | **Data Log Gim (Metrik Murni vs Formatif — R41)** | **Instrumen Uji Utama (Pretest/Posttest)** |

| --- | --- | --- | --- | --- |

| **C2 Memahami** | Menjelaskan fungsi CPU, RAM, bandwidth, dan storage | Tutorial Langkah 2, Kuis Mikro pencocokan 4 sumber daya, tooltip node, & visualisasi beban dominan. | c2_microquiz_score (Skor Kuis Mikro Tutorial) & distribusi tangkapan Era 1. | 5 butir soal pilihan ganda (A–E) |

| **C3 Menerapkan** | Memprediksi dampak perubahan alokasi sumber daya & mengelola beban | Keputusan tangkap/tolak pada Dispatcher, pemantauan K1–K4, pemenuhan Sub-Kuota, & pembelian node Hardware/Performa. | c3_quota_balance_ratio, urutan upgrade kapasitas, & frekuensi penyelamatan Overload. | 8 butir soal pilihan ganda (A–E) |

| **C4 Menganalisis** | Menganalisis akar penyebab masalah & menentukan penanganan insiden | Analisis Log Diagnostik Pra-Era, evaluasi rantai sebab-akibat di Laporan Insiden, & pemilihan bebas Slot Mitigasi. | c4_first_attempt_match (Skor Murni Percobaan Ke-1 — R41) & c4_post_report_adaptation (Percobaan ≥2). | 7 butir soal pilihan ganda (A–E) |

**16. Pelaksanaan Penelitian (2 JP) dan Otentikasi Token Siswa (R41, R48, R50)**

Alokasi waktu perlakuan: 2 Jam Pelajaran (2 × 45 menit = 90 menit): Pembukaan (10m) → Inti Pembelajaran (55m: Tutorial 7m + Era 1–3 40m + Cadangan 8m) → Rangkuman & Refleksi (20m) → Penutup (5m).

**Spesifikasi Keamanan & Validitas Pencatatan Progres (Game Logging — R42)**

- Dropdown Presensi + Token 4 Digit Acak (Anti-Impersonation di Lab Bersama — R42, R50): Untuk mencegah siswa memilih kode presensi temannya secara sengaja maupun tidak sengaja pada komputer laboratorium yang dipakai bergantian, layar masuk mewajibkan siswa memilih Kode Presensi dari Dropdown Kelas DAN memasukkan Token 4 Digit (kode kartu token acak 4 digit yang dibagikan peneliti di awal sesi; NISN TIDAK digunakan karena merupakan data pribadi). Sistem memverifikasi kecocokan pasangan (kode_presensi, hash_token) terhadap tabel daftar kelas sebelum membuka atau memuat profil localStorage (serverlife_log_<kode_presensi>). Hash token yang disimpan di klien hanya berfungsi mencegah salah pilih profil di lab bersama, bukan pengaman anti-peretasan.

- Pencatatan Terstruktur & Auto-Download CSV: Seluruh percobaan (termasuk status LULUS, GAGAL, ABORTED, penggunaan assisted_mode, skor c2_microquiz_score, c4_first_attempt_match, dan durasi performance.now()) dicatat secara otomatis dan diunduh sebagai berkas CSV lokal saat sesi selesai. Karena unduhan otomatis dapat diblokir peramban, layar akhir sesi juga menyediakan tombol 'Salin CSV' dan 'Unduh CSV' sebagai cadangan.

**17. Rekap Keputusan Desain (Final Revisi 8)**

| **Kode** | **Keputusan Teknis Final** |

| --- | --- |

| **R1–R31** | Fondasi GDD Revisi 3 s.d. Revisi 6 yang telah terverifikasi rasio beban ÷ pemulihan dan maksimal Credits-nya (94 / 160 / 275). |

| **R32** | Overload State (3,0 dtk): pemulihan pasif tetap berjalan 70% (100% jika Autoscaling aktif pada bar tersebut; nilai final R43), keluar dari Overload saat bar turun ke <95,0%, dan Emergency Shedding (−6,0 poin; nilai final R43) hanya berlaku untuk CPU/RAM/BW (tidak mengurangi Storage saat menolak UPLOAD). |

| **R33** | Subsidi Belajar: lihat R47 (aturan final: sesi sah = ≥30 dtk DAN ≥8/12 paket bukan ABORTED; 2 sesi sah gagal, atau 3 sesi non-ABORTED gagal, atau >30 menit; Kode Guru). |

| **R34** | Tabel suhu direkonsiliasi dengan rumus aditif konsisten: Laju_Insiden = (2,70 + H_CPU{0,0 / 0,2 / 1,2}) × M_cool{1,0 / 0,7 / 0,4}. Durasi di ≥85°C tanpa node terbukti ≥3,33 dtk (Normal) dan ≥4,48 dtk (Waspada). |

| **R35** | Syarat Era 3 kumulatif: Hardware 85 Credits + minimal 3 Node Pilihan Bebas (tiga termurah yang tersedia = 25 + 25 + 30) = 165 Credits (koreksi R50). |

| **R36** | DDoS dikalibrasi ke +9,0%/dtk selama 12 dtk (R44). Gelombang Ransomware berlangsung 20 dtk pada +6,25%/dtk (mencapai 100% di dtk 16 tanpa node; dapat dikarantina di 37,5%–75% dengan AV/Patch); sisa enkripsi di-reset di akhir gelombang (R45). |

| **R37** | Perpindahan Dispatcher memakai Midpoint Logical Commit: animasi geser 0,16 dtk, dan indeks logis jalur berpindah tepat di titik tengah (0,08 dtk / 50%). |

| **R38** | 3 jadwal seed independen terkalibrasi (R48), dipilih via (nomor_urut_presensi + indeks_era + attempt_counter) mod 3; attempt_counter naik di awal era sehingga refresh (ABORTED) mengganti form. |

| **R39** | Sub-Kuota memakai rumus pembulatan tunggal floor(0,50 × Total_Kategori_Termasuk_HEAVY) di semua era: Era 1 (10W, 7D, 5M, 2U), Era 2 (14W, 10D, 8M, 3U*), Era 3 (22W, 17D, 14M, 6U). |

| **R40** | Contoh K2 + K4 pada Tabel Bagian 4 diperjelas hanya terjadi pada RAM saat RAM <65% (sebelum K1 aktif), konsisten 100% dengan Pemutus Siklus. |

| **R41** | Data log C4 dipisah menjadi c4_first_attempt_match (snapshot saat pertama kali Mulai Era, R50) dan c4_post_report_adaptation (percobaan ulang). |

| **R42** | Layar masuk memadukan Dropdown Presensi dengan Token 4 Digit acak (tanpa NISN; R50) untuk mencegah penyamaan identitas di laboratorium bersama. |

| **R43** | Overload State final: pemulihan ×0,70, keluar <95,0%, shedding −6,0 poin (peluang terselamatkan 99% / 70% / 72% pada Era 1/2/3). |

| **R44** | DDoS +9,0%/dtk selama 12 dtk (Firewall → +3,6; Rate Limiting → +5,4; keduanya → 2,16 < pemulihan 2,5). Jendela evaluasi insiden = durasi + 5 dtk. |

| **R45** | Ransomware: sisa enkripsi di-reset di akhir gelombang (SLA −6% bila ≥50%); Patch Rutin menunda setiap gelombang 10 dtk; tidak ada efek K3 akibat berkas terkunci. |

| **R46** | Pendingin atau UPS praktis wajib di Era 3 (tanpa keduanya 23% lulus; dengan Pendingin Lv1 atau UPS 99%). |

| **R47** | Subsidi Belajar final: sesi sah (bukan ABORTED, ≥30 dtk DAN ≥8/12 paket); 2 sesi sah gagal; cadangan 3 sesi non-ABORTED atau >30 menit; Kode Guru; node pinjaman terkunci dan assisted_mode. |

| **R48** | Seed: 3 jadwal independen terkalibrasi (±1 SD hasil simulasi) menggantikan permutasi jalur; Form_Index = (nomor_urut_presensi + indeks_era + attempt_counter) mod 3. |

| **R49** | Dipulihkan dari Revisi 5: tata letak ponsel <768px, Pause/Blur/visibilitychange, antrean toast maks 2, Math.floor tampilan 99,0–99,99%, batas dt 100 ms, debounce 5 dtk; definisi penyebab utama Laporan Insiden. |

| **R50** | Gerbang Era 3 = 165 Credits; c4_first_attempt_match = snapshot saat pertama Mulai Era; token acak tanpa NISN; cadangan Salin/Unduh CSV; Era 1 sengaja ringan (data C3 dari Era 2–3); Lampiran 20 hasil simulasi. |

**18. Teks Sisipan dan Perbaikan untuk Proposal**

- a. Bab III.D.1 (Variabel Bebas): Dalam gim, siswa memperoleh Credits dari melayani paket request dan bonus penyelesaian era. Credits digunakan pada Skill Tree (16 node dalam empat cabang: Hardware, Performa, Keamanan, dan Ketahanan). Untuk memasuki era berikutnya, server harus memenuhi spesifikasi perangkat keras dasar secara kumulatif serta mengisi slot node mitigasi pilihan berdasarkan analisis siswa terhadap gejala pada Log Diagnostik Pra-Era. Node bekerja otomatis selama era berlangsung, dilengkapi fitur atur ulang (refund) pada node pilihan.

- b. Bab I.C Butir 3: Tambahkan di akhir kalimat: '...Pemilihan node pada Skill Tree bersifat konseptual dan tidak meminta siswa menuliskan perintah konfigurasi.'

- c. Bab II.A.2: Kalimat terakhir ('...menerapkan langkah pemulihan sistem secara responsif') diganti menjadi '...menentukan langkah mitigasi dan penanganan yang sesuai melalui pemilihan konfigurasi node serta pengaturan beban layanan (load shedding)'.

- d. Bab III.E.2 (Catatan Konsistensi Penomoran Tabel Naskah Proposal): Pada naskah proposal Bab III, Tabel 3.1 dan Tabel 3.2 berada di bagian awal Bab III (hlm. 37–39), sedangkan pada bagian instrumen (hlm. 45–47) nomor 'Tabel 3.3' terlewat sehingga 'Tabel 3.4' tertulis dua kali (pada Kisi-Kisi Ahli Materi dan Ahli Media). Penomoran di naskah proposal perlu diurutkan kembali menjadi Tabel 3.3 (Ahli Materi), Tabel 3.4 (Ahli Media), Tabel 3.5 (Angket TAM), dan Tabel 3.6 (Tes Kognitif). Catatan: rujukan halaman ini belum diverifikasi ulang terhadap naskah proposal asli pada penyusunan Revisi 8 dan perlu dicek manual.

**19. Status Penyelesaian Isu Desain**

Seluruh parameter matematis dan interaksi antar-mekanik pada Revisi 8 telah diuji dengan simulator mesin gim berbasis bot (berkas serverlife_sim.py; ringkasan hasil pada Bagian 20). Simulasi belum memodelkan gerakan Dispatcher, kesalahan manusia, dan faktor psikologis siswa, sehingga angka akhir wajib diuji lewat playtest 5–10 siswa (target: lulus Era 1 ≥80% dan Era 3 tercapai dalam ≤35 menit) sebelum pengambilan data penelitian.

**20. Lampiran: Hasil Simulasi dan Uji Penerimaan (R50)**

Lampiran ini merangkum hasil simulator mesin gim (berkas serverlife_sim.py) pada parameter final Revisi 8. Pemain 'terampil' adalah bot yang menahan paket sesuai sisa kapasitas bar, memenuhi sub-kuota, dan menghentikan MEDIA 5 dtk sebelum DDoS; pemain 'serakah' menangkap semua paket. Setiap sel dihitung dari ≥60 jadwal paket acak.

**20.1 Hasil Simulasi per Era dan Konfigurasi Node**

| **Era & Konfigurasi Node** | **Pemain Terampil Lulus** | **Pemain Serakah Lulus** | **Catatan** |

| --- | --- | --- | --- |

| **Era 1, tanpa node** | 100% (≈85 Credits) | 70% | Era 1 sengaja ringan; tidak menangkap apa pun = 0% lulus |

| **Era 2, node bebas: tanpa node relevan / Query Cache / Backup Lokal** | 46% / 43% / 46% | 0% | Kegagalan utama: bottleneck BW saat DDoS |

| **Era 2, Autoscaling** | 60% | 0% | Membantu sebagian (−25% beban, +35% pemulihan, jeda 25 dtk) |

| **Era 2, CDN / Rate Limiting / Firewall** | 99% / 98% / 100% | 0% | Penangkal DDoS efektif |

| **Era 3, Backup Lokal + Firewall + Pendingin Lv1** | 99% | 0% | Mencakup tiga ancaman |

| **Era 3, Firewall + Antivirus + Pendingin Lv1 (tanpa Backup)** | 85% | 0% | ≈12% Game Over karena SLA (penalti Ransomware dan insiden lain) |

| **Era 3, UPS + Antivirus + Firewall** | 87% | 0% | UPS setara Pendingin untuk Overheating |

| **Era 3, Firewall + Antivirus + Backup (tanpa Pendingin/UPS)** | 23% | 0% | ±75% Game Over karena suhu ≥100°C |

| **Era 3, Query Cache + CDN + Load Balancer (tanpa keamanan)** | 0% | 0% | Game Over karena Ransomware (enkripsi 100% di dtk 16) |

| **Era 3, Firewall + Query Cache + CDN (tanpa anti-Ransomware)** | 0% | 0% | Game Over karena Ransomware |

| **Era 3, seluruh node terpasang** | 100% | 73% | Akhir permainan ringan sebagai hadiah progres |

**20.2 Peluang Overload Terselamatkan**

Pemain ceroboh yang mengetahui aturan (menangkap semua paket kecuali sumber daya yang sedang Overload). Revisi 7 (pemulihan ×0,50, shedding −4,0): 14% / 34% / 51% pada Era 1 / 2 / 3. Revisi 8 (pemulihan ×0,70, shedding −6,0): 99% / 70% / 72% pada Era 1 / 2 / 3 (91% di Era 3 bila Query Cache + CDN terpasang). Pemain ceroboh tetap kalah pada Era 2–3 karena kuota, SLA, atau bottleneck lain, sehingga Overload dapat diselamatkan tanpa membuat permainan trivial.

**20.3 Uji Penerimaan untuk Implementasi**

| **No** | **Uji** | **Hasil yang Diharapkan (acuan simulasi, toleransi ±5 poin)** |

| --- | --- | --- |

| **1** | Era 1, tidak menangkap apa pun | 0% lulus (kuota tidak terpenuhi) |

| **2** | Era 1, pemain terampil | 100% lulus, ≈85 Credits |

| **3** | Era 2, pemain serakah, node apa pun | 0% lulus |

| **4** | Era 2, terampil, tanpa Firewall/Rate Limiting/CDN | 43–60% lulus |

| **5** | Era 2, terampil, dengan Firewall/Rate Limiting/CDN | ≥98% lulus |

| **6** | Era 3, tanpa node anti-Ransomware (AV/Patch/Backup) | 0% lulus (Game Over Ransomware) |

| **7** | Era 3, tanpa Pendingin dan UPS | ≈23% lulus |

| **8** | Era 3, Backup Lokal + Firewall + Pendingin Lv1 / Firewall + Antivirus + Pendingin Lv1 | ≈99% / ≈85% lulus |

| **9** | Overload terselamatkan (pemain ceroboh, Era 1 / 2 / 3) | ≈99% / 70% / 72–91% |

| **10** | Sesi ABORTED, <30 dtk, atau <8 paket (Era 1) / <12 paket (Era 2) | Tidak dihitung untuk Subsidi Belajar |

| **11** | Refresh di tengah era | Status 'ABORTED', attempt_counter bertambah, Credits sesi = 0 |

| **12** | Tabel suhu (Bagian 5) | Puncak suhu dan durasi di ≥85°C cocok dengan aljabar (toleransi 0,05) |

**20.4 Batasan Simulasi**

Simulator memakai bot, sehingga tidak memodelkan gerak Dispatcher, kesalahan manusia, maupun faktor psikologis siswa. Seluruh angka pada lampiran ini adalah acuan implementasi, bukan prediksi hasil siswa. Playtest 5–10 siswa wajib dilakukan sebelum pengambilan data (target: lulus Era 1 ≥80% dan Era 3 tercapai dalam ≤35 menit); perbaikan berikutnya sebaiknya berasal dari data playtest.
