import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    title: '1. Akun Pengguna',
    body: 'Akun MathSpace diperuntukkan bagi mahasiswa dan sivitas akademik Departemen Matematika ITS untuk keperluan belajar. Data yang diisi saat mendaftar (nama, jurusan, angkatan) harus benar, dan satu akun hanya untuk satu orang.',
  },
  {
    title: '2. Konten dan Hak Cipta',
    body: 'Seluruh dokumen di MathSpace disediakan untuk keperluan belajar pribadi. Dilarang menyebarluaskan, mengunggah ulang, atau memperjualbelikan dokumen ke platform lain tanpa izin tertulis dari Departemen Matematika ITS.',
  },
  {
    title: '3. Keanggotaan Premium',
    body: 'Pembayaran premium diverifikasi secara manual oleh admin, biasanya dalam waktu 1×24 jam pada hari kerja. Biaya yang sudah dibayarkan tidak dapat dikembalikan (non-refundable), kecuali terjadi kesalahan pada sistem verifikasi. Masa aktif premium adalah 6 bulan sejak permintaan disetujui.',
  },
  {
    title: '4. Perilaku Pengguna',
    body: 'Pengguna dilarang menyalahgunakan platform, termasuk namun tidak terbatas pada: mengirim bukti pembayaran palsu, membuat akun ganda, atau mengunggah konten yang tidak relevan dengan materi akademik. Admin berhak menangguhkan akun yang melanggar ketentuan ini tanpa pemberitahuan sebelumnya.',
  },
  {
    title: '5. Perubahan Ketentuan',
    body: 'Departemen Matematika ITS dapat mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui platform, dan penggunaan berkelanjutan setelah perubahan dianggap sebagai persetujuan terhadap ketentuan yang baru.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto space-y-10">
          <div>
            <h1 className="font-headline font-bold text-primary text-4xl lg:text-5xl leading-tight tracking-tighter mb-4">
              Syarat & <span className="text-secondary italic">Ketentuan</span>
            </h1>
            <p className="text-on-surface-variant">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>

          <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm p-8 md:p-10 space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.title} className="space-y-2">
                <h2 className="font-bold text-primary text-lg">{section.title}</h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>

          <p className="text-xs text-on-surface-variant italic">
            Dokumen ini adalah draf ketentuan penggunaan internal, bukan dokumen hukum yang telah ditinjau oleh bagian hukum kampus. Hubungi pengelola platform untuk pertanyaan lebih lanjut.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
