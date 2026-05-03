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
type FinanceTransactionType = "masuk" | "keluar";

type FinanceItem = {
  id: string;
  category: FinanceType;
  date: string;
  description: string;
  donor?: string;
  type: FinanceTransactionType;
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

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const clean = value.replace(/[^\d-]/g, "");
    return Number(clean || 0);
  }
  return 0;
}

function formatNumberInput(value: string) {
  const raw = value.replace(/[^\d]/g, "");
  if (!raw) return "";
  return new Intl.NumberFormat("id-ID").format(Number(raw));
}

function parseNumberInput(value: string) {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

function mapCategory(value: string): FinanceType {
  const v = value.toLowerCase();

  if (v.includes("kas_pembangunan") || v.includes("pembangunan")) {
    return "pembangunan";
  }

  if (v.includes("kas_anak_yatim") || v.includes("anak_yatim") || v.includes("yatim")) {
    return "yatim";
  }

  return "masjid";
}

function mapType(value: string): FinanceTransactionType {
  const v = value.toLowerCase();

  if (v.includes("kas_keluar") || v.includes("keluar")) {
    return "keluar";
  }

  return "masuk";
}

function sortByDateDesc<T extends { date: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function parseFinanceResponse(payload: any): FinanceItem[] {
  const root = payload?.data ?? payload;

  const rows = Array.isArray(root?.financeItems)
    ? root.financeItems
    : Array.isArray(root?.transactions)
      ? root.transactions
      : Array.isArray(root?.transaksi)
        ? root.transaksi
        : Array.isArray(root?.keuangan)
          ? root.keuangan
          : Array.isArray(root?.finance)
            ? root.finance
            : Array.isArray(root?.items)
              ? root.items
              : [];

  return sortByDateDesc(
    rows
      .map((item: any, index: number): FinanceItem | null => {
        const amount = toNumber(item?.amount ?? item?.nominal ?? item?.jumlah);
        if (amount <= 0) return null;

        return {
          id: String(item?.id ?? `finance-${index + 1}`),
          category: mapCategory(
            String(
              item?.bucket ??
                item?.category ??
                item?.kategori ??
                item?.kas ??
                "kas_masjid"
            )
          ),
          date: String(item?.date ?? item?.tanggal ?? item?.createdAt ?? ""),
          description: String(
            item?.description ??
              item?.keterangan ??
              item?.title ??
              item?.note ??
              "-"
          ),
          donor: String(
            item?.donor ?? item?.donatur ?? item?.donorName ?? item?.donorname ?? ""
          ),
          type: mapType(
            String(item?.type ?? item?.jenis ?? item?.transaksi ?? "kas_masuk")
          ),
          amount,
        };
      })
      .filter(Boolean) as FinanceItem[]
  );
}

function parseArticleResponse(payload: any): ArticleItem[] {
  const root = payload?.data ?? payload;

  const rows = Array.isArray(root?.articles)
    ? root.articles
    : Array.isArray(root?.artikel)
      ? root.artikel
      : Array.isArray(root?.posts)
        ? root.posts
        : Array.isArray(root?.berita)
          ? root.berita
          : [];

  return sortByDateDesc(
    rows.map((item: any, index: number) => ({
      id: String(item?.id ?? index + 1),
      title: String(item?.title ?? item?.judul ?? ""),
      excerpt: String(item?.excerpt ?? item?.ringkasan ?? item?.summary ?? ""),
      category: String(item?.category ?? item?.kategori ?? "Artikel"),
      date: String(item?.date ?? item?.tanggal ?? ""),
      author: String(item?.author ?? item?.penulis ?? "Admin"),
      image: String(item?.image ?? item?.gambar ?? item?.imageUrl ?? ""),
      published: Boolean(item?.isPublished ?? item?.published ?? true),
    }))
  );
}

function parseFridayResponse(payload: any): FridaySchedule {
  const root = payload?.data ?? payload;
  const raw =
    root?.fridayPrayer ||
    root?.fridayKhutbah ||
    root?.khotibJumat ||
    root?.jadwalJumat ||
    root?.jumat ||
    {};

  return {
    hijriDate: raw.hijriDate || raw.tanggalHijriah || "19 Muharram 1448 H",
    gregorianDate: raw.gregorianDate || raw.tanggalMasehi || "Jumat, 8 Mei 2026",
    khatib: raw.khatib || raw.namaKhatib || "Ust. Ahmad Fauzi",
    bilal: raw.bilal || raw.namaBilal || "Muhammad Rizki",
    title:
      raw.title ||
      raw.judulKhutbah ||
      "Memakmurkan Masjid dan Menjaga Ukhuwah Jamaah",
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

function SectionCard({
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

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
    />
  );
}

export default function KeuanganPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingFinance, setSubmittingFinance] = useState(false);
  const [submittingArticle, setSubmittingArticle] = useState(false);
  const [submittingFriday, setSubmittingFriday] = useState(false);

  const [notice, setNotice] = useState("");

  const [financeItems, setFinanceItems] = useState<FinanceItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [friday, setFriday] = useState<FridaySchedule>({
    hijriDate: "19 Muharram 1448 H",
    gregorianDate: "Jumat, 8 Mei 2026",
    khatib: "Ust. Ahmad Fauzi",
    bilal: "Muhammad Rizki",
    title: "Memakmurkan Masjid dan Menjaga Ukhuwah Jamaah",
  });

  const [financeForm, setFinanceForm] = useState({
    bucket: "Kas Masjid",
    type: "Kas Masuk",
    date: todayInputValue(),
    description: "",
    amount: "",
    donor: "",
  });

  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    category: "Artikel",
    date: todayInputValue(),
    author: "Admin",
    image: "",
    publish: "Publish",
  });

  const [fridayForm, setFridayForm] = useState({
    hijriDate: "",
    gregorianDate: "",
    khatib: "",
    bilal: "",
    title: "",
  });

  const fetchAll = async (manual = false) => {
    if (!GAS_URL) {
      setLoading(false);
      setNotice("NEXT_PUBLIC_GAS_URL belum diisi.");
      return;
    }

    try {
      if (manual) {
        setRefreshing(true);
      }

      const res = await fetch(GAS_URL, { cache: "no-store" });
      const json = await res.json();

      const financeParsed = parseFinanceResponse(json);
      const articleParsed = parseArticleResponse(json);
      const fridayParsed = parseFridayResponse(json);

      if (financeParsed.length > 0) {
        setFinanceItems(financeParsed);
      }
      setArticles(articleParsed);
      setFriday(fridayParsed);
      setFridayForm({
        hijriDate: fridayParsed.hijriDate,
        gregorianDate: fridayParsed.gregorianDate,
        khatib: fridayParsed.khatib,
        bilal: fridayParsed.bilal,
        title: fridayParsed.title,
      });
    } catch (error) {
      console.error("Gagal memuat data:", error);
      setNotice("Gagal memuat data dari spreadsheet.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll(false);
  }, []);

  const financeBuckets = useMemo<FinanceBucket[]>(() => {
    const latest = sortByDateDesc(financeItems);

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
    return sortByDateDesc(articles)
      .filter((item) => item.published)
      .slice(0, 2);
  }, [articles]);

  async function postJson(payload: Record<string, unknown>) {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    return json;
  }

  async function handleSubmitFinance(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");

    if (!financeForm.description.trim()) {
      setNotice("Keterangan transaksi wajib diisi.");
      return;
    }

    const amount = parseNumberInput(financeForm.amount);
    if (amount <= 0) {
      setNotice("Nominal transaksi wajib diisi.");
      return;
    }

    try {
      setSubmittingFinance(true);

      const bucketMap: Record<string, string> = {
        "Kas Masjid": "kas_masjid",
        "Kas Pembangunan": "kas_pembangunan",
        "Kas Anak Yatim": "kas_anak_yatim",
      };

      const typeMap: Record<string, string> = {
        "Kas Masuk": "kas_masuk",
        "Kas Keluar": "kas_keluar",
      };

      const result = await postJson({
        action: "createFinance",
        id: `trx-${Date.now()}`,
        tanggal: financeForm.date,
        bucket: bucketMap[financeForm.bucket] || "kas_masjid",
        type: typeMap[financeForm.type] || "kas_masuk",
        keterangan: financeForm.description,
        jumlah: amount,
        donatur: financeForm.donor.trim(),
      });

      if (!result?.success) {
        throw new Error(result?.message || "Gagal menyimpan data keuangan.");
      }

      setNotice("Data keuangan berhasil disimpan.");
      setFinanceForm({
        bucket: "Kas Masjid",
        type: "Kas Masuk",
        date: todayInputValue(),
        description: "",
        amount: "",
        donor: "",
      });

      await fetchAll(true);
    } catch (error) {
      console.error(error);
      setNotice(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan data keuangan."
      );
    } finally {
      setSubmittingFinance(false);
    }
  }

  async function handleSubmitArticle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");

    if (!articleForm.title.trim()) {
      setNotice("Judul artikel wajib diisi.");
      return;
    }

    if (!articleForm.excerpt.trim()) {
      setNotice("Ringkasan artikel wajib diisi.");
      return;
    }

    try {
      setSubmittingArticle(true);

      const result = await postJson({
        action: "createArticle",
        id: `article-${Date.now()}`,
        title: articleForm.title,
        excerpt: articleForm.excerpt,
        category: articleForm.category,
        date: articleForm.date,
        author: articleForm.author,
        image: articleForm.image,
        isPublished: articleForm.publish === "Publish",
      });

      if (!result?.success) {
        throw new Error(result?.message || "Gagal menyimpan artikel.");
      }

      setNotice("Artikel berhasil disimpan.");
      setArticleForm({
        title: "",
        excerpt: "",
        category: "Artikel",
        date: todayInputValue(),
        author: "Admin",
        image: "",
        publish: "Publish",
      });

      await fetchAll(true);
    } catch (error) {
      console.error(error);
      setNotice(
        error instanceof Error ? error.message : "Gagal menyimpan artikel."
      );
    } finally {
      setSubmittingArticle(false);
    }
  }

  async function handleSubmitFriday(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNotice("");

    if (!fridayForm.khatib.trim()) {
      setNotice("Nama khatib wajib diisi.");
      return;
    }

    try {
      setSubmittingFriday(true);

      const result = await postJson({
        action: "updateFridayKhutbah",
        tanggalHijriah: fridayForm.hijriDate,
        tanggalMasehi: fridayForm.gregorianDate,
        khotib: fridayForm.khatib,
        bilal: fridayForm.bilal,
        judulKhutbah: fridayForm.title,
      });

      if (!result?.success) {
        throw new Error(result?.message || "Gagal menyimpan jadwal Jumat.");
      }

      setNotice("Jadwal khotib Jumat berhasil diperbarui.");
      await fetchAll(true);
    } catch (error) {
      console.error(error);
      setNotice(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan jadwal khotib Jumat."
      );
    } finally {
      setSubmittingFriday(false);
    }
  }

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
        {notice ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {notice}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Pemasukan"
            value={loading ? "Memuat..." : formatRupiah(totals.income)}
            tone="green"
          />
          <StatCard
            title="Total Pengeluaran"
            value={loading ? "Memuat..." : formatRupiah(totals.expense)}
            tone="red"
          />
          <StatCard
            title="Saldo Aktif"
            value={loading ? "Memuat..." : formatRupiah(totals.balance)}
          />
          <StatCard
            title="Total Donasi"
            value={loading ? "Memuat..." : formatRupiah(totals.donation)}
            tone="yellow"
          />
        </div>

        <div className="mt-6">
          <SectionCard
            icon={<Landmark className="h-5 w-5" />}
            eyebrow="Input Admin"
            title="Tambah Data Keuangan"
          >
            <form onSubmit={handleSubmitFinance}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kategori Kas
                  </label>
                  <Select
                    value={financeForm.bucket}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        bucket: e.target.value,
                      }))
                    }
                  >
                    <option>Kas Masjid</option>
                    <option>Kas Pembangunan</option>
                    <option>Kas Anak Yatim</option>
                  </Select>
                </div>

                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Jenis Transaksi
                  </label>
                  <Select
                    value={financeForm.type}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                  >
                    <option>Kas Masuk</option>
                    <option>Kas Keluar</option>
                  </Select>
                </div>

                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={financeForm.date}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Keterangan
                  </label>
                  <Input
                    placeholder="Contoh: Infaq Jumat"
                    value={financeForm.description}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nominal
                  </label>
                  <Input
                    placeholder="Contoh: 1.000.000"
                    inputMode="numeric"
                    value={financeForm.amount}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        amount: formatNumberInput(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Donatur
                  </label>
                  <Input
                    placeholder="Kosongkan jika tidak ada"
                    value={financeForm.donor}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        donor: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submittingFinance}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    {submittingFinance ? "Menyimpan..." : "Simpan Data"}
                  </button>
                </div>
              </div>
            </form>
          </SectionCard>
        </div>

        <div className="mt-8 space-y-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <section
                key={index}
                className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm animate-pulse"
              >
                <div className="h-8 w-48 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-32 rounded bg-slate-200" />
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="mt-3 h-6 w-32 rounded bg-slate-200" />
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="mt-3 h-6 w-32 rounded bg-slate-200" />
                  </div>
                  <div className="rounded-2xl bg-slate-100 p-4">
                    <div className="h-3 w-16 rounded bg-slate-200" />
                    <div className="mt-3 h-6 w-32 rounded bg-slate-200" />
                  </div>
                </div>
              </section>
            ))
          ) : (
            financeBuckets.map((bucket) => (
              <FinanceBucketCard key={bucket.category} bucket={bucket} />
            ))
          )}
        </div>

        <div className="mt-8 grid gap-8">
          <SectionCard
            icon={<Newspaper className="h-5 w-5" />}
            eyebrow="Kelola Artikel"
            title="Tambah Artikel"
          >
            <form onSubmit={handleSubmitArticle}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div className="md:col-span-2 xl:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Judul
                  </label>
                  <Input
                    value={articleForm.title}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Kategori
                  </label>
                  <Input
                    placeholder="Artikel"
                    value={articleForm.category}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={articleForm.date}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Penulis
                  </label>
                  <Input
                    placeholder="Admin"
                    value={articleForm.author}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="xl:col-span-1">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status Publish
                  </label>
                  <Select
                    value={articleForm.publish}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        publish: e.target.value,
                      }))
                    }
                  >
                    <option>Publish</option>
                    <option>Draft</option>
                  </Select>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ringkasan
                  </label>
                  <Textarea
                    rows={4}
                    value={articleForm.excerpt}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        excerpt: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      URL Gambar
                    </label>
                    <Input
                      placeholder="Opsional"
                      value={articleForm.image}
                      onChange={(e) =>
                        setArticleForm((prev) => ({
                          ...prev,
                          image: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="mt-auto">
                    <button
                      type="submit"
                      disabled={submittingArticle}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Save className="h-4 w-4" />
                      {submittingArticle ? "Menyimpan..." : "Simpan Artikel"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            icon={<CalendarDays className="h-5 w-5" />}
            eyebrow="Update Khotib Jumat"
            title="Jadwal Jumat"
          >
            <form onSubmit={handleSubmitFriday}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tanggal Hijriah
                  </label>
                  <Input
                    value={fridayForm.hijriDate}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        hijriDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tanggal Masehi
                  </label>
                  <Input
                    value={fridayForm.gregorianDate}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        gregorianDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nama Khatib
                  </label>
                  <Input
                    value={fridayForm.khatib}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        khatib: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nama Bilal
                  </label>
                  <Input
                    value={fridayForm.bilal}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        bilal: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submittingFriday}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" />
                    {submittingFriday ? "Menyimpan..." : "Simpan Jadwal Jumat"}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Judul Khutbah
                </label>
                <Textarea
                  rows={3}
                  value={fridayForm.title}
                  onChange={(e) =>
                    setFridayForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
            </form>
          </SectionCard>
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
                    <h4 className="mt-3 text-xl font-bold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.excerpt}
                    </p>
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

        <div className="mt-6">
          <button
            type="button"
            onClick={() => fetchAll(true)}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {loading ? "Memuat data..." : refreshing ? "Menyegarkan..." : "Refresh Data"}
          </button>
        </div>
      </section>
    </main>
  );
}