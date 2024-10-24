class FunctionalLayerView extends LayerView {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.inputDot = new LayerDot(this, true);
    this.outputDot = new LayerDot(this, false);
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  getPressables() {
    return [this.inputDot, this.outputDot, this.removeButton].filter(Boolean);
  }

  doubleClicked() {
    const allowed =
      iManager.checkRollout(this) && !editLayerOrganizer.getSelected();

    allowed && editLayerOrganizer.enable(this);
  }

  isComponent() {
    return this instanceof Component;
  }

  postUpdateCoordinates() {
    this.updateNeuronsCoordinates();
    this.updateDotsCoordinates();
    super.postUpdateCoordinates();
  }

  updateDotsCoordinates() {
    this.getDots().forEach((dot) => dot.updateCoordinates());
  }

  connectLayer() {
    throw new Error("This must be implemented in derived class");
  }

  handleRemove() {
    throw new Error("This must be implemented in derived class");
  }

  clearLines(targetLayer) {
    this.neurons.forEach((neuron) => neuron.removeLines());
    this.outputDot.free();
    targetLayer.inputDot.free();
  }

  draw() {
    this.getDots().forEach((dot) => dot.draw());
    this.removeButton.draw();
    super.draw();
  }

  destroy() {
    this.removeButton = null;

    this.getDots().forEach((dot) => dot.destroy());
    this.inputDot = null;
    this.outputDot = null;
    super.destroy();
  }
}
