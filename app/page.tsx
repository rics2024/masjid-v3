"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  HeartHandshake,
  Menu,
  MoonStar,
  Newspaper,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  fetchFinanceItems,
  formatRupiah,
  type FinanceBucket,
  type FinanceItem,
} from "@/lib/finance-api";

const features = [
  {
    icon: Wallet,
    title: "Keuangan Transparan",
    text: "Ringkasan pemasukan, pengeluaran, saldo, dan laporan publik yang mudah dipahami jamaah.",
  },
  {
    icon: HeartHandshake,
    title: "Program Donasi Aktif",
    text: "Program infaq, bantuan, renovasi, Ramadhan, dan Qurban tampil lebih rapi dan mudah diakses.",
  },
  {
    icon: Newspaper,
    title: "Portal Berita Masjid",
    text: "Pengumuman, kajian, dan agenda masjid dapat dipublikasikan dengan tampilan yang modern.",
  },
  {
    icon: ShieldCheck,
    title: "Pengelolaan Lebih Mudah",
    text: "Dirancang agar mudah digunakan pengurus untuk mengelola informasi masjid secara teratur.",
  },
];

const fallbackQuotes = [
  {
    type: "Ayat Hari Ini",
    source: "QS. Al-Baqarah: 152",
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ",
    translation:
      "Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu. Bersyukurlah kepada-Ku, dan janganlah kamu ingkar kepada-Ku.",
  },
  {
    type: "Ayat Hari Ini",
    source: "QS. Ar-Ra'd: 28",
    arabic: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation:
      "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.",
  },
  {
    type: "Ayat Hari Ini",
    source: "QS. At-Talaq: 3",
    arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation:
      "Dan barang siapa bertawakal kepada Allah, niscaya Allah akan mencukupkan keperluannya.",
  },
];

const STATIC_PROGRAM_COUNT = 4;
const STATIC_NEWS_COUNT = 12;
const PEMBANGUNAN_TARGET = 50_000_000;
const TOTAL_QURAN_AYAHS = 6236;

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Sunrise?: string;
};

type DailyQuote = {
  type: string;
  source: string;
  arabic: string;
  translation: string;
};

type FinancePanelProps = {
  title: string;
  bucket: FinanceBucket;
  items: FinanceItem[];
};

function formatShortDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function stripTime(value?: string) {
  if (!value) return "-";
  return value.split(" ")[0];
}

function getAyahNumberOfTheDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000) + 1;
  return ((dayOfYear - 1) % TOTAL_QURAN_AYAHS) + 1;
}

