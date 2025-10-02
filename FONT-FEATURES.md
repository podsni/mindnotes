# Font & Typography Settings - MindNote

## Fitur Font Selector yang Diperbarui

### 📝 Font Standar Naskah Film (Screenplay)
1. **Courier New (Hollywood Standard)** - Font standar industri Hollywood, tersedia di semua OS
2. **Courier Prime (Modern & Clean)** - Versi modern yang lebih bersih, dari Google Fonts

### ⌨️ Font Typewriter / Mesin Ketik
3. **Special Elite (Retro Typewriter)** - Nuansa mesin tik retro dari Google Fonts
4. **American Typewriter** - Font typewriter klasik (fallback ke Courier New jika tidak tersedia)
5. **Cutive Mono (Formal Typewriter)** - Campuran formal + mesin tik dari Google Fonts

### 💻 Font Monospace Modern
6. **IBM Plex Mono** - Font profesional dari IBM, tersedia di Google Fonts
7. **Source Code Pro** - Font dari Adobe, tersedia di Google Fonts
8. **PT Mono** - Font clean dan modern, tersedia di Google Fonts
9. **Anonymous Pro** - Font distraction-free untuk fokus menulis, dari Google Fonts

### 🖥️ System Default
10. **System Default** - Menggunakan font sistem operasi

## 🎨 Kontrol Ukuran Font

### Fitur:
- **Range**: 12px - 24px
- **Kontrol**:
  - Tombol `-` untuk mengurangi ukuran
  - Tombol `+` untuk menambah ukuran
  - Input langsung untuk mengatur ukuran spesifik
- **Persistent**: Ukuran font disimpan di localStorage

### Implementasi Teknis:
- Menggunakan CSS variable `--editor-font-size`
- Diterapkan ke `textarea` editor dan `.editor-title`
- Line height disesuaikan per kategori font:
  - Screenplay & Typewriter: `1.7` (lebih longgar untuk keterbacaan)
  - Modern Monospace: `1.6` (standar untuk coding fonts)

## 📦 Google Fonts yang Digunakan

Font berikut diunduh dari Google Fonts API:
- Courier Prime (400, 700)
- Special Elite
- Cutive Mono
- IBM Plex Mono (400, 700)
- Source Code Pro (400, 700)
- PT Mono
- Anonymous Pro (400, 700)

### Performance:
- Menggunakan `preconnect` untuk optimasi loading
- Font di-load dengan `display=swap` untuk menghindari FOIT (Flash of Invisible Text)
- Total ukuran font dari Google Fonts: ~150-200KB (di-cache oleh browser)

## 🎯 User Experience

### Perubahan Font:
1. Pilih font dari dropdown
2. Font langsung diterapkan ke editor
3. Preview setiap font ditampilkan di dropdown
4. Pilihan disimpan ke localStorage

### Perubahan Ukuran:
1. Gunakan tombol +/- untuk increment 1px
2. Atau ketik langsung ukuran yang diinginkan (12-24)
3. Ukuran diterapkan secara real-time
4. Disimpan otomatis ke localStorage

## 🔄 Default Settings
- **Default Font**: Courier Prime (Hollywood Standard modern)
- **Default Size**: 16px
- **Persistence**: Semua pengaturan disimpan di localStorage

## 📱 Responsiveness
- Desktop: Dropdown normal dengan smooth animation
- Mobile: Bottom sheet untuk kemudahan akses
- Kontrol ukuran font disesuaikan untuk layar kecil

## ✨ Highlights

### Kenapa Courier Prime sebagai Default?
- Merupakan versi modern dari Courier New
- Lebih bersih dan mudah dibaca
- Gratis dan open-source
- Standar untuk penulisan naskah film profesional
- Kompatibel dengan format standar industri (Final Draft, Celtx, dll)

### Typography Best Practices:
- Line height yang tepat untuk setiap kategori font
- Letter spacing untuk font typewriter (0.02em)
- Consistent sizing dengan CSS variables
- Smooth transitions saat mengganti font

## 🚀 Build Info
- ✅ TypeScript: 0 errors, 0 warnings
- ✅ Build Success
- CSS: 28.05 kB (gzip: 5.57 kB)
- JS: 194.81 kB (gzip: 66.47 kB)
