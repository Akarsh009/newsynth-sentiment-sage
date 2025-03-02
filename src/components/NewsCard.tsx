
import { useState } from "react";
import { Calendar, Globe } from "lucide-react";
import { NewsArticle } from "@/utils/mockData";
import SentimentTag from "./SentimentTag";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  article: NewsArticle;
  className?: string;
}

const NewsCard = ({ article, className }: NewsCardProps) => {
  const [imageError, setImageError] = useState(false);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Generate a placeholder image based on topic
  const getPlaceholderImage = () => {
    return `https://placehold.co/600x400?text=${article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}+News`;
  };

  return (
    <div className={cn(
      "news-card rounded-xl overflow-hidden bg-card border hover:shadow-lg transition-all duration-300",
      className
    )}>
      <div className="relative h-48 overflow-hidden">
        <div className="bg-muted h-full w-full absolute inset-0"></div>
        {!imageError ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <img
            src={getPlaceholderImage()}
            alt={article.title}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
          />
        )}
        <div className="absolute top-3 left-3">
          <div className="px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-sm text-xs font-medium text-primary-foreground">
            {article.topic.charAt(0).toUpperCase() + article.topic.slice(1)}
          </div>
        </div>
        <div className="absolute top-3 right-3">
          <SentimentTag sentiment={article.sentiment} />
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg line-clamp-2 leading-tight">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{article.description}</p>
        
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            <span>{article.source}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full text-center py-2 rounded-lg border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
        >
          Read Article
        </a>
      </div>
    </div>
  );
};

export default NewsCard;
