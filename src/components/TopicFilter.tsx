
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TopicFilterProps {
  topics: string[];
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
  className?: string;
}

const TopicFilter = ({
  topics,
  selectedTopic,
  onSelectTopic,
  className,
}: TopicFilterProps) => {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        onClick={() => onSelectTopic(null)}
        className={cn(
          "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
          "border hover:bg-secondary",
          selectedTopic === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-transparent text-muted-foreground border-border"
        )}
      >
        All
      </button>
      
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onSelectTopic(topic)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
            "border hover:bg-secondary",
            selectedTopic === topic
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border"
          )}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default TopicFilter;
