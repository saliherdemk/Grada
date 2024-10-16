class DigitComponent extends Component {
  constructor(x, y) {
    super(x, y, 550);
    this.shrank = true;
    this.neuronAlignment = "right";
    this.shape = [1, 784];
    this.grid = new DigitInputGrid(0, 0);
    this.clearButton = new TextButton("Clear shortcut: R", () => {
      this.grid.clear();
    }).setDimensions(this.grid.w, 25);
    this.initialize();
  }

  getData() {
    return [this.grid.values.flat()];
  }

  fetchNext() {}

  initialize() {
    this.inputDot.destroy();
    this.inputDot = null;
    this.outputDot.setColor("cyan");
    this.adjustNeurons();
    this.postUpdateCoordinates();
  }

  postUpdateCoordinates() {
    this.grid.setCoordinates(this.x + 25, this.y + 30);
    this.clearButton.setCoordinates(this.x + 25, this.y + this.h - 30);
    super.postUpdateCoordinates();
  }

  adjustNeurons() {
    const gridSize = this.grid.gridSize;
    const neuronNum = gridSize * gridSize;
    this.adjustNeuronNum(neuronNum);
    this.setShownNeuronsNum(neuronNum > 5 ? 5 : neuronNum);
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  getPressables() {
    return [this.removeButton, this.clearButton, , this.outputDot, this.grid];
  }

  doubleClicked() {}

  handleKeyPressed(k) {
    iManager.isHovered(this) && k == "r" && this.grid.clear();
  }

  show() {
    const middleX = this.x + this.w / 2;
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: ["Grid Input", middleX, this.y - 10],
      },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    super.draw();
    this.show();
    this.isShrank() && this.showInfoBox();
    this.neurons.forEach((neuron) => neuron.draw());
    this.grid.draw();
    this.clearButton.draw();
  }
}
