
import { useEffect, useState, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import TopicFilter from "@/components/TopicFilter";
import NewsGrid from "@/components/NewsGrid";
import SentimentChart from "@/components/SentimentChart";
import { topics, NewsArticle, SentimentType, TopicSentiment } from "@/utils/mockData";
import { Filter, ThumbsUp, Minus, ThumbsDown, RefreshCw } from "lucide-react";
import { fetchAllNews } from "@/services/newsService";

// Refresh interval in milliseconds (5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000;

const Index = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType | null>(null);
  const [topicSentiment, setTopicSentiment] = useState<TopicSentiment | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef<number | null>(null);

  // Calculate topic sentiment stats
  const calculateTopicSentiments = useCallback((articlesData: NewsArticle[]): TopicSentiment => {
    const filteredByTopic = selectedTopic 
      ? articlesData.filter(a => a.topic === selectedTopic)
      : articlesData;
    
    return {
      topic: selectedTopic || "All Topics",
      positive: filteredByTopic.filter((a) => a.sentiment === "positive").length,
      neutral: filteredByTopic.filter((a) => a.sentiment === "neutral").length,
      negative: filteredByTopic.filter((a) => a.sentiment === "negative").length,
      total: filteredByTopic.length,
    };
  }, [selectedTopic]);

  // Fetch articles from the API and scrapers
  const fetchArticles = useCallback(async (showToast = true) => {
    try {
      setIsRefreshing(true);
      const newsArticles = await fetchAllNews();
      
      if (newsArticles.length > 0) {
        setArticles(newsArticles);
        setLastUpdated(new Date());
        
        if (showToast) {
          toast({
            title: "News Updated",
            description: `Loaded ${newsArticles.length} latest articles`,
            duration: 3000,
          });
        }
      } else {
        toast({
          title: "Warning",
          description: "No articles found or API error occurred. Using backup data.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Error",
        description: "Failed to fetch news articles",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  // Manually refresh articles
  const handleRefresh = () => {
    setLoading(true);
    fetchArticles(true);
  };

  // Set up automatic refresh timer
  useEffect(() => {
    console.log("Setting up news refresh timer");
    // Initial fetch
    fetchArticles(false);
    
    // Set up interval for refreshing
    refreshTimerRef.current = window.setInterval(() => {
      console.log("Auto-refreshing news articles...");
      fetchArticles(false);
    }, REFRESH_INTERVAL);
    
    // Clean up timer on unmount
    return () => {
      if (refreshTimerRef.current !== null) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [fetchArticles]);

  // Filter articles by topic and sentiment
  useEffect(() => {
    console.log("Filtering articles. Selected topic:", selectedTopic, "Selected sentiment:", selectedSentiment);
    
    let filtered = [...articles];
    
    // Filter by topic
    if (selectedTopic) {
      filtered = filtered.filter((article) => article.topic === selectedTopic);
    }
    
    // Filter by sentiment
    if (selectedSentiment) {
      filtered = filtered.filter((article) => article.sentiment === selectedSentiment);
    }
    
    setFilteredArticles(filtered);
    
    // Calculate and update sentiment data
    const sentimentData = calculateTopicSentiments(articles);
    setTopicSentiment(sentimentData);
    
    console.log("Filtered articles:", filtered.length);
  }, [articles, selectedTopic, selectedSentiment, calculateTopicSentiments]);

  const handleTopicSelect = (topic: string | null) => {
    console.log("Selected topic:", topic);
    setSelectedTopic(topic);
  };

  const handleSentimentSelect = (sentiment: SentimentType | null) => {
    console.log("Selected sentiment:", sentiment);
    setSelectedSentiment(sentiment);
  };

  // Format last updated time
  const formatLastUpdated = () => {
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Skeleton loader for articles
  const ArticleSkeleton = () => (
    <div className="rounded-xl overflow-hidden bg-card border">
      <div className="h-48 bg-muted"></div>
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
        <div className="flex justify-between pt-2">
          <div className="h-3 bg-muted rounded w-20"></div>
          <div className="h-3 bg-muted rounded w-20"></div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="h-10 bg-muted rounded"></div>
      </div>
    </div>
  );

  // Display skeletons when loading
  const renderSkeletons = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <ArticleSkeleton key={index} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Filters Section */}
          <section className="mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
              <div className="flex flex-col gap-2">
                <TopicFilter
                  topics={topics}
                  selectedTopic={selectedTopic}
                  onSelectTopic={handleTopicSelect}
                />
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>Last updated: {formatLastUpdated()}</span>
                  <button 
                    onClick={handleRefresh} 
                    disabled={isRefreshing}
                    className="ml-2 p-1 rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
                    aria-label="Refresh news"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground mr-1 flex items-center gap-1.5">
                  <Filter className="w-4 h-4" />
                  <span>Sentiment:</span>
                </span>
                
                <button
                  onClick={() => handleSentimentSelect(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                    selectedSentiment === null
                      ? "bg-primary text-primary-foreground"
                      : "bg-card hover:bg-secondary"
                  }`}
                >
                  All
                </button>
                
                <button
                  onClick={() => handleSentimentSelect("positive")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                    selectedSentiment === "positive"
                      ? "bg-positive text-white"
                      : "bg-positive/10 text-positive hover:bg-positive/20"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  Positive
                </button>
                
                <button
                  onClick={() => handleSentimentSelect("neutral")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                    selectedSentiment === "neutral"
                      ? "bg-neutral text-white"
                      : "bg-neutral/10 text-neutral hover:bg-neutral/20"
                  }`}
                >
                  <Minus className="w-3 h-3" />
                  Neutral
                </button>
                
                <button
                  onClick={() => handleSentimentSelect("negative")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 border transition-colors ${
                    selectedSentiment === "negative"
                      ? "bg-negative text-white"
                      : "bg-negative/10 text-negative hover:bg-negative/20"
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  Negative
                </button>
              </div>
            </div>
          </section>
          
          {/* Stats and Chart Section */}
          {topicSentiment && (
            <section className="mb-8 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-3 bg-card rounded-xl border p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Sentiment Distribution: {topicSentiment.topic}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-positive/5 border border-positive/20">
                      <ThumbsUp className="w-8 h-8 text-positive mb-2" />
                      <div className="text-2xl font-bold text-positive">
                        {topicSentiment.positive}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Positive Articles
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-neutral/5 border border-neutral/20">
                      <Minus className="w-8 h-8 text-neutral mb-2" />
                      <div className="text-2xl font-bold text-neutral">
                        {topicSentiment.neutral}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Neutral Articles
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-negative/5 border border-negative/20">
                      <ThumbsDown className="w-8 h-8 text-negative mb-2" />
                      <div className="text-2xl font-bold text-negative">
                        {topicSentiment.negative}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Negative Articles
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-card rounded-xl border p-6">
                  <h3 className="text-lg font-semibold mb-4">Sentiment Chart</h3>
                  <SentimentChart data={topicSentiment} className="h-[180px]" />
                </div>
              </div>
            </section>
          )}
          
          {/* Articles Section */}
          <section className="animate-slide-up">
            <h2 className="text-2xl font-semibold mb-6">
              {selectedTopic
                ? `Latest ${selectedTopic} News`
                : "Latest News"}
              {selectedSentiment && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({selectedSentiment} sentiment)
                </span>
              )}
            </h2>
            
            {loading ? (
              renderSkeletons()
            ) : filteredArticles.length > 0 ? (
              <NewsGrid articles={filteredArticles} />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  Try changing your filter settings or refreshing the page
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Refresh News
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
      
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p>
            © {new Date().getFullYear()} NewSense. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
