"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Landmark,
  Newspaper,
  RefreshCw,
  Save,
} from "lucide-react";

type FinanceType = "masjid" | "pembangunan" | "yatim";

type FinanceItem = {
  id: string;
  category: FinanceType;
  date: string;
  description: string;
  donor?: string;
  type: "masuk" | "keluar";
  amount: number;
};

type ArticleItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  image?: string;
  published: boolean;
};

type FridaySchedule = {
  hijriDate: string;
  gregorianDate: string;
  khatib: string;
  bilal: string;
  title: string;
};

type FinanceBucket = {
  label: string;
  category: FinanceType;
  items: FinanceItem[];
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatRupiah(value: number) {
  return currency.format(value).replace("IDR", "Rp");
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const clean = value.replace(/[^\d-]/g, "");
    return Number(clean || 0);
  }
  return 0;
}

function mapCategory(value: string): FinanceType {
  const v = value.toLowerCase();
  if (v.includes("pembangunan")) return "pembangunan";
  if (v.includes("yatim")) return "yatim";
  return "masjid";
}

function parseFinanceResponse(payload: any): FinanceItem[] {
  const rows = Array.isArray(payload?.finance)
    ? payload.finance
    : Array.isArray(payload?.keuangan)
      ? payload.keuangan
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return rows.map((item: any, index: number) => ({
    id: String(item.id ?? index + 1),
    category: mapCategory(
      item.category || item.kategori || item.kas || "kas masjid"
    ),
    date: item.date || item.tanggal || "",
    description: item.description || item.keterangan || "",
    donor: item.donor || item.donatur || "",
    type:
      String(item.type || item.jenis || item.transaksi || "")
        .toLowerCase()
        .includes("keluar")
        ? "keluar"
        : "masuk",
    amount: toNumber(item.amount || item.nominal || item.jumlah || 0),
  }));
}

function parseArticleResponse(payload: any): ArticleItem[] {
  const rows = Array.isArray(payload?.articles)
    ? payload.articles
    : Array.isArray(payload?.artikel)
      ? payload.artikel
      : [];

  return rows.map((item: any, index: number) => ({
    id: String(item.id ?? index + 1),
    title: item.title || item.judul || "",
    excerpt: item.excerpt || item.ringkasan || "",
    category: item.category || item.kategori || "Artikel",
    date: item.date || item.tanggal || "",
    author: item.author || item.penulis || "Admin",
    image: item.image || item.gambar || item.imageUrl || "",
    published:
      String(item.published ?? item.publish ?? item.status ?? "publish")
        .toLowerCase()
        .includes("publish"),
  }));
}

function parseFridayResponse(payload: any): FridaySchedule {
  const raw =
    payload?.fridayPrayer ||
    payload?.khotibJumat ||
    payload?.jadwalJumat ||
    payload?.jumat ||
    {};

  return {
    hijriDate: raw.hijriDate || raw.tanggalHijriah || "19 Muharram 1448 H",
    gregorianDate: raw.gregorianDate || raw.tanggalMasehi || "Jumat, 8 Mei 2026",
    khatib: raw.khatib || raw.namaKhatib || "Ust. Ahmad Fauzi",
    bilal: raw.bilal || raw.namaBilal || "Muhammad Rizki",
    title:
      raw.title || raw.judulKhutbah || "Memakmurkan Masjid dan Menjaga Ukhuwah Jamaah",
  };
}

