type Board = 'main' | 'chinext' | 'star' | 'beijing' | 'unknown';

class AStockRules {
  public static readonly MAIN_BOARD_LIMIT: number = 0.1;
  public static readonly CHINEXT_LIMIT: number = 0.2;
  public static readonly STAR_LIMIT: number = 0.2;
  public static readonly BEIJING_LIMIT: number = 0.3;
  public static readonly ST_LIMIT: number = 0.05;
  public static readonly LOT_SIZE: number = 100;

  public static getBoard(symbol: string): Board {
    if (/^(60|00)\d{4}$/.test(symbol)) return 'main';
    if (/^30\d{4}$/.test(symbol)) return 'chinext';
    if (/^68\d{4}$/.test(symbol)) return 'star';
    if (/^(8|4)\d{5}$/.test(symbol)) return 'beijing';
    return 'unknown';
  }

  public static isEtf(symbol: string): boolean {
    return /^(51|15|56|58)\d{4}$/.test(symbol);
  }

  public static getPriceLimitRatio(symbol: string, name: string = ''): number {
    const isSt: boolean = name.toUpperCase().includes('ST');
    if (isSt) return AStockRules.ST_LIMIT;
    switch (AStockRules.getBoard(symbol)) {
      case 'chinext':
      case 'star':
        return AStockRules.CHINEXT_LIMIT;
      case 'beijing':
        return AStockRules.BEIJING_LIMIT;
      case 'main':
      default:
        return AStockRules.MAIN_BOARD_LIMIT;
    }
  }

  public static isBuyQuantityValid(quantity: number, source: 'buy' | 'sell'): boolean {
    if (source === 'sell') return true;
    return quantity % AStockRules.LOT_SIZE === 0;
  }
}

export { AStockRules };
export type { Board };
