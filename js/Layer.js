class Layer extends Draggable {
  constructor(neuronNum, x, y, label, cnv, act_func = ActivationFunction.TANH) {
    super("layer");
    this.canvas = cnv;
    this.act_func = act_func;
    this.nextLayer = null;
    this.prevLayer = null;
    this.label = label;
    this.x = x;
    this.w = 50;
    this.yGap = 40;
    this.h = this.yGap * (neuronNum - 1) + 50;
    this.neurons = Array.from(
      { length: neuronNum },
      () => new Neuron(x, y, false, cnv),
    );
    this.shrinked = false;
    this.shownNeuronNum = this.getNeuronNum();

    let middleYPoint = 350;
    this.y = y + middleYPoint - this.h / 2;

    this.updateNeuronsCoordinates();
    // this.neurons.length > 4 && this.shrink();
  }

  addNeuron(neuron) {
    this.neurons.push(neuron);
  }

  removeNeuron() {
    this.neurons.pop();
  }

  getNeuronNum() {
    return this.neurons.length;
  }

  getShownNeuronNum() {
    return this.shownNeuronNum;
  }

  setShownNeuronNum(shownNeuronNum) {
    this.shownNeuronNum = shownNeuronNum;
  }

  shrink() {
    const { neurons, yGap } = this;

    if (
      this.getShownNeuronNum() == this.getNeuronNum() ||
      this.getNeuronNum() < 4
    ) {
      this.expand();
      return;
    }

    const mid = this.getShownNeuronNum() / 2;
    for (let i = 0; i < this.getNeuronNum(); i++) {
      if (!(i < mid || i >= this.getNeuronNum() - mid)) {
        neurons[i].hide();
      }
    }

    this.h = yGap * (this.getShownNeuronNum() - 1) + 50;
    this.shrinked = true;
    this.updateNeuronsCoordinates();
  }

  expand() {
    this.neurons.forEach((neuron) => neuron.visible());
    this.shrinked = false;

    this.updateNeuronsCoordinates();
  }

  isShrinked() {
    return this.shrinked;
  }

  resetP5Settings() {
    const commands = [
      { func: "textSize", args: [12] },
      { func: "textAlign", args: [LEFT, BASELINE] },
      { func: "textLeading", args: [15] },
      { func: "fill", args: [255] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  showInfoBox() {
    const commands = [
      { func: "fill", args: [0] },
      { func: "textSize", args: [18] },
      { func: "textAlign", args: [CENTER, TOP] },
      { func: "textLeading", args: [7] },
      { func: "text", args: [`.\n.\n.`, this.x, this.infoBoxY + 10, 50, 100] },
      { func: "textAlign", args: [CENTER, CENTER] },
      {
        func: "text",
        args: [
          this.getNeuronNum() - this.getShownNeuronNum(),
          this.x,
          this.infoBoxY + 15,
          50,
          100,
        ],
      },
      { func: "textAlign", args: [CENTER, BOTTOM] },
      { func: "textLeading", args: [7] },
      { func: "text", args: [`.\n.\n.`, this.x, this.infoBoxY, 50, 110] },
    ];

    executeDrawingCommands(this.canvas, commands);
    this.resetP5Settings();
  }

  updateNeuronsCoordinates() {
    const isShrinked = this.isShrinked();
    const neuronNum = isShrinked
      ? this.getShownNeuronNum()
      : this.getNeuronNum();
    const infoBoxH = 90;

    this.h = this.yGap * (neuronNum - 1) + 50;

    let index = 0;
    this.neurons.forEach((neuron) => {
      if (!neuron.isHidden()) {
        const externalHeight =
          index > neuronNum / 2 && isShrinked ? infoBoxH : 0;
        const x = this.x + this.w / 2;
        const y =
          this.y +
          this.h / 2 +
          externalHeight +
          this.yGap * (index - (neuronNum - 1) / 2);

        if (index == Math.floor(neuronNum / 2)) {
          this.infoBoxY = y;
        }
        neuron.updateCoordinates(x, y);
        index++;
      }
    });

    this.h += isShrinked ? infoBoxH : 0;
  }

  call(x) {
    let outs = this.neurons.map((neuron) => neuron.call(x));
    return outs.length === 1 ? outs[0] : outs;
  }

  parameters() {
    return this.neurons.flatMap((neuron) => neuron.parameters());
  }

  change_act_func(act_func) {
    this.act_func = act_func;
    this.neurons.forEach((neuron) => neuron.change_act_func(this.act_func));
  }

  setNextLayer(layer) {
    this.nextLayer = layer;

    this.neurons.forEach((neuron) => {
      let lines = [];
      this.nextLayer.neurons.forEach((toNeuron) => {
        lines.push(new Line(neuron, toNeuron));
      });
      neuron.setLines(lines);
    });
  }

  setPrevLayer(layer) {
    this.prevLayer = layer;
  }

  show() {
    let commands = [
      { func: "noFill", args: [] },
      { func: "rect", args: [this.x, this.y, 50, this.h] },
      { func: "fill", args: [0] },
      { func: "text", args: [this.label, this.x, this.y - 10] },
      { func: "fill", args: [255] },
    ];
    executeDrawingCommands(this.canvas, commands);
    this.isShrinked() && this.showInfoBox();
  }

  draw() {
    this.show();
    this.neurons.forEach((neuron) => neuron.draw());

    !organizer.getDragActive() && this.over();
    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}
