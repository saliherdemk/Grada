class Layer {
  constructor(nin, nout) {
    this.nin = nin;
    this.neurons = Array.from({ length: nout }, () => new Neuron(nin));
  }

  changeNin(nin) {
    this.nin = nin;
    this.neurons = Array.from(
      { length: this.neurons.length },
      () => new Neuron(nin),
    );
  }

  addNeuron() {
    this.neurons.push(new Neuron(this.nin));
  }

  popNeuron() {
    this.neurons.pop();
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
}