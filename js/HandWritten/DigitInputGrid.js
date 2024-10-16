class DigitInputGrid extends Draggable {
  constructor(x, y) {
    super(x, y);
    this.gridSize = 28;
    this.cellSize = 10;
    this.setDimensions(
      this.gridSize * this.cellSize,
      this.gridSize * this.cellSize,
    );
    this.clear();
    this.drawings = [];
  }

  clear() {
    this.drawings = [];
    this.values = this.createEmptyGrid();
  }

  createEmptyGrid() {
    return Array.from({ length: this.gridSize }, () =>
      Array(this.gridSize).fill(0),
    );
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

    this.drawings.push(this.getClampedCoordinates(x, y, px, py));
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
    const commands = [
      { func: "stroke", args: [0] },
      { func: "strokeWeight", args: [4] },
    ];

    for (const { x1, y1, x2, y2 } of this.drawings) {
      commands.push({
        func: "line",
        args: [this.x + x1, this.y + y1, this.x + x2, this.y + y2],
      });
    }

    executeDrawingCommands(commands);
  }

  draw() {
    this.showGrid();
    this.showDrawings();
    this.showValues();
  }

  convertDrawingsToValues() {
    this.values = this.createEmptyGrid();

    for (const { x1, y1, x2, y2 } of this.drawings) {
      this.drawLineOnValues(
        Math.min(Math.floor(x1 / this.cellSize), 27),
        Math.min(Math.floor(y1 / this.cellSize), 27),
        Math.min(Math.floor(x2 / this.cellSize), 27),
        Math.min(Math.floor(y2 / this.cellSize), 27),
      );
    }

    this.normalizeValues();
  }

  normalizeValues() {
    const maxValue = Math.max(...this.values.flat());
    if (maxValue === 0) return;

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        this.values[i][j] = Math.floor((this.values[i][j] / maxValue) * 255);
      }
    }
  }

  // Bresenham's Algorithm
  drawLineOnValues(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.values[y1][x1] = Math.min(this.values[y1][x1] + 30, 255);
      if (x1 === x2 && y1 === y2) break;

      const e2 = err * 2;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }
  }

  showValues() {
    this.convertDrawingsToValues();
    const commands = [];
    const cellSize = this.cellSize / 2;

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        const colorValue = this.values[i][j];
        commands.push(
          { func: "fill", args: [colorValue] },
          {
            func: "rect",
            args: [
              this.x + this.w + 25 + j * cellSize,
              this.y + (this.h - cellSize * this.gridSize) / 2 + i * cellSize,
              cellSize,
              cellSize,
            ],
          },
        );
      }
    }

    executeDrawingCommands(commands);
  }
}
