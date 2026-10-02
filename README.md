# typhomework-system（離線 Demo 版）

[typhomework-system](https://github.com/fr80770055re-tech/typhomework-system)（班級管理系統 + 家長即時查詢系統）的**離線展示版本**。

正式版透過 Firebase（Authentication + Realtime Database）同步教師與家長兩端的資料。這個離線版把 Firebase 的部分整個換成本機模擬層，**不連接任何真實後端、不需要 Google 帳號、不會動到正式版的雲端資料**，適合拿來展示功能、或在沒有網路的教室現場使用。

## 包含兩個頁面

- `index.html` - 教師端「班級管理系統」：作業進度、潔牙掃地、成績、出缺勤、宣導事項、備份還原等。
- `parent.html` - 家長端「班級即時聯絡簿」：用座號 + 密碼查詢小孩的作業狀態與班級公告。

## 跟正式版的差異

- [`mock-firebase.js`](mock-firebase.js) 用同樣的函式名稱（`firebase.initializeApp` / `firebase.auth()` / `firebase.database().ref(path).set()/.on('value', cb)`）模擬 Firebase Compat SDK 的行為，`index.html`、`parent.html` 的商業邏輯完全沒有被改動。
- 資料實際存在瀏覽器的 `localStorage`，不會送到任何伺服器。
- 登入畫面不會跳出 Google 登入視窗，點一下就直接進入示範教師帳號。
- [`seed-demo-data.js`](seed-demo-data.js) 會在第一次開啟時自動灌入示範班級資料（5 位學生、幾項作業、公告），教師端登入畫面有「重置示範資料」按鈕可以隨時恢復成初始狀態；家長端預設示範密碼是 `0000`。
- 同一個瀏覽器同時開啟 `index.html` 和 `parent.html` 兩個分頁時，會透過瀏覽器原生的 `storage` 事件互相同步，模擬「即時資料庫」在教師端、家長端之間同步的效果。

## 仍需要網路的部分

Tailwind CSS、xlsx（匯出 Excel 用）、Sortable.js、Google Fonts 這幾個前端函式庫目前仍是從 CDN 載入，只有「資料／登入」這一層被離線化了。如果要做到完全不需要網路，可以再把這些函式庫下載下來改成本機載入。

## 本機執行

這是純靜態網頁，沒有建置流程，用任何靜態伺服器開啟即可，例如：

```bash
npx serve .
# 或
python -m http.server 8080
```

然後瀏覽器打開 `index.html`（教師端）或 `parent.html`（家長端）。
