class InputLayer extends Component {
  constructor(datasetId) {
    super(300, 300, 350);
    this.neuronAlignment = "right";
    this.currentIndex = -2; // FIXME explain why it's -2 if ur not slothful
    this.datasetId = datasetId;
    this.batchX = [];
    this.labels = this.getDataset().getXLabels();
    this.actFunc = "";
    this.initialize();
  }

  initialize() {
    this.inputDot.destroy();
    this.inputDot = null;

    this.updateBatch();
    this.adjustNeurons();
    this.postUpdateCoordinates();
  }

  adjustNeurons() {
    const neuronNum = this.batchX[0].length;
    this.adjustNeuronNum(neuronNum);
    this.setShownNeuronsNum(neuronNum > 4 ? 4 : neuronNum);
  }

  getDataset() {
    return datasetOrganizer.getDatasetById(this.datasetId);
  }

  updateBatch() {
    const { batchX } = this.getDataset().getBatch(this.currentIndex, 6);
    this.batchX = batchX;
  }

  fetchNext() {
    super.fetchNext();
    const { next } = this.parent.getPrevAndNext(this);

    this.batchX[0].forEach((value, i) => {
      const n = next.neurons[i];
      n.setOutput(value);
    });
  }

  reInitializeDots() {
    this.inputDot.destroy();
    this.inputDot = null;
  }

  setValues() {
    return this.batchX[0].map((v) => parseFloat(v));
  }

  getColorful(i) {
    const dataStatus = this.parent?.getDataStatus() ?? -1;
    if (i !== 0 || dataStatus === -1) {
      return [
        { func: "noStroke", args: [] },
        { func: "fill", args: [0, 0, 0] },
      ];
    }

    const args = themeManager.getColor(dataStatus ? "yellow" : "green");
    return [
      { func: "stroke", args: args },
      { func: "fill", args: args },
    ];
  }

  createColCommand(text, x, y, i = -1) {
    const commands = [...this.getColorful(i)];
    commands.push({
      func: "text",
      args: [text, this.x + 21.5 + x, y - 5, 25, 25],
    });
    return commands;
  }

  showValues(batch, lineX, valX, labelX) {
    const commands = [
      {
        func: "line",
        args: [lineX, this.y + 10, lineX, this.y + this.h - 10],
      },
    ];
    const { indexes: shownNeuronsIndexes } = this.shownNeurons;

    batch.forEach((row, i) => {
      shownNeuronsIndexes.forEach((j, ji) => {
        const yOffset =
          this.isShrank() && ji > shownNeuronsIndexes.length / 2
            ? this.infoBox.h
            : 0;
        const y = this.y + 38 + ji * this.yGap + yOffset;
        const _x = i * 50;
        const x = valX === 0 ? _x : valX - _x;

        commands.push(this.createColCommand(row[j], x, y, i));
        commands.push(this.createColCommand(this.labels[j], labelX, y));
      });
    });
    executeDrawingCommands(commands.flat());
  }

  showValuesa() {
    this.showValues(this.batchX, this.x + 50, this.w - 50, 0);
  }

  draw() {
    super.draw();
    this.showValuesa();
  }
}
