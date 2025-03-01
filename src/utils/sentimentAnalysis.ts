
// A simplified sentiment analysis implementation
// In a real application, this would connect to a proper NLP service

import { SentimentType } from "./mockData";

// Simple positive and negative word lists
const positiveWords = [
  "good", "great", "excellent", "amazing", "wonderful", "fantastic", 
  "positive", "success", "successful", "win", "winning", "happy", 
  "joy", "joyful", "benefit", "beneficial", "impressive", "inspire",
  "innovative", "breakthrough", "progress", "improve", "improvement",
  "grow", "growth", "opportunity", "hope", "hopeful", "celebrate"
];

const negativeWords = [
  "bad", "terrible", "awful", "poor", "negative", "failure", "fail",
  "lose", "losing", "unhappy", "sad", "sorrow", "sorrowful", "loss",
  "damage", "hurt", "harmful", "decline", "decrease", "worsen",
  "worse", "worst", "concern", "concerns", "concerning", "problem",
  "trouble", "crisis", "danger", "dangerous", "conflict", "war",
  "death", "die", "disaster", "emergency", "fear", "afraid"
];

export function analyzeTextSentiment(text: string): SentimentType {
  if (!text) return "neutral";
  
  const lowercaseText = text.toLowerCase();
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Check for positive words
  for (const word of positiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  }
  
  // Check for negative words
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  }
  
  // Determine sentiment based on word counts
  if (positiveCount > negativeCount + 1) {
    return "positive";
  } else if (negativeCount > positiveCount + 1) {
    return "negative";
  } else {
    return "neutral";
  }
}

export function getSentimentLabel(sentiment: SentimentType): string {
  switch (sentiment) {
    case "positive":
      return "Positive";
    case "neutral":
      return "Neutral";
    case "negative":
      return "Negative";
    default:
      return "Unknown";
  }
}

export function getSentimentColor(sentiment: SentimentType): string {
  switch (sentiment) {
    case "positive":
      return "positive";
    case "neutral":
      return "neutral";
    case "negative":
      return "negative";
    default:
      return "neutral";
  }
}
