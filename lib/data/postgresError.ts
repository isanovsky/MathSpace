// Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
export function friendlyDbError(error: { code?: string; message?: string } | null): string {
  switch (error?.code) {
    case '23505': // unique_violation
      return 'Sudah ada folder dengan nama itu di lokasi yang sama.';
    case '23503': // foreign_key_violation
      return 'Folder ini masih berisi dokumen atau subfolder. Kosongkan dulu sebelum menghapus.';
    case '23514': // check_violation
      return 'Data tidak memenuhi aturan yang berlaku.';
    default:
      return error?.message || 'Terjadi kesalahan pada database.';
  }
}
