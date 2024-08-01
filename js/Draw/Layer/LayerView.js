class LayerView extends Draggable {
  constructor(x, y, w, h, parent) {
    super(x, y, w, h);
    this.parent = parent;
    this.inputDot = null;
    this.outputDot = null;
    this.removeButton;
    this.editMode = true;
    this.initializeDots();
  }

  initializeDots() {}

  initializeButton() {
    this.removeButton = new CanvasButton("delete", () => this.handleRemove());
    this.updateButtonCoordinates();
  }

  updateDotsCoordinates() {
    this.getDots().forEach((dot) => dot?.updateCoordinates());
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button?.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  handleRemove() {
    if (this.isIsolated()) {
      this.parent.destroy();
      return;
    }
    this.isolate();
  }

  getDots() {
    return [this.inputDot, this.outputDot];
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
    this.postUpdateCoordinates();
  }

  isEditModeOpen() {
    return this.editMode;
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  isIsolated() {
    return this.parent.layers.length == 1;
  }

  isolate() {
    const { prev: prevLayer, next: targetLayer } =
      this.parent.getPrevAndNext(this);

    targetLayer && this.splitMlp(targetLayer);
    prevLayer && prevLayer.splitMlp(this);
  }

  clearLines(targetLayer) {
    this.neurons.forEach((neuron) => neuron.removeLines());
    this.outputDot.free();
    targetLayer.inputDot.free();
  }

  splitMlp(targetLayer) {
    const parent = targetLayer.parent;
    const { prev, index: splitIndex } = parent.getPrevAndNext(targetLayer);
    prev.clearLines(targetLayer);

    const newLayers = parent.getLayers().splice(0, splitIndex);

    const [x, y] = [newLayers[0].x, newLayers[0].y];

    // FIXME: Don't destroy and recreate, just move -> Done but not satisfying
    const newSchema = new Schema(x, y);

    newSchema.setLayers(newLayers);
    newSchema.updateBorders();
    parent.updateBorders();
    mainOrganizer.addSchema(newSchema);
  }

  reconnectNeurons() {
    const parent = this.parent;
    const { prev, next } = parent.getPrevAndNext(this);

    prev && prev.connectNeurons(this);
    next && this.connectNeurons(next);

    this.updateButtonCoordinates();
    this.parent.updateBorders();
  }

  connectNeurons(targetLayer) {
    this.neurons.forEach((n1) => {
      n1.setLines([]);
      targetLayer.neurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
  }

  connectLayer(targetLayer) {
    if (this.parent === targetLayer.parent) return;
    if (this.outputDot.isOccupied()) {
      const { next } = this.parent.getPrevAndNext(this);
      this.splitMlp(next);
    }

    if (targetLayer.inputDot.isOccupied()) {
      this.splitMlp(targetLayer);
    }

    this.connectNeurons(targetLayer);
    targetLayer.parent.moveLayers(this.parent);
  }

  pressed() {
    this.getDots().forEach((dot) => dot?.handlePressed());
    this.removeButton?.handlePressed();
    if (iManager.checkRollout(this) && getMouseButton() == "right") {
      this.toggleEditMode();
    }
  }

  doubleClicked() {
    const allowed =
      iManager.isHovered(this) &&
      this.isEditModeOpen() &&
      !editOrganizer.getSelected();

    allowed && editOrganizer.enable(this);
  }

  destroy() {
    this.neurons.forEach((neuron) => neuron.destroy());
    this.neurons = [];
    this.getDots().forEach((dot) => dot?.destroy());
    this.inputDot = null;
    this.outputDot = null;
    this.instance = null;
    this.button?.destroy();
    this.button = null;
  }
}
