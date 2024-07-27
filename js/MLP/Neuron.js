class Neuron {
  constructor(inputSize) {
    this.w = Array.from(
      { length: inputSize },
      () => new Value(Math.random() * 2 - 1),
    );
    this.b = new Value(Math.random() * 2 - 1);
    this.act_func = ActivationFunction.TANH;
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
}
