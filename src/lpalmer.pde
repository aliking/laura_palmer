import controlP5.*;

ControlP5 cp5;


PImage baseImg;
color pixelColor;
int imageWidth = 800;
int border = 100;
int pixelTotal;

int offset = 0;

int threshold;
int lineAmplitude;
int lineGap;
int modGap;
 //<>//
void fileSelected(File selection) {
  if (selection != null) {
    baseImg = loadImage(selection.getAbsolutePath());
    if (baseImg != null) {
      baseImg.resize(imageWidth, 0);
      windowResize(imageWidth + 2*border,baseImg.height + 2*border);
    }
  }
  render();
}
int colorValue(color colorVal) {
  return unhex(hex(colorVal, 2));
}

int skimPixelTotal(int max) {
  if(pixelTotal > max) {
    pixelTotal = pixelTotal - max;
    return max;
  }
  int ret = pixelTotal;
  pixelTotal = 0;
  return ret;
}

void setup() {
  size(900,200);
  background(0);

      cp5 = new ControlP5(this);

      cp5.addSlider("modGap")
      .setPosition(5,5)
      .setSize(100,25)
      .setRange(0,10)
      .setValue(0)
      ;

      cp5.addSlider("threshold")
      .setPosition(150,5)
      .setSize(100,25)
      .setRange(0,255)
      .setValue(0)
      ;

      cp5.addSlider("lineAmplitude")
      .setPosition(300, 5)
      .setSize(100,25)
      .setRange(0,10)
      .setValue(2)
      ;

      cp5.addSlider("lineGap")
      .setPosition(500,5)
      .setSize(100,25)
      .setRange(0,10)
      .setValue(0)
      ;


      cp5.addButton("loadFile")
      .setPosition(750,5)
      .setSize(90, 25)
      ;

      render();
}

void lineGap(int gap) {
  lineGap = gap;
  render();
}

void lineAmplitude(int amp) {
  lineAmplitude = amp;
  render();
}

void threshold(int thresh) {
  threshold = thresh;
  render();
}

void modGap(int mg) {
  modGap = mg;
  render();
}

void loadFile() {
  selectInput("Choose background image file:", "fileSelected");
}


color thresholdColor(int colorVal) {
  if(threshold == 0){
    return color(colorVal, colorVal, colorVal);
  }
  if (colorVal > threshold) {
    return color(255, 255, 255);
  }
  return color(0,0,0);
}


void render() {
  if (baseImg != null) {
    image(baseImg, border, border); //<>//
    filter(GRAY);
    loadPixels();

    int r = border + offset + lineAmplitude;
    while (r < height - border ) {
      for(int c = 0; c < width; c = c + 1) {
        pixelTotal = 0;
        for (int bandRow = r - lineAmplitude; bandRow <= r+lineAmplitude; bandRow = bandRow+1) {
          pixelTotal = pixelTotal + colorValue(pixels[c+width*bandRow]);
        }
        int linePixel = skimPixelTotal(255);
        pixels[c+width*r] = thresholdColor(linePixel);
        for (int rowOffset = 1; rowOffset <= lineAmplitude; rowOffset = rowOffset+1) {
          int outerPixel = skimPixelTotal(510)/2;
          color outerColor = thresholdColor(outerPixel);
          pixels[c+width*(r-rowOffset)] = outerColor;
          pixels[c+width*(r+rowOffset)] = outerColor;
        }
        for (int gapOffset = 1; gapOffset <= lineGap; gapOffset = gapOffset+1) {
          pixels[c+width*(r+lineAmplitude+gapOffset)] = color(0,0,0);
        }
      }

      r = r + lineAmplitude*2+1+lineGap;
    }
   //<>//
    updatePixels();
      if (modGap != 0){
      for(int row = border; row < height - border; row = row+1){
        if ( row % modGap == 0) {
          stroke(color(0,0,0));
          strokeWeight(1);
          line(0,row,width,row);
        }
      }
    }
  }
}

void draw() {
}
