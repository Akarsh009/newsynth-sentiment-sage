
import { NewsArticle } from "@/utils/mockData";
import NewsCard from "./NewsCard";
import { cn } from "@/lib/utils";

interface NewsGridProps {
  articles: NewsArticle[];
  className?: string;
}

const NewsGrid = ({ articles, className }: NewsGridProps) => {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
      className
    )}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
};

export default NewsGrid;
