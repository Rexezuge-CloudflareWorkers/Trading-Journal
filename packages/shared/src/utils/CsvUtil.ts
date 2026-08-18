interface CsvColumn<T> {
  key: keyof T;
  label: string;
}

class CsvUtil {
  public static toCsv<T extends Record<string, unknown>>(rows: T[], columns: CsvColumn<T>[]): string {
    const header: string = columns.map((column) => CsvUtil.escape(column.label)).join(',');
    const lines: string[] = rows.map((row) => columns.map((column) => CsvUtil.escape(String(row[column.key] ?? ''))).join(','));
    return [header, ...lines].join('\n');
  }

  private static escape(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return `"${value.replaceAll('"', '""')}"`;
    }
    return value;
  }
}

export { CsvUtil };
export type { CsvColumn };
