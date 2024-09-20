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
  async call(x) {
    const batchSize = 10;
    let outs = [];

    for (let i = 0; i < this.neurons.length; i++) {
      const output = this.neurons[i].call(x);
      outs.push(output);

      if (i % batchSize === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    if (this.actFunc) {
      outs = this.actFunc(outs);
    }

    for (let i = 0; i < outs.length; i++) {
      this.neurons[i].setOutput(outs[i]);

      if (i % batchSize === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return outs;
  }

  parameters() {
    return this.neurons.flatMap((neuron) => neuron.parameters());
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
  }
}
