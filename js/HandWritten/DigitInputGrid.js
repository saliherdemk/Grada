class DigitInputGrid extends Draggable {
  constructor(x, y) {
    super(x, y);
    this.gridSize = 28;
    this.cellSize = 10;
    this.brushSize = 5;

    const size = this.gridSize * this.cellSize;
    this.setDimensions(size, size);

    this.drawings = [];
    this.drawingCanvas = createGraphics(size, size);
    this.drawingCanvas.stroke(0);
    this.drawingCanvas.strokeWeight(this.brushSize);

    this.processedCanvas = createGraphics(this.gridSize, this.gridSize);

    this.boundaries = { left: size, right: 0, top: size, bottom: 0 };
    this.clear();
    this.getData();
  }

  clear() {
    this.drawings = [];
    this.drawingCanvas.clear();
    this.drawingCanvas.background(255);
    this.boundaries = { left: this.w, right: 0, top: this.h, bottom: 0 };
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
    this.drawings.push(clamped);

    this.updateBoundaries(clamped);

    this.drawingCanvas.line(clamped.x1, clamped.y1, clamped.x2, clamped.y2);
  }

  updateBoundaries({ x1, y1, x2, y2 }) {
    this.boundaries.left = Math.min(this.boundaries.left, x1, x2);
    this.boundaries.right = Math.max(this.boundaries.right, x1, x2);
    this.boundaries.top = Math.min(this.boundaries.top, y1, y2);
    this.boundaries.bottom = Math.max(this.boundaries.bottom, y1, y2);
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

  showGrid() {
    const commands = [{ func: "stroke", args: [0, 50] }];
    const offset = this.gridSize * this.cellSize;

    for (let i = 0; i <= this.gridSize; i++) {
      const pos = i * this.cellSize;
      commands.push(
        {
          func: "line",
          args: [this.x + pos, this.y, this.x + pos, this.y + offset],
        },
        {
          func: "line",
          args: [this.x, this.y + pos, this.x + offset, this.y + pos],
        },
      );
    }

    executeDrawingCommands(commands);
  }

  showDrawings() {
    executeDrawingCommands([
      { func: "image", args: [this.drawingCanvas, this.x, this.y] },
      { func: "noFill", args: [] },
      { func: "strokeWeight", args: [3] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
    ]);
    this.showGrid();
  }

  draw() {
    this.showDrawings();
    this.showProcessedCanvas();
    this.setValues();
    this.showProcessed();
    this.showTestData();
  }

  calculateBoundaries() {
    const brushSize = this.brushSize;
    const dc = this.drawingCanvas;
    const left = Math.max(this.boundaries.left - brushSize, 0);
    const right = Math.min(this.boundaries.right + brushSize, dc.width);
    const top = Math.max(this.boundaries.top - brushSize, 0);
    const bottom = Math.min(this.boundaries.bottom + brushSize, dc.height);

    return { left, right, top, bottom };
  }

  cropAndNormalizeImage(croppedWidth, croppedHeight, left, top) {
    const dc = this.drawingCanvas;
    const pc = this.processedCanvas;

    const cropped = dc.get(left, top, croppedWidth, croppedHeight);

    pc.clear();
    pc.background(0);

    pc.image(cropped, 0, 0, 28, 28);
  }

  showProcessedCanvas() {
    const { left, right, top, bottom } = this.calculateBoundaries();
    const croppedWidth = Math.max(right - left, 1);
    const croppedHeight = Math.max(bottom - top, 1);

    this.cropAndNormalizeImage(croppedWidth, croppedHeight, left, top);
  }

  setValues() {
    const pc = this.processedCanvas;
    const gs = this.gridSize;

    pc.loadPixels();
    let pixelData = [];
    for (let i = 0; i < gs; i++) {
      for (let j = 0; j < gs; j++) {
        let index = (i + j * gs) * 4;
        let r = pc.pixels[index];
        let g = pc.pixels[index + 1];
        let b = pc.pixels[index + 2];
        let brightness = (r + g + b) / 3;
        pixelData.push((255 - brightness) / 255);
      }
    }
    this.values = pixelData;
  }

  async getData() {
    try {
      const module = await import(`../../../data.js`);
      this.testData = module.default;
    } catch (error) {
      console.error("Error loading yData:", error);
    }
  }

  showTestData() {
    const x = this.x + this.w + 25;
    const y = this.y;

    const commands = [{ func: "noStroke", args: [] }];

    this.testData?.[0].forEach((b, i) => {
      const j = Math.floor(i / this.gridSize);
      commands.push(
        { func: "fill", args: [b * 255] },
        {
          func: "square",
          args: [x + (i % this.gridSize) * 3, y + j * 3, 3],
        },
      );
    });

    executeDrawingCommands(commands);
  }

  showProcessed(values = this.values) {
    const x = this.x + this.w + 25;
    const y = this.y + (this.h - this.gridSize * 3) / 2;

    const commands = [{ func: "noStroke", args: [] }];

    values.forEach((b, i) => {
      const j = Math.floor(i / this.gridSize);
      commands.push(
        { func: "fill", args: [b * 255] },
        {
          func: "square",
          args: [x + j * 3, y + (i % this.gridSize) * 3, 3],
        },
      );
    });

    executeDrawingCommands(commands);
  }
}
