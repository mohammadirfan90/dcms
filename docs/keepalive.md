# Deployment Keepalive Guide (Uptime Strategy)

To prevent your project from sleeping on free hosting tiers (Vercel, Render, Supabase Edge), you must set up an external pinger for your health check endpoint.

## 1. Health Endpoint
Your project now has a dedicated health route:
`https://your-deployment-url.com/api/health`

This endpoint is lightweight, requires no authentication, and performs no database writes.

## 2. Setup cron-job.org (Recommended)
1. Register for a free account at [cron-job.org](https://cron-job.org).
2. Go to **Dashboard** > **Cronjobs** > **Create Cronjob**.
3. **Name**: `DCMS Keepalive`
4. **URL**: `https://your-deployment-url.com/api/health`
5. **Execution Schedule**: Every 10 minutes.
6. Click **Create**.

## 3. Setup GitHub Actions Scheduler (Alternative)
Create a file `.github/workflows/keepalive.yml`:

```yaml
name: Deployment Keepalive
on:
  schedule:
    - cron: '*/10 * * * *' # Every 10 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Health Endpoint
        run: curl -s https://your-deployment-url.com/api/health
```

## 4. Supabase Project Pause
Supabase free tier projects pause after 7 days of inactivity. Setting up one of the pingers above will ensure the database stays active.
