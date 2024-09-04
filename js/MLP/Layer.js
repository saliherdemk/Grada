class Layer {
  constructor(nin, nout, actFunction) {
    this.nin = nin;
    this.neurons = Array.from({ length: nout }, () => new Neuron(nin));
    this.setActFunction(actFunction);
  }

  sanitazed() {
    const neurons = this.neurons.map((n) => n.sanitazed());
    return { neurons, nin: this.nin, actFunc: this.actFunc };
  }

  setActFunction(actFunc) {
    this.actFunc = actFuncManager.getFunction(actFunc);
  }

  call(x) {
    let outs = this.neurons.map((neuron) => neuron.call(x));
    if (this.actFunc) {
      outs = this.actFunc(outs);
    }
    outs.forEach((o, i) => this.neurons[i].setOutput(o));
    return outs;
  }

  parameters() {
    return this.neurons.flatMap((neuron) => neuron.parameters());
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
  }
}
