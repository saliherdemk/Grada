var layers = [];
class Neuron {
  constructor(nin, x, y) {
    this.w = [];
    for (let i = 0; i < nin; i++) {
      let randomValue = Math.random() * 2 - 1;
      this.w.push(new Value(randomValue));
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
  draw() {
    this.lines.forEach((line) => line.draw());
    circle(this.x, this.y, 25, 25);
    text(this.output?.data.toFixed(2), this.x + 30, this.y);
    text(this.output?.grad.toFixed(2), this.x + 30, this.y + 25);
  }
}

class Line {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  draw() {
    line(this.from.x, this.from.y, this.to.x, this.to.y);
  }
}

class Layer extends Draggable {
  constructor(nin, nout, x, act_func = ActivationFunction.TANH) {
    super();
    this.act_func = act_func;
    this.prevLayer = null;
    this.x = x;
    this.w = 50;
    this.neurons = [];
    this.middleYpoint = 350;

    let yGap = 40;
    this.h = yGap * (nout - 1) + 50;
    this.y = this.middleYpoint - this.h / 2;

    for (let i = 0; i < nout; i++) {
      let x = this.x + this.w / 2;
      let y = this.y + this.h / 2 + yGap * (i - (nout - 1) / 2);

      this.neurons.push(new Neuron(nin, x, y));
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

  setPrevLayer(layer) {
    this.prevLayer = layer;

    this.neurons.forEach((neuron) => {
      let lines = [];
      this.prevLayer.neurons.forEach((fromNeuron) => {
        lines.push(new Line(fromNeuron, neuron));
      });
      neuron.setLines(lines);
    });
  }

  draw() {
    fill(255, 255, 255, 0);
    rect(this.x, this.y, 50, this.h);
    fill(255);
    this.neurons.forEach((neuron) => neuron.draw());
  }
}

class MLP {
  constructor(nin, nouts) {
    let sz = [nin, ...nouts];
    this.layers = [];

    for (let i = 0; i < nouts.length; i++) {
      const layer = new Layer(sz[i], sz[i + 1], i * 100 + 50);

      if (this.layers.length > 0) {
        layer.setPrevLayer(this.layers[this.layers.length - 1]);
      }

      this.layers.push(layer);
      layers.push(layer);
    }
  }

  call(x) {
    return this.layers.reduce((input, layer) => layer.call(input), x);
  }

  parameters() {
    return this.layers.flatMap((layer) => layer.parameters());
  }
  draw() {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      this.layers[i].draw();
    }
  }
}
