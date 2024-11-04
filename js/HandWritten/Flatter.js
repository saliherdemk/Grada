class Flatter extends Component {
  constructor(x, y) {
    super(x, y, 275);
    this.shrank = true;
    this.neuronAlignment = "right";
    this.shape = [1, 784];
    this.partCount = 1;
    this.partSize = 28;
    this.source = null;
    this.initialize();
  }

  connectLayer(targetLayer) {
    super.connectLayer(targetLayer) && this.buttons.forEach((b) => b.disable());
  }

  clearLines() {
    super.clearLines();
    this.buttons.forEach((b) => b.enable());
  }

  updateButtons(hide) {
    super.updateButtons(hide);
    this.source?.updateButtons(hide);
  }

  augment(data) {
    let output = [];
    for (let i = 0; i < this.partCount; i++) {
      let diff = 28 - this.partSize;
      let x = parseInt(Math.random() * diff);
      let y = parseInt(Math.random() * diff);
      let part = [];
      for (let j = 0; j < this.partSize; j++) {
        part.push(data[y + j].slice(x, x + this.partSize));
      }
      output.push(part);
    }
    return output;
  }

  getData() {
    return this.values.map((v) => v.map((_v) => _v.flat())).flat();
  }

  handleRemove() {
    // FIXME: add variable to control if component isoleted and ready to remove
    if (!(this.source || this.connected)) {
      this.destroy();
      mainOrganizer.removeComponent(this);

      return;
    }
    if (this.source) {
      this.clearSource();
    }
    if (this.connected) {
      this.clearLines();
    }
    this.values = null;
  }

  fetchNext() {
    this.source.fetchNext();
    const isFromGrid = this.source instanceof DigitInput;
    let data = this.source.getData();
    data = isFromGrid ? [data] : data;
    this.values = data.map((batch) => this.augment(batch));
  }

  setPartSize(ps) {
    this.partSize = ps;
    this.adjustNeurons();
  }

  setSource(source) {
    this.source = source;
    this.connected?.parent.checkCompleted();
  }

  clearSource() {
    this.source.clearConnected();
    this.source = null;
    this.inputDot.free();
    this.connected?.parent.checkCompleted();
  }

  initializeButtons() {
    this.buttons = [
      new TextButton("-", () => {
        this.partCount = Math.max(1, this.partCount - 1);
      }),
      new TextButton("+", () => {
        this.partCount = Math.min(28, this.partCount + 1);
      }),
      new TextButton("-", () => {
        this.setPartSize(Math.max(1, this.partSize - 1));
      }),
      new TextButton("+", () => {
        this.setPartSize(Math.min(28, this.partSize + 1));
      }),
    ];
  }

  initialize() {
    this.initializeButtons();
    this.inputDot.destroy();
    this.inputDot = new FlattenInputDot(this);
    this.outputDot.setColor("cyan");
    this.adjustNeurons();
  }

  postUpdateCoordinates() {
    const coordinatesMap = [
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
      const x = this.x + xOffset;
      const y = this.y + this.h + yOffset;

      button.setCoordinates(x, y);
    });

    super.postUpdateCoordinates();
  }

  adjustNeurons() {
    const neuronNum = this.partSize * this.partSize;
    this.adjustNeuronNum(neuronNum);
    this.setShownNeuronsNum(neuronNum > 5 ? 5 : neuronNum);
    this.postUpdateCoordinates();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  getPressables() {
    return [this.removeButton, this.inputDot, this.outputDot, ...this.buttons];
  }

  doubleClicked() {}

  show() {
    const middleX = this.x + this.w / 2;
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: ["Flatter", middleX, this.y - 10],
      },
    ];

    executeDrawingCommands(commands);
  }

  showAugmentationProps() {
    const commands = [];
    const x = this.x;
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

  showValues() {
    if (!this.values) return;

    const pixelSize = 3;
    const padding = 30;
    const gridWidth = 250;
    const gridHeight = 300;
    const partDisplaySize = pixelSize * this.partSize + padding;

    const elementsPerRow = Math.floor(gridWidth / partDisplaySize);
    const elementsPerColumn = Math.floor(gridHeight / partDisplaySize);
    const maxElements = elementsPerRow * elementsPerColumn;

    const commands = [{ func: "noStroke", args: [] }];
    const valuesToShow = this.values[0].slice(0, maxElements);

    valuesToShow.forEach((value, index) => {
      const rowIndex = Math.floor(index / elementsPerRow);
      const colIndex = index % elementsPerRow;

      const xOffset = colIndex * partDisplaySize;
      const yOffset = rowIndex * partDisplaySize;

      value.forEach((row, j) => {
        row.forEach((brightness, i) => {
          const x = padding + this.x + xOffset + i * pixelSize;
          const y = padding + this.y + yOffset + j * pixelSize;
          commands.push(
            { func: "fill", args: [brightness * 255] },
            { func: "square", args: [x, y, pixelSize] },
          );
        });
      });
    });

    executeDrawingCommands(commands);
  }

  draw() {
    super.draw();
    this.show();
    this.isShrank() && this.showInfoBox();
    this.neurons.forEach((neuron) => neuron.draw());
    this.buttons.forEach((b) => b.draw());
    this.showAugmentationProps();
    this.showValues();
  }
}
