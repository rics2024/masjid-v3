"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookText,
  CalendarDays,
  Landmark,
  Save,
} from "lucide-react";

type FinanceBucketKey = "kasMasjid" | "kasPembangunan" | "kasAnakYatim";
type FinanceType = "masuk" | "keluar";

type JsonRecord = Record<string, unknown>;

type FinanceItem = {
  id: string;
  date: string;
  bucket: FinanceBucketKey;
  type: FinanceType;
  amount: number;
  description: string;
  donor?: string;
};

type BucketSummary = {
  key: FinanceBucketKey;
  label: string;
  incoming: number;
  outgoing: number;
  balance: number;
  recent: FinanceItem[];
};

type ArticleItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  image?: string;
  link?: string;
  isPublished: boolean;
};

type FridayKhutbah = {
  hijriDate: string;
  gregorianDate: string;
  khatib: string;
  bilal: string;
  title: string;
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";

const fallbackFridayKhutbah: FridayKhutbah = {
  hijriDate: "19 Muharram 1448 H",
  gregorianDate: "Jumat, 8 Mei 2026",
  khatib: "Ust. Ahmad Fauzi",
  bilal: "Muhammad Rizki",
  title: "Memakmurkan Masjid dan Menjaga Ukhuwah Jamaah",
};

const fallbackArticles: ArticleItem[] = [
  {
    id: "article-1",
    title: "Kajian Subuh Ahad bersama Ustadz Ahmad",
    excerpt:
      "Kajian rutin Ahad pagi membahas pentingnya menjaga shalat berjamaah dan adab di masjid.",
    category: "Kajian",
    date: "2026-04-21",
    author: "Admin",
    image:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
    link: "#",
    isPublished: true,
  },
  {
    id: "article-2",
    title: "Laporan Keuangan Triwulan Pertama telah terbit",
    excerpt:
      "Ringkasan pemasukan, pengeluaran, dan saldo masjid kini dapat dilihat jamaah secara lebih terbuka.",
    category: "Pengumuman",
    date: "2026-04-19",
    author: "Admin",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    link: "#",
    isPublished: true,
  },
];

const fallbackFinanceItems: FinanceItem[] = [
  {
    id: "1",
    date: "2026-04-29",
    bucket: "kasMasjid",
    type: "masuk",
    amount: 5_000_000,
    description: "Infaq Jumat",
  },
  {
    id: "2",
    date: "2026-04-26",
    bucket: "kasMasjid",
    type: "keluar",
    amount: 300_000,
    description: "Pembelian alat kebersihan",
  },
  {
    id: "3",
    date: "2026-04-28",
    bucket: "kasPembangunan",
    type: "masuk",
    amount: 10_000_000,
    description: "Donasi pembangunan",
    donor: "Ahmad Fauzi",
  },
  {
    id: "4",
    date: "2026-04-17",
    bucket: "kasAnakYatim",
    type: "masuk",
    amount: 3_000_000,
    description: "Santunan jamaah",
    donor: "Siti Aminah",
  },
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;

  let text = value.trim();
  if (!text) return 0;

  text = text.replace(/Rp/gi, "").replace(/\s/g, "");

  if (text.includes(".") && text.includes(",")) {
    if (text.lastIndexOf(",") > text.lastIndexOf(".")) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      text = text.replace(/,/g, "");
    }
  } else {
    text = text.replace(/\./g, "").replace(/,/g, "");
  }

  text = text.replace(/[^\d-]/g, "");
  const num = Number(text);
  return Number.isFinite(num) ? num : 0;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumberInput(value: string): string {
  const onlyDigits = value.replace(/[^\d]/g, "");
  if (!onlyDigits) return "";
  return new Intl.NumberFormat("id-ID").format(Number(onlyDigits));
}

function parseNumberInput(value: string): number {
  return Number(value.replace(/[^\d]/g, "")) || 0;
}

function parseDateValue(value: string): Date {
  if (!value) return new Date("2000-01-01");

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const d = new Date(trimmed);
    if (!Number.isNaN(d.getTime())) return d;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split("/");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(d.getTime())) return d;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(d.getTime())) return d;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  return new Date("2000-01-01");
}

