class MoneyUtility {
  public static round2(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  public static formatCurrency(value: number, locale: string = 'zh-CN', currency: string = 'CNY'): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);
  }

  public static formatSigned(value: number): string {
    const rounded: number = MoneyUtility.round2(value);
    return `${rounded >= 0 ? '+' : ''}${rounded.toFixed(2)}`;
  }
}

export { MoneyUtility as MoneyUtil };
