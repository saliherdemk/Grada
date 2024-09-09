class Component extends FunctionalLayerView {
  constructor(x, y, w = 0, h = 0) {
    super(x, y, w, h);
    this.connected = null;
  }

  connectLayer(targetLayer) {
    const isEqual = this.getNeuronNum() == targetLayer.getNeuronNum();
    if (!isEqual) {
      const newLayer = new HiddenLayer(0, 0);
      newLayer.adjustNeuronNum(this.getNeuronNum());
      newLayer.connectLayer(targetLayer);
      this.connectNeurons(newLayer);
      return;
    }
    this.connectNeurons(targetLayer);
  }

  connectNeurons(targetLayer) {
    this.neurons.forEach((n1, i) => {
      n1.removeLines();
      n1.addLine(new Line(n1, targetLayer.neurons[i]));
    });
    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
    targetLayer.parent.setInputComponent(this);
    this.connected = targetLayer;
  }

  getConnected() {
    return this.connected;
  }

  clearLines() {
    super.clearLines(this.connected);
    this.connected.parent.clearInput();
    this.connected = null;
  }

  handleRemove() {
    if (this.connected) {
      this.clearLines();
      return;
    }
    this.destroy();
    mainOrganizer.removeComponent(this);
  }
}
