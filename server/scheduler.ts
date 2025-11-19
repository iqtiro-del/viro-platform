import type { IStorage } from './storage';

export class Scheduler {
  private storage: IStorage;
  private intervals: NodeJS.Timeout[] = [];

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  start() {
    // Check expired chats every 5 minutes
    const checkExpiredChatsInterval = setInterval(async () => {
      try {
        await this.storage.checkExpiredChats();
        console.log('[Scheduler] Checked expired chats');
      } catch (error) {
        console.error('[Scheduler] Error checking expired chats:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.push(checkExpiredChatsInterval);

    // Process scheduled payments every 5 minutes
    const processPaymentsInterval = setInterval(async () => {
      try {
        await this.storage.processScheduledPayments();
        console.log('[Scheduler] Processed scheduled payments');
      } catch (error) {
        console.error('[Scheduler] Error processing scheduled payments:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    this.intervals.push(processPaymentsInterval);

    console.log('[Scheduler] Started background tasks (checking every 5 minutes)');

    // Run both tasks immediately on startup
    this.storage.checkExpiredChats().catch((err: any) => 
      console.error('[Scheduler] Initial check expired chats failed:', err)
    );
    this.storage.processScheduledPayments().catch((err: any) => 
      console.error('[Scheduler] Initial process payments failed:', err)
    );
  }

  stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('[Scheduler] Stopped background tasks');
  }
}
