
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

// Replace with your actual NewsAPI key
const NEWS_API_KEY = "YOUR_NEWS_API_KEY"; 

// Topics to fetch news for
const TOPICS = ["business", "technology", "health", "science", "sports", "entertainment", "general"];

// Flag to use mock data if API fails
let useMockData = false;

/**
 * Fetch news from NewsAPI for a specific topic
 */
async function fetchNewsByTopic(topic: string): Promise<NewsApiArticle[]> {
  if (useMockData) {
    console.log(`Using mock data for ${topic} due to previous API errors`);
    // Return empty array, we'll use scraped data instead
    return [];
  }
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=${topic}&apiKey=${NEWS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`NewsAPI error: ${response.status}`);
    }
    
    const data: NewsApiResponse = await response.json();
    return data.articles;
  } catch (error) {
    console.error(`Error fetching ${topic} news:`, error);
    // Set flag to use mock data for future requests
    useMockData = true;
    return [];
  }
}

/**
 * Convert NewsAPI article to our app's article format
 */
function convertArticle(article: NewsApiArticle, topic: string): NewsArticle {
  // Analyze sentiment from title and description
  const textToAnalyze = `${article.title} ${article.description || ""}`;
  const sentiment = analyzeTextSentiment(textToAnalyze) as SentimentType;
  
  return {
    id: `api-${topic}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: article.title,
    description: article.description || "No description available",
    content: article.content || "No content available",
    source: article.source.name,
    author: article.author || article.source.name,
    url: article.url,
    imageUrl: article.urlToImage || "https://placehold.co/600x400?text=News+Image",
    publishedAt: article.publishedAt,
    topic: topic,
    sentiment: sentiment,
    sentimentScore: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.2 : 0.5
  };
}

/**
 * Merge and deduplicate articles from different sources
 */
function mergeAndDeduplicate(apiArticles: NewsArticle[], scrapedArticles: NewsArticle[]): NewsArticle[] {
  const allArticles = [...apiArticles, ...scrapedArticles];
  
  // Sort by published date (newest first)
  allArticles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  
  // Deduplicate based on similar titles
  const deduplicated: NewsArticle[] = [];
  const titles = new Set<string>();
  
  for (const article of allArticles) {
    // Simplified title for comparison (lowercase, no special chars)
    const simplifiedTitle = article.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();
    
    // Check if we already have a similar title
    let isDuplicate = false;
    for (const existingTitle of titles) {
      // Calculate similarity (very basic implementation)
      const similarity = calculateSimilarity(simplifiedTitle, existingTitle);
      if (similarity > 0.7) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      titles.add(simplifiedTitle);
      deduplicated.push(article);
    }
  }
  
  return deduplicated;
}

/**
 * Calculate similarity between two strings (Jaccard similarity)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Fetch news for all topics and convert to our format
 */
export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
    // Parallel fetching of API news and scraped news
    const [apiArticlesArrays, scrapedArticles] = await Promise.all([
      Promise.all(
        TOPICS.map(async (topic) => {
          const articles = await fetchNewsByTopic(topic);
          return articles.map(article => convertArticle(article, topic));
        })
      ),
      fetchScrapedNews()
    ]);
    
    const apiArticles = apiArticlesArrays.flat();
    console.log(`Fetched ${apiArticles.length} articles from API and ${scrapedArticles.length} articles from scraping`);
    
    // Merge and deduplicate articles
    const mergedArticles = mergeAndDeduplicate(apiArticles, scrapedArticles);
    console.log(`Total unique articles after deduplication: ${mergedArticles.length}`);
    
    return mergedArticles;
  } catch (error) {
    console.error("Error fetching all news:", error);
    // Fallback to scraped news if API completely fails
    try {
      return await fetchScrapedNews();
    } catch (scrapeError) {
      console.error("Error fetching scraped news as fallback:", scrapeError);
      return [];
    }
  }
}
