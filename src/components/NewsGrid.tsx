
import { NewsArticle } from "@/utils/mockData";
import NewsCard from "./NewsCard";
import { cn } from "@/lib/utils";

interface NewsGridProps {
  articles: NewsArticle[];
  className?: string;
}

const NewsGrid = ({ articles, className }: NewsGridProps) => {
  // Determine grid layout based on number of articles
  const getGridClasses = () => {
    switch (articles.length) {
      case 0:
        return "grid-cols-1";
      case 1:
        return "grid-cols-1 max-w-xl mx-auto";
      case 2:
        return "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto";
      case 3:
        return "grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  };

  return (
    <div 
      className={cn(
        `grid gap-6 ${getGridClasses()}`,
        className
      )}
    >
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default NewsGrid;
