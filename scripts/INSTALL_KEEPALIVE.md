# DigitalOcean Supabase Keep-Alive Setup

This script keeps your self-hosted Supabase instance active by making periodic lightweight requests.

## Installation on DigitalOcean Machine

1. **Copy the script to your DigitalOcean machine:**
   ```bash
   # Upload the script
   scp supabase-keepalive.sh root@your-droplet-ip:/opt/
   ```

2. **Set up the script:**
   ```bash
   # Create directory
   sudo mkdir -p /opt/supabase-keepalive
   sudo mv /opt/supabase-keepalive.sh /opt/supabase-keepalive/
   sudo chmod +x /opt/supabase-keepalive/supabase-keepalive.sh
   ```

3. **Set your Supabase anonymous key:**
   ```bash
   # Replace with your actual key
   export SUPABASE_ANON_KEY="eyJ..."

   # Or add to /etc/environment for persistence
   echo "SUPABASE_ANON_KEY=eyJ..." | sudo tee -a /etc/environment
   ```

4. **Install as a system service (recommended):**
   ```bash
   # Copy service file
   sudo cp supabase-keepalive.service /etc/systemd/system/

   # Edit service file to add your actual API key
   sudo nano /etc/systemd/system/supabase-keepalive.service

   # Enable and start service
   sudo systemctl daemon-reload
   sudo systemctl enable supabase-keepalive
   sudo systemctl start supabase-keepalive
   ```

5. **Check service status:**
   ```bash
   sudo systemctl status supabase-keepalive
   sudo journalctl -u supabase-keepalive -f
   ```

## Manual Usage (Alternative)

If you prefer to run manually:

```bash
# Set environment variable
export SUPABASE_ANON_KEY="your_key_here"

# Run the script
./supabase-keepalive.sh
```

## Configuration

- **Interval**: Default is 1 hour (3600 seconds). Modify `INTERVAL` in the script.
- **Log file**: Logs are written to `/var/log/supabase-keepalive.log`
- **API endpoint**: Makes lightweight requests to `/rest/v1/Products?select=shopify_id&limit=1`

## Benefits

- **Cost-effective**: Runs on your existing DigitalOcean machine
- **Lightweight**: Only fetches 1 record every hour
- **Reliable**: Systemd ensures it restarts if it crashes
- **Logged**: All activity is logged for monitoring

This approach is much cheaper than using Vercel function invocations for keep-alive pings.