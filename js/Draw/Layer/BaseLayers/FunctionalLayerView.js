class FunctionalLayerView extends LayerView {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.parent = null;
    this.removeButton;
    this.inputDot = null;
    this.outputDot = null;
    this.editMode = true;
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
    const inactive = this instanceof IOLayer || this instanceof DigitInputGrid;
    this.parent = new MlpView(inactive);
    const parent = this.parent;
    parent.pushLayer(this);
    mainOrganizer.addMlpView(parent);
  }

  initializeNeurons() {
    const numOfNeurons = parseInt(Math.random() * 7) + 1;
    for (let i = 0; i < numOfNeurons; i++) {
      this.pushNeuron();
    }

    this.setShownNeuronsNum(this.getNeuronNum());
  }

  adjustNeuronNum(neuronNum) {
    const diff = neuronNum - this.getNeuronNum();
    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? this.pushNeuron() : this.popNeuron();
    }
    this.getNeuronNum() > 4 ? this.shrink() : this.expand();
    this.setShownNeuronsNum(Math.min(this.getNeuronNum(), 4));
    this.postUpdateCoordinates();
  }

  setCoordinates(x, y) {
    super.setCoordinates(x, y);
    this.postUpdateCoordinates();
  }

  pressed() {
    iManager.checkRollout(this);
    this.getDots().forEach((dot) => dot?.handlePressed());
    this.removeButton.handlePressed();
  }

  doubleClicked() {
    const allowed =
      iManager.checkRollout(this) &&
      this.isEditModeOpen() &&
      !editLayerOrganizer.getSelected();

    allowed && editLayerOrganizer.enable(this);
  }

  getLayerPosition() {
    const { prev, next } = this.parent.getPrevAndNext(this);
    return {
      isFirst: prev instanceof Component || prev == null,
      isLast: next instanceof Component || next == null,
    };
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    const { isFirst, isLast } = this.getLayerPosition();
    const func = this.editMode ? "visible" : "hide";
    this.getDots().forEach((d) => d?.[func]());
    this.removeButton[func]();

    if (isFirst) this.inputDot.visible();
    if (isLast) this.outputDot.visible();
  }

  postUpdateCoordinates() {
    this.updateNeuronsCoordinates();
    this.updateDotsCoordinates();
    this.parent.updateBorders();
    this.updateButtonCoordinates();
  }

  updateDotsCoordinates() {
    this.getDots().forEach((dot) => dot?.updateCoordinates());
  }

  updateButtonCoordinates() {
    const button = this.removeButton;
    button.setCoordinates(this.x + (this.w - button.w) / 2, this.y + this.h);
  }

  connectLayer(targetLayer) {
    // FIXME remove equal condition & create middle layer automatically
    if (
      (targetLayer.parent.isInitialized() && !(this instanceof Component)) ||
      this.parent == targetLayer.parent ||
      ((this instanceof Component || targetLayer instanceof Component) &&
        targetLayer.getNeuronNum() !== this.getNeuronNum())
    )
      return;
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
    if (targetLayer instanceof Component || this instanceof Component) {
      this.neurons.forEach((n1, i) => {
        n1.removeLines();
        n1.addLine(new WeightlessLine(n1, targetLayer.neurons[i]));
      });
    } else {
      this.neurons.forEach((n1) => {
        n1.removeLines();
        targetLayer.neurons.forEach((n2) => {
          n1.addLine(new Line(n1, n2));
        });
      });
    }
    this.outputDot.occupy();
    targetLayer.inputDot.occupy();
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
    parent.updateButtons();
    newMlpView.updateButtons();
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

  clearOrigin() {}

  destroy() {
    this.parent = null;

    this.removeButton.destroy();
    this.removeButton = null;

    this.getDots().forEach((dot) => dot?.destroy());
    this.inputDot = null;
    this.outputDot = null;
    super.destroy();
  }

  draw() {
    this.getDots().forEach((dot) => dot?.draw());
    this.removeButton.draw();
    this.show();
    this.isShrank() && this.showInfoBox();

    this.neurons.forEach((neuron) => neuron.draw());
  }
}
