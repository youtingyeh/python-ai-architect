# Python → AI Architect：36 週互動教材

給已有 Python 基礎的學習者。每週約 8～10 小時，從 Python 工程基礎到 Web、資料庫、權限、部署、系統設計與 AI 協作。課程是實作安排，不保證完成後即具備正式架構師職務資格。

## 如何學習

1. 點選一週，閱讀「概念」並用自己的話說明。
2. 在「範例」先預測結果，再核對逐步拆解。
3. 在「實作」完成練習，保存草稿與觀察紀錄。
4. 在「驗收」回答題目；判分附解釋，可重做。
5. 在「成果」完成完整作業、留下檔案/commit/測試紀錄，逐項自評後標記完成。

所有 36 週都有兩段概念、範例、拆解、練習、分層提示、參考解法、驗收題與原始文件連結，共 75 題。

Week 1～3 可在瀏覽器執行 Python。固定使用 Pyodide 0.27.7，首次需從 jsDelivr 下載執行環境。程式在 module Web Worker 執行；可停止，載入超時為 60 秒，運算超時為 10 秒。每次為新環境，Python 暫存檔案不保留。範例採 Python 3.12+ 語法，Pyodide 的內建 Python 版本由其發行版決定。

其他週次需在自己的電腦實作。頁面可以保存程式、SQL、指令或設計草稿，但不會執行 FastAPI、PostgreSQL、Docker，也不會自動審查完整專案。需要環境、資料表或專案介面的範例會在說明中標註。

Python 題目測試通過只代表涵蓋的題目案例通過。完整作業仍需自己的測試。執行環境無法載入時，可下載 `.py` 練習與相同測試，在本機通過後以自評方式記錄。

## 進度與備份

- 草稿、筆記、答案、自評與完成記錄存於此瀏覽器 localStorage。
- 換裝置、清除瀏覽器資料或換網址前，使用「匯出進度」。在另一台裝置可「匯入進度」。
- 不會自動同步至 GitHub，沒有帳號系統或雲端保存。
- 保留舊版 `python-ai-architect-progress-v1` 的手動完成週次，標記為舊版記錄。
- 不要將密碼、API 金鑰或真實學生私人資料放入學習紀錄。

## 本機開啟

使用 HTTP 服務，不要依賴 `file://` 開啟（module worker 需要正常來源）：

```bash
python -m http.server 8000
```

開啟 http://localhost:8000。教材為 buildless HTML/CSS/JavaScript，閱讀網站不需 npm 安裝。

## 開發與驗證

安裝 Node 22+ 和 Python 3.12+，再執行：

```bash
npm ci
npm test
```

測試包含：教材資料完整性、完成条件、備份驗證、CPython 題目測試、180 個學習頁面 DOM 載入、草稿保存、判分、worker 訊息、停止與超時、舊進度移轉及損毀儲存處理。DOM 測試使用 linkedom，並非瀏覽器視覺或跨裝置驗證。

本次另以 Pyodide 0.27.7 的 Node 執行環境驗證前 3 週解法與題目測試。網站 CDN 下載、瀏覽器 worker 及版面仍應在部署後實際確認。

## 檔案

| 檔案 | 用途 |
| --- | --- |
| index.html / styles.css | 介面與響應式樣式 |
| course.js | 36 週路線、完整作業與自評條件 |
| lessons.js | 各週教材、練習、問題、解答與來源 |
| app.js | 導覽、判分、編輯、備份與 Python 操作 |
| progress.js | 進度驗證與完成條件 |
| python-worker.js | 背景 Python 執行 |
| tests/ | 教材與互動驗證 |

## GitHub Pages

`Settings → Pages → Build and deployment → Source → GitHub Actions`。

workflow 先驗證，再僅封裝網站所需的 7 個檔案，避免將 node_modules、測試環境或個人作業一併發布。驗證通過後提供 `interactive-course` 下載 artifact，再嘗試 Pages 部署。

Private repository 能否使用 Pages 取決於 GitHub 方案與設定。原始碼設為 private 不代表一般 Pages 網站也私有；設定前請確認網站的預期可見性。不要為啟用 Pages 自動更改 repository 的公開範圍。

## 作業建議位置

建立 `learning/week01/` 至 `learning/week36/`；另以 `architecture/` 保存需求、圖與 ADR，以 `projects/mini-lms/` 保存獨立練習平台。不要在正式 RISE 網站練習故障或刪除流程。
