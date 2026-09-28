import 'server-only';
import type { CurrentProfile } from '@/lib/auth/getCurrentProfile';

// The single place that decides who may open a document.
//   - must be logged in (free documents included)
//   - premium documents need a premium member or an admin
// Step 6d reuses this for the file download endpoint.
export function canAccessDocument(
  profile: CurrentProfile | null,
  isPremium: boolean,
): boolean {
  if (!profile) return false;
  if (profile.role === 'admin') return true;
  return !isPremium || profile.status === 'premium';
}
