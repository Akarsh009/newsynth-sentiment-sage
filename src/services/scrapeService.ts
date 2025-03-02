
import { NewsArticle, SentimentType } from "@/utils/mockData";
import { analyzeTextSentiment } from "@/utils/sentimentAnalysis";

// List of RSS feeds to scrape, adding more Indian news sources
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
  { url: 'https://news.google.com/rss', topic: 'general' },
  // Indian news sources
  { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', topic: 'india' },
  { url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', topic: 'india' }, // India section
  { url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms', topic: 'business' },
  { url: 'https://feeds.feedburner.com/ndtvnews-india-news', topic: 'india' }, // Alternative NDTV feed
  { url: 'https://feeds.feedburner.com/ndtvnews-latest', topic: 'india' }, // NDTV latest
  { url: 'https://indianexpress.com/feed/', topic: 'india' },
  { url: 'https://www.thehindu.com/news/national/?service=rss', topic: 'india' }, // The Hindu
  { url: 'https://www.news18.com/rss/india.xml', topic: 'india' }, // News18
  { url: 'https://zeenews.india.com/rss/india-national-news.xml', topic: 'india' }, // Zee News
  { url: 'https://www.tribuneindia.com/rss/feed?catId=50', topic: 'india' } // The Tribune
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
      
      // Improved content handling
      let content = description;
      // Try different content selectors that various RSS feeds might use
      const contentEncoded = item.querySelector('content\\:encoded') || 
                           item.querySelector('encoded') || 
                           item.querySelector('content');
      
      if (contentEncoded && contentEncoded.textContent) {
        content = contentEncoded.textContent;
      }
      
      const link = item.querySelector('link')?.textContent || '#';
      const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
      
      // Clean source name for display
      let source = new URL(feed.url).hostname
        .replace('www.', '')
        .replace('rss.', '')
        .replace('feeds.', '');
        
      // Handle special cases for source names
      if (source.includes('feedburner')) {
        // Extract real source from URL or feed title
        const feedTitle = xmlDoc.querySelector('channel > title')?.textContent || '';
        if (feedTitle.includes('NDTV')) {
          source = 'ndtv.com';
        } else {
          source = feedTitle.split(' - ')[0].toLowerCase();
        }
      }
      
      // Improved image URL extraction
      let imageUrl = '';
      
      // Try to extract image from media:content
      const mediaContent = item.querySelector('media\\:content');
      if (mediaContent && mediaContent.getAttribute('url')) {
        imageUrl = mediaContent.getAttribute('url') || '';
      }
      
      // Try to extract image from media:thumbnail
      if (!imageUrl) {
        const mediaThumbnail = item.querySelector('media\\:thumbnail');
        if (mediaThumbnail && mediaThumbnail.getAttribute('url')) {
          imageUrl = mediaThumbnail.getAttribute('url') || '';
        }
      }
      
      // Try to extract image from enclosure
      if (!imageUrl) {
        const enclosure = item.querySelector('enclosure');
        if (enclosure && enclosure.getAttribute('url')) {
          const type = enclosure.getAttribute('type') || '';
          if (type.startsWith('image/') || 
              enclosure.getAttribute('url')?.endsWith('.jpg') || 
              enclosure.getAttribute('url')?.endsWith('.png') || 
              enclosure.getAttribute('url')?.endsWith('.jpeg')) {
            imageUrl = enclosure.getAttribute('url') || '';
          }
        }
      }
      
      // Try to extract image from content
      if (!imageUrl && content) {
        const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }
      
      // Try to extract image from description if it's HTML
      if (!imageUrl && description && description.includes('<img')) {
        const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch && imgMatch[1]) {
          imageUrl = imgMatch[1];
        }
      }
      
      // Source-specific default images when no image is found
      if (!imageUrl || !imageUrl.startsWith('http')) {
        if (source.includes('timesofindia')) {
          imageUrl = 'https://static.toiimg.com/photo/msid-74814898/74814898.jpg'; 
        } else if (source.includes('ndtv')) {
          imageUrl = 'https://drop.ndtv.com/homepage/images/ndtvlogo23march.png';
        } else if (source.includes('hindustantimes') || source.includes('tribuneindia')) {
          imageUrl = 'https://www.hindustantimes.com/images/app-images/ht-logo.png';
        } else if (source.includes('indianexpress')) {
          imageUrl = 'https://images.indianexpress.com/2022/03/indian-express-logo.jpg';
        } else if (source.includes('economictimes')) {
          imageUrl = 'https://img.etimg.com/photo/msid-74451948,quality-100/et-logo.jpg';
        } else if (source.includes('thehindu')) {
          imageUrl = 'https://www.thehindu.com/theme/images/th-online/thehindu-logo.svg';
        } else if (source.includes('news18')) {
          imageUrl = 'https://images.news18.com/static_news18/pix/ibnlive/news18/news18-logo-sharing.png';
        } else if (source.includes('zeenews')) {
          imageUrl = 'https://english.cdn.zeenews.com/images/logo/placeholder_image.jpg';
        } else {
          imageUrl = `https://placehold.co/600x400?text=${feed.topic.charAt(0).toUpperCase() + feed.topic.slice(1)}+News`;
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
        topic: feed.topic.toLowerCase(), // Ensure lowercase for consistent filtering
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

// Fetch news from multiple RSS feeds
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
