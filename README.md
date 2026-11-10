# Tangkap Bug! — Game Tara Tech

Game interaktif dari Tara Tech. Satu halaman statis (HTML + CSS + JavaScript),
tanpa framework dan tanpa build step, jadi bisa langsung di-deploy ke mana saja.

## Cara main

- Buka `index.html` di browser.
- Tekan **Mulai Main**, lalu tangkap bug yang muncul di grid selama 30 detik.
- 🐛 Bug biasa = +1 poin, ⭐ Bug emas = +5 poin, 💥 Virus merah = −2 poin.
- Makin banyak tangkapan, bug muncul makin cepat. Skor terbaik tersimpan di browser.

## Menjalankan lokal

```sh
python3 -m http.server
```

## Deploy

Deploy otomatis ke Vercel dari repositori ini. Setiap push ke branch utama akan memicu deployment baru.
