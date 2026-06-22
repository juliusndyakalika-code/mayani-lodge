const TZS_PER_USD = 2650;

export function fmtTZS(amount: number): string {
  return `TZS ${amount.toLocaleString('en-US')}`;
}

export function fmtUSD(tzsAmount: number): string {
  return `~$${Math.round(tzsAmount / TZS_PER_USD)}`;
}

export function fmtPrice(tzsAmount: number): string {
  return `${fmtTZS(tzsAmount)}  (${fmtUSD(tzsAmount)})`;
}
