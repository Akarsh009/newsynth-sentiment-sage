
import { useEffect, useRef } from "react";
import { TopicSentiment } from "@/utils/mockData";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SentimentChartProps {
  data: TopicSentiment;
  className?: string;
}

const SentimentChart = ({ data, className }: SentimentChartProps) => {
  const chartData = [
    { name: "Positive", value: data.positive, color: "#10b981" },
    { name: "Neutral", value: data.neutral, color: "#6b7280" },
    { name: "Negative", value: data.negative, color: "#ef4444" },
  ];

  return (
    <div className={className}>
      <div className="h-full min-h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              animationDuration={500}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} articles`, null]} 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                padding: '8px 12px' 
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SentimentChart;
