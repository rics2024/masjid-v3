"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  HeartHandshake,
  Landmark,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  RefreshCw,
  Wallet,
  X,
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

type PrayerTimes = {
  subuh: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  terbit: string;
};

type DailyVerse = {
  arabic: string;
  latin: string;
  translation: string;
  source: string;
};

type FridayKhutbah = {
  hijriDate: string;
  gregorianDate: string;
  khatib: string;
  bilal: string;
  title: string;
};

const navItems = [
  { label: "Beranda", href: "#beranda" },
  { label: "Program", href: "#program" },
  { label: "Galeri", href: "#berita" },
  { label: "Keuangan", href: "/keuangan" },
  { label: "Kontak", href: "#kontak" },
];

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

const fallbackFridayKhutbah: FridayKhutbah = {
  hijriDate: "19 Muharram 1448 H",
  gregorianDate: "Jumat, 8 Mei 2026",
  khatib: "Ust. Ahmad Fauzi",
  bilal: "Muhammad Rizki",
  title: "Memakmurkan Masjid dan Menjaga Ukhuwah Jamaah",
};

const fallbackPrayerTimes: PrayerTimes = {
  subuh: "04:27",
  dzuhur: "11:43",
  ashar: "15:05",
  maghrib: "17:39",
  isya: "18:50",
  terbit: "05:47",
};

const fallbackFinanceItems: FinanceItem[] = [
  {
    id: "1",
    date: "2026-04-29",
    bucket: "kasMasjid",
    type: "masuk",
    description: "Infaq Jumat",
    amount: 5_000_000,
  },
  {
    id: "2",
    date: "2026-04-26",
    bucket: "kasMasjid",
    type: "keluar",
    description: "Pembelian alat kebersihan",
    amount: 300_000,
  },
  {
    id: "3",
    date: "2026-04-28",
    bucket: "kasPembangunan",
    type: "masuk",
    description: "Donasi pembangunan",
    amount: 10_000_000,
    donor: "Kumis Ganteng",
  },
  {
    id: "4",
    date: "2026-04-27",
    bucket: "kasAnakYatim",
    type: "masuk",
    description: "Donasi anak yatim",
    amount: 3_000_000,
    donor: "Encing",
  },
  {
    id: "5",
    date: "2026-04-25",
    bucket: "kasMasjid",
    type: "keluar",
    description: "Bayar listrik",
    amount: 300_000,
  },
];

const dailyVerses: DailyVerse[] = [
  {
    arabic:
      "إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ",
    latin:
      "Innama ya'muru masajidallahi man amana billahi wal-yaumil akhir.",
    translation:
      "Sesungguhnya yang memakmurkan masjid-masjid Allah hanyalah orang-orang yang beriman kepada Allah dan hari kemudian.",
    source: "QS. At-Taubah: 18",
  },
  {
    arabic:
      "وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ",
    latin: "Wa aqimush-shalata wa atuz-zakata warka'u ma'ar-raki'in.",
    translation:
      "Dirikanlah shalat, tunaikanlah zakat, dan rukuklah bersama orang-orang yang rukuk.",
    source: "QS. Al-Baqarah: 43",
  },
  {
    arabic:
      "وَأَنَّ الْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ اللَّهِ أَحَدًا",
    latin: "Wa annal masajida lillahi fala tad'u ma'allahi ahada.",
    translation:
      "Dan sesungguhnya masjid-masjid itu milik Allah, maka janganlah kamu menyembah seseorang pun di dalamnya di samping Allah.",
    source: "QS. Al-Jinn: 18",
  },
  {
    arabic:
      "مَنْ بَنَى لِلَّهِ مَسْجِدًا بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ",
    latin: "Man bana lillahi masjidan banallahu lahu baitan fil jannah.",
    translation:
      "Barang siapa membangun masjid karena Allah, maka Allah akan bangunkan baginya rumah di surga.",
    source: "HR. Bukhari & Muslim",
  },
  {
    arabic: "أَحَبُّ الْبِلَادِ إِلَى اللَّهِ مَسَاجِدُهَا",
    latin: "Ahabbul biladi ilallahi masajiduha.",
    translation: "Tempat yang paling dicintai Allah adalah masjid-masjidnya.",
    source: "HR. Muslim",
  },
  {
    arabic: "خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ",
    latin: "Khairun-nasi anfa'uhum lin-nas.",
    translation:
      "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.",
    source: "HR. Ahmad",
  },
  {
    arabic: "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى",
    latin: "Wa ta'awanu 'alal birri wat-taqwa.",
    translation:
      "Dan tolong-menolonglah kamu dalam kebaikan dan ketakwaan.",
    source: "QS. Al-Ma'idah: 2",
  },
];

