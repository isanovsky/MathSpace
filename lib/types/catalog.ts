// Shapes returned by the catalog API. Kept close to the original Document /
// Folder interfaces so pages needed minimal changes when migrating off
// localStorage.
// Note: the storage path of a file is never exposed here, only `hasFile`.
export interface CatalogFolder {
  id: string;
  name: string;
  parentId: string | null; // null = root level (matkul)
  type: 'matkul' | 'subfolder';
  documentCount: number;
}

export interface CatalogDocument {
  id: string;
  title: string;
  description: string;
  type: string;
  subject: string;  // derived from the folder tree, not stored
  category: string; // derived from the folder tree, not stored
  folderId: string;
  isPremium: boolean;
  status: 'aktif' | 'diarsipkan';
  author: string;
  createdAt: string;
  hasFile: boolean;
  // Decided by the server (login + premium/admin rule). Clients must not
  // re-derive this; they only use it to pick lock icons and modals.
  canAccess: boolean;
}
