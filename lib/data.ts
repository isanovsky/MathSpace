// DEPRECATED: This file is kept only for reference.
// All data is now managed through lib/contentStore.ts and localStorage.
// Do not import from this file in new code.

export const documents = [
  // Kalkulus I
  {
    id: 'calc1-m23',
    title: 'UTS Kalkulus I 2023',
    subject: 'Kalkulus I',
    category: 'Kumpulan Soal',
    type: 'PDF',
    isPremium: false,
    updated: '2023',
    description: 'Pembahasan soal UTS Kalkulus I 2023. Mencakup limit, turunan, dan integral dasar.',
  },
  {
    id: 'calc1-notes',
    title: 'Catatan Lengkap Kalkulus I',
    subject: 'Kalkulus I',
    category: 'Catatan Kuliah',
    type: 'PDF',
    isPremium: true,
    updated: '2024',
    description: 'Catatan kuliah komprehensif Kalkulus I dari pertemuan 1 sampai 14.',
  },
  // Aljabar Linear
  {
    id: 'alglin-book',
    title: 'Buku Teks Aljabar Linear Elementer',
    subject: 'Aljabar Linear',
    category: 'Buku Teks',
    type: 'PDF',
    isPremium: true,
    updated: '2022',
    description: 'Buku referensi utama untuk mata kuliah Aljabar Linear.',
  },
  // Metode Numerik
  {
    id: 'num-sheet',
    title: 'Spreadsheet Metode Iterasi',
    subject: 'Metode Numerik',
    category: 'Spreadsheet',
    type: 'XLSX',
    isPremium: true,
    updated: '2024',
    description: 'Template Excel untuk menghitung akar persamaan dengan metode Newton-Raphson.',
  },
  // Umum
  {
    id: 'tips-study',
    title: 'Tips & Trik Belajar Matematika',
    subject: 'Umum',
    category: 'Tips & Trik',
    type: 'PDF',
    isPremium: false,
    updated: '2024',
    description: 'Panduan cara belajar matematika yang efektif untuk mahasiswa.',
  },
];

export const subjects = ['Semua Mata Kuliah', 'Kalkulus I', 'Kalkulus II', 'Aljabar Linear', 'Metode Numerik', 'Analisis Real', 'Umum'];
export const categories = ['Semua Tipe', 'Catatan Kuliah', 'Kumpulan Soal', 'Buku Teks', 'Tips & Trik', 'Spreadsheet'];
