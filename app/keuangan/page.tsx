"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import {
  createFinanceItem,
  fetchFinanceItems,
  formatRupiah,
  type FinanceBucket,
  type FinanceItem,
  type FinanceType,
} from "@/lib/finance-api";
import { formatNumberInput, parseNumberInput } from "@/lib/currency";

type FinanceBucketCardProps = {
  title: string;
  bucket: FinanceBucket;
  items: FinanceItem[];
  accentClass?: string;
};

function FinanceBucketCard({
  title,
  bucket,
  items,
  accentClass = "from-emerald-700/80 to-teal-700/80",
}: FinanceBucketCardProps) {
  const bucketItems = useMemo(() => {
    return items
      .filter((item) => item.bucket === bucket)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, bucket]);

  const totalKasMasuk = bucketItems
    .filter((item) => item.type === "kas_masuk" || item.type === "donasi")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalKasKeluar = bucketItems
    .filter((item) => item.type === "kas_keluar")
    .reduce((sum, item) => sum + item.amount, 0);

  const saldo = totalKasMasuk - totalKasKeluar;

  return (
    <section
      className={`overflow-hidden rounded-[32px] bg-gradient-to-r ${accentClass} text-white shadow-xl shadow-emerald-950/20 ring-1 ring-white/10`}
    >
      <div className="p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
              Kategori Keuangan
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/80">
              Data tersinkron langsung dari Google Spreadsheet.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white">
            {bucketItems.length} transaksi
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-white/75">Kas Masuk</p>
            <p className="mt-2 text-2xl font-black">{formatRupiah(totalKasMasuk)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-white/75">Kas Keluar</p>
            <p className="mt-2 text-2xl font-black">{formatRupiah(totalKasKeluar)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-white/75">Saldo</p>
            <p className="mt-2 text-2xl font-black">{formatRupiah(saldo)}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/10 bg-black/10">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/10 text-white/85">
              <tr>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Kas Masuk</th>
                <th className="px-4 py-3 font-semibold">Kas Keluar</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {bucketItems.map((item) => {
                const isIncome = item.type === "kas_masuk" || item.type === "donasi";
                const isExpense = item.type === "kas_keluar";

                return (
                  <tr key={item.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-4 py-3 text-white/90">{item.date}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-100">
                      {isIncome ? formatRupiah(item.amount) : "-"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-rose-100">
                      {isExpense ? formatRupiah(item.amount) : "-"}
                    </td>
                    <td className="px-4 py-3 text-white/90">
                      {item.title}
                      {item.donorName ? ` - ${item.donorName}` : ""}
                    </td>
                  </tr>
                );
              })}

              <tr className="border-t border-white/20 bg-white/10">
                <td className="px-4 py-4 font-bold text-white">Total</td>
                <td className="px-4 py-4 font-black text-emerald-100">
                  {formatRupiah(totalKasMasuk)}
                </td>
                <td className="px-4 py-4 font-black text-rose-100">
                  {formatRupiah(totalKasKeluar)}
                </td>
                <td className="px-4 py-4 font-semibold text-white/80">
                  Saldo: {formatRupiah(saldo)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default function KeuanganPage() {
  const [items, setItems] = useState<FinanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formType, setFormType] = useState<FinanceType>("kas_masuk");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [donorName, setDonorName] = useState("");
  const [note, setNote] = useState("");
  const [bucket, setBucket] = useState<FinanceBucket>("kas_masjid");

  async function loadFinanceItems() {
    try {
      setError("");
      setLoading(true);
      const data = await fetchFinanceItems();
      setItems(data);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data dari Google Spreadsheet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinanceItems();
  }, []);

  const overallSummary = useMemo(() => {
    const income = items
      .filter((item) => item.type === "kas_masuk" || item.type === "donasi")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = items
      .filter((item) => item.type === "kas_keluar")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalDonasi = items
      .filter((item) => item.type === "donasi")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      totalDonasi,
    };
  }, [items]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createFinanceItem({
        date,
        type: formType,
        bucket,
        title,
        amount: parseNumberInput(amount),
        donorName,
        note,
      });

      setTitle("");
      setAmount("");
      setDate("");
      setDonorName("");
      setNote("");

      await loadFinanceItems();
      alert("Data berhasil disimpan");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data ke Google Spreadsheet.");
      alert("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-800 text-white">
      <header className="border-b border-white/10 bg-black/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-emerald-100">Laporan Keuangan</p>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Kas & Donasi Masjid
            </h1>
          </div>
          <a
            href="/"
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Kembali ke Beranda
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] bg-white/12 p-5 shadow-lg shadow-emerald-950/20 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-sm text-white/75">Total Pemasukan</p>
            <p className="mt-2 text-3xl font-black text-emerald-100">
              {formatRupiah(overallSummary.income)}
            </p>
          </div>

          <div className="rounded-[28px] bg-white/12 p-5 shadow-lg shadow-emerald-950/20 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-sm text-white/75">Total Pengeluaran</p>
            <p className="mt-2 text-3xl font-black text-rose-200">
              {formatRupiah(overallSummary.expense)}
            </p>
          </div>

          <div className="rounded-[28px] bg-white/12 p-5 shadow-lg shadow-emerald-950/20 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-sm text-white/75">Saldo Aktif</p>
            <p className="mt-2 text-3xl font-black text-white">
              {formatRupiah(overallSummary.balance)}
            </p>
          </div>

          <div className="rounded-[28px] bg-white/12 p-5 shadow-lg shadow-emerald-950/20 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-sm text-white/75">Total Donasi</p>
            <p className="mt-2 text-3xl font-black text-amber-200">
              {formatRupiah(overallSummary.totalDonasi)}
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] bg-white/12 p-5 shadow-xl shadow-emerald-950/20 ring-1 ring-white/10 backdrop-blur-md sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-100">Input Admin</p>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Tambah Data Keuangan
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Data yang disimpan akan langsung masuk ke Google Spreadsheet dan otomatis
                muncul di halaman keuangan maupun beranda.
              </p>
            </div>

            <button
              type="button"
              onClick={loadFinanceItems}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Kategori Keuangan
              </label>
              <select
                value={bucket}
                onChange={(e) => setBucket(e.target.value as FinanceBucket)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
              >
                <option className="text-slate-900" value="kas_masjid">
                  Kas Masjid
                </option>
                <option className="text-slate-900" value="kas_pembangunan">
                  Kas Pembangunan
                </option>
                <option className="text-slate-900" value="kas_anak_yatim">
                  Kas Anak Yatim
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Jenis Data
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as FinanceType)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
              >
                <option className="text-slate-900" value="kas_masuk">
                  Kas Masuk
                </option>
                <option className="text-slate-900" value="kas_keluar">
                  Kas Keluar
                </option>
                <option className="text-slate-900" value="donasi">
                  Donasi
                </option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-white">
                Judul / Keterangan
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
                placeholder="Contoh: Donasi renovasi"
                required
              />
            </div>

            {formType === "donasi" && (
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-white">
                  Nama Donatur
                </label>
                <input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
                  placeholder="Contoh: Ahmad Fauzi"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Tanggal
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white">
                Nominal
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(formatNumberInput(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
                placeholder="Contoh: 1.000.000"
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-white">
                Catatan
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 outline-none"
                placeholder="Catatan tambahan"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? "Menyimpan..." : "Simpan Data"}
              </button>
            </div>
          </form>
        </section>

        {loading ? (
          <div className="mt-8 rounded-[28px] bg-white/10 p-6 text-sm text-white/80 ring-1 ring-white/10">
            Memuat data keuangan...
          </div>
        ) : (
          <section className="mt-8 grid gap-6">
            <FinanceBucketCard
              title="Kas Masjid"
              bucket="kas_masjid"
              items={items}
              accentClass="from-emerald-700/80 to-teal-700/80"
            />

            <FinanceBucketCard
              title="Kas Pembangunan"
              bucket="kas_pembangunan"
              items={items}
              accentClass="from-cyan-700/80 to-sky-700/80"
            />

            <FinanceBucketCard
              title="Kas Anak Yatim"
              bucket="kas_anak_yatim"
              items={items}
              accentClass="from-lime-700/80 to-emerald-700/80"
            />
          </section>
        )}

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] bg-white/10 p-5 shadow-lg shadow-emerald-950/20 ring-1 ring-white/10 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-400/20 p-3 text-emerald-100">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-100">Catatan</p>
                <h3 className="text-xl font-black text-white">Kas Masuk & Donasi</h3>
              </div>
            </div>
            <p className="text-sm leading-7 text-white/75">
              Pemasukan terdiri dari kas masuk umum dan donasi. Keduanya akan tampil
              otomatis di beranda sesuai kategori masing-masing setelah backend terhubung.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/10 p-5 shadow-lg shadow-emerald-950/20 ring-1 ring-white/10 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-rose-400/20 p-3 text-rose-100">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-100">Akses Admin</p>
                <h3 className="text-xl font-black text-white">Input Dibatasi</h3>
              </div>
            </div>
            <p className="text-sm leading-7 text-white/75">
              Saat ini akses masih terbuka untuk pengujian. Setelah alur live stabil,
              langkah berikutnya adalah membatasi input hanya untuk admin.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}