
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
    const topicName = article.topic.charAt(0).toUpperCase() + article.topic.slice(1);
    
    // Source-specific placeholder images
    if (article.source.includes('timesofindia')) {
      return 'https://static.toiimg.com/photo/msid-74814898/74814898.jpg'; 
    } else if (article.source.includes('ndtv')) {
      return 'https://drop.ndtv.com/homepage/images/ndtvlogo23march.png';
    } else if (article.source.includes('hindustantimes')) {
      return 'https://www.hindustantimes.com/images/app-images/ht-logo.png';
    } else if (article.source.includes('indianexpress')) {
      return 'https://images.indianexpress.com/2022/03/indian-express-logo.jpg';
    } else if (article.source.includes('economictimes')) {
      return 'https://img.etimg.com/photo/msid-74451948,quality-100/et-logo.jpg';
    } else if (article.source.includes('nytimes')) {
      return 'https://static01.nyt.com/newsgraphics/images/icons/defaultPromoCrop.png';
    } else if (article.source.includes('npr')) {
      return 'https://media.npr.org/assets/img/2019/06/17/npr-logo_rgb_primary-e1533569536588-b65c752984de1baac36c16d6a4f4009afb38a8b3.jpg';
    }
    
    return `https://placehold.co/600x400?text=${topicName}+News`;
  };

  // Check if the URL is valid
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false;
    if (!url.startsWith('http')) return false;
    
    // Filter out some problematic image URLs that frequently fail
    if (url.includes('rss.cnn.com')) return false;
    if (url.includes('feeds.feedburner.com')) return false;
    if (url.includes('feedproxy.google.com')) return false;
    
    return true;
  };

  // Initial image source - use placeholder immediately if URL is invalid
  const initialImageSrc = isValidImageUrl(article.imageUrl) ? article.imageUrl : getPlaceholderImage();

  return (
    <div className={cn(
      "news-card rounded-xl overflow-hidden bg-card border hover:shadow-lg transition-all duration-300",
      className
    )}>
      <div className="relative h-48 overflow-hidden">
        <div className="bg-muted h-full w-full absolute inset-0"></div>
        {!imageError ? (
          <img
            src={initialImageSrc}
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
