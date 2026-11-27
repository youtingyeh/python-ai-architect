# 專案交接紀錄（HANDOFF.md）— 任何 AI 接手請先讀這份

> 這份檔案放在 GitHub 儲存庫根目錄，是**最權威的接手說明**。每個 AI 完成階段性工作後，都要更新這份檔案並推送；雲端硬碟 `Antigravity/python-ai-architect` 資料夾是備份。

## 進行中的工作（最新狀態寫在這裡）
- 2026-11-27 23:45：使用者要求把課程擴充到至少 100 課，新增「量子計算專題」（第 87 課起，id 用 `q1`、`q2`…），內容參考 IBM「Quantum Machine Learning with Qiskit」、openHPI「Quantum Machine Learning」、GitHub「Learn-Quantum-Machine-Learning」，以及 2024～2026 的權威論文與綜述。可與 AI 無關。
- 課程規劃（stage「量子計算專題」，track 用 `eng`，課號 87 起）：q1 數學語言｜q2 單一量子位元與布洛赫球｜q3 多量子位元與糾纏｜q4 測量、隱形傳態、混合態｜q5 Deutsch–Jozsa／Bernstein–Vazirani｜q6 Grover｜q7 QFT 與相位估計｜q8 Shor 與資源估計（Gidney 2025：<100 萬雜訊量子位元、約一週）｜q9 雜訊與 NISQ、錯誤緩解｜q10 錯誤更正（Willow 2024 低於門檻、d=7 每輪 0.143%）｜q11 硬體平台（含 Harvard/MIT 3000 原子連續運作，Nature 2025）｜q12 VQE／QAOA｜q13 QML I（編碼、變分分類器、data re-uploading、參數平移）｜q14 QML II（核方法、QGAN、貧瘠高原、去量子化）｜q15 量子優勢現況（Quantum Echoes 2025 可驗證優勢）｜q16 量子密碼學（BB84 QKD、量子隨機數、QKD vs PQC；使用者 23:46 追加要求）
- 進度：q1–q8 課文已寫（rewrite/q1.txt…q8.txt），尚未在 study-data.orig.js 註冊。註冊方式見下方第 2 節；測試的課數需同步調整。

- **最後更新時間**：2026-11-28 00:00 左右 (UTC+8)
- **GitHub 儲存庫**：`https://github.com/youtingyeh/python-ai-architect`（`main` 最新 Commit：`4dd1d502dfed3c979a6647f43cea51e2f4fd0481`）
- **GitHub Pages 線上網站**：`https://youtingyeh.github.io/python-ai-architect/study.html`
- **Google Drive 雲端資料夾**：`Antigravity/python-ai-architect`（Folder ID: `1RRsAeWhZ3v4wfF4m-MlzQqdIM2I2wwfc`）
- **本次同步的雲端檔案**：本交接檔、`study-data.js`（86 課建置產物）、`python-ai-architect-progress-bundle-86.zip`（與 GitHub `4dd1d50` 一致的完整專案，121 個檔案）

---

## 1. 目前專案狀態：86 課

| 範圍 | 課號 | 原始檔 |
|---|---|---|
| AI 主線 | 第 1～47 課 | `ext-*`、`ms-lesson-*`、`w34`～`w36`（詳見 Antigravity 前一版交接） |
| 後續工程延伸 | 第 48～80 課 | `w1`～`w33` |
| **【新增】AI 資安與量子前沿** | **第 81～86 課** | **`w37`～`w42`**（stage：`後續延伸：AI 資安與量子前沿`，track：`eng`） |

