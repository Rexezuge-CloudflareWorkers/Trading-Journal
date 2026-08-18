import { apiFetch } from './api';
import type {
  AnalyticsResponse,
  CashFlow,
  CashFlowInput,
  EquitySnapshot,
  EquitySnapshotInput,
  ImportResult,
  SettingsSummary,
  Trade,
  TradeInput,
} from '../types';

interface TradesResponse {
  trades: Trade[];
}

interface TradeMutationResponse {
  trade: Trade;
  warnings: string[];
}

interface CashFlowsResponse {
  cashFlows: CashFlow[];
}

interface CashFlowMutationResponse {
  cashFlow: CashFlow;
}

interface EquitySnapshotsResponse {
  equitySnapshots: EquitySnapshot[];
}

interface EquitySnapshotMutationResponse {
  equitySnapshot: EquitySnapshot;
}

interface ImportPayload {
  version: 1;
  trades?: Array<TradeInput & { id: string }>;
  cashFlows?: Array<CashFlowInput & { id: string }>;
  equitySnapshots?: EquitySnapshotInput[];
  settings?: SettingsSummary;
}

export const tradesService = {
  list(params: Record<string, string> = {}): Promise<TradesResponse> {
    const query: string = new URLSearchParams(params).toString();
    return apiFetch<TradesResponse>(`/user/trades${query ? `?${query}` : ''}`);
  },
  create(input: TradeInput): Promise<TradeMutationResponse> {
    return apiFetch<TradeMutationResponse>('/user/trades', { method: 'POST', body: JSON.stringify(input) });
  },
  update(tradeId: string, input: TradeInput): Promise<TradeMutationResponse> {
    return apiFetch<TradeMutationResponse>(`/user/trades/${tradeId}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  delete(tradeId: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/user/trades/${tradeId}`, { method: 'DELETE' });
  },
};

export const cashFlowsService = {
  list(): Promise<CashFlowsResponse> {
    return apiFetch<CashFlowsResponse>('/user/cash-flows');
  },
  create(input: CashFlowInput): Promise<CashFlowMutationResponse> {
    return apiFetch<CashFlowMutationResponse>('/user/cash-flows', { method: 'POST', body: JSON.stringify(input) });
  },
  update(cashFlowId: string, input: CashFlowInput): Promise<CashFlowMutationResponse> {
    return apiFetch<CashFlowMutationResponse>(`/user/cash-flows/${cashFlowId}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },
  delete(cashFlowId: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/user/cash-flows/${cashFlowId}`, { method: 'DELETE' });
  },
};

export const equityService = {
  list(): Promise<EquitySnapshotsResponse> {
    return apiFetch<EquitySnapshotsResponse>('/user/equity');
  },
  upsert(input: EquitySnapshotInput): Promise<EquitySnapshotMutationResponse> {
    return apiFetch<EquitySnapshotMutationResponse>('/user/equity', { method: 'POST', body: JSON.stringify(input) });
  },
  update(snapshotId: string, input: { date: string; totalEquity: number; note?: string }): Promise<EquitySnapshotMutationResponse> {
    return apiFetch<EquitySnapshotMutationResponse>(`/user/equity/${snapshotId}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  delete(snapshotId: string): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/user/equity/${snapshotId}`, { method: 'DELETE' });
  },
};

export const analyticsService = {
  get(): Promise<AnalyticsResponse> {
    return apiFetch<AnalyticsResponse>('/user/analytics');
  },
};

export const settingsService = {
  get(): Promise<SettingsSummary> {
    return apiFetch<SettingsSummary>('/user/settings');
  },
  update(settings: SettingsSummary): Promise<SettingsSummary> {
    return apiFetch<SettingsSummary>('/user/settings', { method: 'PUT', body: JSON.stringify(settings) });
  },
};

export const importService = {
  import(payload: ImportPayload): Promise<ImportResult> {
    return apiFetch<ImportResult>('/user/import', { method: 'POST', body: JSON.stringify(payload) });
  },
};

export type { ImportPayload };
