class EditOrganizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.shrank = false;
    this.originX;
    this.originY;
    this.w = 500;
    this.h = 500;
    this.editPanel = getElementById("edit-panel");

    this.eventManager = new EventManager(this);
  }

  isEnabled() {
    return this.enabled;
  }

  getSelected() {
    return this.selectedCopy;
  }

  toggleShrink() {
    const btn = getElementById("toggle-shrink-btn");
    this.shrank = !this.shrank;
    btn.innerText = this.shrank ? "Shrank" : "Expanded";
    this.setInfoText();
  }

  setInfoText() {
    const layer = this.selectedCopy;
    const text = this.shrank ? layer.getShownNeuronsNum() : "all";
    getElementById("info-message").innerText = text;
  }

  getCanvas() {
    return this.canvas;
  }

  adjustOrigins() {
    this.originX = (width - 500) / 2;
    this.originY = 150;
  }

  placeSelected() {
    const layer = this.selectedCopy;
    const x = this.originX + (this.w - layer.w) / 2;
    const y = this.originY + 100;
    layer.setCoordinates(x, y);
    layer.updateNeuronsCoordinates();
  }

  setLayout() {
    this.adjustOrigins();
    this.editPanel.style.left = this.originX + "px";
    this.editPanel.style.top = this.originY + "px";
    this.editPanel.style.display = "flex";
    this.placeSelected();
  }

  setup() {
    this.setLayout();
    // Adjusts inputs properties based on selectedLayer
    this.toggleShrink();
    setElementProperties("set-neuron-num", {
      value: this.selectedCopy.getNeuronNum(),
    });
    this.eventManager.setMaxShownNeuronInput();
  }

  update() {
    const original = this.selected;
    const copy = this.selectedCopy;
    this.copyNeurons(copy, original);
    original.shrank = this.shrank;
    original.setShownNeuronsNum(copy.getShownNeuronsNum());
    original.reconnectNeurons();
  }

  disable() {
    this.enabled = false;
    this.selectedCopy.destroy();
    this.selectedCopy = null;
    this.shrank = false;
    this.editPanel.style.display = "none";
  }

  copyNeurons(from, to) {
    const diff = from.getNeuronNum() - to.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? to.pushNeuron() : to.popNeuron();
    }
  }

  enable(layer) {
    this.selected = layer;
    const copy = new HiddenLayer(0, 0, null, this.canvas);
    this.copyNeurons(layer, copy);
    this.shrank = !layer.shrank; // will call toggleShrink. I wanted to use same function
    this.selectedCopy = copy;
    this.eventManager.setShownNeuronsNum(layer.getShownNeuronsNum());
    this.enabled = true;
    this.setup();
  }

  resize() {
    this.getCanvas().resizeCanvas(windowWidth, windowHeight);
    this.setLayout();
  }

  draw() {
    if (!this.enabled || !this.selectedCopy) return;

    const commands = [
      { func: "clear", args: [] },
      { func: "background", args: [0, 50] },
      { func: "fill", args: [255] },
      {
        func: "rect",
        args: [this.originX, this.originY, this.w, this.h, 10, 10],
      },
    ];
    executeDrawingCommands(commands, this.canvas);

    this.selectedCopy.draw();
    image(this.canvas, 0, 0);
  }
}
