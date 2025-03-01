
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

// Topics to fetch news for
const TOPICS = ["business", "technology", "health", "science", "sports", "entertainment", "general"];

/**
 * Fetch news for all topics and convert to our format
 */
export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
    console.log("Fetching scraped news...");
    // Only use scraped news for now, until it's working properly
    const scrapedArticles = await fetchScrapedNews();
    console.log(`Fetched ${scrapedArticles.length} articles from scraping`);
    
    if (scrapedArticles.length === 0) {
      console.log("No scraped articles found, using mock data");
      return getMockArticles();
    }
    
    return scrapedArticles;
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
  const topics = ["technology", "business", "science", "politics", "sports", "health"];
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
      topic,
      sentiment,
      sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5
    };
  });
}
