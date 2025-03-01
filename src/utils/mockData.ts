
export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  author: string;
  publishedAt: string;
  url: string;
  imageUrl: string;
  topic: string;
  sentiment: SentimentType;
  sentimentScore: number;
}

export interface TopicSentiment {
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

// Sample topics
export const topics = [
  'Politics',
  'Technology',
  'Business',
  'Health',
  'Science',
  'Sports',
  'Entertainment',
  'World'
];

// Sample sources
const sources = [
  'The New York Times',
  'The Washington Post',
  'Reuters',
  'Associated Press',
  'BBC News',
  'CNN',
  'The Guardian',
  'Bloomberg',
  'CNBC',
  'The Verge'
];

// Generate a random date within the last week
const getRandomDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000));
  return date.toISOString();
};

// Generate random sentiment
const getRandomSentiment = (): { type: SentimentType, score: number } => {
  const random = Math.random();
  if (random < 0.33) {
    return { 
      type: 'positive', 
      score: 0.5 + (Math.random() * 0.5) // 0.5 to 1.0
    };
  } else if (random < 0.66) {
    return { 
      type: 'neutral', 
      score: 0.3 + (Math.random() * 0.4) // 0.3 to 0.7
    };
  } else {
    return { 
      type: 'negative', 
      score: 0 + (Math.random() * 0.5) // 0.0 to 0.5
    };
  }
};

// Mock news articles data
const generateMockArticles = (count: number): NewsArticle[] => {
  const articles: NewsArticle[] = [];
  
  const techArticles = [
    {
      title: "Apple Unveils New AI Features for iPhone",
      description: "The tech giant announced several AI enhancements coming to iOS in the next update.",
      content: "Apple today revealed a suite of new artificial intelligence features coming to iPhone with its next major software update. These features include smarter Siri interactions, enhanced photo editing capabilities powered by machine learning, and predictive text that adapts to your writing style."
    },
    {
      title: "Microsoft's Cloud Business Continues to Grow",
      description: "Azure revenue increased by 28% in the last quarter, beating analyst expectations.",
      content: "Microsoft reported strong growth in its cloud division, with Azure revenue increasing 28% compared to the same period last year. This growth exceeded analysts' expectations and highlights the company's successful transition to cloud-based services."
    },
    {
      title: "Tesla Faces Production Challenges for New Model",
      description: "The electric vehicle maker is struggling with supply chain issues for its latest vehicle.",
      content: "Tesla is facing significant production challenges for its newest electric vehicle model. Supply chain disruptions and parts shortages have forced the company to revise its delivery timeline, potentially disappointing customers who have placed pre-orders."
    }
  ];
  
  const politicsArticles = [
    {
      title: "Senate Passes New Climate Bill",
      description: "The legislation includes significant funding for renewable energy projects.",
      content: "The Senate today passed a comprehensive climate bill that allocates billions of dollars to renewable energy projects across the country. The bill, which passed with bipartisan support, aims to reduce carbon emissions by 50% by 2030."
    },
    {
      title: "President Announces Infrastructure Plan",
      description: "The proposal includes $2 trillion in spending on roads, bridges, and broadband.",
      content: "The President unveiled an ambitious infrastructure plan that would invest $2 trillion in the nation's roads, bridges, ports, and broadband internet. The plan, which would be funded through corporate tax increases, faces an uncertain path in Congress."
    },
    {
      title: "Global Leaders Gather for Climate Summit",
      description: "Representatives from 40 countries are meeting to discuss climate change goals.",
      content: "Leaders from 40 countries are convening this week for a virtual climate summit to discuss emissions targets and environmental policies. The talks come as scientists warn that immediate action is necessary to prevent the worst effects of climate change."
    }
  ];
  
  const healthArticles = [
    {
      title: "New Study Shows Benefits of Mediterranean Diet",
      description: "Researchers found significant health improvements in participants following the diet.",
      content: "A new long-term study published in the Journal of Nutrition demonstrates the significant health benefits of following a Mediterranean diet. Participants showed improved heart health markers, lower inflammation, and reduced risk of chronic diseases."
    },
    {
      title: "Breakthrough in Alzheimer's Research Announced",
      description: "Scientists have identified a new potential treatment target for the disease.",
      content: "Researchers at the National Institute of Health have announced a breakthrough in Alzheimer's research, identifying a new protein that could serve as a target for future treatments. The discovery could lead to novel therapies for the neurodegenerative condition."
    },
    {
      title: "Mental Health Applications See Surge in Usage",
      description: "Therapy and meditation apps report record numbers of new users in the past year.",
      content: "Mental health applications have experienced unprecedented growth over the past year, with popular therapy and meditation apps reporting millions of new users. Experts attribute the surge to increased awareness of mental health issues and the convenience of digital wellness solutions."
    }
  ];
  
  // Collect all template articles
  const articleTemplates = [
    ...techArticles.map(article => ({ ...article, topic: 'Technology' })),
    ...politicsArticles.map(article => ({ ...article, topic: 'Politics' })),
    ...healthArticles.map(article => ({ ...article, topic: 'Health' }))
  ];
  
  // Generate articles based on templates
  for (let i = 0; i < count; i++) {
    // If we have templates left, use them first
    if (i < articleTemplates.length) {
      const template = articleTemplates[i];
      const sentiment = getRandomSentiment();
      
      articles.push({
        id: `article-${i}`,
        title: template.title,
        description: template.description,
        content: template.content,
        source: sources[Math.floor(Math.random() * sources.length)],
        author: `Author ${i + 1}`,
        publishedAt: getRandomDate(),
        url: `https://example.com/article-${i}`,
        imageUrl: `https://source.unsplash.com/random/800x600?${template.topic.toLowerCase()}&${i}`,
        topic: template.topic,
        sentiment: sentiment.type,
        sentimentScore: sentiment.score
      });
    } else {
      // Generate random articles for the rest
      const topicIndex = Math.floor(Math.random() * topics.length);
      const sentiment = getRandomSentiment();
      
      articles.push({
        id: `article-${i}`,
        title: `Sample Article Title ${i + 1}`,
        description: `This is a sample description for article ${i + 1}. It provides a brief overview of the content.`,
        content: `This is the full content of article ${i + 1}. It contains more detailed information about the topic and would be much longer in a real application.`,
        source: sources[Math.floor(Math.random() * sources.length)],
        author: `Author ${i + 1}`,
        publishedAt: getRandomDate(),
        url: `https://example.com/article-${i}`,
        imageUrl: `https://source.unsplash.com/random/800x600?${topics[topicIndex].toLowerCase()}&${i}`,
        topic: topics[topicIndex],
        sentiment: sentiment.type,
        sentimentScore: sentiment.score
      });
    }
  }
  
  return articles;
};

// Generate topic sentiment summary
export const generateTopicSentiment = (articles: NewsArticle[]): TopicSentiment[] => {
  const topicMap = new Map<string, { positive: number, neutral: number, negative: number, total: number }>();
  
  // Initialize map with all topics
  topics.forEach(topic => {
    topicMap.set(topic, { positive: 0, neutral: 0, negative: 0, total: 0 });
  });
  
  // Count articles by topic and sentiment
  articles.forEach(article => {
    const topicSentiment = topicMap.get(article.topic);
    if (topicSentiment) {
      topicSentiment[article.sentiment]++;
      topicSentiment.total++;
    }
  });
  
  // Convert map to array
  return Array.from(topicMap.entries()).map(([topic, counts]) => ({
    topic,
    ...counts
  }));
};

// Generate mock data
export const mockArticles = generateMockArticles(30);
export const topicSentiments = generateTopicSentiment(mockArticles);
