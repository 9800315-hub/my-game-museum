# 遊戲收藏博物館｜Game Museum

以溫馨像素風格打造的單頁式遊戲收藏網站。提供遊戲推薦文章後，AI 會依 `AGENTS.md` 整理一款推薦遊戲。

## 網站功能

- 單一 `index.html` 頁面：首頁介紹、收藏統計、搜尋篩選、遊戲收藏與關於本站。
- 點擊遊戲卡片開啟原生 `<dialog>` 詳情彈窗；按 Esc、右上角 × 或點擊背景關閉。
- 遊戲資料統一由 `data/games.json` 管理，新增遊戲不需要新增 HTML 頁面。
- 對應遊戲封面可放在 `assets/images/`，檔名使用遊戲 ID，例如 `game-id.jpg`。
- 桌機、平板與手機響應式排版。
- 初始示範遊戲：Overcooked! 2、Dumpster Gang Demo（測試中）、Hollow Knight。
- 圖片為自製示意圖；示範狀態與空白心得不代表真實遊玩經驗。

## 開發與預覽

請使用 VS Code Live Server 或其他本機 HTTP 伺服器開啟 `index.html`，不要直接用 `file://`，因為瀏覽器會限制 JSON 載入。

## 部署

將專案根目錄上傳到 GitHub Repository，在 Settings → Pages 選擇 Deploy from a branch、main 與 /(root)。部署後檢查網站網址。

## AI 擴充方式

提供推薦文章後，AI 應先閱讀根目錄 `AGENTS.md`，從文章挑選一款尚未收錄的遊戲，新增至 `data/games.json`，再驗證搜尋、統計與彈窗顯示。評分與心得未提供時保持空白；不得將文章推薦描述成實際遊玩紀錄。
