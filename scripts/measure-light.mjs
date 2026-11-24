import { chromium } from "playwright";
import { readFileSync } from "node:fs";

/**
 * Where is the light, really? Decodes a PNG in the browser and reports the mean
 * luminance of each screen quadrant, so "the glow follows the pointer" can be
 * checked as a number instead of a vibe.
 */
const files = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();

for (const file of files) {
  const data = readFileSync(file).toString("base64");
  const quadrants = await page.evaluate(async (b64) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const { data: px, width, height } = ctx.getImageData(0, 0, img.width, img.height);

    const sums = { tl: [0, 0], tr: [0, 0], bl: [0, 0], br: [0, 0] };
    for (let y = 0; y < height; y += 3) {
      for (let x = 0; x < width; x += 3) {
        const i = (y * width + x) * 4;
        const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
        const key = `${y < height / 2 ? "t" : "b"}${x < width / 2 ? "l" : "r"}`;
        sums[key][0] += lum;
        sums[key][1] += 1;
      }
    }
    return Object.fromEntries(
      Object.entries(sums).map(([k, [sum, n]]) => [k, +(sum / n).toFixed(2)]),
    );
  }, data);

  console.log(file.split(/[\\/]/).pop(), JSON.stringify(quadrants));
}

await browser.close();
