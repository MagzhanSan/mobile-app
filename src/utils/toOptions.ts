// utils/toOptions.ts
/**
 * Преобразует любой массив объектов в массив опций { label, value }.
 *
 * @param items — массив объектов
 * @param labelKey — ключ, по которому берётся строка для label
 * @param valueKey — ключ, по которому берётся значение для value (преобразуется в строку)
 */
export function toOptions<T extends Record<string, any>>(
  items: T[],
  labelKey: keyof T,
  valueKey: keyof T,
): { label: string; value: string }[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  return items.map((item, index) => ({
    label: String(item[labelKey] || ''),
    value: String(item[valueKey] || ''),
    key: String(item[valueKey] || `option-${index}`),
  }));
}
