# GetDebug — Game Tara Tech

Kumpulan game interaktif dari Tara Tech. Satu halaman statis per game
(HTML + CSS + JavaScript), tanpa framework dan tanpa build step, jadi bisa
langsung di-deploy ke mana saja.

## Game

### Tangkap Bug! (`index.html`)
Whack-a-mole: tangkap bug yang muncul di grid selama 30 detik.
- 🐛 Bug biasa = +1 poin, ⭐ Bug emas = +5 poin, 💥 Virus merah = −2 poin.
- Makin banyak tangkapan, bug muncul makin cepat. Skor terbaik tersimpan di browser.

### Jangan Typo! (`jangan-typo/index.html`)
Game ketik: balas chat dari 12 orang (Ibu, Bapak, gebetan, dosen killer,
bos, sampai hantu kos) dengan mengetik balasan persis sebelum waktu habis.
- Huruf salah jadi merah dan tombol kirim terkunci sampai dibetulkan.
- Waktu habis = kehilangan 1 nyawa (3 nyawa). Makin cepat kirim, makin
  besar bonus waktu. Skor terbaik tersimpan di browser.

## Menjalankan lokal

```sh
python3 -m http.server
```

## Deploy

Deploy otomatis ke Vercel dari repositori ini. Setiap push ke branch utama akan memicu deployment baru.
