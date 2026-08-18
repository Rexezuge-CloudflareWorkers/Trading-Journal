class TimestampUtility {
  public static getCurrentIsoString(): string {
    return new Date().toISOString();
  }

  public static formatDateKey(date: Date): string {
    const year: number = date.getFullYear();
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const day: string = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export { TimestampUtility as TimestampUtil };