function StatCard({
  title,
  value,
  tone = "default",
}: {
  title: string;
  value: string;
  tone?: "default" | "green" | "red" | "yellow";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-white"
      : tone === "red"
        ? "border-rose-200 bg-white"
        : tone === "yellow"
          ? "border-amber-200 bg-white"
          : "border-slate-200 bg-white";

  const valueClass =
    tone === "green"
      ? "text-emerald-700"
      : tone === "red"
        ? "text-rose-600"
        : tone === "yellow"
          ? "text-amber-600"
          : "text-slate-900";

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {title}
      </p>
      <p className={`mt-3 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function MiniSummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "red" | "default";
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50"
      : tone === "red"
        ? "bg-rose-50"
        : "bg-slate-50";

  const valueClass =
    tone === "green"
      ? "text-emerald-700"
      : tone === "red"
        ? "text-rose-600"
        : "text-slate-900";

  return (
    <div className={`rounded-2xl p-4 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

function FinanceBucketCard({ bucket }: { bucket: FinanceBucket }) {
  const income = bucket.items
    .filter((item) => item.type === "masuk")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = bucket.items
    .filter((item) => item.type === "keluar")
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = income - expense;

  return (
    <section className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{bucket.label}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {bucket.items.length} transaksi terbaru
          </p>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Live
        </span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MiniSummaryCard label="Masuk" value={formatRupiah(income)} tone="green" />
        <MiniSummaryCard label="Keluar" value={formatRupiah(expense)} tone="red" />
        <MiniSummaryCard label="Saldo" value={formatRupiah(balance)} tone="default" />
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Tanggal
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Kas Masuk
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Kas Keluar
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Keterangan
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                Donatur
              </th>
            </tr>
          </thead>
          <tbody>
            {bucket.items.length > 0 ? (
              bucket.items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-emerald-700">
                    {item.type === "masuk" ? formatRupiah(item.amount) : "-"}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-rose-600">
                    {item.type === "keluar" ? formatRupiah(item.amount) : "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {item.description || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {item.donor || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={5}>
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SidebarCard({
  icon,
  eyebrow,
  title,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">{title}</h3>
        </div>
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 ${className}`}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 ${className}`}
    />
  );
}

function Select({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400 ${className}`}
    >
      {children}
    </select>
  );
}

export default function KeuanganPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [financeItems, setFinanceItems] = useState<FinanceItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [friday, setFriday] = useState<FridaySchedule>({
    hijriDate: "19 Muharram 1448 H",
    gregorianDate: "Jumat, 8 Mei 2026",
    khatib: "Ust. Ahmad Fauzi",
    bilal: "Muhammad Rizki",
    title: "Memakmurkan Masjid dan Menjaga Ukhuwah Jamaah",
  });

  const fetchAll = async () => {
    if (!GAS_URL) {
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const res = await fetch(GAS_URL, { cache: "no-store" });
      const json = await res.json();

      setFinanceItems(parseFinanceResponse(json));
      setArticles(parseArticleResponse(json));
      setFriday(parseFridayResponse(json));
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const financeBuckets = useMemo<FinanceBucket[]>(() => {
    const latest = [...financeItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return [
      {
        label: "Kas Masjid",
        category: "masjid",
        items: latest.filter((item) => item.category === "masjid").slice(0, 5),
      },
      {
        label: "Kas Pembangunan",
        category: "pembangunan",
        items: latest.filter((item) => item.category === "pembangunan").slice(0, 5),
      },
      {
        label: "Kas Anak Yatim",
        category: "yatim",
        items: latest.filter((item) => item.category === "yatim").slice(0, 5),
      },
    ];
  }, [financeItems]);

  const totals = useMemo(() => {
    const income = financeItems
      .filter((item) => item.type === "masuk")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = financeItems
      .filter((item) => item.type === "keluar")
      .reduce((sum, item) => sum + item.amount, 0);

    const donation = financeItems
      .filter((item) => item.type === "masuk" && item.donor)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      donation,
    };
  }, [financeItems]);

  const publishedArticles = useMemo(() => {
    return [...articles]
      .filter((item) => item.published)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2);
  }, [articles]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-500">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-100">
                Laporan Keuangan
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
                Kas & Donasi Masjid
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
                Halaman admin untuk mengelola data keuangan, artikel terbaru, dan jadwal khotib Jumat Langgar Kidoel.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Pemasukan" value={formatRupiah(totals.income)} tone="green" />
          <StatCard title="Total Pengeluaran" value={formatRupiah(totals.expense)} tone="red" />
          <StatCard title="Saldo Aktif" value={formatRupiah(totals.balance)} />
          <StatCard title="Total Donasi" value={formatRupiah(totals.donation)} tone="yellow" />
        </div>

        <div className="mt-8 grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {financeBuckets.map((bucket) => (
              <FinanceBucketCard key={bucket.category} bucket={bucket} />
            ))}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6">
            <SidebarCard icon={<Landmark className="h-5 w-5" />} eyebrow="Input Admin" title="Tambah Data Keuangan">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Kategori Kas</label>
                  <Select defaultValue="Kas Masjid">
                    <option>Kas Masjid</option>
                    <option>Kas Pembangunan</option>
                    <option>Kas Anak Yatim</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Jenis Transaksi</label>
                  <Select defaultValue="Kas Masuk">
                    <option>Kas Masuk</option>
                    <option>Kas Keluar</option>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tanggal</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Keterangan</label>
                  <Input placeholder="Contoh: Infaq Jumat" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Nominal</label>
                  <Input placeholder="Contoh: 1.000.000" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Donatur</label>
                  <Input placeholder="Kosongkan jika tidak ada" />
                </div>
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  Simpan Data
                </button>
              </div>
            </SidebarCard>

            <SidebarCard icon={<Newspaper className="h-5 w-5" />} eyebrow="Kelola Artikel" title="Tambah Artikel">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Judul</label>
                  <Input />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Ringkasan</label>
                  <Textarea rows={4} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Kategori</label>
                    <Input placeholder="Artikel" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Tanggal</label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Penulis</label>
                    <Input placeholder="Admin" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Status Publish</label>
                    <Select defaultValue="Publish">
                      <option>Publish</option>
                      <option>Draft</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">URL Gambar</label>
                  <Input placeholder="Opsional" />
                </div>
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  Simpan Artikel
                </button>
              </div>
            </SidebarCard>

            <SidebarCard icon={<CalendarDays className="h-5 w-5" />} eyebrow="Update Khotib Jumat" title="Jadwal Jumat">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tanggal Hijriah</label>
                  <Input defaultValue={friday.hijriDate} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tanggal Masehi</label>
                  <Input defaultValue={friday.gregorianDate} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Khatib</label>
                  <Input defaultValue={friday.khatib} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Nama Bilal</label>
                  <Input defaultValue={friday.bilal} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Judul Khutbah</label>
                  <Textarea rows={3} defaultValue={friday.title} />
                </div>
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  Simpan Jadwal Jumat
                </button>
              </div>
            </SidebarCard>

            <button
              type="button"
              onClick={fetchAll}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {loading ? "Memuat data..." : "Refresh Data"}
            </button>
          </aside>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  Artikel Terbaru
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  Artikel Terbaru
                </h3>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {publishedArticles.length > 0 ? (
                publishedArticles.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {item.category}
                      </span>
                      <span className="text-sm text-slate-500">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <h4 className="mt-3 text-xl font-bold text-slate-900">{item.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.excerpt}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">
                  Belum ada artikel yang dipublikasikan.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
                  Jadwal Jumat
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  Jadwal Khotib Jumat Aktif
                </h3>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Tanggal Hijriah
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">{friday.hijriDate}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Tanggal Masehi
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">{friday.gregorianDate}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Khatib
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">{friday.khatib}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Bilal
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">{friday.bilal}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Judul Khutbah
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">{friday.title}</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}