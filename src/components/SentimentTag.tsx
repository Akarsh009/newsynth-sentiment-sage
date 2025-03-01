
import { SentimentType } from "@/utils/mockData";
import { getSentimentColor, getSentimentLabel } from "@/utils/sentimentAnalysis";
import { ThumbsUp, Minus, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SentimentTagProps {
  sentiment: SentimentType;
  score?: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SentimentTag = ({
  sentiment,
  score,
  showScore = false,
  size = "md",
  className,
}: SentimentTagProps) => {
  const color = getSentimentColor(sentiment);
  const label = getSentimentLabel(sentiment);
  
  const getIcon = () => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="w-3 h-3" />;
      case "neutral":
        return <Minus className="w-3 h-3" />;
      case "negative":
        return <ThumbsDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const colorClasses = {
    positive: "bg-positive/10 text-positive border-positive/30",
    neutral: "bg-neutral/10 text-neutral border-neutral/30",
    negative: "bg-negative/10 text-negative border-negative/30",
  };

  return (
    <div
      className={cn(
        "sentiment-tag inline-flex items-center gap-1.5 rounded-full border",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    >
      {getIcon()}
      <span className="font-medium">{label}</span>
      {showScore && score !== undefined && (
        <span className="text-xs opacity-75">
          {Math.round(score * 100)}%
        </span>
      )}
    </div>
  );
};

export default SentimentTag;
