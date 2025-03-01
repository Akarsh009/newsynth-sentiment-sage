
import { SentimentType } from './mockData';

// This is a placeholder for a real sentiment analysis algorithm
// In a real application, you would use a machine learning model or API

export const analyzeSentiment = (text: string): { type: SentimentType; score: number } => {
  // Count positive and negative words (very simplified approach)
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'happy', 'success', 'benefit', 'improved', 'gain', 'progress'];
  const negativeWords = ['bad', 'poor', 'terrible', 'negative', 'sad', 'failure', 'issue', 'problem', 'challenge', 'decline'];
  
  const lowercaseText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowercaseText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  // Calculate sentiment score (0-1)
  const totalWords = text.split(/\s+/).length;
  const positiveScore = positiveCount / totalWords;
  const negativeScore = negativeCount / totalWords;
  const netScore = 0.5 + (positiveScore - negativeScore) * 5; // Scale to 0-1 range
  const clampedScore = Math.max(0, Math.min(1, netScore));
  
  // Determine sentiment type
  let type: SentimentType;
  if (clampedScore > 0.6) {
    type = 'positive';
  } else if (clampedScore < 0.4) {
    type = 'negative';
  } else {
    type = 'neutral';
  }
  
  return { type, score: clampedScore };
};

// Function to get color based on sentiment
export const getSentimentColor = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case 'positive':
      return 'positive';
    case 'neutral':
      return 'neutral';
    case 'negative':
      return 'negative';
    default:
      return 'neutral';
  }
};

// Function to get icon based on sentiment
export const getSentimentIcon = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case 'positive':
      return 'thumbs-up';
    case 'neutral':
      return 'minus';
    case 'negative':
      return 'thumbs-down';
    default:
      return 'minus';
  }
};

// Function to get label based on sentiment
export const getSentimentLabel = (sentiment: SentimentType): string => {
  switch (sentiment) {
    case 'positive':
      return 'Positive';
    case 'neutral':
      return 'Neutral';
    case 'negative':
      return 'Negative';
    default:
      return 'Unknown';
  }
};
