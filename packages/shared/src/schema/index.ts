import { z } from 'zod';

const DATE_REGEX: RegExp = /^\d{4}-\d{2}-\d{2}$/;
const SYMBOL_REGEX: RegExp = /^\d{6}$/;

function isValidDateKey(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const date: Date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

const DATE_SCHEMA: z.ZodString = z
  .string()
  .regex(DATE_REGEX, 'date must be YYYY-MM-DD')
  .refine(isValidDateKey, 'date must be a real calendar date');

export const TradeInputSchema = z.object({
  tradeDate: DATE_SCHEMA,
  symbol: z.string().regex(SYMBOL_REGEX, 'symbol must be a 6-digit A-share code'),
  name: z.string().trim().max(32).optional().default(''),
  side: z.enum(['buy', 'sell']),
  price: z.number().positive('price must be positive').multipleOf(0.01, 'price must have at most 2 decimal places').max(1_000_000),
  quantity: z.number().int('quantity must be an integer').positive('quantity must be positive').max(1_000_000_000),
  fees: z.number().nonnegative('fees must be non-negative').max(1_000_000).optional().default(0),
  strategy: z.string().trim().max(64).optional().default(''),
  tags: z.array(z.string().trim().max(32)).max(20).optional().default([]),
  reason: z.string().trim().max(2000).optional().default(''),
});

export const CashFlowInputSchema = z.object({
  date: DATE_SCHEMA,
  type: z.enum(['deposit', 'withdraw']),
  amount: z.number().positive('amount must be positive').multipleOf(0.01, 'amount must have at most 2 decimal places').max(1_000_000_000),
  note: z.string().trim().max(500).optional().default(''),
});

export const EquitySnapshotInputSchema = z.object({
  id: z.string().uuid().optional(),
  date: DATE_SCHEMA,
  totalEquity: z.number().positive('totalEquity must be positive').max(1_000_000_000_000),
  note: z.string().trim().max(500).optional().default(''),
});

export const SettingsInputSchema = z.object({
  initialCapital: z.number().nonnegative('initialCapital must be non-negative').max(1_000_000_000_000),
  timeZone: z.string().trim().max(64).optional().default('Asia/Shanghai'),
});

export const ImportPayloadSchema = z.object({
  version: z.literal(1),
  user: z
    .object({
      email: z.string().trim().max(254).optional().default(''),
    })
    .optional(),
  trades: z
    .array(TradeInputSchema.extend({ id: z.string().uuid() }))
    .max(100_000)
    .optional()
    .default([]),
  cashFlows: z
    .array(CashFlowInputSchema.extend({ id: z.string().uuid() }))
    .max(100_000)
    .optional()
    .default([]),
  equitySnapshots: z.array(EquitySnapshotInputSchema).max(20_000).optional().default([]),
  settings: SettingsInputSchema.optional(),
});

export type TradeInput = z.infer<typeof TradeInputSchema>;
export type CashFlowInput = z.infer<typeof CashFlowInputSchema>;
export type EquitySnapshotInput = z.infer<typeof EquitySnapshotInputSchema>;
export type SettingsInput = z.infer<typeof SettingsInputSchema>;
export type ImportPayload = z.infer<typeof ImportPayloadSchema>;
