import { chromium } from "playwright";

/**
 * Does the field follow the pointer, in numbers?
 *
 * Parks the cursor at two corners, screenshots, and reports the mean luminance
 * of a square around each position (decoded in the browser, no image deps). A
 * visible effect has to win on pixels, not on my opinion of the code.
 */
const BOX = 220;
/* One probe, two pointer positions. Same pixels both times, so any difference
   is the effect and not the artwork behind it. */
const PROBE = [700, 430];
const POSITIONS = [
  [700, 430],
  [1320, 820],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3102/track", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const readings = [];
for (const [x, y] of POSITIONS) {
  await page.mouse.move(x, y);
  await page.waitForTimeout(1600);
  const shot = (await page.screenshot()).toString("base64");
  const luma = await page.evaluate(
    async ({ b64, cx, cy, box }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const { data, width } = ctx.getImageData(0, 0, img.width, img.height);
      let sum = 0;
      let count = 0;
      for (let yy = Math.max(0, cy - box); yy < Math.min(img.height, cy + box); yy += 2) {
        for (let xx = Math.max(0, cx - box); xx < Math.min(width, cx + box); xx += 2) {
          const i = (width * yy + xx) * 4;
          sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
          count += 1;
        }
      }
      return +(sum / count).toFixed(2);
    },
    { b64: shot, cx: PROBE[0], cy: PROBE[1], box: BOX },
  );
  readings.push({ pointer: `${x},${y}`, probeLuma: luma });
}

console.log(JSON.stringify(readings, null, 2));
await browser.close();
