# AI 深度自學教材（Python → AI Architect）

這是一套以 **AI 核心與生成式 AI 應用為主線**、每章提供 **完整站內閱讀內容與情境選擇題驗收，可分次閱讀** 的自學網站（目前入口為 `study.html`，`index.html`、`route.html`、`genai.html` 均自動導向此頁）。

## 課程設計原則

1. **AI 學習主線優先（第 1～47 課）**：
   先集中學習 AI 專案判斷、機器學習與深度學習訓練基礎、語言模型與 GPT 底層原理、生成式 AI 應用開發（Prompt、RAG、Function Calling、AI UX、Prompt Injection 防護、LLMOps、開源模型、LoRA 微調、SLM、AI Agent），以及 2025～2026 進階主題（Context Engineering、Agent Harness、KV Cache 與 Flash Attention、後訓練對齊與推理模型、多模態 VLM 與語音模型、MCP 協議、Self-Improving 與現代訓練工程）。
2. **Python、網站開發與系統架構暫置於後（第 48～80 課）**：
   原有的 Python 工程基礎（`w1`～`w6`）、網站與資料庫工程（`w7`～`w22`）、系統架構與可靠性（`w23`～`w33`）完整保留於第 48～80 課作為後續工程延伸，可在頁面左側一鍵切換「全部 (80)／AI 主線 (47)／後續工程 (33)」。
3. **每章 30 分鐘深度閱讀內容（拒絕只有幾行字就直接測驗）**：
   正文目前約6,000～9,200字元（含小標題及標記），各章依實際內容估算時間；每次可閱讀約30分鐘，書籤記錄段落。站內講義，包含：
   - **多個教學小節**：問題背景與痛點、底層原理與數學／機制直覺、架構流程與取捨對照、帶數字真實案例推演、常見工程誤區與除錯指南、30 分鐘重點檢核清單。
   - **完整程式碼／量化推演範例與逐步拆解**：各課附具體範例與 5～6 步逐行拆解。
   - **進階參考實作與驗證範本**：可展開對照教學用參考實作或實驗對照腳本；範例限制另行標示（無須繳交作業）。
   - **3 題情境與除錯選擇題驗收**：立即判分並提供超過百字的深度解析，全部答對即記錄該課通過。

## 五大 AI 教學來源與本站章節對照

| 教學來源 | 官方網址 | 本站對應章節與核心內容 |
| --- | --- | --- |
| **吳恩達 Andrew Ng — AI For Everyone** | [Coursera 課程](https://www.coursera.org/learn/ai-for-everyone) | **第 1～2 課（起點與 AI 判斷）**：AI 能做什麼、預測／分類／生成與規則系統的決策邊界、技術與商業盡職調查、Baseline 基準線、專案選擇與驗收標準 |
| **李宏毅 — 機器學習與生成式 AI** | [生成式 AI 與機器學習導論](https://speech.ee.ntu.edu.tw/~hylee/GenAI-ML/2025-fall.php)、[機器學習 2026](https://speech.ee.ntu.edu.tw/~hylee/ml/2026-spring.php) | **第 5～7、9 課 & 第 38～42、44 課**：機器學習三步驟觀念、資料切分與洩漏、分類評估指標、過擬合診斷、Context Engineering、Agent Harness、KV Cache 與 Flash Attention、後訓練對齊與推理模型、多模態 VLM 與語音模型、Self-Improving 自我成長 |
| **李沐等作者 —《動手學深度學習》** | [中文互動教材 D2L](https://zh.d2l.ai/) | **第 3～10 課 & 第 14 課（模型基礎與訓練）**：張量形狀與廣播機制、計算圖與自動微分（Autograd）、線性回歸與損失函數、Softmax 分類、多層感知機（MLP）與 PyTorch 訓練迴圈、正則化與早停、實驗可重現性、自注意力機制 |
| **Andrej Karpathy — Neural Networks: Zero to Hero** | [官方課程網站](https://karpathy.ai/zero-to-hero.html)、[官方程式庫](https://github.com/karpathy/nn-zero-to-hero) | **第 11～15 課 & 第 44 課（模型內部、語言模型與訓練工程）**：micrograd 純量反向傳播與鏈式法則、makemore Bigram 語言模型與 NLL 損失、UTF-8 與 BPE Tokenizer 演算法、Q/K/V 自注意力與因果遮罩、小型 GPT 訓練與自回歸生成、BF16／Warmup＋Cosine／RMSNorm／Scaling Laws |
| **Microsoft — Generative AI for Beginners** | [繁體中文教材](https://github.com/microsoft/generative-ai-for-beginners/blob/main/translations/zh-TW/README.md)、[英文原始教材](https://github.com/microsoft/generative-ai-for-beginners)、[AI Agents 延伸教材](https://github.com/microsoft/ai-agents-for-beginners) | **第 16～37 課 & 第 43 課（生成式 AI 應用完整 22 單元＋MCP 協議）**：設定與金鑰安全、LLM 文字生成與幻覺、模型選型矩陣、負責任 AI、Prompt 結構、Few-Shot 與任務拆解、文字生成 API、多輪聊天上下文、向量搜尋、RAG 兩段式診斷、Function Calling、AI UX、Prompt Injection 防護、LLMOps 回歸評估、Model Card 與公開權重、微調 vs RAG 決策、SLM 量化部署、AI Agent 行動迴圈、影像生成驗收、Low-Code 取捨、Mistral 與 Meta 模型選型、MCP 工具協議與安全閘道 |

## 進度與備份

- 閱讀與選擇題進度儲存於瀏覽器 `localStorage`（鍵值：`python-ai-reading-v1`），可隨時匯出與匯入 JSON 備份。
- 舊版 `python-ai-architect-progress-v1`、`python-ai-architect-interactive-v2`、`python-ai-genai-supplement-v1` 與 `python-ai-30min-v1` 的本機資料均保留不覆蓋。

## 本機開啟與測試驗證

本機開啟靜態伺服器：

```bash
python -m http.server 8000
```

開啟 `http://localhost:8000/study.html`。

執行自動化測試驗證（Node 22+ 與 Python 3.12+）：

```bash
npm ci
npm test
```


## 2026-11-27 審查修正

- 正文、選讀程式、測驗分開計時；續讀依最後章節與段落書籤。
- 題目使用穩定ID及內容版本，答案位置重新平衡。舊版未帶題目版本的成績保留在 `python-ai-reading-v1-before-20261127-fix`，修訂題需重新驗收。
- 安全、RAG及後端範例明確標示教學限制，不能直接視為可部署的安全服務。
- 課文來源在 `rewrite/*.txt`；程式範例、解法、測驗來源在 `scripts/study-data.orig.js`。修改後執行 `python scripts/build_rewrite.py`，同步產生 `study-data.js` 與 `glossary.js`。CI會檢查生成檔一致性。
- 新增針對審查問題的範例執行、越權／偽造核准／巢狀遮罩／引用反例、公式語意、進度遷移與發布資源測試。
- 修正公式千分位逗點（`{,}` 顯示異常）、正文三反引號程式碼區塊與引用區塊（`> `）渲染、書籤續讀捲動覆蓋、TOC 跳轉、跨課編號誤指、第 40 課來源標示與名詞小辭典跨領域誤判／重複鍵。
- 增補 4 堂約 30 分鐘新手友善 AI 進階章節（第 41～44 課：後訓練對齊與推理模型、多模態 VLM 與語音模型、MCP 協議與安全閘道、Self-Improving 與現代訓練工程）並於第 40 課補齊 Flash Attention；同步優化選擇題選項長度平衡。
