export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null = root level (matkul)
  type: 'matkul' | 'subfolder';
  documentCount: number;
}

const FOLDER_SEED: Folder[] = [
  { id: 'folder-calc1', name: 'Kalkulus I', parentId: null, type: 'matkul', documentCount: 2 },
  { id: 'folder-calc1-ets', name: 'ETS', parentId: 'folder-calc1', type: 'subfolder', documentCount: 1 },
  { id: 'folder-calc1-eas', name: 'EAS', parentId: 'folder-calc1', type: 'subfolder', documentCount: 0 },
  { id: 'folder-calc2', name: 'Kalkulus II', parentId: null, type: 'matkul', documentCount: 0 },
  { id: 'folder-alglin', name: 'Aljabar Linear', parentId: null, type: 'matkul', documentCount: 1 },
  { id: 'folder-metnum', name: 'Metode Numerik', parentId: null, type: 'matkul', documentCount: 1 },
  { id: 'folder-analisis', name: 'Analisis Real', parentId: null, type: 'matkul', documentCount: 0 },
  { id: 'folder-umum', name: 'Umum', parentId: null, type: 'matkul', documentCount: 1 },
];

export const initializeFolders = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('mathspace_folders_initialized')) {
    localStorage.setItem('mathspace_folders', JSON.stringify(FOLDER_SEED));
    localStorage.setItem('mathspace_folders_initialized', 'true');
  }
};

export const getFolders = (): Folder[] => {
  if (typeof window === 'undefined') return FOLDER_SEED;
  initializeFolders();
  const stored = localStorage.getItem('mathspace_folders');
  return stored ? JSON.parse(stored) : FOLDER_SEED;
};

export const addFolder = (folder: Omit<Folder, 'id' | 'documentCount'>) => {
  const folders = getFolders();
  const newFolder = { ...folder, id: 'folder-' + Date.now(), documentCount: 0 };
  localStorage.setItem('mathspace_folders', JSON.stringify([...folders, newFolder]));
  return newFolder;
};

export const updateFolder = (id: string, updates: Partial<Folder>) => {
  const folders = getFolders().map(f => f.id === id ? { ...f, ...updates } : f);
  localStorage.setItem('mathspace_folders', JSON.stringify(folders));
};

export const deleteFolder = (id: string) => {
  const folders = getFolders().filter(f => f.id !== id);
  localStorage.setItem('mathspace_folders', JSON.stringify(folders));
};
