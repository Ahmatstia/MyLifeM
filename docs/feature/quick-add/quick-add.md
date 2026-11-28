# Spesifikasi Fitur: Tambah Cepat (`quick-add`)

> **Direktori**: `src/features/quick-add/`  
> **Rute Terkait**: `/quick-add` (`transparentModal` di `src/app/_layout.tsx`, dipicu oleh `<TabFabButton />` pada slot tengah `TabLayout`)

---

## 1. Struktur Modul

- `presentation/screens/quick-add-screen.tsx` (`QuickAddScreen`) — modal bottom sheet launcher ringan tanpa folder `domain/` atau `data/` terpisah.

---

## 2. User Flow

Saat pengguna menekan tombol **Tambah** (`+`) di tengah floating bottom tab bar, `QuickAddScreen` menampilkan 3 pintu masuk utama menggunakan `router.replace(...)`:
1. **Catat Tugas** -> `/tasks/new` (`TaskEditorScreen`)
2. **Target Hidup** -> `/targets/new` (`CreateTargetScreen`)
3. **Agenda & Kalender** -> `/agenda/new` (`CreateAgendaScreen`)

Menekan area backdrop (*scrim*) atau tombol tutup (`X`) menutup modal dengan `router.back()`.
