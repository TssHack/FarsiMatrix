const faNumber = new Intl.NumberFormat('fa-IR');

export function fa(n: number): string {
  return faNumber.format(n);
}

export function faPercent(ratio: number): string {
  return `${fa(Math.round(ratio * 100))}٪`;
}
