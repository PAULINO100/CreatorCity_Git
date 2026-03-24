import { CityStateManager } from './CityStateManager';
import { CitySnapshot } from './CitySnapshot';

// Mocking Prisma for testing
const mockPrisma = {
  citySnapshot: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('CityStateManager', () => {
  let manager: any;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = CityStateManager.getInstance();
    (manager as any).prisma = mockPrisma;
  });

  it('should return safe_mode when snapshot is corrupted (missing version)', async () => {
    const corruptedRecord = {
      id: '123',
      timestamp: new Date(),
      version: undefined, // Corruption: missing version
      status: 'active',
      buildings: JSON.stringify([]), 
      economy: '{}',
      metadata: '{}'
    };

    mockPrisma.citySnapshot.findFirst.mockResolvedValue(corruptedRecord);

    const snapshot = await manager.loadCityState();
    expect(snapshot.status).toBe('safe_mode');
    expect(snapshot.metadata.integrityHash).toBe('CORRUPTED');
  });

  it('should maintain active status for valid records', async () => {
    const validRecord = {
      id: '123',
      timestamp: new Date(),
      version: '1.0.0',
      status: 'active',
      buildings: JSON.stringify([{ id: 'b1', type: 'office' }]),
      economy: '{}',
      metadata: '{}'
    };

    mockPrisma.citySnapshot.findFirst.mockResolvedValue(validRecord);

    const snapshot = await manager.loadCityState();
    expect(snapshot.status).toBe('active');
    expect(snapshot.buildings.length).toBe(1);
  });

  it('should reject saving corrupted snapshots', async () => {
    const invalidSnapshot: any = {
      version: '1.0',
      buildings: undefined // Missing buildings
    };

    await expect(manager.saveCityState(invalidSnapshot)).rejects.toThrow('CORRUPTION_DETECTED');
  });
});
