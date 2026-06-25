# Football News Feed - Quick Start Guide

Get the football news feed running in 5 minutes.

## Step 1: Get a Free NewsAPI Key (2 minutes)

1. Visit https://newsapi.org
2. Click "Get API Key" or "Register"
3. Sign up with your email (free tier)
4. Verify your email
5. Copy your API key from the dashboard

## Step 2: Configure Backend (1 minute)

Edit `backend/.env` and add:

```bash
NEWSAPI_KEY=your-api-key-from-step-1
```

For example:
```bash
NEWSAPI_KEY=abc123def456ghi789jkl
```

## Step 3: Restart Backend (1 minute)

```bash
# Kill current backend process
pkill -f "uvicorn"

# Or if using Docker:
docker-compose down
docker-compose up -d backend

# Or manually:
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

## Step 4: Test API (30 seconds)

```bash
# Fetch news
curl http://localhost:8000/api/v1/news/football

# Refresh news
curl -X POST http://localhost:8000/api/v1/news/football/refresh
```

Should return JSON with news items.

## Step 5: View on Website (1 minute)

1. Start frontend: `npm run dev` (or your dev command)
2. Navigate to http://localhost:5173
3. Scroll down to see "Football News" section
4. Should display 10 latest football news items

## Done! ✅

The news feed will:
- Auto-refresh every 30 minutes
- Cache data locally for performance
- Show error messages if anything goes wrong
- Work with or without API key (graceful degradation)

## Verify It's Working

**Backend:**
```bash
# Check logs for successful API calls
tail -f backend.log | grep -i news

# Check if returning data
curl http://localhost:8000/api/v1/news/football | head -50
```

**Frontend:**
- Open browser DevTools (F12)
- Go to Network tab
- Filter by "news"
- Should see successful API calls
- Check Console for any errors

## Common Issues

| Issue | Solution |
|-------|----------|
| Empty news feed | Check NEWSAPI_KEY is set in `.env` |
| 401 Unauthorized | NEWSAPI_KEY is invalid or expired |
| No news showing | Restart backend after adding API key |
| API timeout | Check internet connection or NewsAPI status |
| Cache not working | Restart both backend and frontend |

## Next Steps

- Read full documentation: `FOOTBALL-NEWS-FEED.md`
- Deploy to production with same `NEWSAPI_KEY`
- Monitor API usage in NewsAPI dashboard
- Adjust auto-refresh interval if needed (default: 30 min)

## Support Resources

- NewsAPI Help: https://newsapi.org/support
- Backend Logs: `backend/app.log`
- Frontend Console: Browser DevTools (F12)
- This Guide: `FOOTBALL-NEWS-QUICKSTART.md`
- Full Docs: `FOOTBALL-NEWS-FEED.md`

---

**Free Tier Limits:**
- 100 requests/day (plenty for 1-hour cache)
- 50 requests/day per IP
- Great for testing, upgrade if production needs more

Happy coding! ⚽
