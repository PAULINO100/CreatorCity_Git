import { CitySnapshot } from './CitySnapshot';
// Nota: O Prisma Client real será gerado após liberação de arquivos, 
// por isso usamos uma interface mock/aberta para evitar erros de compilação iniciais
// se o client não estiver atualizado.

export class CityStateManager {
  private static instance: CityStateManager;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private prisma: any; // Mantendo any aqui para o stub do Prisma se necessário

  private constructor() {
    this.initPersistence();
  }

  private initPersistence() {
    if (typeof window !== 'undefined') {
      // Browser environment: use localStorage mock
      this.prisma = {
        citySnapshot: {
          create: async ({ data }: any) => {
            const snapshots = JSON.parse(localStorage.getItem('atlas_snapshots') || '[]');
            const newRecord = { ...data, id: `ls_${Date.now()}` };
            snapshots.push(newRecord);
            localStorage.setItem('atlas_snapshots', JSON.stringify(snapshots));
            return newRecord;
          },
          findFirst: async ({ orderBy, where }: any) => {
            let snapshots = JSON.parse(localStorage.getItem('atlas_snapshots') || '[]');
            if (where?.NOT?.label === null) {
               snapshots = snapshots.filter((s: any) => s.label);
            }
            if (where?.status) {
               snapshots = snapshots.filter((s: any) => s.status === where.status);
            }
            if (orderBy?.timestamp === 'desc') {
              snapshots.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            }
            return snapshots[0] || null;
          }
        }
      };
    } else {
      // Server environment: placeholder (would be Prisma)
      this.prisma = {
        citySnapshot: {
          create: async () => { console.warn("Prisma not initialized on server."); return {}; },
          findFirst: async () => null
        }
      };
    }
  }

  public static getInstance(): CityStateManager {
    if (!CityStateManager.instance) {
      CityStateManager.instance = new CityStateManager();
    }
    return CityStateManager.instance;
  }

  /**
   * Salva o estado atual da cidade no banco de dados
   */
  public async saveCityState(snapshot: CitySnapshot): Promise<void> {
    const integrityValid = this.validateIntegrity(snapshot);
    if (!integrityValid) {
      throw new Error('CORRUPTION_DETECTED: Falha na validação de integridade do snapshot.');
    }

    try {
      await this.prisma.citySnapshot.create({
        data: {
          version: snapshot.version,
          status: snapshot.status,
          label: snapshot.label,
          buildings: JSON.stringify(snapshot.buildings),
          economy: JSON.stringify(snapshot.economy),
          metadata: JSON.stringify(snapshot.metadata),
          timestamp: snapshot.timestamp
        }
      });
      console.log(`[CITY_STATE] Snapshot salvo: v${snapshot.version} [${snapshot.status}]`);
    } catch (error) {
      console.error('[CITY_STATE] Erro ao salvar estado:', error);
      throw new Error('SAVE_FAIL: Falha na persistência do estado da cidade.');
    }
  }

  /**
   * Carrega o último estado válido da cidade
   */
  public async loadCityState(): Promise<CitySnapshot | null> {
    try {
      const record = await this.prisma.citySnapshot.findFirst({
        orderBy: { timestamp: 'desc' }
      });

      if (!record) return null;

      const snapshot: CitySnapshot = {
        id: record.id,
        timestamp: record.timestamp,
        version: record.version,
        status: record.status || 'active',
        label: record.label,
        buildings: JSON.parse(record.buildings),
        economy: JSON.parse(record.economy),
        metadata: JSON.parse(record.metadata)
      };

      if (!this.validateIntegrity(snapshot)) {
        console.error('[CITY_STATE] Snapshot corrompido detectado no carregamento.');
        return this.triggerSafeMode(snapshot);
      }

      return snapshot;
    } catch (error) {
      console.error('[CITY_STATE] Erro ao carregar estado:', error);
      return null;
    }
  }

  /**
   * Cria um checkpoint manual (Snapshot com label)
   */
  public async createCheckpoint(label: string, snapshot: CitySnapshot): Promise<string> {
    snapshot.label = label;
    await this.saveCityState(snapshot);
    // Retornaria o ID do banco se disponível
    return `checkpoint_${Date.now()}`;
  }

  /**
   * Ativa o Safe Mode quando a integridade falha mas não há checkpoint para rollback
   */
  private async triggerSafeMode(corruptedSnapshot: CitySnapshot): Promise<CitySnapshot> {
    console.warn('[CITY_STATE] Entrando em SAFE MODE devido à corrupção de dados.');
    return {
      ...corruptedSnapshot,
      status: 'safe_mode',
      metadata: {
        ...corruptedSnapshot.metadata,
        integrityHash: 'CORRUPTED'
      }
    };
  }

  /**
   * Recuperação Automática (Rollback para o último checkpoint válido)
   */
  public async triggerRollback(): Promise<CitySnapshot | null> {
    console.warn('[CITY_STATE] Iniciando Rollback Automático...');
    const lastCheckpoint = await this.prisma.citySnapshot.findFirst({
      where: { 
        NOT: { label: null },
        status: 'active'
      },
      orderBy: { timestamp: 'desc' }
    });

    if (!lastCheckpoint) {
      console.error('[CITY_STATE] Nenhum checkpoint válido encontrado para rollback.');
      return null;
    }

    return {
      id: lastCheckpoint.id,
      timestamp: lastCheckpoint.timestamp,
      version: lastCheckpoint.version,
      status: 'active',
      label: lastCheckpoint.label,
      buildings: JSON.parse(lastCheckpoint.buildings),
      economy: JSON.parse(lastCheckpoint.economy),
      metadata: JSON.parse(lastCheckpoint.metadata)
    };
  }

  /**
   * Validação de integridade (Checksum simples para exemplo)
   */
  private validateIntegrity(snapshot: CitySnapshot): boolean {
    // Em produção, aqui seria gerado um hash SHA-256 dos dados
    // Simulação: Se o número de prédios for negativo ou versão ausente, é corrupção
    return (
      snapshot.version !== undefined && 
      snapshot.buildings !== undefined && 
      snapshot.buildings.length >= 0
    );
  }
}
