import Map "mo:core/Map";
import Set "mo:core/Set";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type Platform = { #shopee; #tiktokShop; #lazada };
  type TipTheme = { #listing; #konten; #promosi; #layananPelanggan; #analisisData };

  type Tip = {
    id : Nat;
    day : Nat;
    title : Text;
    summary : Text;
    actionStep : Text;
    platform : Platform;
    theme : TipTheme;
  };

  type QuizQuestion = {
    id : Nat;
    day : Nat;
    prompt : Text;
    options : [Text];
    correctIndex : Nat;
    explanation : Text;
  };

  type QuizResult = {
    day : Nat;
    score : Nat;
    total : Nat;
    points : Nat;
    completedAt : Int;
  };

  type Challenge = {
    target : Nat;
    startDay : Nat;
    createdAt : Int;
  };

  type SalesEntry = {
    day : Nat;
    quantity : Nat;
    platform : Platform;
    updatedAt : Int;
  };

  public type OldActor = {};
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    tips : Map.Map<Nat, Tip>;
    done : Map.Map<Principal, Set.Set<Nat>>;
    favorites : Map.Map<Principal, Set.Set<Nat>>;
    questions : Map.Map<Nat, QuizQuestion>;
    quizResults : Map.Map<Principal, Map.Map<Nat, QuizResult>>;
    challengeStore : Map.Map<Principal, Challenge>;
    salesEntries : Map.Map<Principal, Map.Map<Nat, SalesEntry>>;
  };

  /// Convert a day count since the Unix epoch into a YYYYMMDD key (UTC).
  /// Inlined from lib/day.mo so the migration stays self-contained.
  func civilFromDays(z0 : Int) : Nat {
    let z = z0 + 719_468;
    let era = (if (z >= 0) z else z - 146_096) / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) mp + 3 else mp - 9;
    let year = if (m <= 2) y + 1 else y;
    year.toNat() * 10_000 + m.toNat() * 100 + d.toNat();
  };

  /// The current UTC day as a YYYYMMDD key, computed at migration time.
  func todayKey() : Nat {
    let seconds = Time.now() / 1_000_000_000;
    civilFromDays(seconds / 86_400);
  };

  /// Advance a YYYYMMDD key by `offset` days, keeping the calendar valid.
  func addDays(day : Nat, offset : Nat) : Nat {
    let year = day / 10_000;
    let month = (day / 100) % 100;
    let dayOfMonth = day % 100;
    let days = daysFromCivil(year, month, dayOfMonth) + offset.toInt();
    civilFromDays(days);
  };

  /// Days since the Unix epoch for a civil date (inverse of civilFromDays).
  func daysFromCivil(year : Nat, month : Nat, day : Nat) : Int {
    let y = if (month <= 2) year - 1 else year;
    let era = y / 400;
    let yoe = y - era * 400;
    let mp = if (month > 2) month - 3 else month + 9;
    let doy = (153 * mp + 2) / 5 + day - 1;
    let doe = yoe * 365 + yoe / 4 - yoe / 100 + doy;
    era * 146_097 + doe - 719_468;
  };

  public func migration(_ : OldActor) : NewActor {
    let base = todayKey();

    let tipData : [(Text, Text, Text, Platform, TipTheme)] = [
      (
        "Optimalkan Judul Produk dengan Kata Kunci",
        "Judul adalah hal pertama yang dilihat calon pembeli dan dibaca algoritma pencarian marketplace.",
        "Tulis judul 60-70 karakter berisi nama produk, jenis, ukuran, dan kata kunci yang paling sering dicari pembeli.",
        #shopee,
        #listing,
      ),
      (
        "Buat Video Pendek Unboxing Produk",
        "Video pendek meningkatkan jangkauan organik dan membuat produk lebih mudah ditemukan pembeli baru.",
        "Rekam video 15-30 detik yang menunjukkan produk dari beberapa sudut, lalu unggah dengan caption berisi kata kunci utama.",
        #tiktokShop,
        #konten,
      ),
      (
        "Pasang Diskon Bertingkat untuk Mendorong Pembelian",
        "Diskon bertingkat mendorong pembeli menambah jumlah barang agar mendapat harga lebih murah.",
        "Siapkan tiga tingkat diskon, misalnya beli 2 hemat 5%, beli 3 hemat 10%, dan beli 5 hemat 15%.",
        #lazada,
        #promosi,
      ),
      (
        "Balas Chat Pembeli dalam 5 Menit",
        "Kecepatan membalas chat sangat memengaruhi tingkat konversi dan penilaian toko.",
        "Aktifkan notifikasi chat dan siapkan balasan cepat untuk pertanyaan yang paling sering muncul.",
        #shopee,
        #layananPelanggan,
      ),
      (
        "Analisis Produk Paling Laris Minggu Ini",
        "Data penjualan membantu Anda memfokuskan stok dan promosi pada produk yang paling menguntungkan.",
        "Buka menu analitik penjualan, urutkan produk berdasarkan jumlah terjual, lalu catat lima produk teratas.",
        #tiktokShop,
        #analisisData,
      ),
      (
        "Gunakan Foto Produk Latar Putih",
        "Foto dengan latar putih bersih membuat produk terlihat profesional dan lebih dipercaya pembeli.",
        "Foto produk di atas latar putih polos dengan pencahayaan merata, lalu unggah minimal lima foto per produk.",
        #lazada,
        #listing,
      ),
      (
        "Buat Konten Edukasi Cara Pakai Produk",
        "Konten edukasi membangun kepercayaan dan membuat pembeli merasa yakin sebelum membeli.",
        "Buat video atau carousel yang menjelaskan cara memakai produk dan manfaat utamanya bagi pembeli.",
        #tiktokShop,
        #konten,
      ),
      (
        "Ikut Kampanye Promo Marketplace",
        "Kampanye resmi marketplace mendatangkan trafik besar dengan biaya promosi yang lebih efisien.",
        "Daftarkan produk unggulan ke kampanye promo yang sedang berjalan dan pastikan stok mencukupi.",
        #shopee,
        #promosi,
      ),
      (
        "Kirim Pesanan Sebelum Batas Waktu",
        "Pengiriman tepat waktu menjaga skor toko dan mengurangi risiko pembatalan pesanan.",
        "Periksa daftar pesanan setiap pagi dan proses semua pesanan sebelum batas waktu pengiriman hari itu.",
        #lazada,
        #layananPelanggan,
      ),
      (
        "Pantau Harga Kompetitor Secara Berkala",
        "Memahami harga pasar membantu Anda menetapkan harga yang tetap kompetitif tanpa mengorbankan margin.",
        "Catat harga lima kompetitor utama untuk produk sejenis, lalu sesuaikan harga Anda agar tetap menarik.",
        #shopee,
        #analisisData,
      ),
      (
        "Tulis Deskripsi Produk yang Lengkap",
        "Deskripsi lengkap mengurangi pertanyaan berulang dan menurunkan tingkat pengembalian barang.",
        "Cantumkan bahan, ukuran, cara perawatan, dan isi paket secara rinci pada deskripsi produk.",
        #lazada,
        #listing,
      ),
      (
        "Manfaatkan Live Shopping untuk Jualan",
        "Live shopping menciptakan interaksi langsung dan mendorong pembelian impulsif dari penonton.",
        "Jadwalkan sesi live 30-60 menit, tunjukkan produk unggulan, dan tawarkan harga khusus selama live.",
        #tiktokShop,
        #konten,
      ),
      (
        "Berikan Voucher untuk Pembeli Baru",
        "Voucher pembeli baru menurunkan hambatan pembelian pertama dan mempercepat pertumbuhan toko.",
        "Buat voucher diskon khusus pengguna baru dengan masa berlaku terbatas untuk mendorong percobaan pertama.",
        #shopee,
        #promosi,
      ),
      (
        "Tangani Komplain dengan Cepat dan Ramah",
        "Penanganan komplain yang baik mengubah pengalaman buruk menjadi ulasan positif.",
        "Balas setiap komplain dalam 24 jam, tawarkan solusi konkret, dan tindak lanjuti sampai pembeli puas.",
        #lazada,
        #layananPelanggan,
      ),
      (
        "Hitung Margin Keuntungan per Produk",
        "Mengetahui margin tiap produk mencegah Anda menjual rugi saat diskon besar berlangsung.",
        "Hitung harga jual dikurangi harga modal, biaya kirim, dan biaya platform untuk setiap produk.",
        #shopee,
        #analisisData,
      ),
      (
        "Susun Katalog Produk Berdasarkan Kategori",
        "Katalog yang rapi memudahkan pembeli menemukan produk dan meningkatkan jumlah barang per transaksi.",
        "Kelompokkan produk ke dalam kategori yang jelas dan atur urutan tampilannya di halaman toko.",
        #lazada,
        #listing,
      ),
      (
        "Buat Kalender Konten Mingguan",
        "Perencanaan konten menjaga konsistensi unggahan dan membuat audiens terus menantikan konten baru.",
        "Rencanakan tema konten untuk tujuh hari ke depan dan siapkan bahannya sebelum hari unggah.",
        #tiktokShop,
        #konten,
      ),
      (
        "Tawarkan Paket Bundling Hemat",
        "Bundling meningkatkan nilai transaksi rata-rata dan membantu menghabiskan stok produk lambat laku.",
        "Gabungkan produk laris dengan produk pendamping dalam satu paket dengan harga lebih hemat.",
        #shopee,
        #promosi,
      ),
      (
        "Minta Ulasan Setelah Pesanan Diterima",
        "Ulasan positif meningkatkan kepercayaan pembeli baru dan peringkat produk di pencarian.",
        "Kirim pesan terima kasih setelah pesanan diterima dan minta pembeli memberikan ulasan jujur.",
        #lazada,
        #layananPelanggan,
      ),
      (
        "Evaluasi Performa Toko Setiap Akhir Pekan",
        "Evaluasi rutin membantu Anda mengetahui apa yang berhasil dan apa yang perlu diperbaiki.",
        "Tinjau jumlah pesanan, tingkat konversi, dan produk terlaris setiap akhir pekan untuk menyusun rencana berikutnya.",
        #shopee,
        #analisisData,
      ),
    ];

    let tips = Map.empty<Nat, Tip>();
    var tipId = 1;
    for ((title, summary, actionStep, platform, theme) in tipData.values()) {
      tips.add(tipId, {
        id = tipId;
        day = addDays(base, tipId - 1);
        title = title;
        summary = summary;
        actionStep = actionStep;
        platform = platform;
        theme = theme;
      });
      tipId += 1;
    };

    let questionData : [(Text, [Text], Nat, Text)] = [
      (
        "Apa yang paling memengaruhi peringkat produk di hasil pencarian marketplace?",
        [
          "Jumlah pengikut toko",
          "Relevansi kata kunci pada judul dan deskripsi",
          "Warna foto produk",
          "Jumlah staf toko",
        ],
        1,
        "Algoritma pencarian mengutamakan relevansi kata kunci, jadi judul dan deskripsi harus memuat kata kunci yang dicari pembeli.",
      ),
      (
        "Berapa lama waktu ideal untuk membalas chat pembeli?",
        [
          "Dalam 5 menit",
          "Dalam 24 jam",
          "Dalam 3 hari",
          "Tidak perlu dibalas",
        ],
        0,
        "Membalas chat dalam 5 menit meningkatkan konversi dan menjaga skor layanan toko tetap tinggi.",
      ),
      (
        "Apa manfaat utama membuat video pendek untuk produk?",
        [
          "Menambah jumlah staf",
          "Mengurangi biaya kirim",
          "Meningkatkan jangkauan organik dan penemuan produk",
          "Menghapus ulasan negatif",
        ],
        2,
        "Video pendek menjangkau audiens baru secara organik dan membuat produk lebih mudah ditemukan.",
      ),
      (
        "Apa itu diskon bertingkat?",
        [
          "Diskon yang hanya berlaku satu hari",
          "Diskon yang semakin besar saat pembeli membeli lebih banyak",
          "Diskon khusus pembeli lama",
          "Diskon untuk semua produk tanpa syarat",
        ],
        1,
        "Diskon bertingkat memberi potongan lebih besar pada jumlah pembelian yang lebih banyak untuk mendorong nilai transaksi.",
      ),
      (
        "Mengapa penting menghitung margin keuntungan per produk?",
        [
          "Agar bisa menaikkan harga seenaknya",
          "Agar tidak menjual rugi saat ada diskon",
          "Agar produk selalu termurah",
          "Agar stok cepat habis",
        ],
        1,
        "Menghitung margin memastikan setiap penjualan tetap menguntungkan, terutama saat diskon besar berlangsung.",
      ),
      (
        "Apa fungsi foto produk dengan latar putih?",
        [
          "Membuat produk terlihat profesional dan dipercaya",
          "Mengurangi berat produk",
          "Mempercepat pengiriman",
          "Menambah jumlah ulasan otomatis",
        ],
        0,
        "Latar putih bersih membuat produk tampak profesional dan lebih meyakinkan calon pembeli.",
      ),
      (
        "Apa manfaat mengikuti kampanye promo resmi marketplace?",
        [
          "Mendapat trafik besar dengan biaya promosi efisien",
          "Mendapat staf gratis",
          "Bebas biaya kirim selamanya",
          "Produk otomatis jadi nomor satu",
        ],
        0,
        "Kampanye resmi mendatangkan trafik besar dan biasanya lebih hemat dibanding iklan mandiri.",
      ),
      (
        "Apa yang sebaiknya dilakukan saat menerima komplain pembeli?",
        [
          "Mengabaikannya",
          "Membalas dengan cepat dan menawarkan solusi konkret",
          "Memblokir pembeli",
          "Menghapus produk",
        ],
        1,
        "Membalas komplain dengan cepat dan solusi konkret mengubah pengalaman buruk menjadi ulasan positif.",
      ),
      (
        "Apa manfaat bundling produk?",
        [
          "Menurunkan kualitas produk",
          "Meningkatkan nilai transaksi rata-rata",
          "Menghapus biaya platform",
          "Mengurangi jumlah pembeli",
        ],
        1,
        "Bundling menaikkan nilai transaksi rata-rata dan membantu menghabiskan stok produk lambat laku.",
      ),
      (
        "Kapan waktu yang tepat mengevaluasi performa toko?",
        [
          "Setiap akhir pekan secara rutin",
          "Hanya saat penjualan turun",
          "Sekali setahun",
          "Tidak perlu dievaluasi",
        ],
        0,
        "Evaluasi rutin setiap akhir pekan membantu menyusun rencana perbaikan yang konsisten.",
      ),
      (
        "Apa yang membuat deskripsi produk dianggap lengkap?",
        [
          "Hanya menulis nama produk",
          "Memuat bahan, ukuran, cara perawatan, dan isi paket",
          "Hanya menulis harga",
          "Hanya menulis kata kunci",
        ],
        1,
        "Deskripsi lengkap mengurangi pertanyaan berulang dan menurunkan tingkat pengembalian barang.",
      ),
      (
        "Apa manfaat live shopping bagi penjual?",
        [
          "Menghilangkan kebutuhan stok",
          "Menciptakan interaksi langsung dan mendorong pembelian",
          "Menggantikan semua iklan",
          "Menambah biaya kirim",
        ],
        1,
        "Live shopping membangun interaksi langsung dengan penonton dan mendorong pembelian impulsif.",
      ),
      (
        "Apa tujuan memberikan voucher untuk pembeli baru?",
        [
          "Menurunkan hambatan pembelian pertama",
          "Menaikkan harga produk",
          "Mengurangi jumlah ulasan",
          "Memperlambat pengiriman",
        ],
        0,
        "Voucher pembeli baru menurunkan hambatan pembelian pertama dan mempercepat pertumbuhan toko.",
      ),
      (
        "Mengapa ulasan positif penting bagi toko?",
        [
          "Meningkatkan kepercayaan pembeli dan peringkat produk",
          "Menghapus biaya platform",
          "Menambah jumlah stok",
          "Mengurangi pajak",
        ],
        0,
        "Ulasan positif membangun kepercayaan pembeli baru dan membantu peringkat produk di pencarian.",
      ),
      (
        "Apa manfaat menyusun kalender konten mingguan?",
        [
          "Menjaga konsistensi unggahan konten",
          "Menghapus kebutuhan foto produk",
          "Menambah jumlah pesanan otomatis",
          "Mengurangi biaya iklan",
        ],
        0,
        "Kalender konten menjaga konsistensi unggahan sehingga audiens terus menantikan konten baru.",
      ),
      (
        "Apa yang sebaiknya dilakukan agar pengiriman tepat waktu?",
        [
          "Memproses pesanan sebelum batas waktu setiap hari",
          "Menunggu pesanan menumpuk",
          "Mengirim seminggu sekali",
          "Membatalkan pesanan lambat",
        ],
        0,
        "Memeriksa dan memproses pesanan setiap hari menjaga skor toko dan mengurangi pembatalan.",
      ),
      (
        "Apa manfaat memantau harga kompetitor?",
        [
          "Menetapkan harga yang tetap kompetitif",
          "Menyalin semua produk kompetitor",
          "Menghapus diskon",
          "Menaikkan harga tanpa alasan",
        ],
        0,
        "Memahami harga pasar membantu menetapkan harga kompetitif tanpa mengorbankan margin.",
      ),
      (
        "Apa manfaat konten edukasi tentang cara pakai produk?",
        [
          "Membangun kepercayaan pembeli sebelum membeli",
          "Menambah berat paket",
          "Mengurangi jumlah foto",
          "Menghapus deskripsi",
        ],
        0,
        "Konten edukasi membangun kepercayaan dan membuat pembeli lebih yakin sebelum membeli.",
      ),
      (
        "Apa manfaat mengelompokkan produk berdasarkan kategori?",
        [
          "Memudahkan pembeli menemukan produk",
          "Menambah biaya iklan",
          "Mengurangi jumlah stok",
          "Menghapus ulasan",
        ],
        0,
        "Katalog yang rapi memudahkan pembeli menemukan produk dan menaikkan jumlah barang per transaksi.",
      ),
      (
        "Apa tujuan meminta ulasan setelah pesanan diterima?",
        [
          "Meningkatkan kepercayaan pembeli baru",
          "Menambah biaya kirim",
          "Mengurangi stok",
          "Menghapus riwayat pesanan",
        ],
        0,
        "Ulasan setelah pesanan diterima meningkatkan kepercayaan pembeli baru dan peringkat produk.",
      ),
    ];

    let questions = Map.empty<Nat, QuizQuestion>();
    var questionId = 1;
    for ((prompt, options, correctIndex, explanation) in questionData.values()) {
      questions.add(questionId, {
        id = questionId;
        day = addDays(base, questionId - 1);
        prompt = prompt;
        options = options;
        correctIndex = correctIndex;
        explanation = explanation;
      });
      questionId += 1;
    };

    {
      accessControlState = AccessControl.initState();
      tips = tips;
      done = Map.empty();
      favorites = Map.empty();
      questions = questions;
      quizResults = Map.empty();
      challengeStore = Map.empty();
      salesEntries = Map.empty();
    };
  };
};
