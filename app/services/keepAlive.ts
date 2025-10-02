/**
 * Keep-Alive Service for Vercel-hosted API Routes
 * Pings Shopify API at random intervals (1-4 hours) to prevent Vercel from going idle
 * Note: Supabase keep-alive is handled by a separate script on the DigitalOcean machine
 */

const MIN_PING_INTERVAL = 1 * 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_PING_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

/**
 * Generate a random interval between 1 and 4 hours
 */
const getRandomInterval = (): number => {
  return MIN_PING_INTERVAL + Math.random() * (MAX_PING_INTERVAL - MIN_PING_INTERVAL);
};
const LAST_SHOPIFY_PING_KEY = 'shopify-api-last-ping';

export interface KeepAliveService {
  start: () => void;
  stop: () => void;
  pingNow: () => Promise<void>;
  pingShopify: () => Promise<void>;
}

class KeepAlive implements KeepAliveService {
  private timeoutId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      this.checkAndPingIfNeeded();
    }
  }

  /**
   * Check if we need to ping based on last ping time
   */
  private async checkAndPingIfNeeded() {
    try {
      // Only run in browser environment
      if (typeof window === 'undefined') return;

      const lastShopifyPingStr = localStorage.getItem(LAST_SHOPIFY_PING_KEY);
      const lastShopifyPing = lastShopifyPingStr ? parseInt(lastShopifyPingStr, 10) : 0;
      const now = Date.now();

      // Check if Shopify needs an initial ping
      const shopifyNeedsPing = now - lastShopifyPing > MAX_PING_INTERVAL;

      if (shopifyNeedsPing) {
        console.log('Keep-alive: Initial ping needed for Shopify');
        await this.pingNow();
      } else {
        console.log('Keep-alive: No initial ping needed for Shopify');
      }
    } catch (error) {
      console.error('Keep-alive: Error checking last ping:', error);
    }
  }

  /**
   * Schedule the next ping with a random interval
   */
  private scheduleNextPing() {
    if (!this.isRunning) return;

    const randomInterval = getRandomInterval();
    const nextPingTime = new Date(Date.now() + randomInterval);

    console.log('Keep-alive: Next ping scheduled in',
      Math.round(randomInterval / 1000 / 60), 'minutes at',
      nextPingTime.toLocaleTimeString());

    this.timeoutId = setTimeout(async () => {
      console.log('Keep-alive: Scheduled ping');
      await this.pingNow();
      this.scheduleNextPing(); // Schedule the next random ping
    }, randomInterval);
  }

  /**
   * Start the keep-alive service
   */
  start() {
    if (this.isRunning) {
      console.log('Keep-alive: Service already running');
      return;
    }

    console.log('Keep-alive: Starting service (ping Shopify every 1-4 hours randomly)');
    this.isRunning = true;

    // Schedule first ping with random interval
    this.scheduleNextPing();
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

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Ping Shopify API immediately
   */
  async pingNow(): Promise<void> {
    console.log('Keep-alive: Pinging Shopify API...');
    await this.pingShopify();
  }

  /**
   * Ping the Shopify API (via dbGetOrderData endpoint)
   */
  async pingShopify(): Promise<void> {
    try {
      console.log('Keep-alive: Pinging Shopify API...');

      // Light ping - just fetch 1 order to wake the Shopify backend
      const response = await fetch('/api/dbGetOrderData?limit=1');

      if (response.ok) {
        const now = Date.now();
        if (typeof window !== 'undefined') {
          localStorage.setItem(LAST_SHOPIFY_PING_KEY, now.toString());
        }
        console.log('Keep-alive: Shopify ping successful at', new Date(now).toLocaleTimeString());
      } else {
        console.error('Keep-alive: Shopify ping failed with status', response.status);
      }
    } catch (error) {
      console.error('Keep-alive: Shopify ping error:', error);
    }
  }

}

/**
 * Create and return a new keep-alive service instance for Shopify backend only
 * Note: Supabase keep-alive is handled by a separate script on the DigitalOcean machine
 */
export function createKeepAliveService(): KeepAliveService {
  return new KeepAlive();
}