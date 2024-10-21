class DigitInputGrid extends Draggable {
  constructor(x, y) {
    super(x, y);
    this.gridSize = 28;
    this.cellSize = 10;
    const size = this.gridSize * this.cellSize;
    this.setDimensions(size, size);

    this.setupCanvases(size);
    this.clear();
    this.getData();

    this.bounds = [Infinity, Infinity, -Infinity, -Infinity];
    this.values = Array({ length: 784 }).fill(0);
  }

  setupCanvases(size) {
    this.drawingCanvas = createGraphics(size, size);
    this.drawingCanvas.stroke(255);
    this.drawingCanvas.strokeWeight(10);

    this.centeredCanvas = createGraphics(size, size);
    this.normalizedCanvas = createGraphics(this.gridSize, this.gridSize);
  }

  clear() {
    this.drawingCanvas.background(0);
    this.bounds = [Infinity, Infinity, -Infinity, -Infinity];
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  handlePressed() {
    iManager.checkRollout(this);
  }

  handleDrag(_x, _y) {
    const { mouseX, mouseY, pmouseX, pmouseY } = getCurrentMouseCoordinates();
    const { x, y } = iManager.getAbsoluteCoordinates(mouseX, mouseY);
    const { x: px, y: py } = iManager.getAbsoluteCoordinates(pmouseX, pmouseY);
    const clamped = this.getClampedCoordinates(x, y, px, py);

    this.drawingCanvas.line(clamped.x1, clamped.y1, clamped.x2, clamped.y2);
    this.startPipeline();
  }

  startPipeline() {
    this.updateBounds();
    this.centeredBoxTask();
  }

  updateBounds() {
    this.drawingCanvas.loadPixels();
    const p = this.drawingCanvas.pixels;
    const w = this.drawingCanvas.width;

    for (let i = 0; i < w * w; i++) {
      const j = i * 4;
      if (p[j] > 0 || p[j + 1] > 0 || p[j + 2] > 0) {
        const x = i % w;
        const y = Math.floor(i / w);
        this.bounds = [
          Math.min(x, this.bounds[0]),
          Math.min(y, this.bounds[1]),
          Math.max(x, this.bounds[2]),
          Math.max(y, this.bounds[3]),
        ];
      }
    }

    this.bounds[2] -= this.bounds[0];
    this.bounds[3] -= this.bounds[1];
  }

  getCroppedAndCentered() {
    const [boundW, boundH] = [this.bounds[2], this.bounds[3]];
    const scalingFactor = 200 / Math.max(boundW, boundH);
    const croppedW = boundW * scalingFactor;
    const croppedH = boundH * scalingFactor;
    const [sX, sY] = [this.bounds[0], this.bounds[1]];
    const centerX = this.centeredCanvas.width / 2 - croppedW / 2;
    const centerY = this.centeredCanvas.height / 2 - croppedH / 2;

    return [sX, sY, boundW, boundH, centerX, centerY, croppedW, croppedH];
  }

  centeredBoxTask() {
    const centeredCanvas = this.centeredCanvas;
    centeredCanvas.clear();
    centeredCanvas.background(0);
    centeredCanvas.copy(this.drawingCanvas, ...this.getCroppedAndCentered());

    this.normalizedTask();
  }

  normalizedTask() {
    const cc = this.centeredCanvas;
    const nc = this.normalizedCanvas;
    nc.clear();
    nc.copy(cc, 0, 0, cc.width, cc.height, 0, 0, nc.width, nc.height);
    this.setValues();
  }

  setValues() {
    const pc = this.normalizedCanvas;
    const gs = this.gridSize;
    pc.loadPixels();
    let pixelData = [];
    for (let j = 0; j < gs; j++) {
      for (let i = 0; i < gs; i++) {
        let index = (i + j * gs) * 4;
        let r = pc.pixels[index];
        let g = pc.pixels[index + 1];
        let b = pc.pixels[index + 2];
        let brightness = (r + g + b) / 3;
        pixelData.push(brightness / 255);
      }
    }
    this.values = pixelData;
  }

  getClampedCoordinates(x, y, px, py) {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    return {
      x1: clamp(x - this.x, 0, this.w),
      y1: clamp(y - this.y, 0, this.h),
      x2: clamp(px - this.x, 0, this.w),
      y2: clamp(py - this.y, 0, this.h),
    };
  }

  showDrawingCanvas() {
    executeDrawingCommands([
      { func: "strokeWeight", args: [5] },
      { func: "stroke", args: [255, 0, 0] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
      { func: "image", args: [this.drawingCanvas, this.x, this.y] },
    ]);
  }

  async getData() {
    try {
      const module = await import(
        `https://saliherdemk.github.io/Grada/Data/testData.js`
      );
      this.testData = module.default;
    } catch (error) {
      console.error("Error loading test data:", error);
    }
  }

  showTestData() {
    const x = this.x + this.w + 25;
    const y = this.y;
    const commands = [
      { func: "noStroke", args: [] },
      { func: "text", args: ["example from mnist", x, y - 10] },
    ];

    this.testData?.[0].forEach((b, i) => {
      const j = Math.floor(i / this.gridSize);
      commands.push(
        { func: "fill", args: [b * 255] },
        { func: "square", args: [x + (i % this.gridSize) * 3, y + j * 3, 3] },
      );
    });

    executeDrawingCommands(commands);
  }

  showValues() {
    const x = this.x + this.w + 25;
    const y = this.y + 100;
    const commands = [{ func: "noStroke", args: [] }];

    this.values.forEach((b, i) => {
      const j = Math.floor(i / this.gridSize);
      commands.push(
        { func: "fill", args: [b * 255] },
        { func: "square", args: [x + (i % this.gridSize) * 3, y + j * 3, 3] },
      );
    });

    executeDrawingCommands(commands);
  }

  draw() {
    this.showDrawingCanvas();
    this.showTestData();
    this.showValues();
  }
}
