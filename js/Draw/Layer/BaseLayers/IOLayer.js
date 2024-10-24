class IOLayer extends Component {
  constructor(datasetId, _x, _y) {
    super(_x, _y, 350);
    this.datasetId = datasetId;
    this.currentIndex = -2; // FIXME explain why it's -2 if ur not slothful
    this.recordNum = this.getDataset().shapeY[0];
  }

  initialize() {
    this.updateShownBatch();
    this.adjustNeurons();
    this.postUpdateCoordinates();
  }

  adjustNeurons() {
    const neuronNum = this.batch[0].length;
    this.adjustNeuronNum(neuronNum);
    this.setShownNeuronsNum(neuronNum > 4 ? 4 : neuronNum);
  }

  getDataset() {
    return datasetOrganizer.getDatasetById(this.datasetId);
  }

  fetchNext() {
    this.currentIndex += parseInt(this.connected.parent.batchSize);
    this.updateShownBatch();
  }

  getColorful(i) {
    const dataStatus = this.connected?.parent.getStatus();
    if (i !== 0 || !dataStatus || dataStatus < 1) {
      return [
        { func: "noStroke", args: [] },
        { func: "fill", args: [0, 0, 0] },
      ];
    }

    const args = themeManager.getColor(dataStatus == 2 ? "yellow" : "green");
    return [
      { func: "stroke", args: args },
      { func: "fill", args: args },
    ];
  }

  createColCommand(text, x, y, i = -1) {
    const commands = [...this.getColorful(i)];
    commands.push({
      func: "text",
      args: [text.toString().slice(0, 2), this.x + 21.5 + x, y - 5, 25, 25],
    });
    return commands;
  }

  showTotalRecordNum() {
    const commands = [
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: [`Shape: ${this.shape}`, this.x, this.y + this.h - 10, this.w],
      },
    ];
    executeDrawingCommands(commands);
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
    this.showTotalRecordNum();
  }
}
