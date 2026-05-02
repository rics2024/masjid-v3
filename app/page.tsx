"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  HeartHandshake,
  Landmark,
  Mail,
  MapPin,
  Menu,
  Newspaper,
  Phone,
  X,
} from "lucide-react";

type FinanceBucket = "kasMasjid" | "kasPembangunan" | "kasAnakYatim";
type FinanceType = "masuk" | "keluar";

type FinanceItem = {
  id: string;
  tanggal: string;
  bucket: FinanceBucket;
  type: FinanceType;
  keterangan: string;
  jumlah: number;
  donatur?: string;
};

type PrayerTimes = {
  Subuh: string;
  Dzuhur: string;
  Ashar: string;
  Maghrib: string;
  Isya: string;
  Terbit: string;
};

type QuoteItem = {
  type: "ayat" | "hadis";
  arabic: string;
  translation: string;
  source: string;
};

type FridayKhutbahItem = {
  tanggalHijriah: string;
  tanggalMasehi: string;
  khotib: string;
  bilal: string;
  judulKhutbah: string;
};

type ArticleItem = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author?: string;
  image?: string;
  isPublished?: boolean;
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";

const HERO_BG =
  "https://images.unsplash.com/photo-1564769625392-651b1c67d2f4?auto=format&fit=crop&w=1600&q=80";

const featuredProgramTarget = 50_000_000;

const fallbackFridayKhutbahInfo: FridayKhutbahItem = {
  tanggalHijriah: "19 Muharram 1448 H",
  tanggalMasehi: "Jumat, 8 Mei 2026",
  khotib: "Ust. Ahmad Fauzi",
  bilal: "Muhammad Rizki",
  judulKhutbah: "Memakmurkan Masjid dan Menjaga Ukhuwah Jamaah",
};

const programs = [
  {
    title: "Renovasi Langgar Kidoel",
    description:
      "Program perbaikan area wudhu, perawatan bangunan, dan peningkatan fasilitas ibadah jamaah.",
    terkumpul: 10_000_000,
    target: 50_000_000,
    status: "Berjalan",
  },
  {
    title: "Santunan Anak Yatim",
    description:
      "Bantuan rutin untuk anak yatim dan dhuafa di sekitar lingkungan Langgar Kidoel.",
    terkumpul: 3_000_000,
    target: 15_000_000,
    status: "Aktif",
  },
  {
    title: "Beasiswa Tahfidz",
    description:
      "Dukungan pendidikan untuk santri penghafal Al-Qur'an agar lebih fokus belajar.",
    terkumpul: 12_000_000,
    target: 50_000_000,
    status: "Aktif",
  },
];

const latestNews = [
  {
    title: "Kajian Subuh Ahad bersama Ustadz Ahmad",
    category: "Kajian",
    date: "Ahad, 21 April 2026",
  },
  {
    title: "Laporan Keuangan Triwulan Pertama telah terbit",
    category: "Pengumuman",
    date: "Senin, 19 April 2026",
  },
  {
    title: "Pendaftaran Peserta Qurban resmi dibuka",
    category: "Qurban",
    date: "Rabu, 17 April 2026",
  },
];

const dailyQuotes: QuoteItem[] = [
  {
    type: "ayat",
    arabic:
      "وَأَنَّ الْمَسَاجِدَ لِلَّهِ فَلَا تَدْعُوا مَعَ اللَّهِ أَحَدًا",
    translation:
      "Dan sesungguhnya masjid-masjid itu adalah milik Allah, maka janganlah kamu menyembah seseorang pun di dalamnya selain Allah.",
    source: "QS. Al-Jinn: 18",
  },
  {
    type: "hadis",
    arabic:
      "مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ",
    translation:
      "Barang siapa membangun masjid karena Allah, maka Allah akan bangunkan baginya rumah di surga.",
    source: "HR. Bukhari dan Muslim",
  },
  {
    type: "ayat",
    arabic:
      "إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ",
    translation:
      "Sesungguhnya yang memakmurkan masjid-masjid Allah hanyalah orang-orang yang beriman kepada Allah dan hari kemudian.",
    source: "QS. At-Taubah: 18",
  },
  {
    type: "hadis",
    arabic: "أَحَبُّ الْبِلَادِ إِلَى اللَّهِ مَسَاجِدُهَا",
    translation:
      "Tempat yang paling dicintai Allah di suatu negeri adalah masjid-masjidnya.",
    source: "HR. Muslim",
  },
];

