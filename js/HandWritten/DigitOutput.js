class DigitOutput extends Component {
  constructor(x, y) {
    super(x, y, 50);
    this.initialize();
  }

  initialize() {
    this.outputDot.destroy();
    this.outputDot = null;
    this.inputDot.setColor("cyan");
    this.adjustNeuronNum(10);
    this.setShownNeuronsNum(10);
    this.neurons.forEach((n, i) => n.setOutput(i, true));
    this.postUpdateCoordinates();
  }

  setData(data) {
    let maxIndex = 0;
    data.forEach((val, idx) => {
      if (val > data[maxIndex]) maxIndex = idx;
    });
    this.neurons.forEach((n, i) => {
      n.setColor(i == maxIndex ? "green" : "white");
    });
  }

  // FIXME: maybe we can merge those functions into a base class for output
  fetchNext() {}

  connectLayer(targetLayer) {
    const isEqual = this.getNeuronNum() == targetLayer.getNeuronNum();
    if (!isEqual) return;

    this.connectNeurons(targetLayer);
  }

  connectNeurons(targetLayer) {
    targetLayer.neurons.forEach((n1, i) => {
      n1.removeLines();
      n1.addLine(new Line(n1, this.neurons[i]));
    });
    this.inputDot.occupy();
    targetLayer.outputDot.occupy();
    targetLayer.parent.setOutputComponent(this);
    this.connected = targetLayer;
  }

  clearLines() {
    this.connected.clearLines(this);
    this.connected.parent.clearOutput();
    this.connected = null;
  }

  show() {
    const middleX = this.x + this.w / 2;
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10] },
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: ["Grid Output", middleX, this.y - 10],
      },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    super.draw();
    this.show();
    this.neurons.forEach((neuron) => neuron.draw());
  }
}
