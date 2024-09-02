class Component extends FunctionalLayerView {
  constructor(x, y, w = 0, h = 0) {
    super(x, y, w, h);
  }

  connectLayer(targetLayer) {
    if (this.getNeuronNum() !== targetLayer.getNeuronNum()) return;
    super.connectLayer(targetLayer);
  }

  connectNeurons(targetLayer) {
    this.neurons.forEach((n1, i) => {
      n1.removeLines();
      n1.addLine(new Line(n1, targetLayer.neurons[i]));
    });
    if (this instanceof InputLayer) {
      this.outputDot.occupy();
      targetLayer.inputDot.occupy();
      return;
    }
    this.inputDot.occupy();
    targetLayer.outputDot.occupy();
  }
}
