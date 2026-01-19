// services/tavilyService.ts

export const searchCompetitors = async (apiKey: string, query: string) => {
  if (!apiKey) {
    throw new Error("Tavily API Key is missing");
  }

  // 我们调用 Tavily 的搜索接口
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      query: query,
      search_depth: "advanced", // 深度搜索模式
      include_answer: true,     // 让它生成一个简短回答
      include_raw_content: false,
      max_results: 5,           // 抓取前 5 名 (为了速度和精准度，5篇高质量比10篇杂乱的好)
      // 如果你需要更多，可以把 max_results 改成 10
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily Search Failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

// 辅助函数：把 API 返回的 JSON 格式化成 AI 能读懂的文本
export const formatCompetitorData = (data: any): string => {
  if (!data.results || data.results.length === 0) return "No results found.";

  let formatted = `====== [AUTO-GENERATED COMPETITOR ANALYSIS] ======\n`;
  formatted += `Query: ${data.query}\n`;
  if (data.answer) formatted += `Quick Summary: ${data.answer}\n`;
  formatted += `\n`;

  data.results.forEach((item: any, index: number) => {
    formatted += `--- Source ${index + 1} ---\n`;
    formatted += `Title: ${item.title}\n`;
    formatted += `URL: ${item.url}\n`;
    formatted += `Content Excerpt: ${item.content}\n\n`;
  });

  formatted += `==================================================\n`;
  return formatted;
};