const fallbackArticles: ArticleItem[] = [
  {
    id: "1",
    title: "Kajian Subuh Ahad Bersama Ustadz Ahmad",
    excerpt:
      "Kajian rutin Ahad pagi membahas pentingnya menjaga shalat berjamaah dan adab di masjid.",
    category: "Kajian",
    date: "2026-05-01",
    author: "Admin",
    image:
      "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
    isPublished: true,
  },
  {
    id: "2",
    title: "Program Santunan Anak Yatim Bulan Ini Dibuka",
    excerpt:
      "Jamaah dapat ikut berpartisipasi dalam program santunan anak yatim melalui donasi langsung ke masjid.",
    category: "Sosial",
    date: "2026-04-28",
    author: "Admin",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80",
    isPublished: true,
  },
];

const fallbackFinanceItems: FinanceItem[] = [
  {
    id: "1",
    tanggal: "2026-04-29",
    bucket: "kasMasjid",
    type: "masuk",
    keterangan: "Infaq Jumat",
    jumlah: 5_000_000,
  },
  {
    id: "2",
    tanggal: "2026-04-26",
    bucket: "kasMasjid",
    type: "keluar",
    keterangan: "Pembelian alat kebersihan",
    jumlah: 300_000,
  },
  {
    id: "3",
    tanggal: "2026-04-28",
    bucket: "kasPembangunan",
    type: "masuk",
    keterangan: "Donasi pembangunan",
    jumlah: 10_000_000,
    donatur: "Ahmad Fauzi",
  },
  {
    id: "4",
    tanggal: "2026-04-17",
    bucket: "kasAnakYatim",
    type: "masuk",
    keterangan: "Santunan jamaah",
    jumlah: 3_000_000,
    donatur: "Siti Aminah",
  },
  {
    id: "5",
    tanggal: "2026-04-24",
    bucket: "kasMasjid",
    type: "masuk",
    keterangan: "Infaq kotak amal",
    jumlah: 1_500_000,
  },
  {
    id: "6",
    tanggal: "2026-04-20",
    bucket: "kasMasjid",
    type: "keluar",
    keterangan: "Bayar listrik",
    jumlah: 1_200_000,
  },
  {
    id: "7",
    tanggal: "2026-04-21",
    bucket: "kasPembangunan",
    type: "masuk",
    keterangan: "Donasi renovasi",
    jumlah: 2_000_000,
    donatur: "Hamba Allah",
  },
  {
    id: "8",
    tanggal: "2026-04-19",
    bucket: "kasAnakYatim",
    type: "masuk",
    keterangan: "Infaq sosial",
    jumlah: 750_000,
    donatur: "Muhammad Rizki",
  },
];