function FinancePanel({ title, bucket, items }: FinancePanelProps) {
  const bucketItems = useMemo(() => {
    return items
      .filter((item) => item.bucket === bucket)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [items, bucket]);

  const summary = useMemo(() => {
    const income = bucketItems
      .filter((item) => item.type === "kas_masuk" || item.type === "donasi")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = bucketItems
      .filter((item) => item.type === "kas_keluar")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [bucketItems]);

  return (
    <div className="rounded-[28px] bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="mb-4">
        <h4 className="text-2xl font-black text-white">{title}</h4>
        <p className="mt-2 text-sm text-white/75">5 transaksi terbaru</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/70">Masuk</p>
          <p className="mt-2 text-lg font-black">{formatRupiah(summary.income)}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/70">Keluar</p>
          <p className="mt-2 text-lg font-black">{formatRupiah(summary.expense)}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-xs uppercase tracking-wide text-white/70">Saldo</p>
          <p className="mt-2 text-lg font-black">{formatRupiah(summary.balance)}</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[22px] bg-black/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/10 text-white/85">
            <tr>
              <th className="px-4 py-3 font-semibold">Tanggal</th>
              <th className="px-4 py-3 font-semibold">Kas Masuk</th>
              <th className="px-4 py-3 font-semibold">Kas Keluar</th>
              <th className="px-4 py-3 font-semibold">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {bucketItems.length > 0 ? (
              bucketItems.map((item) => {
                const isIncome =
                  item.type === "kas_masuk" || item.type === "donasi";
                const isExpense = item.type === "kas_keluar";

                return (
                  <tr key={item.id} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white/90">
                      {formatShortDate(item.date)}
                    </td>
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
              })
            ) : (
              <tr className="border-t border-white/10">
                <td colSpan={4} className="px-4 py-4 text-white/70">
                  Belum ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Home() {
  const [financeItems, setFinanceItems] = useState<FinanceItem[]>([]);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [financeError, setFinanceError] = useState("");

  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [prayerLoading, setPrayerLoading] = useState(true);

  const [dailyQuote, setDailyQuote] = useState<DailyQuote>(
    fallbackQuotes[new Date().getDate() % fallbackQuotes.length]
  );

  async function loadFinanceItems() {
    try {
      setFinanceLoading(true);
      setFinanceError("");
      const data = await fetchFinanceItems();
      setFinanceItems(data);
    } catch (error) {
      console.error(error);
      setFinanceError("Gagal mengambil data keuangan.");
    } finally {
      setFinanceLoading(false);
    }
  }

  async function loadPrayerTimes() {
    try {
      setPrayerLoading(true);

      const city = "Yogyakarta";
      const country = "Indonesia";
      const url =
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}` +
        `&country=${encodeURIComponent(country)}&method=20`;

      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (json?.code === 200 && json?.data?.timings) {
        setPrayerTimes({
          Fajr: stripTime(json.data.timings.Fajr),
          Dhuhr: stripTime(json.data.timings.Dhuhr),
          Asr: stripTime(json.data.timings.Asr),
          Maghrib: stripTime(json.data.timings.Maghrib),
          Isha: stripTime(json.data.timings.Isha),
          Sunrise: stripTime(json.data.timings.Sunrise),
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPrayerLoading(false);
    }
  }

  async function loadDailyQuote() {
    try {
      const ayahNumber = getAyahNumberOfTheDay();
      const url = `https://api.alquran.cloud/v1/ayah/${ayahNumber}/editions/quran-uthmani,id.indonesian`;
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();

      if (json?.code === 200 && Array.isArray(json?.data) && json.data.length >= 2) {
        const arabicEdition = json.data[0];
        const indonesianEdition = json.data[1];

        setDailyQuote({
          type: "Ayat Hari Ini",
          source: `QS. ${arabicEdition?.surah?.englishName || indonesianEdition?.surah?.englishName || "Al-Qur'an"}: ${arabicEdition?.numberInSurah || indonesianEdition?.numberInSurah || ""}`,
          arabic: arabicEdition?.text || "",
          translation: indonesianEdition?.text || "",
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadFinanceItems();
    loadPrayerTimes();
    loadDailyQuote();
  }, []);

  const overallSummary = useMemo(() => {
    const income = financeItems
      .filter((item) => item.type === "kas_masuk" || item.type === "donasi")
      .reduce((sum, item) => sum + item.amount, 0);

    const expense = financeItems
      .filter((item) => item.type === "kas_keluar")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [financeItems]);

  const pembangunanSummary = useMemo(() => {
    const pembangunanItems = financeItems.filter(
      (item) => item.bucket === "kas_pembangunan"
    );

    const collected = pembangunanItems
      .filter((item) => item.type === "kas_masuk" || item.type === "donasi")
      .reduce((sum, item) => sum + item.amount, 0);

    const progress = Math.min(
      100,
      Math.round((collected / PEMBANGUNAN_TARGET) * 100) || 0
    );

    return {
      collected,
      target: PEMBANGUNAN_TARGET,
      progress,
    };
  }, [financeItems]);

  const heroStats = useMemo(() => {
    return [
      {
        label: "Pemasukan Tahun Ini",
        value: formatRupiah(overallSummary.income),
      },
      {
        label: "Saldo Aktif",
        value: formatRupiah(overallSummary.balance),
      },
      {
        label: "Program Aktif",
        value: `${STATIC_PROGRAM_COUNT} Program`,
      },
      {
        label: "Berita Terbaru",
        value: `${STATIC_NEWS_COUNT} Update`,
      },
    ];
  }, [overallSummary]);

  const prayerCards = [
    ["Subuh", prayerTimes?.Fajr ?? "-"],
    ["Dzuhur", prayerTimes?.Dhuhr ?? "-"],
    ["Ashar", prayerTimes?.Asr ?? "-"],
    ["Maghrib", prayerTimes?.Maghrib ?? "-"],
    ["Isya", prayerTimes?.Isha ?? "-"],
    ["Terbit", prayerTimes?.Sunrise ?? "-"],
  ] as const;

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-200">
              <MoonStar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide text-emerald-700">
                Website Resmi
              </p>
              <h1 className="text-xl font-bold tracking-tight">Langgar Kidoel</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            <a className="text-base font-semibold text-slate-700 transition hover:text-emerald-700" href="#beranda">
              Beranda
            </a>
            <a className="text-base font-semibold text-slate-700 transition hover:text-emerald-700" href="#fitur">
              Fitur
            </a>
            <a className="text-base font-semibold text-slate-700 transition hover:text-emerald-700" href="#program">
              Program
            </a>
            <a className="text-base font-semibold text-slate-700 transition hover:text-emerald-700" href="#keuangan">
              Keuangan
            </a>
            <a className="text-base font-semibold text-slate-700 transition hover:text-emerald-700" href="#kontak">
              Kontak
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-2xl lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section
          id="beranda"
          className="relative overflow-hidden text-white"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(4,24,18,0.88) 0%, rgba(6,95,70,0.78) 45%, rgba(16,185,129,0.48) 100%), url('https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <Badge className="mb-5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/10">
                Website Resmi Langgar Kidoel
              </Badge>

              <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Pusat informasi Masjid yang rapi, modern, dan mudah diakses jamaah.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-50/90 sm:text-lg">
                Temukan informasi kegiatan, jadwal shalat, program donasi, berita terbaru, dan
                laporan keuangan masjid dalam satu website yang nyaman dibuka dari HP maupun
                desktop.
              </p>

              <div className="mt-8">
                <p className="max-w-xl text-sm leading-7 text-emerald-50/80 sm:text-base">
                  Website ini disiapkan untuk memudahkan jamaah mengikuti informasi terbaru dari
                  Langgar Kidoel secara lebih cepat dan tertata.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {heroStats.map((item) => (
                  <Card
                    key={item.label}
                    className="rounded-[28px] border border-white/10 bg-white/10 text-white shadow-none backdrop-blur-md"
                  >
                    <CardContent className="p-6">
                      <p className="break-words text-3xl font-black leading-tight sm:text-4xl">
                        {item.value}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-emerald-50/85 sm:text-base">
                        {item.label}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <Card className="w-full rounded-[32px] border border-white/10 bg-white/90 text-slate-900 shadow-2xl shadow-emerald-950/20 backdrop-blur-md">
                <CardContent className="space-y-6 p-5 sm:p-6 lg:p-7">
                  <div className="rounded-[28px] bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          Jadwal Shalat
                        </p>
                        <h3 className="mt-2 text-2xl font-black text-slate-900">Hari Ini</h3>
                      </div>
                      <div className="rounded-2xl bg-white px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                        {prayerLoading ? "Memuat..." : "Live Update"}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {prayerCards.map(([name, time]) => (
                        <div
                          key={name}
                          className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-emerald-100"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {name}
                          </p>
                          <p className="mt-2 text-lg font-black text-slate-900">{time}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-slate-950 p-5 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                          Program Unggulan
                        </p>
                        <h3 className="mt-2 text-2xl font-black">Renovasi Langgar Kidoel</h3>
                      </div>
                      <Badge className="rounded-full bg-amber-400 px-3 py-1 text-slate-900 hover:bg-amber-400">
                        {pembangunanSummary.progress}% Tercapai
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      Pengembangan area ibadah, perbaikan fasilitas wudhu, dan peningkatan ruang
                      kegiatan jamaah.
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Terkumpul</p>
                        <p className="mt-2 text-xl font-black">
                          {formatRupiah(pembangunanSummary.collected)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Target</p>
                        <p className="mt-2 text-xl font-black">
                          {formatRupiah(pembangunanSummary.target)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-800 text-white shadow-2xl shadow-emerald-200/20">
            <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12">
              <div className="mb-4">
                <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  {dailyQuote.type}
                </span>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
                {dailyQuote.source}
              </p>

              <h3 className="mt-5 text-right text-2xl font-bold leading-loose text-white sm:text-3xl lg:text-4xl">
                {dailyQuote.arabic}
              </h3>

              <div className="mt-6 h-px w-full bg-white/10" />

              <p className="mt-6 max-w-3xl text-base leading-8 text-emerald-50/90 sm:text-lg">
                {dailyQuote.translation}
              </p>
            </div>
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                Informasi Utama
              </Badge>
              <h3 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Informasi utama untuk jamaah dalam satu halaman.
              </h3>
            </div>

            <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Halaman ini membantu jamaah melihat jadwal shalat, mengikuti program masjid,
              membaca pengumuman terbaru, serta memantau laporan keuangan dengan tampilan
              yang lebih rapi dan mudah dipahami.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: MoonStar,
                title: "Jadwal Shalat & Agenda",
                text: "Jadwal shalat harian dan agenda kegiatan masjid ditampilkan agar jamaah mudah mengikuti aktivitas ibadah.",
              },
              {
                icon: HeartHandshake,
                title: "Program Donasi Masjid",
                text: "Program pembangunan, santunan, infaq, dan kegiatan sosial ditampilkan agar jamaah mudah berpartisipasi.",
              },
              {
                icon: Newspaper,
                title: "Berita & Pengumuman",
                text: "Informasi kajian, pengumuman kegiatan, dan berita terbaru masjid bisa dibaca dengan lebih cepat dan jelas.",
              },
              {
                icon: Wallet,
                title: "Laporan Keuangan",
                text: "Ringkasan pemasukan, pengeluaran, dan saldo masjid disajikan agar jamaah dapat melihat transparansi keuangan.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-[28px] border-0 bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-100"
                >
                  <CardContent className="p-7">
                    <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3.5 text-white shadow-md shadow-emerald-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h4 className="text-2xl font-black tracking-tight text-slate-950">
                      {item.title}
                    </h4>
                    <p className="mt-4 text-base leading-8 text-slate-600">{item.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="program" className="mx-auto max-w-7xl px-4 pb-14 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-[30px] border-0 bg-slate-950 text-white shadow-xl shadow-slate-300/30">
              <CardContent className="p-7 sm:p-9">
                <Badge className="rounded-full bg-emerald-400 px-4 py-1.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400">
                  Akses Mudah
                </Badge>

                <h3 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  Mudah diakses jamaah dari HP maupun desktop
                </h3>

                <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
                  Website Langgar Kidoel dibuat agar tetap nyaman dibuka dari berbagai perangkat.
                  Jamaah dapat melihat jadwal shalat, membaca pengumuman, memantau program donasi,
                  dan melihat laporan keuangan tanpa harus kesulitan saat membuka dari layar kecil.
                </p>

                <div className="mt-7 rounded-[28px] bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
                      <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">Tampilan responsif</p>
                      <p className="text-base leading-7 text-slate-400">
                        Menu, jadwal, berita, program, dan laporan keuangan menyesuaikan ukuran layar secara otomatis.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "Jadwal Harian",
                  text: "Jadwal shalat dan informasi waktu ibadah harian tersedia agar jamaah lebih mudah memantau waktu.",
                },
                {
                  title: "Program Sosial & Donasi",
                  text: "Informasi pembangunan, santunan, dan program infaq ditampilkan agar jamaah mudah ikut mendukung.",
                },
                {
                  title: "Kajian & Pengumuman",
                  text: "Agenda kajian, berita kegiatan, dan pengumuman penting ditampilkan lebih rapi dan informatif.",
                },
                {
                  title: "Transparansi Keuangan",
                  text: "Data pemasukan, pengeluaran, dan saldo ditampilkan agar jamaah dapat memantau laporan masjid.",
                },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className="rounded-[28px] border-0 bg-gradient-to-br from-white to-emerald-50 shadow-lg shadow-slate-200/50 ring-1 ring-emerald-100"
                >
                  <CardContent className="p-7">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-base font-black text-white">
                      0{idx + 1}
                    </div>
                    <h4 className="mt-5 text-2xl font-black tracking-tight text-slate-950">
                      {item.title}
                    </h4>
                    <p className="mt-4 text-base leading-8 text-slate-600">{item.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="keuangan" className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <Card className="overflow-hidden rounded-[34px] border-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl shadow-emerald-200/50">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge className="rounded-full bg-white/15 text-white hover:bg-white/15">
                    Ringkasan Laporan Keuangan
                  </Badge>
                  <h3 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                    Data keuangan tampil live dan sinkron.
                  </h3>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
                    Menampilkan 3 kategori keuangan utama yang tersinkron langsung dari Google Spreadsheet.
                  </p>
                </div>

                <a href="/keuangan">
                  <Button className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
                    Lihat Detail
                  </Button>
                </a>
              </div>

              {financeError ? (
                <div className="mt-6 rounded-2xl border border-rose-300/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {financeError}
                </div>
              ) : null}

              {financeLoading ? (
                <div className="mt-6 rounded-2xl bg-white/10 px-4 py-4 text-sm text-white/80">
                  Memuat data keuangan...
                </div>
              ) : (
                <div className="mt-8 grid gap-6 xl:grid-cols-3">
                  <FinancePanel title="Kas Masjid" bucket="kas_masjid" items={financeItems} />
                  <FinancePanel title="Kas Pembangunan" bucket="kas_pembangunan" items={financeItems} />
                  <FinancePanel title="Kas Anak Yatim" bucket="kas_anak_yatim" items={financeItems} />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section id="kontak" className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                  Kontak & Informasi
                </p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
                  Langgar Kidoel hadir sebagai pusat informasi kegiatan dan pelayanan jamaah.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Silakan akses website untuk mengikuti perkembangan program, membaca pengumuman,
                  dan melihat informasi terbaru dari Langgar Kidoel.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="/keuangan">
                  <Button className="rounded-2xl bg-emerald-600 px-6 py-6 text-base font-semibold hover:bg-emerald-700">
                    Lihat Keuangan
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-3 lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-200">
                <MoonStar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-emerald-700">
                  Website Resmi
                </p>
                <h4 className="text-lg font-bold text-slate-950">Langgar Kidoel</h4>
              </div>
            </div>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Website resmi Langgar Kidoel untuk menyampaikan informasi kegiatan,
              jadwal shalat, program donasi, berita masjid, dan laporan keuangan secara
              lebih rapi dan mudah diakses jamaah.
            </p>
          </div>

          <div>
            <h5 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
              Navigasi
            </h5>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><a href="#beranda" className="transition hover:text-emerald-700">Beranda</a></li>
              <li><a href="#fitur" className="transition hover:text-emerald-700">Fitur</a></li>
              <li><a href="#program" className="transition hover:text-emerald-700">Program</a></li>
              <li><a href="#keuangan" className="transition hover:text-emerald-700">Keuangan</a></li>
              <li><a href="#kontak" className="transition hover:text-emerald-700">Kontak</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-900">
              Informasi
            </h5>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Alamat: Yogyakarta, Indonesia</p>
              <p>Email: info@langgarkidoel.com</p>
              <p>Website ini dikelola untuk kebutuhan informasi jamaah.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <p>© 2026 Langgar Kidoel. Semua hak dilindungi.</p>
            <p>Media informasi resmi untuk jamaah dan masyarakat.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}