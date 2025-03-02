
import { NewsArticle, SentimentType } from "@/utils/mockData";
import { analyzeTextSentiment } from "@/utils/sentimentAnalysis";
import { fetchScrapedNews } from "./scrapeService";

// NewsAPI response interfaces
interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

// Topics to fetch news for - make sure these are lowercase
const TOPICS = ["business", "technology", "health", "science", "sports", "entertainment", "politics", "general", "india"];

// NewsAPI key and endpoint
const NEWS_API_KEY = "1e8fa1048e3c4ff9b1edf1aff8365c04";
const NEWS_API_ENDPOINT = "https://newsapi.org/v2/top-headlines";

/**
 * Fetch news from NewsAPI
 */
async function fetchNewsApi(): Promise<NewsArticle[]> {
  try {
    console.log("Fetching news from NewsAPI...");
    
    // Collect all promises for different topics and countries
    const promises = [
      // Fetch by topic categories
      ...TOPICS.filter(topic => topic !== "india").map(async (topic) => {
        try {
          const response = await fetch(
            `${NEWS_API_ENDPOINT}?category=${topic}&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
          );
          
          if (!response.ok) {
            console.error(`NewsAPI error for topic ${topic}:`, response.statusText);
            return [];
          }
          
          const data: NewsApiResponse = await response.json();
          
          // Convert NewsAPI articles to our format with sentiment analysis
          return data.articles.map((article): NewsArticle => {
            // Analyze sentiment
            const text = `${article.title} ${article.description || ''}`;
            const sentiment = analyzeTextSentiment(text) as SentimentType;
            
            // Fallback image handling
            let imageUrl = article.urlToImage || `https://placehold.co/600x400?text=${topic}+News`;
            
            // Ensure image URL is valid
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://placehold.co/600x400?text=${topic}+News`;
            }
            
            return {
              id: `newsapi-${topic}-${Date.now()}-${article.url}`,
              title: article.title,
              description: article.description || 'No description available',
              content: article.content || article.description || 'No content available',
              source: article.source.name,
              author: article.author || article.source.name,
              url: article.url,
              imageUrl,
              publishedAt: article.publishedAt,
              topic: topic.toLowerCase(), // Ensure lowercase topics
              sentiment,
              sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5
            };
          });
        } catch (error) {
          console.error(`Error fetching news for topic ${topic}:`, error);
          return [];
        }
      }),
      
      // Special fetch for India news
      (async () => {
        try {
          const response = await fetch(
            `${NEWS_API_ENDPOINT}?country=in&pageSize=15&apiKey=${NEWS_API_KEY}`
          );
          
          if (!response.ok) {
            console.error(`NewsAPI error for India news:`, response.statusText);
            return [];
          }
          
          const data: NewsApiResponse = await response.json();
          
          // Convert NewsAPI articles to our format with sentiment analysis
          return data.articles.map((article): NewsArticle => {
            // Analyze sentiment
            const text = `${article.title} ${article.description || ''}`;
            const sentiment = analyzeTextSentiment(text) as SentimentType;
            
            // Fallback image handling
            let imageUrl = article.urlToImage || `https://placehold.co/600x400?text=India+News`;
            
            // Ensure image URL is valid
            if (imageUrl && !imageUrl.startsWith('http')) {
              imageUrl = `https://placehold.co/600x400?text=India+News`;
            }
            
            return {
              id: `newsapi-india-${Date.now()}-${article.url}`,
              title: article.title,
              description: article.description || 'No description available',
              content: article.content || article.description || 'No content available',
              source: article.source.name,
              author: article.author || article.source.name,
              url: article.url,
              imageUrl,
              publishedAt: article.publishedAt,
              topic: "india", // Assign india topic
              sentiment,
              sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5
            };
          });
        } catch (error) {
          console.error(`Error fetching news for India:`, error);
          return [];
        }
      })()
    ];
    
    // Wait for all requests to complete
    const topicArticles = await Promise.all(promises);
    const articles = topicArticles.flat();
    
    console.log(`Fetched ${articles.length} articles from NewsAPI`);
    return articles;
  } catch (error) {
    console.error("Error in fetchNewsApi:", error);
    return [];
  }
}

/**
 * Remove duplicate articles based on title similarity
 */
function deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
  const uniqueArticles: NewsArticle[] = [];
  const titles = new Set<string>();
  
  for (const article of articles) {
    // Normalize title for comparison
    const normalizedTitle = article.title.toLowerCase().trim();
    
    if (!titles.has(normalizedTitle)) {
      titles.add(normalizedTitle);
      uniqueArticles.push(article);
    }
  }
  
  return uniqueArticles;
}

/**
 * Fetch news for all topics and convert to our format
 */
export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
    console.log("Fetching all news sources...");
    
    // Fetch from both sources in parallel
    const [newsApiArticles, scrapedArticles] = await Promise.all([
      fetchNewsApi(),
      fetchScrapedNews()
    ]);
    
    let allArticles = [...newsApiArticles, ...scrapedArticles];
    
    // Deduplicate articles
    allArticles = deduplicateArticles(allArticles);
    
    console.log(`Combined ${allArticles.length} unique articles from all sources`);
    
    if (allArticles.length === 0) {
      console.log("No articles found, using mock data");
      return getMockArticles();
    }
    
    return allArticles;
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return mock data as fallback
    return getMockArticles();
  }
}

/**
 * Generate mock articles as fallback
 */
function getMockArticles(): NewsArticle[] {
  // Make sure these topics match the ones used in filtering (all lowercase)
  const topics = ["technology", "business", "science", "politics", "sports", "health", "india"];
  const sentiments: SentimentType[] = ["positive", "neutral", "negative"];
  
  return Array.from({ length: 12 }, (_, i) => {
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    
    return {
      id: `mock-${i}`,
      title: `Sample ${topic} article ${i + 1}`,
      description: `This is a sample ${sentiment} article about ${topic}. This is used as fallback when no real articles are available.`,
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.`,
      source: "Mock News",
      author: "AI Assistant",
      url: "#",
      imageUrl: `https://placehold.co/600x400?text=${topic}+News`,
      publishedAt: new Date().toISOString(),
      topic, // already lowercase
      sentiment,
      sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5
    };
  });
}
