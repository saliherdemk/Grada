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

  async call(x, setOutput = false) {
    let outs = [];

    for (const neuron of this.neurons) {
      const output = await neuron.call(x);
      outs.push(output);

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (this.actFunc) {
      outs = this.actFunc(outs);
    }

    setOutput && outs.forEach((o, i) => this.neurons[i].setOutput(o));

    return outs;
  }

  parameters() {
    return this.neurons.flatMap((neuron) => neuron.parameters());
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
  }
}
