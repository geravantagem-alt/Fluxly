export function normalizeCnpj(value: string) {
  return value.replace(/\D/g, "").slice(0, 14);
}

export function maskCnpj(value: string) {
  const digits = normalizeCnpj(value);
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function isValidCnpjFormat(cnpj: string) {
  const normalized = normalizeCnpj(cnpj);
  if (normalized.length !== 14) return false;
  return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(maskCnpj(cnpj));
}

export function isValidCnpj(cnpj: string) {
  const cleaned = normalizeCnpj(cnpj);
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calcDigit = (base: string, factors: number[]) => {
    const sum = base.split("").reduce((acc, num, index) => acc + Number(num) * factors[index], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const first = calcDigit(cleaned.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calcDigit(cleaned.slice(0, 12) + String(first), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return cleaned.endsWith(`${first}${second}`);
}