function formatIndoDate(value: string): string {
  const date = parseDateValue(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatInputDate(value: string): string {
  const date = parseDateValue(value);
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeBucket(value: unknown): FinanceBucketKey {
  const text = String(value ?? "").toLowerCase();

  if (
    text.includes("pembangunan") ||
    text.includes("renovasi") ||
    text.includes("bangun")
  ) {
    return "kasPembangunan";
  }

  if (text.includes("yatim")) {
    return "kasAnakYatim";
  }

  return "kasMasjid";
}

function normalizeType(value: unknown): FinanceType {
  const text = String(value ?? "").toLowerCase();

  if (
    text.includes("keluar") ||
    text.includes("pengeluaran") ||
    text.includes("debit")
  ) {
    return "keluar";
  }

  return "masuk";
}

function normalizeFinanceItems(raw: unknown[]): FinanceItem[] {
  return raw
    .map((entry, index): FinanceItem | null => {
      if (!isRecord(entry)) return null;

      const rawMasuk = toNumber(
        entry.kasMasuk ?? entry.masuk ?? entry.amountMasuk
      );
      const rawKeluar = toNumber(
        entry.kasKeluar ?? entry.keluar ?? entry.amountKeluar
      );

      let type: FinanceType = normalizeType(
        entry.type ?? entry.jenis ?? entry.status
      );
      let amount = toNumber(entry.amount ?? entry.nominal ?? entry.jumlah);

      if (rawMasuk > 0 || rawKeluar > 0) {
        if (rawMasuk > 0) {
          type = "masuk";
          amount = rawMasuk;
        } else {
          type = "keluar";
          amount = rawKeluar;
        }
      }

      return {
        id: String(entry.id ?? `finance-${index}`),
        date: String(entry.date ?? entry.tanggal ?? entry.createdAt ?? ""),
        bucket: normalizeBucket(
          entry.bucket ?? entry.kategori ?? entry.kas ?? entry.financeGroup
        ),
        type,
        amount,
        description: String(
          entry.description ?? entry.keterangan ?? entry.title ?? "-"
        ),
        donor: entry.donor ? String(entry.donor) : "",
      };
    })
    .filter((item): item is FinanceItem => item !== null && item.amount > 0)
    .sort(
      (a, b) => parseDateValue(b.date).getTime() - parseDateValue(a.date).getTime()
    );
}

function normalizeArticles(raw: unknown[]): ArticleItem[] {
  return raw
    .map((entry, index): ArticleItem | null => {
      if (!isRecord(entry)) return null;

      const publishValue = String(
        entry.isPublished ?? entry.publish ?? entry.published ?? "true"
      ).toLowerCase();

      return {
        id: String(entry.id ?? `article-${index}`),
        title: String(entry.title ?? entry.judul ?? ""),
        excerpt: String(entry.excerpt ?? entry.ringkasan ?? entry.summary ?? ""),
        category: String(entry.category ?? entry.kategori ?? "Artikel"),
        date: String(entry.date ?? entry.tanggal ?? ""),
        author: String(entry.author ?? entry.penulis ?? "Admin"),
        image: String(
          entry.image ??
            entry.gambar ??
            "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80"
        ),
        link: String(entry.link ?? entry.url ?? "#"),
        isPublished:
          publishValue === "true" ||
          publishValue === "1" ||
          publishValue === "yes",
      };
    })
    .filter(
      (item): item is ArticleItem => item !== null && item.isPublished && !!item.title
    )
    .sort(
      (a, b) => parseDateValue(b.date).getTime() - parseDateValue(a.date).getTime()
    );
}

function normalizeFridayKhutbah(value: unknown): FridayKhutbah | null {
  if (!isRecord(value)) return null;

  return {
    hijriDate: String(
      value.hijriDate ??
        value.tanggalHijriyah ??
        value.tanggalHijriah ??
        fallbackFridayKhutbah.hijriDate
    ),
    gregorianDate: String(
      value.gregorianDate ??
        value.tanggalMasehi ??
        fallbackFridayKhutbah.gregorianDate
    ),
    khatib: String(
      value.khatib ?? value.namaKhatib ?? fallbackFridayKhutbah.khatib
    ),
    bilal: String(value.bilal ?? value.namaBilal ?? fallbackFridayKhutbah.bilal),
    title: String(
      value.title ?? value.judulKhutbah ?? value.tema ?? fallbackFridayKhutbah.title
    ),
  };
}

function getBucketLabel(key: FinanceBucketKey): string {
  if (key === "kasPembangunan") return "Kas Pembangunan";
  if (key === "kasAnakYatim") return "Kas Anak Yatim";
  return "Kas Masjid";
}

function buildBucketSummaries(items: FinanceItem[]): BucketSummary[] {
  const keys: FinanceBucketKey[] = [
    "kasMasjid",
    "kasPembangunan",
    "kasAnakYatim",
  ];

  return keys.map((key) => {
    const bucketItems = items.filter((item) => item.bucket === key);
    const incoming = bucketItems
      .filter((item) => item.type === "masuk")
      .reduce((sum, item) => sum + item.amount, 0);

    const outgoing = bucketItems
      .filter((item) => item.type === "keluar")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      key,
      label: getBucketLabel(key),
      incoming,
      outgoing,
      balance: incoming - outgoing,
      recent: bucketItems.slice(0, 10),
    };
  });
}

function FinanceBucketCard({ bucket }: { bucket: BucketSummary }) {
  return (
    <section className="rounded-[30px] bg-white p-5 shadow-[0_25px_70px_-50px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[30px] font-bold leading-tight text-slate-900">
            {bucket.label}
          </h3>
          <p className="mt-1 text-[15px] text-slate-500">
            {bucket.recent.length} transaksi terbaru
          </p>
        </div>
        <div className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700">
          Live
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-emerald-700/80">
            Masuk
          </p>
          <p className="mt-2 break-words text-[22px] font-bold text-slate-900">
            {formatRupiah(bucket.incoming)}
          </p>
        </div>
        <div className="rounded-2xl bg-rose-50 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-rose-700/80">
            Keluar
          </p>
          <p className="mt-2 break-words text-[22px] font-bold text-slate-900">
            {formatRupiah(bucket.outgoing)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Saldo
          </p>
          <p className="mt-2 break-words text-[22px] font-bold text-slate-900">
            {formatRupiah(bucket.balance)}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-slate-100">
        <table className="min-w-[760px] w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Tanggal
              </th>
              <th className="px-4 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Kas Masuk
              </th>
              <th className="px-4 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Kas Keluar
              </th>
              <th className="px-4 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Keterangan
              </th>
              <th className="px-4 py-4 text-[13px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Donatur
              </th>
            </tr>
          </thead>
          <tbody>
            {bucket.recent.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-[15px] text-slate-500">
                  Belum ada data transaksi.
                </td>
              </tr>
            ) : (
              bucket.recent.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-4 text-[15px] text-slate-700">
                    {formatIndoDate(item.date)}
                  </td>
                  <td className="px-4 py-4 text-[15px] font-semibold text-emerald-700">
                    {item.type === "masuk" ? formatRupiah(item.amount) : "-"}
                  </td>
                  <td className="px-4 py-4 text-[15px] font-semibold text-rose-700">
                    {item.type === "keluar" ? formatRupiah(item.amount) : "-"}
                  </td>
                  <td className="px-4 py-4 text-[15px] text-slate-700">
                    {item.description}
                  </td>
                  <td className="px-4 py-4 text-[15px] text-slate-500">
                    {item.donor || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function KeuanganPage() {
  const [financeItems, setFinanceItems] = useState<FinanceItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [fridayKhutbah, setFridayKhutbah] =
    useState<FridayKhutbah>(fallbackFridayKhutbah);
  const [loading, setLoading] = useState(true);
  const [saveInfo, setSaveInfo] = useState("");

  const [financeForm, setFinanceForm] = useState({
    bucket: "kasMasjid" as FinanceBucketKey,
    type: "masuk" as FinanceType,
    date: formatInputDate(new Date().toISOString()),
    description: "",
    amount: "",
    donor: "",
  });

  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    category: "Artikel",
    date: formatInputDate(new Date().toISOString()),
    author: "Admin",
    image: "",
    isPublished: true,
  });

  const [fridayForm, setFridayForm] =
    useState<FridayKhutbah>(fallbackFridayKhutbah);

  useEffect(() => {
    const gasUrl = process.env.NEXT_PUBLIC_GAS_URL?.trim();

    if (!gasUrl) {
      setFinanceItems(fallbackFinanceItems);
      setArticles(fallbackArticles);
      setFridayKhutbah(fallbackFridayKhutbah);
      setFridayForm(fallbackFridayKhutbah);
      setLoading(false);
      return;
    }

    const loadAll = async () => {
      try {
        const response = await fetch(gasUrl, {
          method: "GET",
          cache: "no-store",
        });

        const json = await response.json();
        const root = (json?.data ?? json) as unknown;

        if (isRecord(root)) {
          const financeRaw =
            root.financeItems ??
            root.transactions ??
            root.transaksi ??
            root.keuangan ??
            root.finance ??
            root.items;

          const financeNormalized = normalizeFinanceItems(
            toArray<unknown>(financeRaw)
          );
          setFinanceItems(
            financeNormalized.length > 0 ? financeNormalized : fallbackFinanceItems
          );

          const articleRaw =
            root.articles ?? root.artikel ?? root.posts ?? root.berita;
          const articleNormalized = normalizeArticles(toArray<unknown>(articleRaw));
          setArticles(
            articleNormalized.length > 0 ? articleNormalized : fallbackArticles
          );

          const fridayRaw =
            root.fridayKhutbah ??
            root.khotibJumat ??
            root.jadwalJumat ??
            root.fridaySchedule;
          const fridayNormalized = normalizeFridayKhutbah(fridayRaw);

          const finalFriday = fridayNormalized ?? fallbackFridayKhutbah;
          setFridayKhutbah(finalFriday);
          setFridayForm(finalFriday);
        } else {
          setFinanceItems(fallbackFinanceItems);
          setArticles(fallbackArticles);
          setFridayKhutbah(fallbackFridayKhutbah);
          setFridayForm(fallbackFridayKhutbah);
        }
      } catch (error) {
        console.error("Gagal mengambil data admin:", error);
        setFinanceItems(fallbackFinanceItems);
        setArticles(fallbackArticles);
        setFridayKhutbah(fallbackFridayKhutbah);
        setFridayForm(fallbackFridayKhutbah);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const bucketSummaries = useMemo(() => {
    return buildBucketSummaries(financeItems);
  }, [financeItems]);

  const totals = useMemo(() => {
    const incoming = bucketSummaries.reduce((sum, item) => sum + item.incoming, 0);
    const outgoing = bucketSummaries.reduce((sum, item) => sum + item.outgoing, 0);
    return {
      incoming,
      outgoing,
      balance: incoming - outgoing,
      donation:
        (bucketSummaries.find((item) => item.key === "kasPembangunan")?.incoming ?? 0) +
        (bucketSummaries.find((item) => item.key === "kasAnakYatim")?.incoming ?? 0),
    };
  }, [bucketSummaries]);

  async function postToGas(payload: Record<string, unknown>) {
    if (!GAS_URL) {
      throw new Error("NEXT_PUBLIC_GAS_URL belum diisi.");
    }

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

  async function handleFinanceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveInfo("");

    try {
      const payload = {
        action: "createFinance",
        id: `finance-${Date.now()}`,
        tanggal: financeForm.date,
        bucket:
          financeForm.bucket === "kasMasjid"
            ? "kas masjid"
            : financeForm.bucket === "kasPembangunan"
            ? "kas pembangunan"
            : "kas anak yatim",
        type: financeForm.type,
        keterangan: financeForm.description,
        jumlah: parseNumberInput(financeForm.amount),
        donatur: financeForm.donor,
      };

      await postToGas(payload);
      setSaveInfo("Data keuangan berhasil dikirim. Refresh halaman setelah data masuk.");
      setFinanceForm({
        bucket: "kasMasjid",
        type: "masuk",
        date: formatInputDate(new Date().toISOString()),
        description: "",
        amount: "",
        donor: "",
      });
    } catch (error) {
      setSaveInfo(
        error instanceof Error ? error.message : "Gagal menyimpan data keuangan."
      );
    }
  }

  async function handleArticleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveInfo("");

    try {
      await postToGas({
        action: "createArticle",
        id: `article-${Date.now()}`,
        title: articleForm.title,
        excerpt: articleForm.excerpt,
        category: articleForm.category,
        date: articleForm.date,
        author: articleForm.author,
        image: articleForm.image,
        isPublished: articleForm.isPublished,
      });

      setSaveInfo("Artikel berhasil dikirim. Refresh halaman setelah data masuk.");
      setArticleForm({
        title: "",
        excerpt: "",
        category: "Artikel",
        date: formatInputDate(new Date().toISOString()),
        author: "Admin",
        image: "",
        isPublished: true,
      });
    } catch (error) {
      setSaveInfo(
        error instanceof Error ? error.message : "Gagal menyimpan artikel."
      );
    }
  }

  async function handleFridaySubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveInfo("");

    try {
      await postToGas({
        action: "updateFridayKhutbah",
        tanggalHijriah: fridayForm.hijriDate,
        tanggalMasehi: fridayForm.gregorianDate,
        khotib: fridayForm.khatib,
        bilal: fridayForm.bilal,
        judulKhutbah: fridayForm.title,
      });

      setSaveInfo("Data khotib Jumat berhasil diperbarui.");
      setFridayKhutbah(fridayForm);
    } catch (error) {
      setSaveInfo(
        error instanceof Error ? error.message : "Gagal memperbarui data khotib Jumat."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f6faf8] text-slate-900">
      <section className="border-b border-emerald-100 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
                Laporan Keuangan
              </p>
              <h1 className="mt-3 text-[40px] font-bold leading-tight sm:text-[48px]">
                Kas & Donasi Masjid
              </h1>
              <p className="mt-4 max-w-3xl text-[17px] leading-8 text-emerald-50/90">
                Halaman admin untuk mengelola data keuangan, artikel terbaru,
                dan jadwal khotib Jumat Langgar Kidoel.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-45px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Total Pemasukan
            </p>
            <p className="mt-3 break-words text-[34px] font-bold text-slate-900">
              {formatRupiah(totals.incoming)}
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-45px_rgba(244,63,94,0.2)] ring-1 ring-rose-100">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-rose-700">
              Total Pengeluaran
            </p>
            <p className="mt-3 break-words text-[34px] font-bold text-slate-900">
              {formatRupiah(totals.outgoing)}
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-45px_rgba(16,185,129,0.25)] ring-1 ring-slate-100">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              Saldo Aktif
            </p>
            <p className="mt-3 break-words text-[34px] font-bold text-slate-900">
              {formatRupiah(totals.balance)}
            </p>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[0_24px_60px_-45px_rgba(249,115,22,0.2)] ring-1 ring-amber-100">
            <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-amber-700">
              Total Donasi
            </p>
            <p className="mt-3 break-words text-[34px] font-bold text-slate-900">
              {formatRupiah(totals.donation)}
            </p>
          </div>
        </div>

        {saveInfo ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[15px] text-emerald-800">
            {saveInfo}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {loading ? (
              <div className="rounded-[30px] bg-white p-6 ring-1 ring-emerald-100">
                Memuat data...
              </div>
            ) : (
              bucketSummaries.map((bucket) => (
                <FinanceBucketCard key={bucket.key} bucket={bucket} />
              ))
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_60px_-45px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100">
              <div className="mb-5 flex items-center gap-3">
                <Save className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Input Admin
                  </p>
                  <h2 className="text-[28px] font-bold text-slate-900">
                    Tambah Data Keuangan
                  </h2>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleFinanceSubmit}>
                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Kategori Kas
                  </label>
                  <select
                    value={financeForm.bucket}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        bucket: e.target.value as FinanceBucketKey,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  >
                    <option value="kasMasjid">Kas Masjid</option>
                    <option value="kasPembangunan">Kas Pembangunan</option>
                    <option value="kasAnakYatim">Kas Anak Yatim</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Jenis Transaksi
                  </label>
                  <select
                    value={financeForm.type}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        type: e.target.value as FinanceType,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  >
                    <option value="masuk">Kas Masuk</option>
                    <option value="keluar">Kas Keluar</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={financeForm.date}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Keterangan
                  </label>
                  <input
                    type="text"
                    value={financeForm.description}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Donasi renovasi"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Nominal
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={financeForm.amount}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        amount: formatNumberInput(e.target.value),
                      }))
                    }
                    placeholder="Contoh: 1.000.000"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Donatur
                  </label>
                  <input
                    type="text"
                    value={financeForm.donor}
                    onChange={(e) =>
                      setFinanceForm((prev) => ({
                        ...prev,
                        donor: e.target.value,
                      }))
                    }
                    placeholder="Kosongkan jika tidak ada"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  Simpan Data
                </button>
              </form>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_60px_-45px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100">
              <div className="mb-5 flex items-center gap-3">
                <BookText className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Kelola Artikel
                  </p>
                  <h2 className="text-[28px] font-bold text-slate-900">
                    Tambah Artikel
                  </h2>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleArticleSubmit}>
                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Judul
                  </label>
                  <input
                    type="text"
                    value={articleForm.title}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Ringkasan
                  </label>
                  <textarea
                    rows={4}
                    value={articleForm.excerpt}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        excerpt: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                      Kategori
                    </label>
                    <input
                      type="text"
                      value={articleForm.category}
                      onChange={(e) =>
                        setArticleForm((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={articleForm.date}
                      onChange={(e) =>
                        setArticleForm((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                      Penulis
                    </label>
                    <input
                      type="text"
                      value={articleForm.author}
                      onChange={(e) =>
                        setArticleForm((prev) => ({
                          ...prev,
                          author: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                      Status Publish
                    </label>
                    <select
                      value={articleForm.isPublished ? "true" : "false"}
                      onChange={(e) =>
                        setArticleForm((prev) => ({
                          ...prev,
                          isPublished: e.target.value === "true",
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                    >
                      <option value="true">Publish</option>
                      <option value="false">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    URL Gambar
                  </label>
                  <input
                    type="text"
                    value={articleForm.image}
                    onChange={(e) =>
                      setArticleForm((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    placeholder="Opsional"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  Simpan Artikel
                </button>
              </form>
            </section>

            <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_60px_-45px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100">
              <div className="mb-5 flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Update Khotib Jumat
                  </p>
                  <h2 className="text-[28px] font-bold text-slate-900">
                    Jadwal Jumat
                  </h2>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleFridaySubmit}>
                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Tanggal Hijriah
                  </label>
                  <input
                    type="text"
                    value={fridayForm.hijriDate}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        hijriDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Tanggal Masehi
                  </label>
                  <input
                    type="text"
                    value={fridayForm.gregorianDate}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        gregorianDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Nama Khatib
                  </label>
                  <input
                    type="text"
                    value={fridayForm.khatib}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        khatib: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Nama Bilal
                  </label>
                  <input
                    type="text"
                    value={fridayForm.bilal}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        bilal: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[14px] font-semibold text-slate-700">
                    Judul Khutbah
                  </label>
                  <textarea
                    rows={3}
                    value={fridayForm.title}
                    onChange={(e) =>
                      setFridayForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-emerald-400"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[15px] font-semibold text-white transition hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" />
                  Simpan Jadwal Jumat
                </button>
              </form>
            </section>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_60px_-45px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100">
            <div className="mb-4 flex items-center gap-3">
              <BookText className="h-5 w-5 text-emerald-600" />
              <h3 className="text-[26px] font-bold text-slate-900">
                Artikel Terbaru
              </h3>
            </div>

            <div className="space-y-4">
              {(articles.length > 0 ? articles : fallbackArticles)
                .slice(0, 5)
                .map((article) => (
                  <div key={article.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700">
                        {article.category}
                      </span>
                      <span className="text-[13px] text-slate-500">
                        {formatIndoDate(article.date)}
                      </span>
                    </div>
                    <h4 className="mt-3 text-[20px] font-bold leading-snug text-slate-900">
                      {article.title}
                    </h4>
                    <p className="mt-2 text-[15px] leading-7 text-slate-600">
                      {article.excerpt}
                    </p>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-[30px] bg-white p-6 shadow-[0_24px_60px_-45px_rgba(16,185,129,0.35)] ring-1 ring-emerald-100">
            <div className="mb-4 flex items-center gap-3">
              <Landmark className="h-5 w-5 text-emerald-600" />
              <h3 className="text-[26px] font-bold text-slate-900">
                Jadwal Khotib Jumat Aktif
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Tanggal Hijriah
                </p>
                <p className="mt-2 text-[18px] font-semibold text-slate-900">
                  {fridayKhutbah.hijriDate}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Tanggal Masehi
                </p>
                <p className="mt-2 text-[18px] font-semibold text-slate-900">
                  {fridayKhutbah.gregorianDate}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Khatib
                </p>
                <p className="mt-2 text-[18px] font-semibold text-slate-900">
                  {fridayKhutbah.khatib}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Bilal
                </p>
                <p className="mt-2 text-[18px] font-semibold text-slate-900">
                  {fridayKhutbah.bilal}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Judul Khutbah
              </p>
              <p className="mt-2 text-[18px] font-semibold leading-snug text-slate-900">
                {fridayKhutbah.title}
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}