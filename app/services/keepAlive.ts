/**
 * Keep-Alive Service for Shopify and Supabase Backends
 * Pings both APIs at random intervals (1-4 hours) to prevent them from going idle
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
const LAST_SUPABASE_PING_KEY = 'supabase-api-last-ping';

export interface KeepAliveService {
  start: () => void;
  stop: () => void;
  pingNow: () => Promise<void>;
  pingShopify: () => Promise<void>;
  pingSupabase: () => Promise<void>;
}

class KeepAlive implements KeepAliveService {
  private timeoutId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor() {
    this.checkAndPingIfNeeded();
  }

  /**
   * Check if we need to ping based on last ping time for both services
   */
  private async checkAndPingIfNeeded() {
    try {
      const lastShopifyPingStr = localStorage.getItem(LAST_SHOPIFY_PING_KEY);
      const lastSupabasePingStr = localStorage.getItem(LAST_SUPABASE_PING_KEY);
      const lastShopifyPing = lastShopifyPingStr ? parseInt(lastShopifyPingStr, 10) : 0;
      const lastSupabasePing = lastSupabasePingStr ? parseInt(lastSupabasePingStr, 10) : 0;
      const now = Date.now();

      // Check if either service needs an initial ping
      const shopifyNeedsPing = now - lastShopifyPing > MAX_PING_INTERVAL;
      const supabaseNeedsPing = now - lastSupabasePing > MAX_PING_INTERVAL;

      if (shopifyNeedsPing || supabaseNeedsPing) {
        console.log('Keep-alive: Initial ping needed for',
          shopifyNeedsPing && supabaseNeedsPing ? 'both services' :
          shopifyNeedsPing ? 'Shopify' : 'Supabase');
        await this.pingNow();
      } else {
        console.log('Keep-alive: No initial ping needed for either service');
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

    console.log('Keep-alive: Starting service (ping both Shopify and Supabase every 1-4 hours randomly)');
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
   * Ping both Shopify and Supabase APIs immediately
   */
  async pingNow(): Promise<void> {
    console.log('Keep-alive: Pinging both APIs...');
    await Promise.all([
      this.pingShopify(),
      this.pingSupabase()
    ]);
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
        localStorage.setItem(LAST_SHOPIFY_PING_KEY, now.toString());
        console.log('Keep-alive: Shopify ping successful at', new Date(now).toLocaleTimeString());
      } else {
        console.error('Keep-alive: Shopify ping failed with status', response.status);
      }
    } catch (error) {
      console.error('Keep-alive: Shopify ping error:', error);
    }
  }

  /**
   * Ping the Supabase API (both Next.js API and direct droplet)
   */
  async pingSupabase(): Promise<void> {
    try {
      console.log('Keep-alive: Pinging Supabase API...');

      // Ping 1: Next.js API route (keeps Vercel active)
      const apiResponse = await fetch('/api/dbGetProductData?limit=1');

      // Ping 2: Direct droplet ping (keeps DigitalOcean droplet active)
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const dropletResponse = await fetch('https://jupiter-consulting.store/rest/v1/Products?limit=1', {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });

      let success = false;

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('Keep-alive: Next.js API ping successful, sample data:', {
          productCount: apiData.products?.length || 0,
          sampleProduct: apiData.products?.[0] ? {
            id: apiData.products[0].shopify_id,
            title: apiData.products[0].title,
            price: apiData.products[0].price
          } : null
        });
        success = true;
      } else {
        console.error('Keep-alive: Next.js API ping failed with status', apiResponse.status);
      }

      if (dropletResponse.ok) {
        const dropletData = await dropletResponse.json();
        console.log('Keep-alive: Droplet direct ping successful, sample data:', {
          productCount: dropletData?.length || 0,
          sampleProduct: dropletData?.[0] ? {
            id: dropletData[0].shopify_id,
            title: dropletData[0].title,
            price: dropletData[0].price
          } : null
        });
        success = true;
      } else {
        console.error('Keep-alive: Droplet direct ping failed with status', dropletResponse.status);
      }

      if (success) {
        const now = Date.now();
        localStorage.setItem(LAST_SUPABASE_PING_KEY, now.toString());
        console.log('Keep-alive: Supabase ping completed at', new Date(now).toLocaleTimeString());
      }
    } catch (error) {
      console.error('Keep-alive: Supabase ping error:', error);
    }
  }
}

/**
 * Create and return a new keep-alive service instance for both Shopify and Supabase backends
 */
export function createKeepAliveService(): KeepAliveService {
  return new KeepAlive();
}