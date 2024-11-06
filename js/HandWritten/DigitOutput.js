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

  resetTo(x, y) {
    this.setCoordinates(x, y);
  }

  setData(data) {
    let index = 0;
    let result = Array.from({ length: 10 }).fill(0);

    while (index < 10) {
      data.forEach((el) => {
        result[index] += el[index];
      });
      result[index++] /= 4;
    }
    let maxIndex = 0;
    result.forEach((val, idx) => {
      if (val > result[maxIndex]) maxIndex = idx;
    });

    this.neurons.forEach((n, i) => {
      n.setColor(i == maxIndex ? "green" : "white");
    });
  }

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
