class HiddenLayer extends FunctionalLayerView {
  constructor(x, y) {
    super(x, y, 55, 0);
    this.origin = null;
    this.actFunc = "tanh";
    this.initialize();
  }

  clearOrigin() {
    this.neurons.forEach((n) => n.clearOrigin());
    this.origin = null;
  }

  setOrigin(obj) {
    // Thanks to MLP class, we can't get rid of this mess. There is no input layer in original MLP class and all weights belongs to target neurons. Too much work to change. Maybe later.
    const { prev } = this.parent.getPrevAndNext(this);
    for (let i = 0; i < this.neurons.length; i++) {
      for (let j = 0; j < prev.neurons.length; j++) {
        this.neurons[i].setOrigin(obj.neurons[i]);
        prev.neurons[j].lines[i].setOrigin(obj.neurons[i].w[j]);
      }
    }
    this.origin = obj;
  }

  destroy() {
    super.destroy();
  }
}
