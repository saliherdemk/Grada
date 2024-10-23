class DigitInput extends Component {
  constructor(x, y) {
    super(x, y, 550);
    this.shrank = true;
    this.neuronAlignment = "right";
    this.shape = [1, 784];
    this.grid = new DigitInputGrid(0, 0);
    this.partCount = 1;
    this.partSize = 28;
    this.initialize();
  }

  getData() {
    return [this.grid.values.flat()];
  }

  fetchNext() {}

  setPartSize(ps) {
    this.partSize = ps;
    this.adjustNeurons();
  }

  initializeButtons() {
    this.buttons = [
      new TextButton("Clear shortcut: R", () => {
        this.grid.clear();
      }).setDimensions(this.grid.w, 25),
      new TextButton("-", () => {
        this.partCount = Math.max(1, this.partCount - 1);
      }),
      new TextButton("+", () => {
        this.partCount = Math.min(28, this.partCount + 1);
      }),
      new TextButton("-", () => {
        this.setPartSize(Math.max(3, this.partSize - 1));
      }),
      new TextButton("+", () => {
        this.setPartSize(Math.min(28, this.partSize + 1));
      }),
    ];
  }

  initialize() {
    this.initializeButtons();
    this.inputDot.destroy();
    this.inputDot = null;
    this.outputDot.setColor("cyan");
    this.adjustNeurons();
    this.postUpdateCoordinates();
  }

  postUpdateCoordinates() {
    this.grid.setCoordinates(this.x + 25, this.y + 30);

    const coordinatesMap = [
      { xOffset: 25 - this.grid.w, yOffset: -30 },
      { xOffset: 100, yOffset: -90 },
      { xOffset: 150, yOffset: -90 },
      { xOffset: 50, yOffset: -30 },
      { xOffset: 125, yOffset: -30 },
    ];

    this.buttons.forEach((button, index) => {
      const { xOffset, yOffset } = coordinatesMap[index] || {
        xOffset: 0,
        yOffset: 0,
      };
      const x = this.x + this.grid.w + xOffset;
      const y = this.y + this.h + yOffset;

      button.setCoordinates(x, y);
    });

    super.postUpdateCoordinates();
  }

  adjustNeurons() {
    const neuronNum = this.partSize * this.partSize;
    this.adjustNeuronNum(neuronNum);
    this.setShownNeuronsNum(neuronNum > 5 ? 5 : neuronNum);
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  getPressables() {
    return [this.removeButton, , this.outputDot, this.grid, ...this.buttons];
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

  showAugmentationProps() {
    const commands = [];
    const x = this.x + this.grid.w;
    const y = this.y + this.h;
    const ps = this.partSize;
    commands.push(
      {
        func: "text",
        args: [
          `28x28 grid will be splitted into\n\n\n\nrandom parts each with a size of`,
          x + 35,
          y - 100,
        ],
      },
      { func: "textAlign", args: [CENTER, CENTER] },
      { func: "text", args: [this.partCount, x + 130, y - 75, 15] },
      { func: "text", args: [`${ps}x${ps}`, x + 95, y - 15, 15] },
      { func: "text", args: [`= ${ps * ps}`, x + 175, y - 15] },
    );
    executeDrawingCommands(commands);
  }

  draw() {
    super.draw();
    this.show();
    this.isShrank() && this.showInfoBox();
    this.neurons.forEach((neuron) => neuron.draw());
    this.grid.draw();
    this.buttons.forEach((b) => b.draw());
    this.showAugmentationProps();
  }
}
