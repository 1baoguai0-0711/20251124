// 同時處理兩組精靈表，移除背景音樂，使用固定速度與生成間隔的水果小遊戲
let spritesheet1, spritesheet2;
let frames1 = [], frames2 = [];

let SPRITE_W1 = 36;
let SPRITE_H1 = 32;
let SPRITE_W2 = 36;
let SPRITE_H2 = 32;

const FRAME_COUNT = 9;
const SCALE = 3; // 放大倍數
const SPACING = 40; // 兩張動畫間距（像素）
const FRAME_MS = 180; // 每格顯示時間（毫秒）

// -------- 新增：背景音樂變數 --------
let music = null;
let audioLoaded = false;
let audioStarted = false;
let audioLoadError = false;

// 動畫時間管理
let frameIndex1 = 0, accumulator1 = 0, loaded1 = false, loadError1 = false;
let frameIndex2 = 0, accumulator2 = 0, loaded2 = false, loadError2 = false;

function preload() {
  spritesheet1 = loadImage('1/all.png',
    img => console.log('spritesheet1', img.width, 'x', img.height),
    err => { console.error('failed to load 1/all.png', err); loadError1 = true; }
  );
  spritesheet2 = loadImage('2/all.png',
    img => console.log('spritesheet2', img.width, 'x', img.height),
    err => { console.error('failed to load 2/all.png', err); loadError2 = true; }
  );

  // -------- 新增：載入背景音樂（請放置於 c:\Users\L110\Downloads\20251124\音樂\水果小遊戲-500audio.com.mp3） --------
  music = loadSound(
    '音樂/水果小遊戲-500audio.com.mp3',
    s => { audioLoaded = true; console.log('music loaded'); },
    e => { audioLoadError = true; console.error('failed to load music', e); }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  imageMode(CENTER);
  textFont('Arial');

  if (spritesheet1 && spritesheet1.width > 0 && !loadError1) {
    SPRITE_W1 = Math.floor(spritesheet1.width / FRAME_COUNT);
    SPRITE_H1 = spritesheet1.height;
    splitFrames(spritesheet1, frames1, SPRITE_W1, SPRITE_H1);
    loaded1 = frames1.length === FRAME_COUNT;
  } else {
    loadError1 = true;
  }

  if (spritesheet2 && spritesheet2.width > 0 && !loadError2) {
    SPRITE_W2 = Math.floor(spritesheet2.width / FRAME_COUNT);
    SPRITE_H2 = spritesheet2.height;
    splitFrames(spritesheet2, frames2, SPRITE_W2, SPRITE_H2);
    loaded2 = frames2.length === FRAME_COUNT;
  } else {
    loadError2 = true;
  }

  frameIndex1 = frameIndex2 = 0;
  accumulator1 = accumulator2 = 0;
}

function splitFrames(sheet, targetArray, w, h) {
  targetArray.length = 0;
  if (!sheet || w <= 0 || h <= 0) return;
  for (let i = 0; i < FRAME_COUNT; i++) {
    targetArray.push(sheet.get(i * w, 0, w, h));
  }
}

function draw() {
  background('#bde0fe');

  if (loadError1 || loadError2) {
    push();
    fill(200, 50, 50);
    rectMode(CENTER);
    rect(width/2, height/2, 520, 140, 8);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    let msg = '圖片載入問題：\n';
    if (loadError1) msg += '確認 c:\\Users\\L110\\Downloads\\20251124\\1\\all.png\n';
    if (loadError2) msg += '確認 c:\\Users\\L110\\Downloads\\20251124\\2\\all.png\n';
    msg += '或啟用本機伺服器後重新載入（見 Console）。';
    text(msg, width/2, height/2);
    pop();
    return;
  }

  if (!loaded1 || !loaded2) {
    push();
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(16);
    text('載入中...', width/2, height/2);
    pop();
    return;
  }

  // 更新動畫幀（各自獨立）
  accumulator1 += deltaTime;
  while (accumulator1 >= FRAME_MS) {
    frameIndex1 = (frameIndex1 + 1) % FRAME_COUNT;
    accumulator1 -= FRAME_MS;
  }
  accumulator2 += deltaTime;
  while (accumulator2 >= FRAME_MS) {
    frameIndex2 = (frameIndex2 + 1) % FRAME_COUNT;
    accumulator2 -= FRAME_MS;
  }

  // 計算顯示尺寸與並排位置
  const destW1 = SPRITE_W1 * SCALE;
  const destH1 = SPRITE_H1 * SCALE;
  const destW2 = SPRITE_W2 * SCALE;
  const destH2 = SPRITE_H2 * SCALE;

  const totalWidth = destW1 + SPACING + destW2;
  const leftCenterX = width/2 - totalWidth/2 + destW1/2;
  const rightCenterX = leftCenterX + destW1 + SPACING + destW2/2;
  const centerY = height/2;

  // 繪製第一張（資料夾1）
  push();
  imageMode(CENTER);
  translate(leftCenterX, centerY);
  image(frames1[frameIndex1], 0, 0, destW1, destH1);
  pop();

  // 繪製第二張（資料夾2）
  push();
  imageMode(CENTER);
  translate(rightCenterX, centerY);
  image(frames2[frameIndex2], 0, 0, destW2, destH2);
  pop();

  // 輕量除錯資訊
  push();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(12);
  text(`frameMs: ${FRAME_MS}`, 10, 10);
  pop();
}

function mousePressed() {
  // 新增：點擊畫布啟動背景音樂（瀏覽器需使用者互動）
  if (!audioStarted && audioLoaded && !audioLoadError && music) {
    userStartAudio().then(() => {
      music.loop();
      audioStarted = true;
      console.log('music started');
    }).catch(err => {
      console.warn('userStartAudio failed', err);
    });
  }
}

function touchStarted() {
  // 支援行動裝置
  mousePressed();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
