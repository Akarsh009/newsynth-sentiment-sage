
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import TopicFilter from "@/components/TopicFilter";
import NewsGrid from "@/components/NewsGrid";
import SentimentChart from "@/components/SentimentChart";
import SentimentTag from "@/components/SentimentTag";
import { mockArticles, topics, topicSentiments, NewsArticle, SentimentType, TopicSentiment } from "@/utils/mockData";
import { Filter, ThumbsUp, Minus, ThumbsDown } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType | null>(null);
  const [topicSentiment, setTopicSentiment] = useState<TopicSentiment | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch articles (simulated)
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setArticles(mockArticles);
      setLoading(false);
      
      toast({
        title: "News Updated",
        description: "Latest articles have been loaded",
        duration: 3000,
      });
    };
    
    fetchArticles();
  }, [toast]);

  // Filter articles by topic and sentiment
  useEffect(() => {
    let filtered = [...articles];
    
    // Filter by topic
    if (selectedTopic) {
      filtered = filtered.filter((article) => article.topic === selectedTopic);
      
      // Find topic sentiment data
      const topicData = topicSentiments.find(
        (item) => item.topic === selectedTopic
      );
      setTopicSentiment(topicData || null);
    } else {
      // Calculate overall sentiment data
      const overallSentiment = {
        topic: "All Topics",
        positive: articles.filter((a) => a.sentiment === "positive").length,
        neutral: articles.filter((a) => a.sentiment === "neutral").length,
        negative: articles.filter((a) => a.sentiment === "negative").length,
        total: articles.length,
      };
      setTopicSentiment(overallSentiment);
    }
    
    // Filter by sentiment
    if (selectedSentiment) {
      filtered = filtered.filter(
        (article) => article.sentiment === selectedSentiment
      );
    }
    
    setFilteredArticles(filtered);
  }, [articles, selectedTopic, selectedSentiment]);

  const handleTopicSelect = (topic: string | null) => {
    setSelectedTopic(topic);
  };

  const handleSentimentSelect = (sentiment: SentimentType | null) => {
    setSelectedSentiment(sentiment);
  };

  // Skeleton loader for articles
  const ArticleSkeleton = () => (
    <div className="rounded-xl overflow-hidden bg-card border animate-pulse">
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
          {/* Hero Section */}
          <section className="mb-12 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-800 p-8 text-white">
            <div className="max-w-3xl animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                NewSynth Sentiment Sage
              </h1>
              <p className="text-lg opacity-90 mb-6">
                Discover the latest news with AI-powered sentiment analysis that helps
                you understand the emotional tone behind each story.
              </p>
              <div className="flex flex-wrap gap-3">
                <SentimentTag
                  sentiment="positive"
                  size="lg"
                  className="!bg-positive/20 !border-positive/40"
                />
                <SentimentTag
                  sentiment="neutral"
                  size="lg"
                  className="!bg-neutral/20 !border-neutral/40"
                />
                <SentimentTag
                  sentiment="negative"
                  size="lg"
                  className="!bg-negative/20 !border-negative/40"
                />
              </div>
            </div>
          </section>
          
          {/* Filters Section */}
          <section className="mb-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-4">
              <TopicFilter
                topics={topics}
                selectedTopic={selectedTopic}
                onSelectTopic={handleTopicSelect}
              />
              
              <div className="flex items-center gap-2">
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
                  Try changing your filter settings
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
          <p>
            © {new Date().getFullYear()} NewSynth Sentiment Sage. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
