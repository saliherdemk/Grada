class DigitInputGrid extends Component {
  constructor(x, y) {
    super(x, y, 400);
    this.shrank = true;
    this.neuronAlignment = "right";
    this.gridSize = 28;
    this.grid = Array.from({ length: this.gridSize }, () =>
      Array(this.gridSize).fill(0),
    );
    this.initialize();
    this.inputDot.destroy();
    this.inputDot = null;
  }

  initializeNeurons() {
    const numOfNeurons = this.gridSize * this.gridSize;
    for (let i = 0; i < numOfNeurons; i++) {
      this.neurons.push(new NeuronView());
    }

    this.setShownNeuronsNum(5);
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  doubleClicked() {}

  showGrid() {
    const commands = [{ func: "stroke", args: [0, 150] }];
    const cellSize = 10;
    for (let i = 0; i <= this.gridSize; i++) {
      const offSet1 = i * cellSize;
      const offset2 = this.gridSize * cellSize;
      const x = this.x + 25;
      const y = this.y + 30;
      commands.push({
        func: "line",
        args: [x + offSet1, y, x + offSet1, y + offset2],
      });
      commands.push({
        func: "line",
        args: [x, y + offSet1, x + offset2, y + offSet1],
      });
    }

    executeDrawingCommands(commands);
  }

  show() {
    const middleX = this.x + this.w / 2;
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: ["Grid Input", middleX, this.y - 10],
      },
    ];

    executeDrawingCommands(commands);
    this.showGrid();
  }

  draw() {
    super.draw();
    this.show();
    this.isShrank() && this.showInfoBox();

    this.neurons.forEach((neuron) => neuron.draw());
  }
}
