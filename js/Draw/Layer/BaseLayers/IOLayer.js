class IOLayer extends Component {
  constructor(datasetId, _x, _y, isInput = true) {
    super(_x, _y, 350);
    this.neuronAlignment = isInput ? "right" : "left";
    this.datasetId = datasetId;
    this.currentIndex = -2;
    this.labels = [];
    this.initialize();
  }
  initialize() {
    super.initialize();
    this.adjustNeuronNum();
    this.reInitializeDots();
  }

  reset() {
    this.currentIndex = -2;
    this.updateBatch();
  }

  play() {
    const { batchX, batchY } = this.getDataset().getBatch(
      ++this.currentIndex,
      5,
    );
    this.batchX = batchX;
    this.batchY = batchY;
  }

  isDataReady() {
    return this.parent.isDataFetched();
  }

  getDataset() {
    return datasetOrganizer.getDatasetById(this.datasetId);
  }

  fetchNext() {
    this.currentIndex++;
    this.updateBatch();
  }

  getColorful(i) {
    const dataStatus = this.parent.getDataStatus();
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

  getTrainXSize() {
    return this.getDataset().getTrainX()[0].length;
  }

  getTrainYSize() {
    return this.getDataset().getTrainY()[0].length;
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

  show() {
    const commands = [{ func: "rect", args: [this.x, this.y, this.w, this.h] }];
    executeDrawingCommands(commands);
  }

  updateBatch() {}
  draw() {
    super.draw();
    this.showValues();
  }
}
