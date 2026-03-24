import { IEconomyAdapter } from './interfaces';

/**
 * Implementação do Adapter Economy
 */
export class EconomyAdapter implements IEconomyAdapter {
  private balance: number = 1000; // Mock balance
  private dailyLimit: number = 500;
  private spentToday: number = 0;

  public async getBalance(): Promise<number> {
    return this.balance;
  }

  public async charge(amount: number, description: string): Promise<boolean> {
    if (this.spentToday + amount > this.dailyLimit) {
      console.warn(`[ECONOMY] Limite diário excedido: ${description}`);
      return false;
    }

    if (this.balance < amount) {
      console.warn(`[ECONOMY] Saldo insuficiente: ${description}`);
      return false;
    }

    this.balance -= amount;
    this.spentToday += amount;
    return true;
  }

  public getDailyLimit(): number {
    return this.dailyLimit;
  }
}
