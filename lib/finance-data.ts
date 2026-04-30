export type FinanceType = "kas_masuk" | "kas_keluar" | "donasi";
export type FinanceBucket = "kas_masjid" | "kas_pembangunan" | "kas_anak_yatim";

export type FinanceItem = {
  id: string;
  date: string;
  type: FinanceType;
  bucket: FinanceBucket;
  title: string;
  amount: number;
  donorName?: string;
  note?: string;
};

export const financeItems: FinanceItem[] = [
  {
    id: "trx-001",
    date: "2026-02-15",
    type: "kas_keluar",
    bucket: "kas_masjid",
    title: "Bayar listrik Februari",
    amount: 1300000,
    note: "Pembayaran listrik bulanan",
  },
  {
    id: "trx-002",
    date: "2026-02-10",
    type: "donasi",
    bucket: "kas_pembangunan",
    title: "Donasi renovasi",
    amount: 2500000,
    donorName: "Ahmad Fauzi",
  },
  {
    id: "trx-003",
    date: "2026-02-09",
    type: "donasi",
    bucket: "kas_pembangunan",
    title: "Donasi renovasi",
    amount: 1000000,
    donorName: "Siti Aminah",
  },
  {
    id: "trx-004",
    date: "2026-02-08",
    type: "kas_masuk",
    bucket: "kas_masjid",
    title: "Infaq Jumat Minggu 1",
    amount: 6000000,
    note: "Pemasukan infaq mingguan",
  },
  {
    id: "trx-005",
    date: "2026-02-07",
    type: "donasi",
    bucket: "kas_anak_yatim",
    title: "Donasi santunan anak yatim",
    amount: 750000,
    donorName: "Hamba Allah",
  },
  {
    id: "trx-006",
    date: "2026-02-05",
    type: "kas_keluar",
    bucket: "kas_masjid",
    title: "Gaji marbot",
    amount: 2000000,
    note: "Operasional bulanan",
  },
  {
    id: "trx-007",
    date: "2026-02-03",
    type: "donasi",
    bucket: "kas_anak_yatim",
    title: "Donasi anak yatim",
    amount: 500000,
    donorName: "Muhammad Rizki",
  },
  {
    id: "trx-008",
    date: "2026-02-01",
    type: "kas_masuk",
    bucket: "kas_masjid",
    title: "Infaq kotak amal",
    amount: 4800000,
    note: "Pemasukan dari kotak amal",
  },
  {
    id: "trx-009",
    date: "2026-01-29",
    type: "donasi",
    bucket: "kas_pembangunan",
    title: "Donasi pembangunan aula",
    amount: 1250000,
    donorName: "Budi Santoso",
  },
  {
    id: "trx-010",
    date: "2026-01-28",
    type: "donasi",
    bucket: "kas_anak_yatim",
    title: "Donasi santunan",
    amount: 900000,
    donorName: "Nur Aini",
  },
];

export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function getFinanceSummary() {
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
}

export function getLatestFinanceItems(limit = 5) {
  return [...financeItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getLatestFinanceItemsByBucket(
  bucket: FinanceBucket,
  limit = 5
) {
  return financeItems
    .filter((item) => item.bucket === bucket)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getFinanceSummaryByBucket(bucket: FinanceBucket) {
  const bucketItems = financeItems.filter((item) => item.bucket === bucket);

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
}