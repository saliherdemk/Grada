class FunctionalLayerView extends LayerView {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.inputDot = new Dot(this);
    this.outputDot = new Dot(this);
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  getPressables() {
    return [this.inputDot, this.outputDot, this.removeButton, this].filter(
      Boolean,
    );
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
    this.updateButtonCoordinates();
  }

  updateDotsCoordinates() {
    this.getDots().forEach((dot) => dot.updateCoordinates());
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  getDots() {
    let dots = [];
    this.inputDot && dots.push(this.inputDot);
    this.outputDot && dots.push(this.outputDot);
    return dots;
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

  clearOrigin() {}

  draw() {
    this.getDots().forEach((dot) => dot.draw());
    this.removeButton.draw();
    super.draw();
  }

  destroy() {
    this.removeButton.destroy();
    this.removeButton = null;

    this.getDots().forEach((dot) => dot.destroy());
    this.inputDot = null;
    this.outputDot = null;
    super.destroy();
  }
}
