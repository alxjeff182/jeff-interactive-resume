/** @type {typeof import('./messages.en.js').MESSAGES_EN} */
export const MESSAGES_ID = {
  shell: {
    title: 'Jeffry Alexander G. — Resume Interaktif 3D · Senior Frontend Engineer · Jakarta',
    loading: 'Memuat pengalaman 3D...',
    hint: 'Klik bangunan untuk detail · Kolam (Kontak): PDF',
    skipLink: 'Langsung ke peternakan interaktif',
    skipHref: '#c',
    introAria: 'Pengantar',
    canvasAria:
      'Peternakan isometrik interaktif: keyboard atau stick di layar untuk bergerak; ketuk atau klik bangunan untuk detail resume.',
    exitPhotoMode: 'Keluar mode foto',
    touchMove: 'Gerak',
    touchStickAria: 'Seret untuk berjalan',
    touchToolbarAria: 'Kontrol tampilan',
    touchActionsAria: 'Aksi interaksi',
    touchZoomAria: 'Zoom',
    touchActionA: 'Interaksi bangunan terdekat',
    touchActionB: 'Tahan untuk lari (sama seperti double-tap di desktop)',
    touchPhotoAria: 'Alihkan mode foto',
    touchPhotoTitle: 'Mode foto',
    touchZoomOut: 'Perkecil',
    touchZoomIn: 'Perbesar',
    mobileControlsAria: 'Kontrol sentuh',
    closePanelAria: 'Tutup panel resume',
    langSwitchToId: 'Ganti bahasa ke Indonesia',
    langSwitchToEn: 'Ganti bahasa ke Inggris',
    tourTriggerAria: 'Tampilkan panduan',
    tourTriggerTitle: 'Cara memakai adegan ini',
  },
  tour: {
    next: 'Lanjut',
    prev: 'Kembali',
    done: 'Mengerti',
    stepStickTitle: 'Gerak',
    stepStickDesc:
      'Seret stick untuk berjalan — menggantikan WASD / panah di desktop.',
    stepZoomTitle: 'Zoom',
    stepZoomDesc:
      'Ketuk − dan + untuk memperbesar atau memperkecil kamera. Atau cubit dengan dua jari di area peternakan.',
    stepPhotoTitle: 'Mode foto',
    stepPhotoDesc:
      'Ketuk ikon kamera untuk menyembunyikan HUD agar screenshot bersih. Ketuk lagi atau tombol Keluar untuk menampilkan lagi.',
    stepBTitle: 'Lari — tahan B',
    stepBDesc:
      'Tahan B untuk sprint. Lepas untuk berjalan lagi — sama seperti double-tap di keyboard.',
    stepATitle: 'Interaksi — ketuk A',
    stepADesc:
      'Saat sudah cukup dekat dengan bangunan, ketuk A untuk membuka bagian resume. Tombol akan redup sampai kamu dalam jangkauan.',
    stepDesktopCanvasTitle: 'Jelajah',
    stepDesktopCanvasDesc:
      'Pakai WASD atau panah untuk bergerak. Seret di area peternakan untuk memutar kamera. Scroll zoom in/out. Double-tap cepat pada tombol jalan untuk sprint. Tekan F untuk mode foto (HUD bersih). Klik bangunan saat sudah dekat untuk membuka detail resume.',
    stepDesktopHintTitle: 'Petunjuk',
    stepDesktopHintDesc:
      'Pill seperti ini bisa muncul dengan ringkasan. Kolam membuka PDF kontak.',
    stepDesktopLangTitle: 'Bahasa',
    stepDesktopLangDesc:
      'Ganti Inggris / Indonesia — teks UI dan panduan ikut berubah.',
  },
  loading: {
    critical: 'Memuat aset 3D utama...',
    farmhouse: 'Memuat farmhouse...',
    buildings: 'Memuat bangunan...',
    character: 'Memuat karakter...',
    finalizing: 'Menyelesaikan adegan...',
    preparing: 'Menyiapkan adegan...',
  },
  error: {
    title: 'Gagal memuat aset 3D',
    retry: 'Coba lagi',
    suffixRetry: 'Silakan coba lagi.',
  },
  toast: {
    photoOn: 'Mode foto — tampilan bersih',
    photoOff: 'HUD ditampilkan',
    sprint: 'Sprint aktif',
    moveCloser: 'Dekati bangunan untuk berinteraksi',
  },
  cv: {
    openBuilding: 'Buka',
    pondBadge: 'Kontak — PDF',
  },
}
