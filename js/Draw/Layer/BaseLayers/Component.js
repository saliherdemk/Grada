class Component extends FunctionalLayerView {
  constructor(x, y, w = 0, h = 0) {
    super(x, y, w, h);
  }

  connectLayer(targetLayer) {
    if (this.getNeuronNum() !== targetLayer.getNeuronNum()) {
      const newLayer = new HiddenLayer(0, 0);
      newLayer.adjustNeuronNum(this.getNeuronNum());
      super.connectLayer(newLayer);
      newLayer.connectLayer(targetLayer);
      this.parent.resetCoordinates();
    } else {
      super.connectLayer(targetLayer);
    }
  }
}