const fallbackPrayerTimes: PrayerTimes = {
  Subuh: "04:34",
  Dzuhur: "11:50",
  Ashar: "15:12",
  Maghrib: "17:47",
  Isya: "18:58",
  Terbit: "05:53",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function shortRupiah(value: number) {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1).replace(".", ",")} Jt`;
  }
  return formatRupiah(value);
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";

  const cleaned = dateStr.includes("/")
    ? dateStr.split("/").reverse().join("-")
    : dateStr;

  const date = new Date(cleaned);
  if (Number.isNaN(date.getTime())) return dateStr;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function parseAmount(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^\d-]/g, "");
  return Number(normalized) || 0;
}

function detectBucket(value: string): FinanceBucket {
  const v = value.toLowerCase();
  if (v.includes("pembangunan")) return "kasPembangunan";
  if (v.includes("anak yatim") || v.includes("yatim")) return "kasAnakYatim";
  return "kasMasjid";
}

function detectType(value: string): FinanceType {
  const v = value.toLowerCase();
  if (v.includes("keluar") || v.includes("pengeluaran")) return "keluar";
  return "masuk";
}

function normalizeFinanceRows(raw: unknown): FinanceItem[] {
  if (!raw) return [];

  const normalized: FinanceItem[] = [];

  const pushItem = (item: any, forcedBucket?: FinanceBucket) => {
    const bucket = forcedBucket
      ? forcedBucket
      : detectBucket(
          String(
            item.bucket ||
              item.kategori ||
              item.kas ||
              item.sheet ||
              item.jenisKas ||
              "kas masjid"
          )
        );

    const type = detectType(
      String(item.type || item.jenis || item.arus || item.status || "masuk")
    );

    normalized.push({
      id: String(item.id || item.ID || crypto.randomUUID()),
      tanggal: String(item.tanggal || item.date || item.created_at || ""),
      bucket,
      type,
      keterangan: String(
        item.keterangan || item.judul || item.deskripsi || "Transaksi"
      ),
      jumlah: parseAmount(item.jumlah || item.nominal || item.amount || 0),
      donatur: item.donatur ? String(item.donatur) : undefined,
    });
  };

  if (Array.isArray(raw)) {
    raw.forEach((item) => pushItem(item));
    return normalized;
  }

  if (typeof raw === "object" && raw !== null) {
    const data = raw as Record<string, any>;

    if (Array.isArray(data.items)) {
      data.items.forEach((item) => pushItem(item));
      return normalized;
    }

    if (Array.isArray(data.data)) {
      data.data.forEach((item) => pushItem(item));
      return normalized;
    }

    if (Array.isArray(data.finance)) {
      data.finance.forEach((item) => pushItem(item));
      return normalized;
    }

    if (Array.isArray(data.transactions)) {
      data.transactions.forEach((item) => pushItem(item));
      return normalized;
    }

    if (Array.isArray(data.kasMasjid)) {
      data.kasMasjid.forEach((item) => pushItem(item, "kasMasjid"));
    }

    if (Array.isArray(data.kasPembangunan)) {
      data.kasPembangunan.forEach((item) => pushItem(item, "kasPembangunan"));
    }

    if (Array.isArray(data.kasAnakYatim)) {
      data.kasAnakYatim.forEach((item) => pushItem(item, "kasAnakYatim"));
    }
  }

  return normalized;
}

function sortByLatest<T extends { tanggal?: string; date?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const da = new Date((a.tanggal || a.date || "") as string).getTime();
    const db = new Date((b.tanggal || b.date || "") as string).getTime();
    return db - da;
  });
}

function getBucketSummary(items: FinanceItem[], bucket: FinanceBucket) {
  const bucketItems = sortByLatest(items.filter((item) => item.bucket === bucket));
  const totalMasuk = bucketItems
    .filter((item) => item.type === "masuk")
    .reduce((sum, item) => sum + item.jumlah, 0);

  const totalKeluar = bucketItems
    .filter((item) => item.type === "keluar")
    .reduce((sum, item) => sum + item.jumlah, 0);

  return {
    totalMasuk,
    totalKeluar,
    saldo: totalMasuk - totalKeluar,
    latest: bucketItems,
  };
}

function getQuoteOfDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / 86400000);
  return dailyQuotes[day % dailyQuotes.length];
}

function getTodayLabel() {
  const now = new Date();
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}

function getProgressPercent(current: number, target: number) {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

type FinanceSectionCardProps = {
  title: string;
  summary: ReturnType<typeof getBucketSummary>;
};

function FinanceSectionCard({ title, summary }: FinanceSectionCardProps) {
  const latestDesktop = summary.latest.slice(0, 5);
  const latestMobile = summary.latest.slice(0, 3);

  return (
    <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm text-emerald-50/85">Transaksi terbaru</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-50/80">
            Masuk
          </p>
          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
            {formatRupiah(summary.totalMasuk)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-50/80">
            Keluar
          </p>
          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
            {formatRupiah(summary.totalKeluar)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-50/80">
            Saldo
          </p>
          <p className="mt-2 text-xl font-bold text-white sm:text-2xl">
            {formatRupiah(summary.saldo)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 sm:hidden">
        {latestMobile.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  {formatDate(item.tanggal)}
                </p>
                <p className="mt-1 text-sm text-emerald-50/85">
                  {item.keterangan}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    item.type === "masuk"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {item.type === "masuk" ? "Masuk" : "Keluar"}
                </span>
                <p className="mt-2 text-sm font-bold text-white">
                  {formatRupiah(item.jumlah)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {latestMobile.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 p-4 text-sm text-emerald-50/80">
            Belum ada data transaksi.
          </div>
        ) : null}
      </div>

      <div className="mt-5 hidden space-y-3 sm:block">
        {latestDesktop.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  {formatDate(item.tanggal)}
                </p>
                <p className="mt-1 text-sm text-emerald-50/85">
                  {item.keterangan}
                </p>
                {item.donatur ? (
                  <p className="mt-1 text-xs text-emerald-100/70">
                    Donatur: {item.donatur}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.type === "masuk"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {item.type === "masuk" ? "Kas Masuk" : "Kas Keluar"}
                </span>
                <p className="mt-2 text-sm font-bold text-white">
                  {formatRupiah(item.jumlah)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {latestDesktop.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 p-4 text-sm text-emerald-50/80">
            Belum ada data transaksi.
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [financeItems, setFinanceItems] = useState<FinanceItem[]>(fallbackFinanceItems);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes>(fallbackPrayerTimes);
  const [todayQuote, setTodayQuote] = useState<QuoteItem>(dailyQuotes[0]);
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [articles, setArticles] = useState<ArticleItem[]>(fallbackArticles);
  const [fridayKhutbahInfo, setFridayKhutbahInfo] = useState<FridayKhutbahItem>(
    fallbackFridayKhutbahInfo
  );

  useEffect(() => {
    setTodayQuote(getQuoteOfDay());
  }, []);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        if (!GAS_URL) {
          setFinanceItems(fallbackFinanceItems);
          return;
        }

        const res = await fetch(GAS_URL, { cache: "no-store" });
        const json = await res.json();

        const items = normalizeFinanceRows(json);
        if (items.length > 0) {
          setFinanceItems(items);
        } else {
          setFinanceItems(fallbackFinanceItems);
        }
      } catch (error) {
        console.error("Gagal mengambil data keuangan:", error);
        setFinanceItems(fallbackFinanceItems);
      } finally {
        setLoadingFinance(false);
      }
    };

    fetchFinance();
  }, []);

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch(
          "https://api.aladhan.com/v1/timingsByCity?city=Cirebon&country=Indonesia&method=11",
          { cache: "no-store" }
        );
        const json = await res.json();

        const timings = json?.data?.timings;
        if (timings) {
          setPrayerTimes({
            Subuh: timings.Fajr || fallbackPrayerTimes.Subuh,
            Dzuhur: timings.Dhuhr || fallbackPrayerTimes.Dzuhur,
            Ashar: timings.Asr || fallbackPrayerTimes.Ashar,
            Maghrib: timings.Maghrib || fallbackPrayerTimes.Maghrib,
            Isya: timings.Isha || fallbackPrayerTimes.Isya,
            Terbit: timings.Sunrise || fallbackPrayerTimes.Terbit,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil jadwal shalat:", error);
      }
    };

    fetchPrayerTimes();
  }, []);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        if (!GAS_URL) return;

        const res = await fetch(`${GAS_URL}?action=getArticles`, {
          cache: "no-store",
        });
        const json = await res.json();

        const rawItems = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json?.articles)
          ? json.articles
          : [];

        const normalized: ArticleItem[] = rawItems
          .map((item: any) => ({
            id: String(item.id || crypto.randomUUID()),
            title: String(item.title || ""),
            excerpt: String(item.excerpt || item.ringkasan || ""),
            category: String(item.category || item.kategori || "Artikel"),
            date: String(item.date || item.tanggal || ""),
            author: item.author ? String(item.author) : "Admin",
            image: item.image ? String(item.image) : "",
            isPublished:
              String(item.isPublished || item.publish || "TRUE").toLowerCase() ===
              "true",
          }))
          .filter((item) => item.isPublished)
          .sort(
            (a, b) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 2);

        if (normalized.length > 0) {
          setArticles(normalized);
        }
      } catch (error) {
        console.error("Gagal mengambil artikel:", error);
      }
    };

    loadArticles();
  }, []);

  useEffect(() => {
    const loadFridayKhutbah = async () => {
      try {
        if (!GAS_URL) return;

        const res = await fetch(`${GAS_URL}?action=getFridayKhutbah`, {
          cache: "no-store",
        });
        const json = await res.json();

        const item =
          json?.data ||
          json?.item ||
          (Array.isArray(json?.items) ? json.items[0] : null);

        if (item) {
          setFridayKhutbahInfo({
            tanggalHijriah: String(
              item.tanggalHijriah || item.hijriah || fallbackFridayKhutbahInfo.tanggalHijriah
            ),
            tanggalMasehi: String(
              item.tanggalMasehi || item.masehi || fallbackFridayKhutbahInfo.tanggalMasehi
            ),
            khotib: String(item.khotib || fallbackFridayKhutbahInfo.khotib),
            bilal: String(item.bilal || fallbackFridayKhutbahInfo.bilal),
            judulKhutbah: String(
              item.judulKhutbah || item.judul || fallbackFridayKhutbahInfo.judulKhutbah
            ),
          });
        }
      } catch (error) {
        console.error("Gagal mengambil jadwal khotib Jumat:", error);
      }
    };

    loadFridayKhutbah();
  }, []);

  const kasMasjidSummary = useMemo(
    () => getBucketSummary(financeItems, "kasMasjid"),
    [financeItems]
  );

  const kasPembangunanSummary = useMemo(
    () => getBucketSummary(financeItems, "kasPembangunan"),
    [financeItems]
  );

  const kasAnakYatimSummary = useMemo(
    () => getBucketSummary(financeItems, "kasAnakYatim"),
    [financeItems]
  );

  const totalPemasukan = useMemo(
    () =>
      financeItems
        .filter((item) => item.type === "masuk")
        .reduce((sum, item) => sum + item.jumlah, 0),
    [financeItems]
  );

  const totalSaldo = useMemo(() => {
    const totalMasuk = financeItems
      .filter((item) => item.type === "masuk")
      .reduce((sum, item) => sum + item.jumlah, 0);

    const totalKeluar = financeItems
      .filter((item) => item.type === "keluar")
      .reduce((sum, item) => sum + item.jumlah, 0);

    return totalMasuk - totalKeluar;
  }, [financeItems]);

  const featuredCollected = kasPembangunanSummary.saldo;
  const featuredPercent = getProgressPercent(featuredCollected, featuredProgramTarget);

  const prayerCards = [
    { label: "Subuh", value: prayerTimes.Subuh },
    { label: "Dzuhur", value: prayerTimes.Dzuhur },
    { label: "Ashar", value: prayerTimes.Ashar },
    { label: "Maghrib", value: prayerTimes.Maghrib },
    { label: "Isya", value: prayerTimes.Isya },
    { label: "Terbit", value: prayerTimes.Terbit },
  ];

  const navItems = [
    { label: "Beranda", href: "#beranda" },
    { label: "Program", href: "#program" },
    { label: "Berita", href: "#berita" },
    { label: "Keuangan", href: "/keuangan" },
    { label: "Kontak", href: "#kontak" },
  ];

  return (
    <main className="min-h-screen bg-[#f7faf8] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-2xl font-bold text-white shadow-lg">
              ☪
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-700">
                Website Resmi
              </p>
              <h1 className="truncate text-2xl font-black text-slate-900">
                Langgar Kidoel
              </h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) =>
              item.href.startsWith("#") ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-base font-semibold text-slate-700 transition hover:text-emerald-700"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-base font-semibold text-slate-700 transition hover:text-emerald-700"
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 md:hidden"
            aria-label="Toggle Menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* mobile menu premium */}
      <div
        className={`fixed inset-0 z-[70] md:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "pointer-events-auto bg-black/45 opacity-100"
            : "pointer-events-none bg-black/0 opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-2xl transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-5">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                Website Resmi
              </p>
              <h2 className="text-xl font-black text-slate-900">
                Langgar Kidoel
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700"
              aria-label="Close Menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 py-5">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) =>
                item.href.startsWith("#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-4 py-4 text-base font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-2xl px-4 py-4 text-base font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>
        </div>
      </div>

      <section
        id="beranda"
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(3,37,33,0.88) 0%, rgba(8,99,85,0.76) 50%, rgba(99,214,195,0.55) 100%), url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <span className="mb-5 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
              Website Resmi Langgar Kidoel
            </span>

            <h2 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Pusat informasi masjid yang rapi, modern, dan mudah diakses
              jamaah.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/95 sm:text-xl">
              Temukan informasi kegiatan, jadwal shalat, program donasi, berita
              terbaru, dan laporan keuangan masjid dalam satu website yang
              nyaman dibuka dari HP maupun desktop.
            </p>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-emerald-50/80">
              Website ini disiapkan untuk memudahkan jamaah mengikuti informasi
              terbaru dari Langgar Kidoel secara lebih cepat, tertata, dan
              mudah dipahami.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-[26px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-4xl font-black text-white">
                  {shortRupiah(totalPemasukan)}
                </p>
                <p className="mt-2 text-sm font-medium text-emerald-50/90">
                  Pemasukan Tahun Ini
                </p>
              </div>
              <div className="rounded-[26px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-4xl font-black text-white">
                  {shortRupiah(totalSaldo)}
                </p>
                <p className="mt-2 text-sm font-medium text-emerald-50/90">
                  Saldo Aktif
                </p>
              </div>
              <div className="rounded-[26px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-4xl font-black text-white">4</p>
                <p className="mt-2 text-sm font-medium text-emerald-50/90">
                  Program Aktif
                </p>
              </div>
              <div className="rounded-[26px] border border-white/15 bg-white/10 p-5 backdrop-blur">
                <p className="text-4xl font-black text-white">12</p>
                <p className="mt-2 text-sm font-medium text-emerald-50/90">
                  Berita Terbaru
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[34px] bg-[#eff8f4] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.18)] sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.35em] text-emerald-700">
                    Jadwal Shalat
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-slate-900">
                    Hari Ini
                  </h3>
                </div>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                  Live Update
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {prayerCards.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 text-center shadow-sm"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-black text-slate-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] bg-[#020826] p-5 text-white shadow-[0_25px_70px_rgba(0,0,0,0.25)] sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-300">
                  Program Unggulan
                </span>
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-slate-900">
                  {featuredPercent}% Tercapai
                </span>
              </div>

              <h3 className="text-3xl font-black">Renovasi Langgar Kidoel</h3>
              <p className="mt-3 text-base leading-7 text-slate-300">
                Pengembangan area ibadah, perbaikan fasilitas wudhu, dan
                peningkatan ruang kegiatan jamaah.
              </p>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-yellow-400"
                  style={{ width: `${featuredPercent}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Terkumpul
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {formatRupiah(featuredCollected)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Target
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {formatRupiah(featuredProgramTarget)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Informasi Utama
            </span>
            <h3 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-slate-900">
              Semua kebutuhan informasi masjid dalam satu tampilan yang lebih
              rapi.
            </h3>
          </div>
          <p className="text-lg leading-8 text-slate-600">
            Website ini dirancang agar jamaah dapat dengan mudah mengakses
            informasi penting seperti berita masjid, laporan keuangan, program
            donasi, jadwal kegiatan, dan informasi layanan lainnya dari berbagai
            perangkat.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <Landmark size={20} />,
              title: "Keuangan Transparan",
              desc: "Ringkasan pemasukan, pengeluaran, saldo, dan laporan publik yang mudah dipahami jamaah.",
            },
            {
              icon: <HeartHandshake size={20} />,
              title: "Program Donasi Aktif",
              desc: "Program infaq, bantuan, renovasi, Ramadhan, dan Qurban tampil lebih rapi dan mudah diakses.",
            },
            {
              icon: <Newspaper size={20} />,
              title: "Portal Berita Masjid",
              desc: "Pengumuman, kajian, dan agenda masjid dapat dipublikasikan dengan tampilan yang modern.",
            },
            {
              icon: <CalendarDays size={20} />,
              title: "Pengelolaan Lebih Mudah",
              desc: "Dirancang agar mudah digunakan pengurus untuk mengelola informasi masjid secara teratur.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
                {item.icon}
              </div>
              <h4 className="mt-5 text-2xl font-bold text-slate-900">
                {item.title}
              </h4>
              <p className="mt-3 text-base leading-7 text-slate-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[34px] bg-[#030822] p-6 text-white shadow-[0_25px_70px_rgba(0,0,0,0.22)] sm:p-8">
            <span className="inline-flex rounded-full bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-900">
              Jadwal Khotib Jumat
            </span>

            <h3 className="mt-5 text-4xl font-black leading-tight">
              Informasi khotib, bilal, dan tema khutbah Jumat pekan ini
            </h3>

            <p className="mt-5 text-lg leading-8 text-slate-300">
              Jamaah dapat melihat informasi pelaksanaan khutbah Jumat lebih
              mudah, mulai dari tanggal Hijriah dan Masehi, nama khotib, nama
              bilal, hingga judul khutbah yang akan disampaikan.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    Tanggal Hijriah
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {fridayKhutbahInfo.tanggalHijriah}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    Tanggal Masehi
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {fridayKhutbahInfo.tanggalMasehi}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    Nama Khotib
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {fridayKhutbahInfo.khotib}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm font-semibold text-emerald-300">
                    Nama Bilal
                  </p>
                  <p className="mt-2 text-xl font-bold">
                    {fridayKhutbahInfo.bilal}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/20">
                <p className="text-sm font-semibold text-emerald-300">
                  Judul Khutbah
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {fridayKhutbahInfo.judulKhutbah}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {articles.map((article, idx) => (
              <article
                key={article.id}
                className="overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 shadow-lg shadow-slate-200/50 ring-1 ring-emerald-100"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      Tidak ada gambar
                    </div>
                  )}
                </div>

                <div className="p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-base font-black text-white">
                      0{idx + 1}
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                      {article.category}
                    </span>
                  </div>

                  <h4 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                    {article.title}
                  </h4>

                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {article.excerpt}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{formatDate(article.date)}</span>
                    <span>•</span>
                    <span>{article.author || "Admin"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="program" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Program Masjid
            </span>
            <h3 className="mt-4 text-4xl font-black leading-tight text-slate-900">
              Dukungan jamaah untuk program yang sedang berjalan
            </h3>
          </div>
          <p className="text-lg leading-8 text-slate-600">
            Informasi program donasi dan kegiatan sosial ditampilkan secara
            ringkas agar jamaah dapat mengikuti perkembangannya dan ikut
            berpartisipasi.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {programs.map((program) => {
            const percent = getProgressPercent(program.terkumpul, program.target);

            return (
              <div
                key={program.title}
                className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {percent}% tercapai
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {program.status}
                  </span>
                </div>

                <h4 className="mt-5 text-2xl font-bold text-slate-900">
                  {program.title}
                </h4>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {program.description}
                </p>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Terkumpul
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatRupiah(program.terkumpul)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Target
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formatRupiah(program.target)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="berita" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              Berita & Pengumuman
            </span>
            <h3 className="mt-4 text-4xl font-black leading-tight text-slate-900">
              Informasi terbaru untuk jamaah
            </h3>
          </div>
          <p className="text-lg leading-8 text-slate-600">
            Kajian, pengumuman, dan kabar terbaru masjid dapat diakses dengan
            lebih cepat dan nyaman dari satu halaman yang tertata.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {latestNews.map((news) => (
            <div
              key={news.title}
              className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
            >
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                {news.category}
              </span>
              <h4 className="mt-5 text-2xl font-bold leading-snug text-slate-900">
                {news.title}
              </h4>
              <p className="mt-4 text-base text-slate-500">{news.date}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-emerald-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                {todayQuote.type === "ayat" ? "Ayat Harian" : "Hadis Harian"}
              </span>
              <h3 className="mt-4 text-3xl font-black text-slate-900">
                Renungan untuk hari ini
              </h3>
            </div>
            <p className="text-base leading-7 text-slate-500">
              {getTodayLabel()}
            </p>
          </div>

          <div className="mt-6 rounded-[28px] bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white sm:p-8">
            <p className="text-right text-sm font-semibold text-emerald-50/90">
              {todayQuote.source}
            </p>
            <p className="mt-4 text-right text-2xl font-bold leading-[2.2] sm:text-3xl">
              {todayQuote.arabic}
            </p>
            <p className="mt-6 text-lg leading-8 text-emerald-50/95 sm:text-xl">
              {todayQuote.translation}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[36px] bg-gradient-to-r from-emerald-600 to-sky-500 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.15)] sm:p-8">
          <div className="mb-8">
            <span className="inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
              Ringkasan Laporan Keuangan
            </span>
            <h3 className="mt-4 text-4xl font-black leading-tight text-white">
              Data keuangan tampil live dan sinkron
            </h3>
            <p className="mt-3 max-w-3xl text-lg leading-8 text-emerald-50/90">
              Menampilkan 3 kategori keuangan utama yang tersinkron langsung
              dari Google Spreadsheet.
            </p>
          </div>

          {loadingFinance ? (
            <div className="rounded-[28px] bg-white/10 p-5 text-base font-medium text-white">
              Memuat data keuangan...
            </div>
          ) : (
            <div className="grid gap-5 xl:grid-cols-3">
              <FinanceSectionCard title="Kas Masjid" summary={kasMasjidSummary} />
              <FinanceSectionCard
                title="Kas Pembangunan"
                summary={kasPembangunanSummary}
              />
              <FinanceSectionCard
                title="Kas Anak Yatim"
                summary={kasAnakYatimSummary}
              />
            </div>
          )}
        </div>
      </section>

      <section id="kontak" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                Kontak & Informasi
              </span>
              <h3 className="mt-4 text-4xl font-black leading-tight text-slate-900">
                Langgar Kidoel hadir sebagai pusat informasi kegiatan dan
                pelayanan jamaah
              </h3>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Silakan akses website ini untuk mengikuti perkembangan program,
                membaca pengumuman, dan melihat informasi terbaru dari Langgar
                Kidoel.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-emerald-600">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      Alamat
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      Jl. Raya Masjid No. 1, Kota Indah, Indonesia
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-emerald-600">
                    <Phone size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      Kontak
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-900">
                      0812-3456-7890
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-emerald-600">
                    <Mail size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                      Email
                    </p>
                    <p className="mt-2 text-xl font-bold break-all text-slate-900">
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
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.9fr_0.9fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 text-2xl font-bold text-white shadow-lg">
                ☪
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Website Resmi
                </p>
                <h4 className="text-2xl font-black text-slate-900">
                  Langgar Kidoel
                </h4>
              </div>
            </div>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-600">
              Website resmi Langgar Kidoel untuk menyampaikan informasi jamaah,
              program masjid, jadwal shalat, berita, serta laporan keuangan
              secara lebih rapi dan mudah diakses.
            </p>
          </div>

          <div>
            <h5 className="text-lg font-black text-slate-900">Navigasi</h5>
            <div className="mt-4 space-y-3">
              <a href="#beranda" className="block text-base text-slate-600 hover:text-emerald-700">
                Beranda
              </a>
              <a href="#program" className="block text-base text-slate-600 hover:text-emerald-700">
                Program
              </a>
              <a href="#berita" className="block text-base text-slate-600 hover:text-emerald-700">
                Berita
              </a>
              <Link href="/keuangan" className="block text-base text-slate-600 hover:text-emerald-700">
                Keuangan
              </Link>
              <a href="#kontak" className="block text-base text-slate-600 hover:text-emerald-700">
                Kontak
              </a>
            </div>
          </div>

          <div>
            <h5 className="text-lg font-black text-slate-900">Kontak Cepat</h5>
            <div className="mt-4 space-y-3 text-base text-slate-600">
              <p>Jl. Raya Masjid No. 1, Kota Indah, Indonesia</p>
              <p>0812-3456-7890</p>
              <p className="break-all">info@langgarkidoel.id</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p>© 2026 Langgar Kidoel. Semua hak cipta dilindungi.</p>
            <p>Dikelola untuk memudahkan informasi jamaah.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}