# Python → AI Architect Roadmap

一套給「已有 Python 基礎」學習者的 36 週實作課程。目標不是只學會呼叫 AI 寫程式，而是逐步建立 Software / System Architect 所需的工程判斷能力。

## 課程路線

Python 工程基礎 → HTTP / API → PostgreSQL → Frontend → Authentication / RBAC → Testing → Docker / CI → System Architecture → Scaling → Security → Reliability → AI-native Engineering

## 網站功能

- 36 週完整 Roadmap
- 各週學習目標
- 必學主題
- 實作任務
- 過關條件
- 每週產出
- 階段篩選
- 完成進度紀錄（存在瀏覽器 localStorage）
- Responsive layout

## 本地開啟

網站沒有 framework dependency，可直接打開 `index.html`。

也可以在專案目錄執行：

```bash
python -m http.server 8000
```

然後打開：

```text
http://localhost:8000
```

## 學習規則

1. 先理解，再讓 AI 幫忙。
2. 先定義需求與資料，再寫程式。
3. AI 產生的程式碼必須能解釋、測試與修改。
4. 每週留下 README / 筆記 / 程式碼或架構文件作為產出。
5. 不以「用過多少技術」衡量進度，而以「能否解釋取捨」衡量。

## 建議 Repository 結構

之後可以逐週加入：

```text
learning/
  week01/
  week02/
  ...
  week36/
architecture/
  requirements/
  diagrams/
  adr/
  threat-model/
projects/
  mini-lms/
```

目前首頁是課程導航；實際作業與專案可以逐週增加到這個 repository。

## GitHub Pages

本專案包含 GitHub Pages workflow。Repository 啟用 Pages 後，每次 push 到 `main` 都會自動部署靜態網站。

在 GitHub Repository：

`Settings → Pages → Build and deployment → Source → GitHub Actions`

如果目前 GitHub 方案不支援 private repository Pages，可以把 repository 改成 public，或改用其他靜態網站服務部署。
