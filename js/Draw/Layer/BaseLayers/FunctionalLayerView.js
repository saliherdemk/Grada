class FunctionalLayerView extends LayerView {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.parent = null;
    this.removeButton;
    this.inputDot = null;
    this.outputDot = null;
    this.editMode = true;
    this.initialize();
  }

  initialize() {
    this.inputDot = new Dot(this);
    this.outputDot = new Dot(this);

    this.removeButton = new ImageButton("delete", () => this.handleRemove());
    this.initializeNeurons();
    this.initializeParent();
    this.postUpdateCoordinates();
  }

  initializeParent() {
    this.parent = new MlpView();
    const parent = this.parent;
    parent.pushLayer(this);
    mainOrganizer.addMlpView(parent);
  }

  initializeNeurons() {
    const numOfNeurons = parseInt(Math.random() * 7) + 1;
    for (let i = 0; i < numOfNeurons; i++) {
      this.neurons.push(new NeuronView());
    }

    this.setShownNeuronsNum(this.getNeuronNum());
  }

  pressed() {
    iManager.checkRollout(this);
    if (!this.isEditModeOpen()) return;
    this.getDots().forEach((dot) => dot?.handlePressed());
    this.removeButton?.handlePressed();
  }

  doubleClicked() {
    const allowed =
      iManager.checkRollout(this) &&
      this.isEditModeOpen() &&
      !editLayerOrganizer.getSelected();

    allowed && editLayerOrganizer.enable(this);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  postUpdateCoordinates() {
    this.updateNeuronsCoordinates();
    this.updateDotsCoordinates();
    this.parent.updateBorders();
    this.updateButtonCoordinates();
  }

  updateDotsCoordinates() {
    this.getDots().forEach((dot) => dot.updateCoordinates());
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
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

  connectNeurons(targetLayer) {
    this.neurons.forEach((n1) => {
      n1.removeLines();
      targetLayer.neurons.forEach((n2) => {
        n1.addLine(new Line(n1, n2));
      });
    });
    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
  }

  reconnectNeurons() {
    const parent = this.parent;
    const { prev, next } = parent.getPrevAndNext(this);

    prev && prev.connectNeurons(this);
    next && this.connectNeurons(next);
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

    const newMlpView = new MlpView();
    newMlpView.setLayers(newLayers);
    newMlpView.updateBorders();
    parent.updateBorders();
    parent.checkMlpCompleted();
    mainOrganizer.addMlpView(newMlpView);
  }

  getDots() {
    return [this.inputDot, this.outputDot];
  }

  setParent(parent) {
    this.parent = parent;
  }

  handleRemove() {
    if (this.isIsolated()) {
      this.parent.destroy();
      return;
    }
    this.isolate();
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

  isEditModeOpen() {
    return this.editMode;
  }

  destroy() {
    this.parent.destroy();
    this.parent = null;

    this.removeButton.destroy();
    this.removeButton = null;

    this.getDots().forEach((dot) => dot?.destroy());
    this.inputDot = null;
    this.outputDot = null;
    super.destroy();
  }

  draw() {
    if (this.isEditModeOpen()) {
      this.getDots().forEach((dot) => dot?.draw());
      this.removeButton.draw();
    }
  }
}
