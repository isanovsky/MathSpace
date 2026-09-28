import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CatalogDocument, CatalogFolder } from '@/lib/types/catalog';

interface FolderRow {
  id: string;
  name: string;
  parent_id: string | null;
  type: 'matkul' | 'subfolder';
}

interface DocumentRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  folder_id: string | null;
  is_premium: boolean;
  status: 'aktif' | 'diarsipkan';
  author: string | null;
  created_at: string;
  file_path: string | null;
}

const DOCUMENT_COLUMNS =
  'id, title, description, type, folder_id, is_premium, status, author, created_at, file_path';

function toDocument(
  row: DocumentRow,
  folderById: Map<string, FolderRow>,
): CatalogDocument {
  const folder = row.folder_id ? folderById.get(row.folder_id) : undefined;
  const parent = folder?.parent_id ? folderById.get(folder.parent_id) : undefined;

  // Same rule the old admin upload used: a subfolder document belongs to the
  // parent's subject, a root-folder document is its own subject and category.
  const subject = parent?.name ?? folder?.name ?? 'Umum';
  const category = folder?.name ?? subject;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    type: row.type,
    subject,
    category,
    folderId: row.folder_id ?? '',
    isPremium: row.is_premium,
    status: row.status,
    author: row.author ?? '',
    createdAt: row.created_at.slice(0, 10),
    hasFile: !!row.file_path,
  };
}

export async function fetchCatalog(includeArchived: boolean) {
  const admin = createAdminClient();

  let docsQuery = admin
    .from('documents')
    .select(DOCUMENT_COLUMNS)
    .order('created_at', { ascending: false });
  if (!includeArchived) docsQuery = docsQuery.eq('status', 'aktif');

  const [foldersRes, docsRes] = await Promise.all([
    admin.from('folders').select('id, name, parent_id, type').order('name'),
    docsQuery,
  ]);

  if (foldersRes.error) throw foldersRes.error;
  if (docsRes.error) throw docsRes.error;

  const folderRows = (foldersRes.data ?? []) as FolderRow[];
  const docRows = (docsRes.data ?? []) as DocumentRow[];
  const folderById = new Map(folderRows.map((f) => [f.id, f]));

  const counts = new Map<string, number>();
  for (const d of docRows) {
    if (d.folder_id) counts.set(d.folder_id, (counts.get(d.folder_id) ?? 0) + 1);
  }

  const folders: CatalogFolder[] = folderRows.map((f) => ({
    id: f.id,
    name: f.name,
    parentId: f.parent_id,
    type: f.type,
    documentCount: counts.get(f.id) ?? 0,
  }));

  const documents = docRows.map((d) => toDocument(d, folderById));

  return { folders, documents };
}

export async function fetchDocumentById(id: string, includeArchived: boolean) {
  const admin = createAdminClient();

  const [docRes, foldersRes] = await Promise.all([
    admin.from('documents').select(DOCUMENT_COLUMNS).eq('id', id).maybeSingle(),
    admin.from('folders').select('id, name, parent_id, type'),
  ]);

  if (docRes.error) throw docRes.error;
  if (foldersRes.error) throw foldersRes.error;

  const row = docRes.data as DocumentRow | null;
  if (!row) return null;
  if (row.status !== 'aktif' && !includeArchived) return null;

  const folderById = new Map(
    ((foldersRes.data ?? []) as FolderRow[]).map((f) => [f.id, f]),
  );
  return toDocument(row, folderById);
}