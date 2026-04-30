export function formatNumberInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

export function parseNumberInput(value: string) {
  return Number(value.replace(/\./g, "").replace(/,/g, "").replace(/\D/g, "")) || 0;
}