const DATA_URL = "data/games.json";
let games = [];
const dialog = document.getElementById("game-dialog");
const content = document.getElementById("dialog-content");
const closeButton = document.getElementById("dialog-close");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function tag(text, type = "") {
  return el("span", `tag ${type}`.trim(), text);
}
function imageFor(game) {
  const img = el("img");
  img.src = game.image;
  img.alt = `${game.title} 的示意封面`;
  img.onerror = () => {
    img.onerror = null;
    img.src = "assets/images/placeholder.svg";
  };
  return img;
}
function tagsFor(game) {
  const wrap = el("div", "tags");
  wrap.append(tag(game.status, game.status === "測試中" ? "testing" : ""));
  if (game.isDemo) wrap.append(tag("示範資料", "demo"));
  (game.genres || []).forEach((g) => wrap.append(tag(g)));
  return wrap;
}
function addSection(parent, heading, value) {
  parent.append(el("h3", "", heading), el("p", "", value));
}
function openGame(game) {
  content.replaceChildren();
  const layout = el("div", "dialog-layout");
  const visual = el("div", "dialog-visual");
  visual.append(imageFor(game));
  const details = el("div", "dialog-details");
  const title = el("h2", "", game.title);
  title.id = "dialog-title";
  details.append(title, tagsFor(game));
  addSection(details, "✦ 遊戲介紹", game.description || "待補充");
  addSection(
    details,
    "✦ 遊戲特色",
    (game.features || []).join("・") || "待補充",
  );
  addSection(
    details,
    "個人評分",
    game.rating == null ? "尚未評分" : `${game.rating} / 5`,
  );
  addSection(details, "遊玩心得", game.review || "尚未填寫個人心得");
  addSection(details, "✦ 推薦對象", game.recommendedFor || "待補充");
  layout.append(visual, details);
  content.append(layout);
  dialog.showModal();
  closeButton.focus();
}
function cardFor(game) {
  const button = el("button", "card");
  button.type = "button";
  button.setAttribute("aria-label", `查看 ${game.title} 的詳細資訊`);
  const body = el("div", "cardbody");
  body.append(
    el("h3", "", game.title),
    tagsFor(game),
    el("p", "", game.description),
  );
  button.append(imageFor(game), body);
  button.addEventListener("click", () => openGame(game));
  return button;
}
function updateStats() {
  const stats = {
    total: games.length,
    completed: games.filter((g) => g.status === "已通關").length,
    playing: games.filter((g) => g.status === "遊玩中").length,
    testing: games.filter((g) => g.status === "測試中").length,
  };
  Object.entries(stats).forEach(([key, value]) => {
    const target = document.querySelector(`[data-stat="${key}"]`);
    if (target) target.textContent = value;
  });
}
function render() {
  const query = document
    .getElementById("search")
    .value.trim()
    .toLocaleLowerCase();
  const genre = document.getElementById("genre").value;
  const status = document.getElementById("status").value;
  const filtered = games.filter(
    (g) =>
      g.title.toLocaleLowerCase().includes(query) &&
      (!genre || g.genres.includes(genre)) &&
      (!status || g.status === status),
  );
  document.getElementById("result-count").textContent =
    `找到 ${filtered.length} 款遊戲`;
  const grid = document.getElementById("game-list");
  grid.replaceChildren(...filtered.map(cardFor));
  if (!filtered.length)
    grid.append(
      el("div", "empty", "找不到符合條件的遊戲，試試其他關鍵字或分類。"),
    );
}
async function init() {
  closeButton.addEventListener("click", () => dialog.close());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) dialog.close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("讀取失敗");
    games = await response.json();
    if (!Array.isArray(games)) throw new Error("資料格式錯誤");
    const genreSelect = document.getElementById("genre");
    [...new Set(games.flatMap((g) => g.genres))]
      .sort((a, b) => a.localeCompare(b, "zh-Hant"))
      .forEach((genre) => {
        const option = el("option", "", genre);
        option.value = genre;
        genreSelect.append(option);
      });
    ["search", "genre", "status"].forEach((id) =>
      document
        .getElementById(id)
        .addEventListener(id === "search" ? "input" : "change", render),
    );
    updateStats();
    render();
  } catch (error) {
    document
      .getElementById("game-list")
      .replaceChildren(
        el(
          "div",
          "empty",
          "遊戲資料載入失敗，請使用 VS Code Live Server 或 GitHub Pages 開啟網站。",
        ),
      );
  }
}
document.addEventListener("DOMContentLoaded", init);
