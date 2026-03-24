import { create } from 'zustand';
import { CityStatus } from './CitySnapshot';

interface CityState {
  status: CityStatus;
  setStatus: (status: CityStatus) => void;
  lastSnapshotId: string | null;
  setLastSnapshotId: (id: string | null) => void;
}

export const useCityStore = create<CityState>((set) => ({
  status: 'active',
  setStatus: (status) => set({ status }),
  lastSnapshotId: null,
  setLastSnapshotId: (id) => set({ lastSnapshotId: id }),
}));
