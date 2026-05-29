let baseImg = null;
const imageWidth = 800;
const border = 100;

let threshold = 0;
let lineAmplitude = 2;
let lineGap = 0;
let modGap = 0;
let offset = 0;

let canvas;

function preload() {
  baseImg = loadImage("assets/lpalmer.png");
}

function setup() {
  pixelDensity(1);

  canvas = createCanvas(900, 200);
  canvas.parent("canvas-wrap");
  background(0);

  createControls();

  if (baseImg) {
    baseImg.resize(imageWidth, 0);
    resizeCanvas(imageWidth + 2 * border, baseImg.height + 2 * border);
  }

  render();
  noLoop();
}

function createControls() {
  const controls = document.getElementById("controls");

  addSliderControl(controls, "modGap", 0, 10, 1, modGap, (value) => {
    modGap = value;
    render();
  });

  addSliderControl(controls, "threshold", 0, 255, 1, threshold, (value) => {
    threshold = value;
    render();
  });

  addSliderControl(controls, "lineAmplitude", 0, 10, 1, lineAmplitude, (value) => {
    lineAmplitude = value;
    render();
  });

  addSliderControl(controls, "lineGap", 0, 10, 1, lineGap, (value) => {
    lineGap = value;
    render();
  });

  const fileControl = document.createElement("div");
  fileControl.className = "control";

  const button = document.createElement("button");
  button.textContent = "Load Image";

  const input = document.createElement("input");
  input.className = "hidden-input";
  input.type = "file";
  input.accept = "image/*";

  button.addEventListener("click", () => input.click());
  input.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    loadImage(
      url,
      (img) => {
        baseImg = img;
        baseImg.resize(imageWidth, 0);
        resizeCanvas(imageWidth + 2 * border, baseImg.height + 2 * border);
        background(0);
        render();
        URL.revokeObjectURL(url);
      },
      () => {
        URL.revokeObjectURL(url);
      }
    );
  });

  fileControl.appendChild(button);
  fileControl.appendChild(input);
  controls.appendChild(fileControl);
}

function addSliderControl(parent, labelText, min, max, step, initial, onInput) {
  const wrapper = document.createElement("div");
  wrapper.className = "control";

  const label = document.createElement("label");
  const name = document.createElement("span");
  name.textContent = labelText;

  const value = document.createElement("span");
  value.textContent = String(initial);

  label.appendChild(name);
  label.appendChild(value);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = String(min);
  slider.max = String(max);
  slider.step = String(step);
  slider.value = String(initial);

  slider.addEventListener("input", () => {
    const nextValue = Number(slider.value);
    value.textContent = slider.value;
    onInput(nextValue);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(slider);
  parent.appendChild(wrapper);
}

function thresholdValue(colorVal) {
  if (threshold === 0) {
    return colorVal;
  }

  if (colorVal > threshold) {
    return 255;
  }

  return 0;
}

function skimPixelTotal(total, max) {
  if (total > max) {
    return { value: max, remainder: total - max };
  }
  return { value: total, remainder: 0 };
}

function render() {
  if (!baseImg) {
    background(0);
    return;
  }

  background(0);
  image(baseImg, border, border);
  filter(GRAY);
  loadPixels();

  const widthPx = width;
  const heightPx = height;

  let r = border + offset + lineAmplitude;

  while (r < heightPx - border) {
    for (let c = 0; c < widthPx; c += 1) {
      let pixelTotal = 0;

      for (let bandRow = r - lineAmplitude; bandRow <= r + lineAmplitude; bandRow += 1) {
        const idx = 4 * (c + widthPx * bandRow);
        const bandPixel = pixels[idx];
        pixelTotal += bandPixel;
      }

      const lineResult = skimPixelTotal(pixelTotal, 255);
      let remainder = lineResult.remainder;
      let linePixel = thresholdValue(lineResult.value);

      setGrayPixel(c, r, linePixel, widthPx);

      for (let rowOffset = 1; rowOffset <= lineAmplitude; rowOffset += 1) {
        const outerResult = skimPixelTotal(remainder, 510);
        remainder = outerResult.remainder;
        const outerPixel = Math.floor(outerResult.value / 2);
        const outerColor = thresholdValue(outerPixel);

        setGrayPixel(c, r - rowOffset, outerColor, widthPx);
        setGrayPixel(c, r + rowOffset, outerColor, widthPx);
      }

      for (let gapOffset = 1; gapOffset <= lineGap; gapOffset += 1) {
        const y = r + lineAmplitude + gapOffset;
        if (y >= 0 && y < heightPx) {
          setGrayPixel(c, y, 0, widthPx);
        }
      }
    }

    r += lineAmplitude * 2 + 1 + lineGap;
  }

  updatePixels();

  if (modGap !== 0) {
    stroke(0);
    strokeWeight(1);
    for (let row = border; row < heightPx - border; row += 1) {
      if (row % modGap === 0) {
        line(0, row, widthPx, row);
      }
    }
  }
}

function setGrayPixel(x, y, value, widthPx) {
  if (x < 0 || x >= widthPx || y < 0 || y >= height) {
    return;
  }

  const idx = 4 * (x + widthPx * y);
  pixels[idx] = value;
  pixels[idx + 1] = value;
  pixels[idx + 2] = value;
  pixels[idx + 3] = 255;
}
