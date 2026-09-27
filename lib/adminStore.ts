export interface PaymentItem {
  id: string;
  name: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  bank?: string;
  amount?: number;
  transferTime?: string;
  proofImageUrl?: string;
  reason?: string;
}

export const getQueue = (): PaymentItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('mathspace_queue');
  if (stored) return JSON.parse(stored);
  
  // default mock data jika belum ada
  const defaultQueue: PaymentItem[] = [
    { 
      id: '1', 
      name: 'Elena Rodriguez', 
      role: 'Peneliti Pascasarjana', 
      status: 'pending', 
      bank: 'BCA', 
      amount: 15000,
      transferTime: '2025-01-15 14:32'
    },
    { 
      id: '2', 
      name: 'Julian Voss', 
      role: 'Mahasiswa S1', 
      status: 'pending', 
      bank: 'BRI', 
      amount: 15000,
      transferTime: '2025-01-15 10:15'
    },
    { 
      id: '3', 
      name: 'Siti Aminah', 
      role: 'Mahasiswa Matematika', 
      status: 'pending', 
      bank: 'Mandiri', 
      amount: 15000,
      transferTime: '2025-01-14 22:41'
    },
  ];
  localStorage.setItem('mathspace_queue', JSON.stringify(defaultQueue));
  return defaultQueue;
};

export const approveUser = (id: string) => {
  const queue = getQueue();
  const updated = queue.map(item =>
    item.id === id ? { ...item, status: 'approved' as const } : item
  );
  localStorage.setItem('mathspace_queue', JSON.stringify(updated));
  
  // Also update approved_users for compatibility with existing logic if any
  const approved = JSON.parse(localStorage.getItem('approved_users') || '[]');
  if (!approved.includes(id)) {
    localStorage.setItem('approved_users', JSON.stringify([...approved, id]));
  }
};

export const rejectUser = (id: string, reason: string) => {
  const queue = getQueue();
  const updated = queue.map(item =>
    item.id === id ? { ...item, status: 'rejected' as const, reason } : item
  );
  localStorage.setItem('mathspace_queue', JSON.stringify(updated));
};
