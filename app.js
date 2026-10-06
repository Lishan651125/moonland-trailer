const assetRoot = "./assets/images/";
const audioSource = "./assets/audio/moonland-音訊-ub4qyx.mp3";
const sceneDuration = 4000;

const scenes = [
  { file: "01.png", move: "drift-left", count: "01 / 07 · 07:20", title: "還沒準備好", mood: "清晨，還沒準備好面對這一天。", atmosphere: "daylight" },
  { file: "02.png", move: "drift-right", count: "02 / 07 · 08:10", title: "在人群之中", mood: "在擁擠的人群裡，安靜地前進。", atmosphere: "daylight" },
  { file: "06-1.png", move: "gentle", count: "03 / 07 · 17:00", title: "時間沒有出口", mood: "時間一直往前，卻像沒有出口。", atmosphere: "daylight" },
  { file: "11.png", move: "pull-back", count: "04 / 07 · 20:40", title: "留一點喘息", mood: "晚餐和城市的燈光，給她一點喘息。", atmosphere: "nightglow" },
  { file: "14.png", move: "drift-left", count: "05 / 07 · 21:15", title: "但訊息又亮了", mood: "工作訊息，在回家後再次亮起。", atmosphere: "nightglow", notice: true },
  { file: "16.png", move: "drift-right", count: "06 / 07 · 21:28", title: "先停一下", mood: "先停一下，替自己留一杯溫熱。", atmosphere: "nightglow", candle: true, steam: true },
  { file: "19.png", move: "pull-back", count: "07 / 07 · 今晚", title: "好好陪自己", mood: "至少今晚，我可以好好陪自己。", atmosphere: "nightglow", candle: true, end: true },
];

const scenesElement = document.querySelector("#scenes");
const caption = document.querySelector("#caption");
const progressBar = document.querySelector("#progressBar");
const pauseButton = document.querySelector("#pauseButton");
const startButton = document.querySelector("#startButton");
const openingCard = document.querySelector("#openingCard");
const audio = document.querySelector("#trailerAudio");
audio.src = audioSource;
audio.volume = 0.62;

let sceneElements = [];
let currentScene = 0;
let isPlaying = false;
let isPaused = false;
let sceneStartedAt = 0;
let pausedAt = 0;

function makeScene(scene, index) {
  const element = document.createElement("article");
  element.className = "scene";
  element.dataset.move = scene.move;
  element.style.setProperty("--image", `url("${assetRoot}${encodeURIComponent(scene.file)}")`);
  element.innerHTML = `
    <div class="art"></div>
    <div class="depth-field"></div>
    <div class="atmosphere color-wash"></div>
    <div class="atmosphere ${scene.atmosphere}"></div>
    <div class="atmosphere graphic-lines"></div>
    <div class="scene-card"><span class="count">${scene.count}</span><span class="title">${scene.title}</span></div>
    ${scene.candle ? '<div class="atmosphere candle-glow"></div>' : ''}
    ${scene.steam ? '<div class="steam"></div>' : ''}
    ${scene.notice ? '<div class="notice-halo"></div>' : ''}
    ${scene.end ? '<div class="end-reveal"></div>' : ''}
  `;
  element.setAttribute("aria-hidden", index === 0 ? "false" : "true");
  return element;
}

function restartActiveSceneAnimation(index) {
  const oldElement = sceneElements[index];
  const replacement = oldElement.cloneNode(true);
  replacement.classList.add("active");
  replacement.setAttribute("aria-hidden", "false");
  oldElement.replaceWith(replacement);
  sceneElements[index] = replacement;
}

function showScene(index) {
  sceneElements.forEach((element, elementIndex) => {
    if (elementIndex !== index) {
      element.classList.remove("active");
      element.setAttribute("aria-hidden", "true");
    }
  });
  restartActiveSceneAnimation(index);
  caption.textContent = scenes[index].mood;
  caption.classList.remove("visible");
  window.setTimeout(() => caption.classList.add("visible"), 260);
}

function endTrailer() {
  isPlaying = false;
  isPaused = false;
  audio.pause();
  audio.currentTime = 0;
  progressBar.style.width = "100%";
  startButton.innerHTML = '再看一次 <span>↗</span>';
  openingCard.classList.remove("hidden");
  document.querySelector(".stage").classList.remove("paused");
  pauseButton.textContent = "Ⅱ";
}

function advanceScene() {
  if (currentScene === scenes.length - 1) {
    endTrailer();
    return;
  }
  currentScene += 1;
  sceneStartedAt = performance.now();
  showScene(currentScene);
}

function tick(now) {
  if (isPlaying && !isPaused) {
    const elapsed = now - sceneStartedAt;
    const totalElapsed = currentScene * sceneDuration + Math.min(elapsed, sceneDuration);
    progressBar.style.width = `${(totalElapsed / (scenes.length * sceneDuration)) * 100}%`;
    audio.volume = Math.max(0, Math.min(0.62, 0.62 * Math.min(1, (scenes.length * sceneDuration - totalElapsed) / 1800)));
    if (elapsed >= sceneDuration) advanceScene();
  }
  requestAnimationFrame(tick);
}

function startTrailer() {
  currentScene = 0;
  sceneStartedAt = performance.now();
  progressBar.style.width = "0";
  audio.currentTime = 0;
  audio.volume = 0.62;
  // Playback is started inside the user's button click, so browsers allow sound.
  audio.play().catch(() => {
    document.querySelector("#audioNote").textContent = "找不到音樂檔，仍可播放無聲預覽";
  });
  showScene(currentScene);
  openingCard.classList.add("hidden");
  isPlaying = true;
  isPaused = false;
}

function togglePause() {
  if (!isPlaying) return;
  isPaused = !isPaused;
  if (isPaused) {
    pausedAt = performance.now();
    audio.pause();
    document.querySelector(".stage").classList.add("paused");
    pauseButton.textContent = "▶";
    pauseButton.setAttribute("aria-label", "播放動畫");
  } else {
    sceneStartedAt += performance.now() - pausedAt;
    audio.play().catch(() => {});
    document.querySelector(".stage").classList.remove("paused");
    pauseButton.textContent = "Ⅱ";
    pauseButton.setAttribute("aria-label", "暫停動畫");
  }
}

scenes.forEach((scene, index) => {
  const element = makeScene(scene, index);
  scenesElement.append(element);
  sceneElements.push(element);
});
showScene(0);
startButton.addEventListener("click", startTrailer);
pauseButton.addEventListener("click", togglePause);
document.addEventListener("visibilitychange", () => { if (document.hidden && isPlaying && !isPaused) togglePause(); });
requestAnimationFrame(tick);
