class Layer {
  constructor(actFunction) {
    this.neurons = [];
    this.setActFunction(actFunction);
  }

  addNeuron(nin) {
    this.neurons.push(new Neuron(nin));
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