const programCatalog = [
  {
    title: "Renovasi Langgar Kidoel",
    description:
      "Pengembangan area ibadah, perbaikan fasilitas wudhu, dan peningkatan ruang kegiatan jamaah.",
    target: 50_000_000,
    bucket: "kasPembangunan" as FinanceBucketKey,
    badge: "Aktif",
  },
  {
    title: "Santunan Anak Yatim",
    description:
      "Program santunan bulanan untuk anak-anak yatim dan keluarga yang membutuhkan di sekitar masjid.",
    target: 15_000_000,
    bucket: "kasAnakYatim" as FinanceBucketKey,
    badge: "Aktif",
  },
  {
    title: "Beasiswa Tahfidz",
    description:
      "Dukungan pendidikan bagi santri penghafal Al-Qur'an agar lebih fokus belajar dan berprestasi.",
    target: 50_000_000,
    bucket: "kasMasjid" as FinanceBucketKey,
    badge: "Aktif",
  },
];

const galleryItems = [
  {
    id: "gallery-1",
    title: "Kajian Subuh Ahad",
    date: "21 April 2026",
    image:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "gallery-2",
    title: "Santunan Anak Yatim",
    date: "19 April 2026",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "gallery-3",
    title: "Kerja Bakti Masjid",
    date: "17 April 2026",
    image:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1200&q=80",
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

function formatCompactRupiah(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".", ",")} Jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)} Rb`;
  }
  return formatRupiah(value);
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

function formatShortDate(value: string): string {
  const date = parseDateValue(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeBucket(value: unknown): FinanceBucketKey {
  const text = String(value ?? "").toLowerCase();

  if (
    text.includes("kas_pembangunan") ||
    text.includes("pembangunan") ||
    text.includes("renovasi") ||
    text.includes("bangun")
  ) {
    return "kasPembangunan";
  }

  if (
    text.includes("kas_anak_yatim") ||
    text.includes("anak_yatim") ||
    text.includes("yatim")
  ) {
    return "kasAnakYatim";
  }

  return "kasMasjid";
}

function normalizeType(value: unknown): FinanceType {
  const text = String(value ?? "").toLowerCase();

  if (
    text.includes("kas_keluar") ||
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

      const amount = toNumber(entry.amount ?? entry.nominal ?? entry.jumlah);
      if (amount <= 0) return null;

      return {
        id: String(entry.id ?? `finance-${index}`),
        date: String(entry.date ?? entry.tanggal ?? entry.createdAt ?? ""),
        bucket: normalizeBucket(
          entry.bucket ?? entry.kategori ?? entry.kas ?? entry.financeGroup
        ),
        type: normalizeType(entry.type ?? entry.jenis ?? entry.status),
        amount,
        description: String(
          entry.description ?? entry.keterangan ?? entry.title ?? entry.note ?? "-"
        ),
        donor: String(
          entry.donor ?? entry.donatur ?? entry.donorName ?? entry.donorname ?? ""
        ),
      };
    })
    .filter((item): item is FinanceItem => item !== null)
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

function mergeArticleData(liveItems: ArticleItem[]): ArticleItem[] {
  const merged: ArticleItem[] = [];

  for (const item of liveItems) {
    if (!merged.find((row) => row.id === item.id || row.title === item.title)) {
      merged.push(item);
    }
  }

  for (const item of fallbackArticles) {
    if (!merged.find((row) => row.id === item.id || row.title === item.title)) {
      merged.push(item);
    }
  }

  return merged
    .filter((item) => item.isPublished)
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
      recent: bucketItems.slice(0, 5),
    };
  });
}

function getDayIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getDailyVerse(date: Date): DailyVerse {
  const index = getDayIndex(date) % dailyVerses.length;
  return dailyVerses[index];
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.35)] transition duration-300 hover:-translate-y-1">
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white">
        {icon}
      </div>
      <h3 className="text-[26px] font-bold leading-tight text-slate-900">
        {title}
      </h3>
      <p className="mt-3 text-[17px] leading-8 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function MoneyStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
      <p className="text-[14px] font-semibold tracking-[0.18em] text-emerald-50/75 uppercase">
        {label}
      </p>
      <p className="mt-3 break-words text-[30px] font-bold leading-tight text-white md:text-[34px]">
        {value}
      </p>
    </div>
  );
}

function SmallMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-4">
      <div className="text-[13px] uppercase tracking-[0.18em] text-white/60">
        {label}
      </div>
      <div className="mt-2 text-[17px] font-semibold leading-snug text-white">
        {value}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [financeItems, setFinanceItems] = useState<FinanceItem[]>(fallbackFinanceItems);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(fallbackPrayerTimes);
  const [dailyVerse, setDailyVerse] = useState<DailyVerse>(dailyVerses[0]);
  const [todayLabel, setTodayLabel] = useState("");
  const [fridayKhutbah, setFridayKhutbah] =
    useState<FridayKhutbah>(fallbackFridayKhutbah);
  const [financeReady, setFinanceReady] = useState(false);
  const [refreshingFinance, setRefreshingFinance] = useState(false);

  useEffect(() => {
    const now = new Date();
    setDailyVerse(getDailyVerse(now));
    setTodayLabel(
      new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now)
    );
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch(
          "https://api.aladhan.com/v1/timingsByCity?city=Jakarta&country=Indonesia&method=11",
          { cache: "no-store" }
        );
        const json = await response.json();

        if (json?.data?.timings) {
          const timings = json.data.timings as Record<string, string>;
          setPrayerTimes({
            subuh: timings.Fajr ?? fallbackPrayerTimes.subuh,
            dzuhur: timings.Dhuhr ?? fallbackPrayerTimes.dzuhur,
            ashar: timings.Asr ?? fallbackPrayerTimes.ashar,
            maghrib: timings.Maghrib ?? fallbackPrayerTimes.maghrib,
            isya: timings.Isha ?? fallbackPrayerTimes.isya,
            terbit: timings.Sunrise ?? fallbackPrayerTimes.terbit,
          });
        }
      } catch {
        setPrayerTimes(fallbackPrayerTimes);
      }
    };

    fetchPrayerTimes();
  }, []);

  const fetchSheetData = async (isManualRefresh = false) => {
    const gasUrl = process.env.NEXT_PUBLIC_GAS_URL?.trim();

    if (!gasUrl) {
      setFinanceReady(true);
      return;
    }

    try {
      if (isManualRefresh) {
        setRefreshingFinance(true);
      }

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

        if (financeNormalized.length > 0) {
          setFinanceItems(financeNormalized);
        }

        const articleRaw =
          root.articles ?? root.artikel ?? root.posts ?? root.berita;
        const articleNormalized = normalizeArticles(toArray<unknown>(articleRaw));
        setArticles(articleNormalized);

        const fridayRaw =
          root.fridayKhutbah ??
          root.khotibJumat ??
          root.jadwalJumat ??
          root.fridaySchedule;

        const fridayNormalized = normalizeFridayKhutbah(fridayRaw);
        if (fridayNormalized) {
          setFridayKhutbah(fridayNormalized);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data spreadsheet:", error);
    } finally {
      setFinanceReady(true);
      setRefreshingFinance(false);
    }
  };

  useEffect(() => {
    fetchSheetData(false);
  }, []);

  const bucketSummaries = useMemo(() => {
    return buildBucketSummaries(financeItems);
  }, [financeItems]);

  const kasPembangunan = bucketSummaries.find(
    (item) => item.key === "kasPembangunan"
  );

  const mergedArticles = useMemo(() => mergeArticleData(articles), [articles]);
  const latestArticles = useMemo(() => mergedArticles.slice(0, 2), [mergedArticles]);

  const heroStats = useMemo(() => {
    const totalIncoming = bucketSummaries.reduce(
      (sum, bucket) => sum + bucket.incoming,
      0
    );
    const totalBalance = bucketSummaries.reduce(
      (sum, bucket) => sum + bucket.balance,
      0
    );

    return {
      totalIncoming,
      totalBalance,
      activePrograms: programCatalog.length,
      totalUpdates: mergedArticles.length,
    };
  }, [bucketSummaries, mergedArticles]);

  return (
    <main className="min-h-screen bg-[#f7faf9] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-500 text-white shadow-[0_16px_40px_-20px_rgba(16,185,129,0.65)]">
              <span className="text-[30px] font-bold">◔</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-emerald-700">
                Website Resmi
              </p>
              <h1 className="text-[23px] font-bold leading-tight text-slate-900 sm:text-[26px]">
                Langgar Kidoel
              </h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[17px] font-semibold text-slate-700 transition hover:text-emerald-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 text-slate-700 transition hover:bg-emerald-50 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup menu"
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-emerald-700">
                  Navigasi
                </p>
                <h2 className="text-[22px] font-bold text-slate-900">
                  Langgar Kidoel
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-4 text-[18px] font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  {item.label}
                  <ChevronRight className="h-5 w-5" />
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-[24px] bg-gradient-to-br from-emerald-600 to-teal-500 p-5 text-white">
              <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Info Singkat
              </p>
              <p className="mt-3 text-[16px] leading-7 text-white/95">
                Website resmi Langgar Kidoel memuat jadwal shalat, informasi
                program, galeri kegiatan, dan laporan keuangan jamaah.
              </p>
            </div>
          </div>
        </div>
      )}

      <section
        id="beranda"
        className="relative overflow-hidden bg-gradient-to-r from-[#184d47] via-[#2a7b6f] to-[#9bded1]"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542816417-0983670d5e98?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-[0.16]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#143c38]/90 via-[#1e655d]/70 to-[#8cd2c6]/60" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold tracking-[0.2em] text-white/85 backdrop-blur-md uppercase">
              Website Resmi Langgar Kidoel
            </div>

            <h2 className="mt-6 text-[42px] font-bold leading-[1.08] text-white sm:text-[54px] lg:text-[64px]">
              Pusat informasi masjid yang rapi, modern, dan mudah diakses jamaah.
            </h2>

            <p className="mt-6 max-w-2xl text-[18px] leading-9 text-emerald-50/90 sm:text-[19px]">
              Temukan informasi kegiatan, jadwal shalat, program donasi, galeri
              kegiatan, dan laporan keuangan masjid dalam satu website yang
              nyaman dibuka dari HP maupun desktop.
            </p>

            <p className="mt-4 max-w-2xl text-[17px] leading-8 text-emerald-50/80">
              Website ini disiapkan untuk memudahkan jamaah mengikuti informasi
              terbaru dari Langgar Kidoel secara lebih cepat, tertata, dan mudah
              dipahami.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 md:max-w-2xl">
              <MoneyStat
                label="Pemasukan Tahun Ini"
                value={formatCompactRupiah(heroStats.totalIncoming)}
              />
              <MoneyStat
                label="Saldo Aktif"
                value={formatCompactRupiah(heroStats.totalBalance)}
              />
              <MoneyStat
                label="Program Aktif"
                value={`${heroStats.activePrograms}`}
              />
              <MoneyStat
                label="Update Terbaru"
                value={`${heroStats.totalUpdates}`}
              />
            </div>
          </div>

          <div className="rounded-[34px] bg-[#f4fbf8] p-6 shadow-[0_35px_90px_-40px_rgba(0,0,0,0.45)] sm:p-7">
            <div className="rounded-[28px] bg-[#edf8f3] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] font-bold tracking-[0.28em] text-emerald-700 uppercase">
                    Jadwal Shalat
                  </p>
                  <h3 className="mt-2 text-[34px] font-bold leading-tight text-slate-900">
                    Hari Ini
                  </h3>
                </div>
                <span className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-[12px] font-semibold text-emerald-700">
                  Live Update
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Subuh", value: prayerTimes.subuh },
                  { label: "Dzuhur", value: prayerTimes.dzuhur },
                  { label: "Ashar", value: prayerTimes.ashar },
                  { label: "Maghrib", value: prayerTimes.maghrib },
                  { label: "Isya", value: prayerTimes.isya },
                  { label: "Terbit", value: prayerTimes.terbit },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[20px] border border-emerald-100 bg-white p-4 text-center"
                  >
                    <p className="text-[12px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                      {item.label}
                    </p>
                    <p className="mt-2 text-[24px] font-bold text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-[28px] bg-[#050b2a] p-5 text-white shadow-[0_24px_60px_-35px_rgba(5,11,42,0.9)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[13px] font-bold tracking-[0.28em] text-emerald-300 uppercase">
                  Program Unggulan
                </p>
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-bold text-[#050b2a]">
                  {Math.min(
                    100,
                    Math.round(
                      ((kasPembangunan?.incoming ?? 0) / 50_000_000) * 100
                    )
                  )}
                  % Tercapai
                </span>
              </div>

              <h3 className="mt-4 text-[34px] font-bold leading-tight">
                Renovasi Langgar Kidoel
              </h3>
              <p className="mt-3 text-[16px] leading-8 text-slate-200">
                Pengembangan area ibadah, perbaikan fasilitas wudhu, dan
                peningkatan ruang kegiatan jamaah.
              </p>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width: `${Math.min(
                      100,
                      ((kasPembangunan?.incoming ?? 0) / 50_000_000) * 100
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <SmallMeta
                  label="Terkumpul"
                  value={formatRupiah(kasPembangunan?.incoming ?? 0)}
                />
                <SmallMeta label="Target" value={formatRupiah(50_000_000)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-emerald-100 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.25)] sm:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                Ayat Harian
              </span>
              <h3 className="mt-4 text-[34px] font-bold leading-tight text-slate-900">
                Renungan untuk hari ini
              </h3>
            </div>
            <div className="text-[15px] font-medium text-slate-500">
              {todayLabel}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white sm:p-8">
            <div className="flex items-center gap-3 text-emerald-50/80">
              <BookOpen className="h-5 w-5" />
              <span className="text-[13px] font-semibold tracking-[0.18em] uppercase">
                {dailyVerse.source}
              </span>
            </div>

            <p className="mt-6 text-right text-[26px] leading-[2.1] sm:text-[32px]">
              {dailyVerse.arabic}
            </p>
            <p className="mt-5 text-[16px] italic leading-8 text-emerald-50/85 sm:text-[17px]">
              {dailyVerse.latin}
            </p>
            <p className="mt-4 text-[17px] leading-8 text-white/95 sm:text-[18px]">
              {dailyVerse.translation}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              Informasi Utama
            </span>
            <h3 className="mt-5 max-w-3xl text-[38px] font-bold leading-tight text-slate-900 sm:text-[46px]">
              Semua kebutuhan informasi masjid dalam satu tampilan yang lebih rapi.
            </h3>
          </div>
          <p className="text-[18px] leading-9 text-slate-600">
            Website ini dirancang agar jamaah dapat dengan mudah mengakses
            informasi penting seperti galeri kegiatan, laporan keuangan, program
            donasi, jadwal kegiatan, dan informasi layanan lainnya dari berbagai
            perangkat.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <FeatureCard
            icon={<Wallet className="h-5 w-5" />}
            title="Keuangan Transparan"
            description="Ringkasan pemasukan, pengeluaran, saldo, dan laporan publik yang mudah dipahami jamaah."
          />
          <FeatureCard
            icon={<HeartHandshake className="h-5 w-5" />}
            title="Program Donasi Aktif"
            description="Program infak, bantuan, renovasi, Ramadhan, dan Qurban tampil lebih rapi dan mudah diakses."
          />
          <FeatureCard
            icon={<Newspaper className="h-5 w-5" />}
            title="Portal Kegiatan Masjid"
            description="Galeri kegiatan, kajian, dan dokumentasi aktivitas masjid tampil lebih menarik dan informatif."
          />
          <FeatureCard
            icon={<Landmark className="h-5 w-5" />}
            title="Pengelolaan Lebih Mudah"
            description="Dirancang agar mudah digunakan pengurus untuk mengelola informasi masjid secara teratur."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Info Jumat & Artikel
            </span>
            <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
              Informasi khutbah Jumat dan artikel terbaru
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-slate-600">
            Jamaah dapat melihat jadwal khotib Jumat pekan ini sekaligus membaca artikel dan pengumuman terbaru dari Langgar Kidoel.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)] sm:p-7">
            <div className="mb-5 inline-flex rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Jadwal Khotib Jumat
            </div>

            <h3 className="text-2xl font-bold leading-tight sm:text-3xl">
              Informasi khotib, bilal, dan tema khutbah Jumat pekan ini
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              Jamaah dapat melihat informasi khutbah Jumat lebih mudah, mulai dari tanggal hijriah dan masehi, nama khotib, nama bilal, hingga judul khutbah yang akan disampaikan.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Tanggal Hijriah
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {fridayKhutbah.hijriDate}
                </p>
              </div>

              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Tanggal Masehi
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {fridayKhutbah.gregorianDate}
                </p>
              </div>

              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Nama Khatib
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {fridayKhutbah.khatib}
                </p>
              </div>

              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Nama Bilal
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {fridayKhutbah.bilal}
                </p>
              </div>

              <div className="rounded-2xl bg-white/6 p-4 ring-1 ring-white/10 sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Judul Khutbah
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {fridayKhutbah.title}
                </p>
              </div>
            </div>
          </div>

          {latestArticles.map((article, index) => (
            <article
              key={`${article.id}-${index}`}
              className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
            >
              <div className="h-52 w-full overflow-hidden bg-emerald-100">
                <img
                  src={
                    article.image ||
                    "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={article.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>

              <div className="p-6 sm:p-7">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {article.category}
                  </span>
                  <span>{formatIndoDate(article.date)}</span>
                </div>

                <h3 className="text-2xl font-bold leading-tight text-slate-900">
                  {article.title}
                </h3>

                <p className="mt-4 line-clamp-4 text-base leading-8 text-slate-600">
                  {article.excerpt}
                </p>

                {article.link && article.link !== "#" ? (
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                  >
                    Baca selengkapnya
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="program"
        className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              Program Masjid
            </span>
            <h3 className="mt-5 text-[38px] font-bold leading-tight text-slate-900 sm:text-[46px]">
              Dukungan jamaah untuk program yang sedang berjalan
            </h3>
          </div>
          <p className="text-[18px] leading-9 text-slate-600">
            Informasi program donasi dan kegiatan sosial ditampilkan secara
            ringkas agar jamaah dapat mengikuti perkembangannya dan ikut
            berpartisipasi.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {programCatalog.map((program) => {
            const summary = bucketSummaries.find(
              (item) => item.key === program.bucket
            );
            const terkumpul = summary?.incoming ?? 0;
            const progress = Math.min(
              100,
              Math.round((terkumpul / program.target) * 100)
            );

            return (
              <div
                key={program.title}
                className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(16,185,129,0.22)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700">
                    {progress}% tercapai
                  </span>
                  <span className="text-[14px] font-semibold text-slate-500">
                    {program.badge}
                  </span>
                </div>

                <h3 className="mt-4 text-[30px] font-bold leading-tight text-slate-900">
                  {program.title}
                </h3>
                <p className="mt-4 text-[16px] leading-8 text-slate-600">
                  {program.description}
                </p>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Terkumpul
                    </p>
                    <p className="mt-2 break-words text-[20px] font-bold text-slate-900">
                      {formatRupiah(terkumpul)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Target
                    </p>
                    <p className="mt-2 break-words text-[20px] font-bold text-slate-900">
                      {formatRupiah(program.target)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section
        id="berita"
        className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
      >
        <div className="grid gap-6 lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
              Galeri Kegiatan
            </span>
            <h3 className="mt-5 text-[38px] font-bold leading-tight text-slate-900 sm:text-[46px]">
              Dokumentasi kegiatan jamaah dan aktivitas masjid
            </h3>
          </div>
          <p className="text-[18px] leading-9 text-slate-600">
            Galeri ini menampilkan suasana kegiatan, kajian, santunan, kerja
            bakti, dan berbagai aktivitas jamaah di Langgar Kidoel.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {galleryItems.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_24px_60px_-40px_rgba(16,185,129,0.2)]"
            >
              <div className="h-56 w-full overflow-hidden bg-emerald-100">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-semibold text-emerald-700">
                    Kegiatan Masjid
                  </span>
                  <Newspaper className="h-5 w-5 text-emerald-500" />
                </div>

                <h3 className="mt-4 text-[26px] font-bold leading-tight text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-[15px] text-slate-500">{item.date}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[34px] bg-gradient-to-r from-emerald-600 to-sky-500 p-6 text-white shadow-[0_30px_80px_-50px_rgba(14,165,233,0.5)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-white uppercase">
                Ringkasan Laporan Keuangan
              </span>
              <h3 className="mt-5 text-[38px] font-bold leading-tight sm:text-[46px]">
                Data keuangan tampil live dan sinkron
              </h3>
              <p className="mt-4 text-[17px] leading-8 text-white/90">
                Menampilkan 3 kategori keuangan utama yang tersinkron langsung
                dari Google Spreadsheet.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchSheetData(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshingFinance ? "animate-spin" : ""}`}
              />
              {refreshingFinance ? "Menyegarkan..." : "Refresh Data"}
            </button>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            {bucketSummaries.map((bucket) => {
              const latestDonor = bucket.recent.find(
                (item) =>
                  item.type === "masuk" &&
                  item.donor &&
                  item.donor.trim() !== ""
              );

              return (
                <div
                  key={bucket.key}
                  className="rounded-[28px] bg-white/10 p-5 backdrop-blur-md"
                >
                  <h4 className="text-[32px] font-bold leading-tight text-white">
                    {bucket.label}
                  </h4>
                  <p className="mt-2 text-[15px] text-white/80">
                    {bucket.recent.length} transaksi terbaru
                  </p>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        Masuk
                      </p>
                      <p className="mt-2 break-words text-[22px] font-bold leading-tight text-white">
                        {formatRupiah(bucket.incoming)}
                      </p>
                      {latestDonor ? (
                        <p className="mt-2 text-[13px] leading-5 text-white/75">
                          Donatur:{" "}
                          <span className="font-semibold text-white">
                            {latestDonor.donor}
                          </span>
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        Keluar
                      </p>
                      <p className="mt-2 break-words text-[22px] font-bold leading-tight text-white">
                        {formatRupiah(bucket.outgoing)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        Saldo
                      </p>
                      <p className="mt-2 break-words text-[22px] font-bold leading-tight text-white">
                        {formatRupiah(bucket.balance)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {bucket.recent.length === 0 ? (
                      <div className="rounded-2xl bg-white/10 p-4 text-[15px] text-white/80">
                        Belum ada data transaksi.
                      </div>
                    ) : (
                      bucket.recent.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white/10 p-4"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-[13px] text-white/70">
                                {formatShortDate(item.date)}
                              </div>
                              <div className="mt-1 text-[15px] font-semibold leading-6 text-white">
                                {item.description}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${
                                item.type === "masuk"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {item.type === "masuk" ? "Kas Masuk" : "Kas Keluar"}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-[13px] text-white/70">
                              {item.donor ? `Donatur: ${item.donor}` : "Transaksi"}
                            </div>
                            <div className="text-[16px] font-bold text-white">
                              {formatRupiah(item.amount)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="kontak"
        className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8"
      >
        <div className="rounded-[34px] border border-emerald-100 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(16,185,129,0.25)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-[12px] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                Kontak & Informasi
              </span>
              <h3 className="mt-5 text-[38px] font-bold leading-tight text-slate-900 sm:text-[46px]">
                Langgar Kidoel hadir sebagai pusat informasi kegiatan dan pelayanan jamaah
              </h3>
              <p className="mt-5 text-[17px] leading-8 text-slate-600">
                Silakan akses website ini untuk mengikuti perkembangan program,
                membaca pengumuman, dan melihat informasi terbaru dari Langgar
                Kidoel.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-1 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Alamat
                    </p>
                    <p className="mt-2 text-[18px] font-semibold text-slate-900">
                      Jl. Raya Masjid No. 1, Kota Indah, Indonesia
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <Phone className="mt-1 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Kontak
                    </p>
                    <p className="mt-2 text-[18px] font-semibold text-slate-900">
                      0812-3456-7890
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <Mail className="mt-1 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Email
                    </p>
                    <p className="mt-2 text-[18px] font-semibold text-slate-900">
                      info@langgarkidoel.id
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
          <div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-emerald-500 text-white">
                <span className="text-[24px] font-bold">◔</span>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-emerald-700">
                  Website Resmi
                </p>
                <h4 className="text-[22px] font-bold text-slate-900">
                  Langgar Kidoel
                </h4>
              </div>
            </div>

            <p className="mt-5 max-w-md text-[16px] leading-8 text-slate-600">
              Website resmi Langgar Kidoel untuk menyampaikan informasi jamaah,
              program masjid, jadwal ibadah, galeri kegiatan, serta laporan
              keuangan secara lebih rapi dan mudah diakses.
            </p>
          </div>

          <div>
            <h5 className="text-[18px] font-bold text-slate-900">Navigasi</h5>
            <div className="mt-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-[16px] text-slate-600 transition hover:text-emerald-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[18px] font-bold text-slate-900">Kontak Cepat</h5>
            <div className="mt-4 space-y-3 text-[16px] leading-8 text-slate-600">
              <p>Jl. Raya Masjid No. 1, Kota Indah, Indonesia</p>
              <p>0812-3456-7890</p>
              <p>info@langgarkidoel.id</p>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-[14px] text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>© 2026 Langgar Kidoel. Semua hak cipta dilindungi.</p>
            <p>Dikelola untuk memudahkan informasi jamaah.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}