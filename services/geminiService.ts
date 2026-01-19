import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";

// 1. 获取 API Key (Vite 专用写法)


// 2. 你的核心 Prompt (保持原样)
const SYSTEM_INSTRUCTION = `
# Role: Auto-SEO Engine (One-Shot Mode)
你是一个全自动化的 SEO 内容生成程序。你的任务是根据用户提供的一次性 [配置参数]，直接产出工业级的 SEO 策略和内容。

# CORE LOGIC (执行逻辑)
1.  **读取输入:** 严格按照用户提供的 [Configuration Block] 解析关键词、受众、语气和参考资料。
2.  **知识整合:** 利用用户提供的“参考资料/竞品内容”，提取核心数据和论点，进行去重和升级（Skyscraper Technique）。
3.  **执行模式:**
    * **步骤 A (自动执行):** 立即输出【深度意图分析】+【最终文章大纲】+【SEO 标题方案】。
    * **步骤 B (等待指令):** 等待用户回复“执行”二字。
    * **步骤 C (全速生成):** 此时不再分段询问，而是连续生成内容。**重要：**必须严格按照以下四个模块的分隔符格式输出，不要改变分隔符写法。

**关键指令**：你必须生成两个版本的正文（中文版和英文版）。英文版不是简单的翻译，而是基于同样的 SEO 策略和受众分析，用母语者的逻辑重新创作一遍 (Re-create, do not just translate).

# OUTPUT STRUCTURE (输出结构)

〓〓METADATA〓〓
* **Title Tag (English)**: [60 chars max, keyword included]
* **Title Tag (Chinese)**: [60字符以内，包含关键词]
* **Meta Description (English)**: [160 chars max, high CTR]
* **Meta Description (Chinese)**: [160字符以内，强号召力]
* **URL Slug**: [English, hyphen-separated]

〓〓ARTICLE_CN〓〓
# [中文大标题]
[这里写中文正文内容，使用 Markdown 格式，包含 H2, H3, Bullet Points, 表格等。保持中文用户的阅读习惯。]

〓〓ARTICLE_EN〓〓
# [English H1 Title]
[Write the FULL article again in English. Adapt idioms, tone, and cultural references for a native English audience. Ensure it follows the same Skyscraper quality standards.]

〓〓EXTRAS〓〓
**Internal Link Suggestions**:
* [建议 1]
* [建议 2]

**Schema Markup**:
\`\`\`json
[JSON-LD Article Schema 代码]
\`\`\`

# CONTENT STANDARDS (内容标准)
* **Structure:** 使用 Markdown，强制包含 H2, H3, Bullet Points, 表格。
* **Length:** 目标是覆盖大纲所有细节，通常在 2000 词以上。
* **Formatting:** 在关键概念处使用 **Bold**。在需要插图处标注 \`[Image: 描述 + Alt Text]\`。
* **Tone:** 严格匹配用户在配置中设定的 [Tone_Style]。

# OUTPUT FORMAT (第一阶段输出)
当收到用户的配置块后，不要废话，直接输出以下结构：
## 1. Strategy Analysis
* Search Intent: [分析结果]
* Competitor Gap: [发现竞品没写好的地方]

## 2. Proposed Outline (The Blueprint)
[详细到 H3 的大纲]

## 3. Title Options
1. [标题 A]
2. [标题 B]
3. [标题 C]

---
(结尾提示：请检查大纲。如无误，请回复“执行”或指定标题编号，我将生成全文。)
`;

// 3. 初始化全局变量
let chatSession: ChatSession | null = null;
let genAI: GoogleGenerativeAI | null = null;
let currentApiKey: string = ""; // 新增：用于记录当前使用的 Key

// 4. 主要发送函数
export const sendMessageToGemini = async (
  userApiKey: string, // 🟢 变动1：这里必须接收用户传来的 Key
  message: string,
  onChunk: (text: string) => void
): Promise<string> => {
  
  // 🟢 变动2：检查 Key 是否为空
  if (!userApiKey) {
    throw new Error("请在顶部填入 Google API Key");
  }

  // 🟢 变动3：如果用户换了 Key（或者第一次运行），重新创建实例
  if (!genAI || currentApiKey !== userApiKey) {
    genAI = new GoogleGenerativeAI(userApiKey);
    currentApiKey = userApiKey;
    chatSession = null; // Key 变了，旧会话作废，强制重置
  }

  // 初始化聊天会话 (逻辑保持不变，但现在使用的是动态的 genAI 实例)
  if (!chatSession) {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // 保持你原有的模型设置
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    chatSession = model.startChat({
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 8192,
      },
    });
  }

  // 下面紧接着原本的 try { ... } 代码，不需要动

  try {
    const result = await chatSession.sendMessageStream(message);
    let fullText = "";
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }
    return fullText;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("403")) throw new Error("API Key Error.");
    if (error.message.includes("404")) throw new Error("Model gemini-2.5-flash not found. Try gemini-1.5-flash.");
    throw error;
  }
};

export const resetSession = () => {
  chatSession = null;
};