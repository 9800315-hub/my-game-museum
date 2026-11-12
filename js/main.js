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
  img.alt = `${game.title} 的封面`;
  const updateAspectRatio = () => {
    if (img.naturalWidth && img.naturalHeight) {
      img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
    }
  };
  img.addEventListener("load", updateAspectRatio);
  img.onerror = () => {
    img.onerror = null;
    img.src = "images/placeholder.svg";
  };
  img.src = game.image;
  if (img.complete && img.naturalWidth) updateAspectRatio();
  return img;
}
function renderFeaturedGame() {
  const game = games[0];
  if (!game) return;
  const image = imageFor(game);
  image.id = "featured-image";
  document.getElementById("featured-image").replaceWith(image);
  document.getElementById("featured-title").textContent = game.title;
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
  const ratingText = game.rating == null ? "尚未評分" : `${game.rating} / 5`;
  addSection(details, "評分", ratingText);
  addSection(details, "推薦評析", game.review || "尚未提供評析");
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
  const total = document.querySelector('[data-stat="total"]');
  if (total) total.textContent = games.length;
  const stamps = document.getElementById("crown-stamps");
  if (stamps) {
    stamps.replaceChildren(
      ...games.map(() => {
        const crown = el("span", "crown-stamp", "👑");
        crown.setAttribute("aria-hidden", "true");
        return crown;
      }),
    );
    stamps.setAttribute("aria-label", `共有 ${games.length} 枚收藏皇冠`);
  }
}
function render() {
  const query = document
    .getElementById("search")
    .value.trim()
    .toLocaleLowerCase();
  const genre = document.getElementById("genre").value;
  const filtered = games.filter(
    (g) =>
      g.title.toLocaleLowerCase().includes(query) &&
      (!genre || g.genres.includes(genre)),
  );
  document.getElementById("result-count").textContent = games.length
    ? `找到 ${filtered.length} 款遊戲`
    : "";
  const grid = document.getElementById("game-list");
  grid.classList.toggle("single-card", filtered.length === 1);
  grid.replaceChildren(...filtered.map(cardFor));
  if (!filtered.length)
    grid.append(
      el(
        "div",
        "empty",
        games.length
          ? "找不到符合條件的遊戲，試試其他關鍵字或分類。"
          : "目前尚無收藏遊戲，提供推薦文章後即可新增。",
      ),
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
    renderFeaturedGame();
    const genreSelect = document.getElementById("genre");
    [...new Set(games.flatMap((g) => g.genres))]
      .sort((a, b) => a.localeCompare(b, "zh-Hant"))
      .forEach((genre) => {
        const option = el("option", "", genre);
        option.value = genre;
        genreSelect.append(option);
      });
    ["search", "genre"].forEach((id) =>
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
