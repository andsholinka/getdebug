# GetDebug — Tara Tech Arcade

Kumpulan game interaktif dari Tara Tech. Satu halaman statis per game
(HTML + CSS + JavaScript), tanpa framework dan tanpa build step, jadi bisa
langsung di-deploy ke mana saja.

## Struktur

- `index.html` — landing page **Tara Tech Arcade**: kumpulan semua game,
  tombol install, dan cara install di HP.
- `tangkap-bug/index.html` — game Tangkap Bug!
- `jangan-typo/index.html` — game Jangan Typo!
- `manifest.webmanifest` + `sw.js` + `icons/` — dukungan PWA
  (bisa diinstall di HP, main offline).
- `vendor/three/` — **Three.js 0.187.0** (ES module, di-vendor ke repo,
  tanpa npm/build step) + `assets/js/` — efek 3D: latar hero interaktif
  di landing page dan ledakan partikel 3D di Tangkap Bug.

## Efek 3D (Three.js)

- **Landing page:** latar 3D di belakang konten — bentuk geometri warna
  brand (biru/emas/hijau) yang melayang dan berputar, mengikuti gerakan
  kursor; ketuk/klik layar memunculkan ledakan partikel. Kartu game
  miring 3D mengikuti kursor (mouse/trackpad saja).
- **Tangkap Bug!:** setiap tangkapan memunculkan ledakan partikel 3D
  di posisi lubang — biru (+1), emas (+5), merah (−2).
- Semua efek gagal dengan aman (*fail-soft*): kalau WebGL tidak tersedia
  atau `prefers-reduced-motion` aktif, game tetap jalan normal tanpa 3D.
  Renderer Three.js di-vendor lokal, jadi efek 3D ikut ter-cache service
  worker dan tetap jalan offline — tidak ada CDN.
- Detail versi & cara upgrade: `vendor/three/README.md`.

## Game

### Tangkap Bug! (`tangkap-bug/`)
Whack-a-mole: tangkap bug yang muncul di grid selama 30 detik.
- 🐛 Bug biasa = +1 poin, ⭐ Bug emas = +5 poin, 💥 Virus merah = −2 poin.
- Makin banyak tangkapan, bug muncul makin cepat. Skor terbaik tersimpan di browser.

### Jangan Typo! (`jangan-typo/`)
Game ketik: balas chat dari 12 orang (Ibu, Bapak, gebetan, dosen killer,
bos, sampai hantu kos) dengan mengetik balasan persis sebelum waktu habis.
- Huruf salah jadi merah dan tombol kirim terkunci sampai dibetulkan.
- Waktu habis = kehilangan 1 nyawa (3 nyawa). Makin cepat kirim, makin
  besar bonus waktu. Skor terbaik tersimpan di browser.

## PWA (install di HP)

- `manifest.webmanifest`: nama, ikon, `display: standalone`,
  `start_url: /`, warna tema `#0b1526`.
- `sw.js`: service worker yang menyimpan halaman utama, kedua game, manifest,
  dan ikon ke cache, jadi setelah sekali dibuka, game bisa dimainkan offline.
- Ikon: `icons/icon.svg` — pembungkus SVG dari ikon PNG (joystick emas +
  bug hijau di latar navy). SVG dipakai karena konektor GitHub di sini hanya
  bisa mengirim file teks, jadi PNG tidak bisa di-push lewat konektor.
  Manifest mendeklarasikan SVG itu pada ukuran 192x192 dan 512x512
  (`purpose: any` + `maskable`), yang diterima Chrome untuk install.
- File PNG aslinya (192/512/maskable/180/favicon + sumber WebP) disimpan di
  `~/workspace/getdebug-icons/` di luar repo. Kalau nanti di-upload manual
  lewat website GitHub ke `icons/`, manifest bisa diganti merujuk PNG
  (dan iPhone akan dapat ikon layar utama yang proper, karena iOS tidak
  memakai SVG sebagai `apple-touch-icon`).
- Android (Chrome): tombol **Install di HP** di landing page (event
  `beforeinstallprompt`) atau menu ⋮ → Install aplikasi.
- iPhone (Safari): Bagikan → Tambah ke Layar Utama. Instalasi jalan, tapi
  ikon layar utama akan berupa pratinjau halaman sampai PNG di-upload.

## Menjalankan lokal

```sh
python3 -m http.server
```

Catatan: service worker hanya aktif lewat `http://localhost` atau HTTPS,
jadi untuk menguji install/offline, buka lewat `localhost`, bukan `file://`.

## Deploy

Deploy otomatis ke Vercel dari repositori ini. Setiap push ke branch utama akan memicu deployment baru.
