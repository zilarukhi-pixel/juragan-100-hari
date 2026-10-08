/// Static, human- and agent-readable documentation of the public backend API.
/// This mixin declares no state and reads no runtime data — it returns a fixed
/// Markdown document authored from the current backend source.
mixin () {
  /// Return the backend API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "
# Tantangan 100 Hari — Backend API

Backend canister untuk aplikasi gamifikasi seller marketplace Indonesia
(Shopee, TikTok Shop, Lazada): tips harian, kuis harian, dan tantangan 100 hari
menuju 1.000.000 barang terjual.

## Authentication and identity

- Semua endpoint publik dapat dipanggil tanpa login, tetapi data disimpan
  **per principal pemanggil**. Pemanggil anonim (`2vxsx-fae`) memiliki data
  sendiri yang terpisah dan tidak dibagikan.
- Login aplikasi memakai **Internet Identity**. Frontend memakai derivation
  origin yang dipin pada aplikasi, dipublikasikan di
  `/.well-known/ii-derivation-origin` bila tersedia. Agent yang sudah memegang
  otorisasi Internet Identity pengguna menurunkan principal per-aplikasi yang
  benar terhadap origin tersebut (misalnya
  `icp identity link web <name> --app <host>`). Delegasi semacam itu bertindak
  dengan otoritas penuh pengguna di aplikasi ini sampai kedaluwarsa.
- Registrasi terjadi hanya saat pemanggil menyelesaikan sign-in melalui
  frontend aplikasi. Pemanggil yang belum pernah melakukannya **tidak
  terdaftar**, walaupun ia milik pemilik aplikasi, dan principal yang
  diturunkan terhadap origin berbeda adalah principal yang berbeda dari yang
  didaftarkan frontend.
- Pemanggil yang belum terdaftar dapat memanggil `_initialize_access_control`
  sekali sebagai pemanggil yang sudah sign-in (bukan anonim) untuk mendaftar.
  Pemanggil pertama yang mendaftar menerima peran `#admin`; setiap pemanggil
  berikutnya menerima `#user`. Pemanggil anonim diabaikan (tidak didaftarkan).
- `getCallerUserRole()` mengembalikan `#guest` untuk pemanggil anonim, peran
  tersimpan untuk pemanggil terdaftar, dan **trap** `User is not registered`
  untuk pemanggil sign-in yang belum terdaftar.
- `assignCallerUserRole(user, role)` hanya boleh dipanggil oleh admin; jika
  bukan, ia **trap** `Unauthorized: Only admins can assign user roles`.
- `isCallerAdmin()` mengembalikan `true` hanya untuk peran `#admin`.

## Authorization model

- Endpoint domain (tips, kuis, tantangan, penjualan) **tidak** memerlukan
  peran khusus: setiap pemanggil membaca dan menulis data miliknya sendiri,
  di-key oleh principal pemanggil. Tidak ada endpoint lintas-pengguna.
- Endpoint OQL (`schema`, `execute`) memiliki otorisasi **per entitas**:
  - `tip`, `quizQuestion` — `#public_`: siapa pun (termasuk anonim) membaca
    seluruh baris.
  - `challenge`, `salesEntry`, `quizResult` — `#controllerOnly`: hanya
    controller canister (platform) yang membaca.
  - `tipDone`, `tipFavorite` — `#scopedPerUser`: hanya pemanggil yang sudah
    sign-in, dan hanya baris miliknya sendiri.

## Units and encodings

- `DayKey` (`Nat`) adalah tanggal kalender berformat **YYYYMMDD** dalam UTC,
  misalnya `20261007`. Semua perbandingan hari memakai urutan numerik ini.
- `Timestamp` (`Int`) adalah nanodetik sejak Unix epoch (UTC).
- `Platform` adalah varian `#shopee`, `#tiktokShop`, `#lazada`.
- `TipTheme` adalah varian `#listing`, `#konten`, `#promosi`,
  `#layananPelanggan`, `#analisisData`.
- `UserId` adalah `Principal` Internet Identity.
- Nilai opsional (`?T`) dikirim sebagai `null` atau nilai; filter opsional
  `null` berarti 'tanpa filter'.
- Di OQL, `platform` dan `theme` diserialisasi sebagai teks ('shopee',
  'tiktokShop', 'lazada'; 'listing', 'konten', 'promosi',
  'layananPelanggan', 'analisisData'). `options` kuis digabung dengan
  pemisah ' | '.

## Tips Harian

- `getTodayTip() : ?TipView` — tips untuk hari UTC ini, atau `null` bila tidak
  ada tips terjadwal hari ini. `TipView` menyertakan `done` dan `favorite`
  milik pemanggil.
- `listTips(day, platform, theme) : [TipView]` — arsip tips; setiap argumen
  `null` berarti tanpa filter. Urutan tidak dijamin.
- `markTipDone(tipId)` / `unmarkTipDone(tipId)` — menandai/membatalkan tips
  selesai untuk pemanggil. Idempoten: menandai dua kali sama dengan sekali;
  membatalkan tips yang belum ditandai tidak berefek.
- `addFavorite(tipId)` / `removeFavorite(tipId)` — menambah/menghapus favorit.
  Idempoten. `tipId` yang tidak ada tetap tersimpan sebagai id (tidak
  divalidasi terhadap katalog tips).
- `listFavorites() : [TipView]` — tips favorit pemanggil.

## Kuis Harian

- `getTodayQuiz() : [QuizQuestionView]` — pertanyaan kuis hari UTC ini tanpa
  jawaban benar (`id`, `prompt`, `options`).
- `submitQuiz(answers : [(Nat, Nat)]) : QuizSubmission` — `answers` adalah
  daftar pasangan `(questionId, chosenIndex)`. Pertanyaan yang tidak dijawab
  dianggap memilih indeks `0`. Hasil disimpan per hari dan **menimpa** hasil
  hari yang sama bila dikirim ulang (retry aman, bukan duplikat). Skor = jumlah
  jawaban benar; `points = score * 10`.
- `getQuizResult(day) : ?QuizResult` — hasil pemanggil untuk hari tertentu.
- `listQuizHistory() : [QuizResult]` — riwayat kuis pemanggil, terbaru dulu
  (urut `day` menurun).

## Pencatatan Penjualan & Tantangan

- `startChallenge(target, startDay) : Challenge` — memulai/mengganti tantangan
  pemanggil. Memanggil ulang **menimpa** konfigurasi tantangan yang ada.
- `getChallenge() : ?Challenge` — konfigurasi tantangan pemanggil, atau `null`.
- `recordSales(day, quantity, platform) : SalesEntry` — mencatat penjualan
  untuk satu hari. Satu entri per hari: memanggil ulang untuk hari yang sama
  **menimpa** entri hari itu (bukan menambah). `quantity` adalah jumlah barang.
- `listSales(platform, fromDay, toDay) : [SalesEntry]` — riwayat penjualan
  pemanggil, terbaru dulu. `fromDay`/`toDay` inklusif; `null` berarti tanpa
  batas.
- `getProgress() : ?ChallengeProgress` — agregat progres, atau `null` bila
  tantangan belum dimulai. Berisi `totalSold`, `percent` (dibulatkan ke bawah,
  `0` bila target `0`), `dayNumber` (hari ke- dari `startDay`, mulai 1),
  `daysRemaining` (0 setelah hari ke-100), `currentStreak`, `perPlatform`, dan
  `milestones` (10/25/50/75/100%).
- **Streak**: jumlah hari berturut-turut dengan penjualan tercatat, dihitung
  mundur dari hari ini; bila hari ini belum ada entri, perhitungan dimulai dari
  kemarin sehingga streak tidak hilang sebelum entri hari ini dibuat.

## Lifecycle and polling

- Semua endpoint adalah panggilan tunggal yang selesai seketika; tidak ada
  operasi asinkron jangka panjang atau status 'sedang diproses'.
- `getTodayTip`, `getTodayQuiz`, dan `getProgress` bergantung pada hari UTC
  saat ini. Hari berganti pada tengah malam UTC; panggil ulang setelahnya untuk
  data hari baru.
- `getProgress` mengembalikan `null` sampai `startChallenge` dipanggil.

## Mutation retry safety

- `markTipDone`, `unmarkTipDone`, `addFavorite`, `removeFavorite` idempoten —
  aman diulang.
- `recordSales` idempoten per hari (menimpa entri hari yang sama).
- `submitQuiz` idempoten per hari (menimpa hasil hari yang sama).
- `startChallenge` **destruktif**: panggilan ulang mengganti target dan
  `startDay`, sehingga `dayNumber` dan `daysRemaining` berubah. Jangan
  mengulang tanpa sengaja.
- `assignCallerUserRole` menimpa peran pengguna target.

## Errors, traps, and gotchas

- `getCallerUserRole` dan `isCallerAdmin` **trap** untuk pemanggil sign-in yang
  belum terdaftar (`User is not registered`); panggil
  `_initialize_access_control` lebih dulu.
- `assignCallerUserRole` **trap** bila pemanggil bukan admin.
- Endpoint domain tidak memvalidasi `tipId` terhadap katalog; id yang tidak ada
  tetap tersimpan pada tanda selesai/favorit.
- `getTodayTip` mengembalikan tips pertama yang cocok untuk hari ini; bila ada
  beberapa tips dengan hari sama, hanya satu yang dikembalikan.
- OQL `execute` dan `schema` mengikuti otorisasi per entitas di atas; entitas
  `#controllerOnly` tidak dapat dibaca pengguna biasa.
";
  };
};
