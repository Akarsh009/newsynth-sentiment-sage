
import { NewsArticle, SentimentType } from "@/utils/mockData";
import { analyzeTextSentiment } from "@/utils/sentimentAnalysis";

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
const TOPICS = ["business", "technology", "health", "science", "sports", "entertainment"];

/**
 * Fetch news from NewsAPI for a specific topic
 */
async function fetchNewsByTopic(topic: string): Promise<NewsApiArticle[]> {
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
    id: `${topic}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: article.title,
    description: article.description || "No description available",
    content: article.content || "No content available",
    source: article.source.name,
    url: article.url,
    imageUrl: article.urlToImage || "https://placehold.co/600x400?text=News+Image",
    publishedAt: article.publishedAt,
    topic: topic,
    sentiment: sentiment,
  };
}

/**
 * Fetch news for all topics and convert to our format
 */
export async function fetchAllNews(): Promise<NewsArticle[]> {
  try {
    const topicPromises = TOPICS.map(async (topic) => {
      const articles = await fetchNewsByTopic(topic);
      return articles.map(article => convertArticle(article, topic));
    });
    
    const articlesArrays = await Promise.all(topicPromises);
    return articlesArrays.flat();
  } catch (error) {
    console.error("Error fetching all news:", error);
    return [];
  }
}
