class DigitInputGrid extends Draggable {
  constructor(x, y) {
    super(x, y);
    this.gridSize = 28;
    this.cellSize = 10;
    const size = this.gridSize * this.cellSize;
    this.setDimensions(size, size);
    this.drawings = [];

    this.drawingCanvas = createGraphics(size, size);
    this.drawingCanvas.stroke(0);
    this.drawingCanvas.strokeWeight(15);

    this.scaledCanvas = createGraphics(this.gridSize, this.gridSize);
    this.clear();
  }

  clear() {
    this.drawings = [];
    this.drawingCanvas.clear();
    this.drawingCanvas.background(255);
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

    this.drawingCanvas.line(clamped.x1, clamped.y1, clamped.x2, clamped.y2);
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
    this.showValues();
    this.setValues();
  }

  showValues() {
    const sc = this.scaledCanvas;
    const dc = this.drawingCanvas;
    const gs = this.gridSize;
    sc.copy(dc, 0, 0, dc.width, dc.height, 0, 0, gs, gs);
    const canvasSize = 100;
    const x = this.x + this.w + 50;
    const y = this.y + (this.h - canvasSize) / 2;
    executeDrawingCommands([
      { func: "image", args: [sc, x, y, canvasSize, canvasSize] },
      { func: "noFill", args: [] },
      { func: "rect", args: [x, y, canvasSize, canvasSize] },
    ]);
  }

  setValues() {
    const sc = this.scaledCanvas;
    const gs = this.gridSize;
    sc.loadPixels();
    let pixelData = [];
    for (let y = 0; y < gs; y++) {
      for (let x = 0; x < gs; x++) {
        let index = (x + y * gs) * 4;
        let r = sc.pixels[index];
        let g = sc.pixels[index + 1];
        let b = sc.pixels[index + 2];
        let brightness = (r + g + b) / 3;
        pixelData.push(`${1 - Math.round(brightness) / 255} `);
      }
    }
    this.values = pixelData;
  }
}
