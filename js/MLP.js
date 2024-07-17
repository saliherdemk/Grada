class Neuron {
  constructor(x, y, hidden, cnv) {
    this.w = [];
    // for (let i = 0; i < nin; i++) {
    //   this.w.push(new Value(Math.random() * 2 - 1));
    // }
    this.canvas = cnv;
    this.b = new Value(Math.random() * 2 - 1);
    this.act_func = ActivationFunction.TANH;
    this.output = null;
    this.lines = [];
    this.x = x;
    this.y = y;
    this.hidden = hidden;
  }

  hide() {
    this.hidden = true;
  }

  visible() {
    this.hidden = false;
  }

  call(x) {
    let act = this.b;
    for (let i = 0; i < this.w.length; i++) {
      act = act.add(this.w[i].mul(x[i]));
    }

    this.output = activation_functions[this.act_func](act);
    return this.output;
  }

  parameters() {
    return [...this.w, this.b];
  }

  change_act_func(act_func) {
    this.act_func = act_func;
  }

  setLines(lines) {
    this.lines = lines;
  }

  updateCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    const commands = [
      { func: "circle", args: [this.x, this.y, 25, 25] },
      { func: "fill", args: [0] },
      {
        func: "text",
        args: [this.output?.data.toFixed(2), this.x + 30, this.y],
      },
      {
        func: "text",
        args: [this.output?.grad.toFixed(2), this.x + 30, this.y + 25],
      },
      { func: "fill", args: [255] },
    ];
    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    if (this.hidden) return;
    this.lines.forEach((line) => line.draw());
    this.show();
  }
}

class Line {
  constructor(from, to) {
    this.from = from;
    this.to = to;
    this.w = new Value(Math.random() * 2 - 1);
  }

  draw() {
    !(this.from.hidden || this.to.hidden) &&
      line(this.from.x, this.from.y, this.to.x, this.to.y);
  }
}

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
    this.shownNeuronsNum = 3;

    let middleYPoint = 350;
    this.y = y + middleYPoint - this.h / 2;

    this.updateNeuronsCoordinates();
    this.neurons.length > 4 && this.shrink();
  }

  shrink() {
    let mid = this.shownNeuronsNum / 2;
    for (let i = 0; i < this.neurons.length; i++) {
      if (!(i < mid || i >= this.neurons.length - mid)) {
        this.neurons[i].hide();
      }
    }

    this.h = this.yGap * (this.shownNeuronsNum - 1) + 50;

    this.shrinked = true;
    this.updateNeuronsCoordinates();
  }

  expand() {
    this.neurons.forEach((neuron) => neuron.visible());
    this.shrinked = false;

    this.updateNeuronsCoordinates();
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
          this.neurons.length - this.shownNeuronsNum,
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
    const neuronNum = this.shrinked
      ? this.shownNeuronsNum
      : this.neurons.length;
    const infoBoxH = 90;

    this.h = this.yGap * (neuronNum - 1) + 50;

    let index = 0;
    this.neurons.forEach((neuron) => {
      if (!neuron.hidden) {
        const externalHeight =
          index >= neuronNum / 2 && this.shrinked ? infoBoxH : 0;
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

    this.h += this.shrinked ? infoBoxH : 0;
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
      { func: "rect", args: [this.x, this.y, 50, this.h] },
      { func: "fill", args: [0] },
      { func: "text", args: [this.label, this.x, this.y - 10] },
      { func: "fill", args: [255] },
    ];
    executeDrawingCommands(this.canvas, commands);
    this.shrinked && this.showInfoBox();
  }

  draw() {
    this.show();
    this.neurons.forEach((neuron) => neuron.draw());

    !organizer.getDragActive() && this.over();
    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}

class MLP extends Draggable {
  constructor(nin, nouts, x, y, cnv) {
    super("mlp");
    let sz = [nin, ...nouts];
    this.x = x;
    this.y = y;
    this.h;
    this.w;
    this.canvas = cnv;
    this.inputLayer = new Layer(sz[0], this.x - 50, this.y, "Input Layer", cnv);
    this.layers = [this.inputLayer];

    for (let i = 0; i < nouts.length; i++) {
      const layer = new Layer(
        sz[i + 1],
        this.x + i * 100 + 50,
        this.y,
        "L" + (i + 1),
        cnv,
      );

      if (this.layers.length > 0) {
        let prevLayer = this.layers[this.layers.length - 1];
        prevLayer.setNextLayer(layer);
        layer.setPrevLayer(prevLayer);
      }

      this.layers.push(layer);
    }

    this.updateBorders();
  }

  updateBorders() {
    let lastX = 0;
    let firstX = width;
    let firstY = height;
    let lastY = 0;
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      lastX = Math.max(layer.x, lastX);
      firstX = Math.min(layer.x, firstX);

      firstY = Math.min(layer.y, firstY);
      lastY = Math.max(lastY, layer.y + layer.h);
    }
    this.w = lastX - firstX + 100;
    this.x = firstX - 25;
    this.y = firstY - 25;
    this.h = lastY - firstY + 50;
  }

  call(x) {
    return this.layers.reduce((input, layer) => layer.call(input), x);
  }

  parameters() {
    return this.layers.flatMap((layer) => layer.parameters());
  }

  show() {
    const commands = [
      { func: "fill", args: [255, 255, 255, 0.5] },
      { func: "rect", args: [this.x, this.y, this.w, this.h] },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  handlePressed() {
    this.layers.forEach((layer) => {
      layer.pressed();
    });
    if (organizer.getDragActive()) return;
    this.pressed();
  }

  handleReleased() {
    this.layers.forEach((layer) => {
      layer.released();
    });
    this.released();
  }

  handleDoubleClicked() {
    this.layers.forEach((layer) => layer.doubleClicked());
  }

  draw() {
    this.layers.forEach((layer) => layer.draw());
    this.show();

    !organizer.getDragActive() && this.over();
    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}
