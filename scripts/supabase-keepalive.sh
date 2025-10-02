#!/bin/bash

# Keep-Alive Script for DigitalOcean Supabase Instance
# This script keeps your Supabase instance active by making periodic requests
# Run this on your DigitalOcean machine with: ./supabase-keepalive.sh

# Configuration
SUPABASE_URL="https://jupiter-consulting.store"
API_KEY="${SUPABASE_ANON_KEY}"
LOG_FILE="/var/log/supabase-keepalive.log"
INTERVAL=3600  # 1 hour in seconds (adjust as needed)

# Ensure log file exists and is writable
sudo touch "$LOG_FILE" 2>/dev/null || LOG_FILE="./supabase-keepalive.log"

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

ping_supabase() {
    # Make a lightweight request to keep the database active
    response=$(curl -s -w "%{http_code}" \
        -H "apikey: $API_KEY" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        "$SUPABASE_URL/rest/v1/Products?select=shopify_id&limit=1" \
        -o /dev/null)

    if [ "$response" = "200" ]; then
        log_message "✓ Supabase ping successful (HTTP $response)"
        return 0
    else
        log_message "✗ Supabase ping failed (HTTP $response)"
        return 1
    fi
}

# Main keep-alive loop
main() {
    log_message "Starting Supabase keep-alive service (interval: ${INTERVAL}s)"

    while true; do
        ping_supabase

        log_message "Next ping in $INTERVAL seconds..."
        sleep "$INTERVAL"
    done
}

# Handle script termination gracefully
cleanup() {
    log_message "Keep-alive service stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check if API key is set
if [ -z "$API_KEY" ]; then
    log_message "ERROR: SUPABASE_ANON_KEY environment variable not set"
    echo "Please set your Supabase anonymous key:"
    echo "export SUPABASE_ANON_KEY='your_key_here'"
    exit 1
fi

# Start the service
main