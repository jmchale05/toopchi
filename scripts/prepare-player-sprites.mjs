import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const assetsDir = path.resolve("public/assets");
const FRAME_COUNT = 9;

const sources = [
  {
    input: "intermilan-animated.png",
    output: "intermilan-player.png",
  },
  {
    input: "acmilan-animated.png",
    output: "acmilan-player.png",
  },
];

function isCheckerboardBackground(r, g, b) {
  if (r >= 240 && g >= 240 && b >= 240) {
    return true;
  }

  if (
    Math.abs(r - 192) <= 8 &&
    Math.abs(g - 192) <= 8 &&
    Math.abs(b - 192) <= 8
  ) {
    return true;
  }

  return false;
}

function trimTransparentPadding(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const index = (png.width * y + x) * 4;
      if (png.data[index + 3] > 0) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const trimmed = new PNG({ width, height });

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = (png.width * (minY + y) + (minX + x)) * 4;
      const targetIndex = (width * y + x) * 4;
      trimmed.data[targetIndex] = png.data[sourceIndex];
      trimmed.data[targetIndex + 1] = png.data[sourceIndex + 1];
      trimmed.data[targetIndex + 2] = png.data[sourceIndex + 2];
      trimmed.data[targetIndex + 3] = png.data[sourceIndex + 3];
    }
  }

  return trimmed;
}

function extractFirstFrame(inputPath, outputPath) {
  const source = PNG.sync.read(fs.readFileSync(inputPath));
  const frameWidth = source.width / FRAME_COUNT;
  const frameHeight = source.height;
  const output = new PNG({ width: frameWidth, height: frameHeight });

  for (let y = 0; y < frameHeight; y += 1) {
    for (let x = 0; x < frameWidth; x += 1) {
      const sourceIndex = (source.width * y + x) * 4;
      const outputIndex = (frameWidth * y + x) * 4;
      const r = source.data[sourceIndex];
      const g = source.data[sourceIndex + 1];
      const b = source.data[sourceIndex + 2];

      output.data[outputIndex] = r;
      output.data[outputIndex + 1] = g;
      output.data[outputIndex + 2] = b;
      output.data[outputIndex + 3] = isCheckerboardBackground(r, g, b) ? 0 : 255;
    }
  }

  const trimmed = trimTransparentPadding(output);
  fs.writeFileSync(outputPath, PNG.sync.write(trimmed));
  console.log(`Wrote ${outputPath} (${trimmed.width}x${trimmed.height})`);
}

for (const { input, output } of sources) {
  extractFirstFrame(path.join(assetsDir, input), path.join(assetsDir, output));
}
