class Neuron {
  constructor(nin) {
    this.w = [];
    for (let i = 0; i < nin; i++) {
      let randomValue = Math.random() * 2 - 1;
      this.w.push(new Value(randomValue));
    }
    this.b = new Value(Math.random() * 2 - 1);
    this.act_func = ActivationFunction.TANH;
    this.output = null;
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

  draw(layerX, layerY, layerW, layerH, numOfNeuron, i) {
    let x = layerX + layerW / 2;
    let y = layerY + 25 + (layerH / numOfNeuron) * i;
    circle(x, y, 25, 25);
    text(this.output?.data.toFixed(2), x + 30, y);
    text(this.output?.grad.toFixed(2), x + 30, y + 25);
  }
}

class Layer {
  constructor(nin, nout, act_func = ActivationFunction.TANH) {
    this.neurons = Array.from({ length: nout }, () => new Neuron(nin));
    this.act_func = act_func;
    this.x = 100;
    this.y = 100;
    this.w = 50;
    this.h = 200;
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

  change_x(x) {
    this.x = x;
  }

  draw() {
    rect(this.x, this.y, 50, this.h);

    this.neurons.forEach((neuron, i) =>
      neuron.draw(this.x, this.y, this.w, this.h, this.neurons.length, i),
    );
  }
}

class MLP {
  constructor(nin, nouts) {
    let sz = [nin, ...nouts];
    this.layers = [];
    for (let i = 0; i < nouts.length; i++) {
      const layer = new Layer(sz[i], sz[i + 1]);
      layer.change_x(i * 100 + 50);
      this.layers.push(layer);
    }
  }

  call(x) {
    return this.layers.reduce((input, layer) => layer.call(input), x);
  }

  parameters() {
    return this.layers.flatMap((layer) => layer.parameters());
  }
  draw() {
    this.layers.forEach((layer) => layer.draw());
  }
}
