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
  createdAt?: string;
};

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL;

export function formatRupiah(amount: number) {
  return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
}

export async function fetchFinanceItems(): Promise<FinanceItem[]> {
  if (!GAS_URL) {
    throw new Error("NEXT_PUBLIC_GAS_URL belum di-set di .env.local");
  }

  const res = await fetch(GAS_URL, {
    method: "GET",
    cache: "no-store",
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Gagal mengambil data");
  }

  return (json.data || []).map((item: any) => ({
    id: String(item.id || ""),
    date: String(item.date || ""),
    type: item.type as FinanceType,
    bucket: item.bucket as FinanceBucket,
    title: String(item.title || ""),
    amount: Number(item.amount || 0),
    donorName: item.donorName ? String(item.donorName) : "",
    note: item.note ? String(item.note) : "",
    createdAt: item.createdAt ? String(item.createdAt) : "",
  }));
}

export async function createFinanceItem(payload: {
  date: string;
  type: FinanceType;
  bucket: FinanceBucket;
  title: string;
  amount: number;
  donorName?: string;
  note?: string;
}) {
  if (!GAS_URL) {
    throw new Error("NEXT_PUBLIC_GAS_URL belum di-set di .env.local");
  }

  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || "Gagal menyimpan data");
  }

  return json;
}