### 新增的 6 課
- 第 81 課 `w37`：AI 應用資安：OWASP LLM 十大風險（2025 版，提醒讀者查看 2026 新版）
- 第 82 課 `w38`：提示注入與 Agent 權限防護（致命三件套、最小權限、人工確認、隔離模式、紅隊回歸測試）
- 第 83 課 `w39`：MITRE ATLAS 與 AI 紅隊測試（規避／投毒／竊取／濫用四大類）
- 第 84 課 `w40`：用 AI 做資安防守（SOC、告警疲勞、異常偵測 ＋ LLM 摘要、學習資源）
- 第 85 課 `w41`：量子計算白話入門與後量子密碼（干涉、邏輯量子位元、Shor、NIST IR 8547：2030 不建議／2035 不允許）
- 第 86 課 `w42`：量子與 AI（AlphaQubit／AlphaQubit 2、AlphaTensor-Quantum、Quantinuum×Hiverge Hive、量子機器學習現況、Qiskit／PennyLane 學習資源）

每課都有：課文（rewrite/w3x.txt）、可執行的 Python 範例與參考實作、5 步逐步拆解、3 題測驗（答案位置已平衡）。UI 預估閱讀時間 27～30 分鐘。

### 「和 AI 一起做」段落（使用者要求：實務課要教如何與 AI 互動合作，而非單純技術）
- 第 48～86 課（`w1`～`w33`、`w37`～`w42`）**每課都新增一節** `@section 和 AI 一起做：……`，放在「動動腦」之前。
- 內容固定包含：適合交給 AI 的事、一段範例提示（code block）、怎麼檢查 AI 的產出、哪些判斷不能交給 AI。
- 交叉引用使用目前的課號（AI 主線 1～47、工程 48～80、新課 81～86）。

### 其他本輪修改
- `study.html`：課程安排說明、計數器與篩選按鈕改為 86／39。
- `tests/study.test.cjs`：改為驗證 86 課，並檢查第 81～86 課為 `w37`～`w42`。
- `tests/review-regressions.test.cjs`：新課的範例與參考實作加入 Python 實際執行測試。
- `README.md`：加入第 81～86 課與「和 AI 一起做」說明。
- `npm test`：21 項全部通過。

---

## 2. 維護與建置流程（接手 AI 必讀）

- 課文單一來源：`rewrite/<lesson_id>.txt`（`@section 標題`、`@term 名詞`；Markdown 表格不會渲染，請用清單）
- 程式範例／逐步拆解／測驗單一來源：`scripts/study-data.orig.js`（新增課程要在這裡加一筆，`sections` 留空由建置填入）
- 建置：`python scripts/build_rewrite.py` → 產生 `study-data.js`、`glossary.js`（CI 會檢查兩者與原始檔一致）
- 測試：`npm ci && npm test`
- 測驗規則：答案位置要平衡（目前各位置 64～65 題），正解不要總是最長的選項（測試門檻 < 55%）

---

## 3. 後續可選方向（尚未執行）

1. 把第 81～86 課中閱讀時間 27 分鐘的幾課（w38、w39、w40）再補到 30 分鐘。
2. 第 1～47 課（AI 主線）目前**沒有**加「和 AI 一起做」段落（使用者這次只要求實務工程課與新課）；若使用者需要，可比照加入。
3. Antigravity 前一版交接列出的選項仍有效：首屏效能（study-data.js 已約 2.1 MB，可改按需載入）、清理舊版轉址資產。
4. 量子與資安領域變化快：OWASP 2026 版清單、NIST 後續簽章演算法、量子硬體里程碑，建議每季複查課文中的數字與時程。

---

## 4. 給下一位 AI 的指令與算力保護規則

1. 接手開場：「請用 gdrive 讀取我 Google 雲端硬碟 `Antigravity/python-ai-architect` 資料夾內最新的交接檔（本檔），或直接抓 GitHub `youtingyeh/python-ai-architect` 最新 `main`，接續專案。」
2. **使用者不會讓兩個 AI 同時運作**：輪到你時，代表前一個 AI 的額度已用完，直接從 GitHub 最新版接著做；發現前一位的錯誤，確認後直接修正。
3. **算力保護**：完成階段性修改、或察覺額度快用完前，**優先**把最新交接檔、`study-data.js` 與專案壓縮包同步到 Google Drive `Antigravity/python-ai-architect`。
