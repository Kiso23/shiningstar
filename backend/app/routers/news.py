import os
import aiohttp
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
import asyncio

router = APIRouter(prefix="/news", tags=["news"])

# NewsAPI.org credentials - get free API key at https://newsapi.org/
NEWS_API_KEY = os.getenv("NEWS_API_KEY", "")
NEWS_API_BASE = "https://newsapi.org/v2"

# Cache for news to reduce API calls
_news_cache = {
    "articles": [],
    "last_updated": None,
    "expires_at": None
}

CACHE_DURATION_MINUTES = 30

# Fallback news when API is unavailable
FALLBACK_NEWS = [
    {
        "title": "Breaking: Football championship tournament begins",
        "description": "The 2026 football championship has officially kicked off with exciting matches.",
        "source": "Sports Today",
        "url": "https://sports.google.com/search?q=football",
        "image": None,
        "published_at": datetime.utcnow().isoformat(),
        "category": "international"
    },
    {
        "title": "Local football teams gear up for tournament",
        "description": "Teams from around the region are preparing for the upcoming football tournament.",
        "source": "Local News",
        "url": "https://sports.google.com/search?q=local+football",
        "image": None,
        "published_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "category": "local"
    }
]


class NewsArticle(BaseModel):
    id: str
    title: str
    description: str
    source: str
    url: str
    image: Optional[str] = None
    published_at: str
    category: str  # "local" or "international"


class NewsResponse(BaseModel):
    articles: List[NewsArticle]
    total: int
    cached: bool


async def _fetch_from_newsapi(query: str, page_size: int = 20) -> List[dict]:
    """Fetch news from NewsAPI.org"""
    if not NEWS_API_KEY or NEWS_API_KEY == "":
        return []
    
    try:
        async with aiohttp.ClientSession() as session:
            # Football/soccer related keywords
            search_queries = [
                f"football {query}",
                f"soccer {query}",
                f"FIFA {query}",
            ]
            
            all_articles = []
            
            for search_q in search_queries:
                url = f"{NEWS_API_BASE}/everything"
                params = {
                    "q": search_q,
                    "sortBy": "publishedAt",
                    "pageSize": page_size,
                    "apiKey": NEWS_API_KEY,
                    "language": "en"
                }
                
                async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        all_articles.extend(data.get("articles", []))
                    
                    # Avoid rate limiting
                    await asyncio.sleep(0.5)
            
            return all_articles
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []


def _parse_articles(raw_articles: List[dict], category: str = "international") -> List[NewsArticle]:
    """Parse raw articles from NewsAPI into our NewsArticle format"""
    articles = []
    seen_urls = set()
    
    for article in raw_articles:
        # Avoid duplicates
        if article.get("url") in seen_urls:
            continue
        seen_urls.add(article.get("url"))
        
        # Skip articles without required fields
        if not article.get("title") or not article.get("url"):
            continue
        
        # Parse published date
        pub_date = article.get("publishedAt", datetime.utcnow().isoformat())
        
        try:
            parsed_date = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
        except:
            parsed_date = datetime.utcnow()
        
        news = NewsArticle(
            id=f"{article.get('source', {}).get('id', 'unknown')}_{len(seen_urls)}",
            title=article.get("title", "")[:150],
            description=article.get("description", "")[:300],
            source=article.get("source", {}).get("name", "Unknown"),
            url=article.get("url", ""),
            image=article.get("urlToImage"),
            published_at=parsed_date.isoformat(),
            category=category
        )
        articles.append(news)
    
    return articles


@router.get("/football", response_model=NewsResponse)
async def get_football_news(
    category: Optional[str] = Query(None, regex="^(local|international)$"),
    limit: int = Query(10, ge=1, le=50)
):
    """
    Get latest football news from local and international sources.
    Results are cached for 30 minutes to reduce API calls.
    Falls back to sample data if API key is not configured.
    
    - **category**: Filter by "local" or "international" (optional)
    - **limit**: Number of articles to return (1-50, default 10)
    """
    
    # Check cache
    now = datetime.utcnow()
    is_cached = False
    articles = []
    
    if (_news_cache["expires_at"] and 
        now < _news_cache["expires_at"] and 
        _news_cache["articles"]):
        is_cached = True
        articles = _news_cache["articles"]
    else:
        # Try to fetch fresh news from API
        if NEWS_API_KEY and NEWS_API_KEY != "":
            local_articles = await _fetch_from_newsapi("India")
            international_articles = await _fetch_from_newsapi("World")
            
            local_parsed = _parse_articles(local_articles, category="local")
            international_parsed = _parse_articles(international_articles, category="international")
            
            articles = sorted(
                local_parsed + international_parsed,
                key=lambda x: x.published_at,
                reverse=True
            )
        
        # If no articles from API, use fallback
        if not articles:
            fallback = []
            for item in FALLBACK_NEWS:
                fallback.append(NewsArticle(
                    id=f"fallback_{len(fallback)}",
                    title=item["title"],
                    description=item["description"],
                    source=item["source"],
                    url=item["url"],
                    image=item.get("image"),
                    published_at=item["published_at"],
                    category=item["category"]
                ))
            articles = fallback
        
        # Update cache
        _news_cache["articles"] = articles
        _news_cache["last_updated"] = now
        _news_cache["expires_at"] = now + timedelta(minutes=CACHE_DURATION_MINUTES)
    
    # Filter by category if requested
    if category:
        articles = [a for a in articles if a.category == category]
    
    # Limit results
    articles = articles[:limit]
    
    return NewsResponse(
        articles=articles,
        total=len(articles),
        cached=is_cached
    )
