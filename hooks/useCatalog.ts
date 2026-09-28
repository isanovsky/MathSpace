'use client';

import { useEffect, useState } from 'react';
import type { CatalogDocument, CatalogFolder } from '@/lib/types/catalog';

interface CatalogState {
  documents: CatalogDocument[];
  folders: CatalogFolder[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useCatalog(): CatalogState {
  const [state, setState] = useState<Omit<CatalogState, 'refresh'>>({
    documents: [],
    folders: [],
    isLoading: true,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    fetch('/api/catalog')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setState({
          documents: data.documents,
          folders: data.folders,
          isLoading: false,
          error: null,
        });
      })
      .catch(() => {
        if (!active) return;
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Gagal memuat konten. Coba muat ulang halaman.',
        }));
      });

    return () => {
      active = false;
    };
  }, [reloadToken]);

  const refresh = () => setReloadToken((t) => t + 1);

  return { ...state, refresh };
}
