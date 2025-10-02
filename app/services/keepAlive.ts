/**
 * Keep-Alive Service for Shopify Backend
 * Pings the API every 4 hours to prevent it from going idle
 */

const PING_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const LAST_PING_KEY = 'shopify-api-last-ping';

export interface KeepAliveService {
  start: () => void;
  stop: () => void;
  pingNow: () => Promise<void>;
}

class KeepAlive implements KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.checkAndPingIfNeeded();
  }

  /**
   * Check if we need to ping based on last ping time
   */
  private async checkAndPingIfNeeded() {
    try {
      const lastPingStr = localStorage.getItem(LAST_PING_KEY);
      const lastPing = lastPingStr ? parseInt(lastPingStr, 10) : 0;
      const now = Date.now();

      // If it's been more than 4 hours since last ping, ping now
      if (now - lastPing > PING_INTERVAL) {
        console.log('Keep-alive: Initial ping needed (last ping was',
          lastPing ? `${Math.round((now - lastPing) / 1000 / 60)} minutes ago)` : 'never)');
        await this.pingNow();
      } else {
        console.log('Keep-alive: No initial ping needed (last ping was',
          Math.round((now - lastPing) / 1000 / 60), 'minutes ago)');
      }
    } catch (error) {
      console.error('Keep-alive: Error checking last ping:', error);
    }
  }

  /**
   * Start the keep-alive service
   */
  start() {
    if (this.isRunning) {
      console.log('Keep-alive: Service already running');
      return;
    }

    console.log('Keep-alive: Starting service (ping every 4 hours)');
    this.isRunning = true;

    // Set up interval for periodic pings
    this.intervalId = setInterval(async () => {
      console.log('Keep-alive: Scheduled ping');
      await this.pingNow();
    }, PING_INTERVAL);

    // Also schedule next ping based on last ping time
    const lastPingStr = localStorage.getItem(LAST_PING_KEY);
    if (lastPingStr) {
      const lastPing = parseInt(lastPingStr, 10);
      const nextPingIn = PING_INTERVAL - (Date.now() - lastPing);

      if (nextPingIn > 0 && nextPingIn < PING_INTERVAL) {
        // Clear the regular interval and set a timeout for the next ping
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }

        setTimeout(() => {
          this.pingNow().then(() => {
            // After this ping, set up regular interval
            this.intervalId = setInterval(async () => {
              console.log('Keep-alive: Scheduled ping');
              await this.pingNow();
            }, PING_INTERVAL);
          });
        }, nextPingIn);

        console.log('Keep-alive: Next ping scheduled in',
          Math.round(nextPingIn / 1000 / 60), 'minutes');
      }
    }
  }

  /**
   * Stop the keep-alive service
   */
  stop() {
    if (!this.isRunning) {
      console.log('Keep-alive: Service not running');
      return;
    }

    console.log('Keep-alive: Stopping service');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Ping the API immediately
   */
  async pingNow(): Promise<void> {
    try {
      console.log('Keep-alive: Pinging API...');

      // Light ping - just fetch 1 order to wake the backend
      const response = await fetch('/api/dbGetOrderData?limit=1');

      if (response.ok) {
        const now = Date.now();
        localStorage.setItem(LAST_PING_KEY, now.toString());
        console.log('Keep-alive: Ping successful at', new Date(now).toLocaleTimeString());
      } else {
        console.error('Keep-alive: Ping failed with status', response.status);
      }
    } catch (error) {
      console.error('Keep-alive: Ping error:', error);
    }
  }
}

/**
 * Create and return a new keep-alive service instance
 */
export function createKeepAliveService(): KeepAliveService {
  return new KeepAlive();
}