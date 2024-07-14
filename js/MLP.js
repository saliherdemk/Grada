class Neuron {
  constructor(nin, x, y) {
    this.w = [];
    for (let i = 0; i < nin; i++) {
      this.w.push(new Value(Math.random() * 2 - 1));
    }
    this.b = new Value(Math.random() * 2 - 1);
    this.act_func = ActivationFunction.TANH;
    this.output = null;
    this.lines = [];
    this.x = x;
    this.y = y;
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
    circle(this.x, this.y, 25, 25);
    fill(0);
    text(this.output?.data.toFixed(2), this.x + 30, this.y);
    text(this.output?.grad.toFixed(2), this.x + 30, this.y + 25);
    fill(255);
  }
  draw() {
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
    line(this.from.x, this.from.y, this.to.x, this.to.y);
  }
}

class Layer extends Draggable {
  constructor(nin, nout, x, y, label, act_func = ActivationFunction.TANH) {
    super("layer");
    this.act_func = act_func;
    this.nextLayer = null;
    this.prevLayer = null;
    this.label = label;
    this.x = x;
    this.w = 50;
    this.nout = nout;
    this.yGap = 40;
    this.h = this.yGap * (nout - 1) + 50;
    this.neurons = Array.from({ length: nout }, () => new Neuron(nin, x, y));

    let middleYPoint = 350;
    this.y = y + middleYPoint - this.h / 2;

    this.updateNeuronsCoordinates();
  }

  updateNeuronsCoordinates() {
    for (let i = 0; i < this.neurons.length; i++) {
      let x = this.x + this.w / 2;
      let y = this.y + this.h / 2 + this.yGap * (i - (this.nout - 1) / 2);
      this.neurons[i].updateCoordinates(x, y);
    }
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
    fill(255, 255, 255, 0);
    rect(this.x, this.y, 50, this.h);
    fill(0);
    text(this.label, this.x, this.y - 10);
    fill(255);
  }

  draw() {
    this.show();
    this.neurons.forEach((neuron) => neuron.draw());

    !organizer.getDragActive() && this.over();
    (organizer.getDragActive() || this.dragging) && this.updateCoordinates();
  }
}

class MLP extends Draggable {
  constructor(nin, nouts, x, y) {
    super("mlp");
    let sz = [nin, ...nouts];
    this.x = x;
    this.y = y;
    this.h;
    this.w;
    this.inputLayer = new Layer(nin, sz[0], this.x - 50, this.y, "Input Layer");
    this.layers = [this.inputLayer];

    for (let i = 0; i < nouts.length; i++) {
      const layer = new Layer(
        sz[i],
        sz[i + 1],
        this.x + i * 100 + 50,
        this.y,
        "L" + (i + 1),
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
    fill(255, 255, 255, 0.5);
    rect(this.x, this.y, this.w, this.h);
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
