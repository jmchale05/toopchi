import type { TenableValueFormat } from "../../../types/tenable";

export function formatTenableItemValue(
  value: number,
  valueFormat?: TenableValueFormat,
): string {
  if (!valueFormat) {
    return `(${value})`;
  }

  const amount = `${valueFormat.prefix ?? ""}${value}${valueFormat.suffix ?? ""}`;
  const period = valueFormat.period ? ` ${valueFormat.period}` : "";
  return `(${amount}${period})`;
}
