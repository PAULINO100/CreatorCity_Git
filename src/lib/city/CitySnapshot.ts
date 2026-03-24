/**
 * Interfaces e tipos para o estado da cidade (City Snapshot)
 */

export interface BuildingState {
  id: string;
  type: string;
  position: { x: number; y: number };
  customization?: Record<string, unknown>;
}

export interface EconomyState {
  totalBalance: number;
  activeTransactions: number;
  districtLiquidity: Record<string, number>;
}

export interface CityMetadata {
  version: string;
  lastCheckpointLabel?: string;
  districtConfigs: Record<string, unknown>;
  integrityHash?: string;
}

export type CityStatus = 'active' | 'safe_mode' | 'corrupted';

export interface CitySnapshot {
  id?: string;
  timestamp: Date;
  version: string;
  status: CityStatus;
  label?: string;
  buildings: BuildingState[];
  economy: EconomyState;
  metadata: CityMetadata;
}
