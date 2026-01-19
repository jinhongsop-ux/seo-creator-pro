# 🚀 SEO-Creator-Pro Engine

> **A skyscraper-level SEO content generator powered by Google Gemini 1.5 & Tavily AI.**
> 基于 Google Gemini 和 Tavily AI 的摩天大楼级 SEO 内容生成引擎。

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech](https://img.shields.io/badge/Built%20With-React%20%7C%20Vite%20%7C%20Tailwind-black)

## ✨ Features (核心功能)

This is not just another wrapper. It's a professional workflow tool designed for SEO specialists.
这不仅仅是一个套壳工具，它是专为 SEO 专家设计的工业级工作流。

* **🧠 Dual AI Core (双核驱动):**
    * **Google Gemini 2.5 Flash:** Handle 1M+ context window for deep, long-form content generation.
    * **Tavily AI Search:** Auto-research the top 5 competitors on Google and extract key insights.
* **🔐 BYOK Architecture (自带 Key 模式):**
    * Client-side architecture. Your API Keys are stored locally in your browser (`localStorage`).
    * No backend server required. Zero maintenance cost.
* **⚡ 7-Window Configuration (七步配置法):**
    * Structured inputs for Keyword, Audience, Tone, Goal, Brand Protocol, and Competitor Knowledge.
* **🤖 One-Click Research (一键调研):**
    * Automatically scrape and summarize top ranking articles to feed the AI context.
* **🎨 Neo-Brutalism UI (新野兽派设计):**
    * High-contrast, bold, and interactive interface for maximum productivity.
* **📝 Professional Output (专业交付):**
    * Markdown & Rich Text support.
    * One-click copy formatted HTML/Word-ready content.
    * Dual-language generation (CN/EN) support.

## 🛠️ Tech Stack (技术栈)

* **Framework:** React + Vite
* **Styling:** Tailwind CSS (Custom Neo-brutalism Theme)
* **Icons:** Lucide React
* **AI Integration:** Google Generative AI SDK (`@google/generative-ai`)
* **Search Integration:** Tavily API (REST)
* **Deployment:** Vercel

## 🚀 Getting Started (快速开始)

### Prerequisites (前置要求)

You need to obtain free API keys from:
1.  **Google AI Studio:** [Get Gemini Key](https://aistudio.google.com/app/apikey)
2.  **Tavily AI:** [Get Tavily Key](https://tavily.com/)

### Installation (本地运行)

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-username/seo-creator-pro.git](https://github.com/your-username/seo-creator-pro.git)
    cd seo-creator-pro
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

## 📖 Usage Guide (使用指南)

1.  **Setup Keys:** Enter your Google Gemini Key and Tavily Key in the top black bar ("API SETTINGS").
2.  **Input Keyword:** Enter your target keyword in Window 1.
3.  **Auto Research:** Click the **"Auto-Research (Top 5)"** button in Window 5. The AI will browse the web and fill in the knowledge base.
4.  **Configure:** Fill in other preferences (Audience, Tone, etc.).
5.  **Start Engine:** Click "启动引擎 (Start Engine)".
6.  **Refine & Execute:** Review the strategy outline, make edits if needed, then click "EXECUTE" to generate the full article.

## 📦 Deployment (部署)

This project is optimized for Vercel.

1.  Fork this repository.
2.  Import to Vercel.
3.  **No Environment Variables needed!** Since it uses the "Bring Your Own Key" pattern, you don't need to set secrets in Vercel.
4.  Deploy & Share your URL.

## 🛡️ Privacy & Security (隐私说明)

* **API Keys:** Your keys are **NEVER** sent to our servers. They are stored strictly in your browser's `localStorage` and sent directly to Google/Tavily APIs.
* **Data:** All article generation happens client-side.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ by [Reese]*
