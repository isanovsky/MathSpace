export interface Document {
  id: string;
  title: string;
  description: string;
  type: string;        // 'Catatan Kuliah' | 'Kumpulan Soal' | 'Buku Teks' | 'Spreadsheet' | 'Tips & Trik'
  subject: string;     // mata kuliah name, e.g. 'Kalkulus I'
  folderId: string;    // links to folder in folderStore
  category: string;    // subfolder name or subject name
  isPremium: boolean;
  status: 'aktif' | 'diarsipkan';
  author: string;
  createdAt: string;
  fileUrl?: string;
}

const SEED_DATA: Document[] = [
  {
    id: 'calc1-m23',
    title: 'UTS Kalkulus I 2023',
    description: 'Pembahasan soal UTS Kalkulus I 2023. Mencakup limit, turunan, dan integral dasar.',
    type: 'Kumpulan Soal',
    subject: 'Kalkulus I',
    folderId: 'folder-calc1',
    category: 'Kalkulus I',
    isPremium: false,
    status: 'aktif',
    author: 'Dept. Staff',
    createdAt: '2023-01-01',
  },
  {
    id: 'calc1-notes',
    title: 'Catatan Lengkap Kalkulus I',
    description: 'Catatan kuliah komprehensif Kalkulus I dari pertemuan 1 sampai 14.',
    type: 'Catatan Kuliah',
    subject: 'Kalkulus I',
    folderId: 'folder-calc1',
    category: 'Kalkulus I',
    isPremium: true,
    status: 'aktif',
    author: 'Dept. Staff',
    createdAt: '2024-01-01',
  },
  {
    id: 'alglin-book',
    title: 'Buku Teks Aljabar Linear Elementer',
    description: 'Buku referensi utama untuk mata kuliah Aljabar Linear.',
    type: 'Buku Teks',
    subject: 'Aljabar Linear',
    folderId: 'folder-alglin',
    category: 'Aljabar Linear',
    isPremium: true,
    status: 'aktif',
    author: 'Dept. Staff',
    createdAt: '2022-01-01',
  },
  {
    id: 'num-sheet',
    title: 'Spreadsheet Metode Iterasi',
    description: 'Template Excel untuk menghitung akar persamaan dengan metode Newton-Raphson.',
    type: 'Spreadsheet',
    subject: 'Metode Numerik',
    folderId: 'folder-metnum',
    category: 'Metode Numerik',
    isPremium: true,
    status: 'aktif',
    author: 'Dept. Staff',
    createdAt: '2024-01-01',
  },
  {
    id: 'tips-study',
    title: 'Tips & Trik Belajar Matematika',
    description: 'Panduan cara belajar matematika yang efektif untuk mahasiswa.',
    type: 'Tips & Trik',
    subject: 'Umum',
    folderId: 'folder-umum',
    category: 'Umum',
    isPremium: false,
    status: 'aktif',
    author: 'Dept. Staff',
    createdAt: '2024-01-01',
  },
];

export const initializeStore = () => {
  if (typeof window === 'undefined') return;
  // Only seed if localStorage is empty (first time)
  if (!localStorage.getItem('mathspace_contents_initialized')) {
    localStorage.setItem('mathspace_contents', JSON.stringify(SEED_DATA));
    localStorage.setItem('mathspace_contents_initialized', 'true');
  }
};

export const getContents = (): Document[] => {
  if (typeof window === 'undefined') return SEED_DATA;
  initializeStore();
  const stored = localStorage.getItem('mathspace_contents');
  return stored ? JSON.parse(stored) : SEED_DATA;
};

export const getContentById = (id: string): Document | undefined => {
  return getContents().find(doc => doc.id === id);
};

export const addContent = (doc: Omit<Document, 'id' | 'createdAt'>) => {
  const contents = getContents();
  const newDoc = { 
    ...doc, 
    id: 'doc-' + Date.now(), 
    createdAt: new Date().toISOString().split('T')[0] 
  };
  localStorage.setItem('mathspace_contents', JSON.stringify([...contents, newDoc]));
  return newDoc;
};

export const updateContent = (id: string, updates: Partial<Document>) => {
  const contents = getContents().map(d => d.id === id ? { ...d, ...updates } : d);
  localStorage.setItem('mathspace_contents', JSON.stringify(contents));
};

export const deleteContent = (id: string) => {
  const contents = getContents().filter(d => d.id !== id);
  localStorage.setItem('mathspace_contents', JSON.stringify(contents));
};

// For backward compatibility with previous Content interface if needed
export type { Document as Content };
