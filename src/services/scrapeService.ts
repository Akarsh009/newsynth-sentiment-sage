
import { NewsArticle, SentimentType } from "@/utils/mockData";
import { analyzeTextSentiment } from "@/utils/sentimentAnalysis";

// List of RSS feeds to scrape
const RSS_FEEDS = [
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', topic: 'world' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', topic: 'technology' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml', topic: 'business' },
  { url: 'https://feeds.npr.org/1001/rss.xml', topic: 'politics' },
  { url: 'https://feeds.npr.org/1007/rss.xml', topic: 'science' },
  { url: 'https://feeds.npr.org/1048/rss.xml', topic: 'sports' },
  { url: 'https://www.espn.com/espn/rss/news', topic: 'sports' },
  { url: 'https://www.theverge.com/rss/index.xml', topic: 'technology' },
  { url: 'https://lifehacker.com/rss', topic: 'lifestyle' },
  { url: 'https://news.google.com/rss', topic: 'general' }
];

// Parse RSS feed
async function parseRSSFeed(feed: { url: string, topic: string }): Promise<NewsArticle[]> {
  try {
    console.log(`Fetching RSS feed: ${feed.url}`);
    
    // Use a CORS proxy to access the RSS feed
    const corsProxy = 'https://api.allorigins.win/raw?url=';
    const response = await fetch(`${corsProxy}${encodeURIComponent(feed.url)}`);
    
    if (!response.ok) {
      console.error(`Failed to fetch RSS feed: ${feed.url}`, response.statusText);
      return [];
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");
    
    // Get all items from the feed
    const items = xmlDoc.querySelectorAll('item');
    console.log(`Found ${items.length} items in feed: ${feed.url}`);
    
    const articles: NewsArticle[] = [];
    
    items.forEach((item, index) => {
      if (index >= 5) return; // Limit to 5 articles per feed
      
      const title = item.querySelector('title')?.textContent || 'No title';
      const description = item.querySelector('description')?.textContent || 'No description available';
      const content = item.querySelector('content:encoded')?.textContent || description;
      const link = item.querySelector('link')?.textContent || '#';
      const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
      const source = new URL(feed.url).hostname
        .replace('www.', '')
        .replace('rss.', '')
        .replace('feeds.', '');
      
      // Find an image URL in the content if available
      let imageUrl = 'https://placehold.co/600x400?text=News+Image';
      
      // Try to extract image from content
      const contentStr = content.toString();
      const imgMatch = contentStr.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      } else {
        // Try to extract image from media:content
        const mediaContent = item.querySelector('media\\:content, content');
        if (mediaContent && mediaContent.getAttribute('url')) {
          imageUrl = mediaContent.getAttribute('url') || imageUrl;
        }
        
        // Try to extract image from enclosure
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('url') && 
            enclosure.getAttribute('type')?.startsWith('image/')) {
          imageUrl = enclosure.getAttribute('url') || imageUrl;
        }
      }
      
      // Analyze sentiment
      const textToAnalyze = `${title} ${description.replace(/<\/?[^>]+(>|$)/g, "")}`;
      const sentiment = analyzeTextSentiment(textToAnalyze) as SentimentType;
      
      articles.push({
        id: `scraped-${feed.topic}-${Date.now()}-${index}`,
        title,
        description: description.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML
        content: content.replace(/<\/?[^>]+(>|$)/g, ""), // Strip HTML
        source,
        url: link,
        imageUrl,
        publishedAt: new Date(pubDate).toISOString(),
        topic: feed.topic,
        sentiment,
        author: source,
        sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5
      });
    });
    
    console.log(`Parsed ${articles.length} articles from feed: ${feed.url}`);
    return articles;
  } catch (error) {
    console.error(`Error parsing RSS feed ${feed.url}:`, error);
    return [];
  }
}

/**
 * Fetch news from multiple RSS feeds
 */
export async function fetchScrapedNews(): Promise<NewsArticle[]> {
  try {
    console.log('Fetching scraped news from RSS feeds...');
    const feedPromises = RSS_FEEDS.map(feed => parseRSSFeed(feed));
    const articlesArrays = await Promise.all(feedPromises);
    const articles = articlesArrays.flat();
    
    console.log(`Fetched ${articles.length} articles from RSS feeds`);
    return articles;
  } catch (error) {
    console.error('Error fetching scraped news:', error);
    return [];
  }
}
