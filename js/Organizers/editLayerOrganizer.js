class EditLayerOrganizer extends EditOrganizer {
  constructor() {
    super();
    this.selectedCopy = null;
    this.shrank = false;
    this.w = 500; // make this responsive to parent element
    this.h = 500;
    this.eventManager = new EventManager(this);
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

  placeSelected() {
    const layer = this.selectedCopy;
    const x = (this.w - layer.w) / 2;
    const y = 100;
    layer.setCoordinates(x, y);
    layer.updateNeuronsCoordinates();
  }

  setLayout() {
    this.placeSelected();
  }

  setup() {
    this.setLayout();
    // Adjusts inputs properties based on selectedLayer
    this.toggleShrink();
    setElementProperties("set-neuron-num", {
      value: this.selectedCopy.getNeuronNum(),
    });

    setElementProperties("label-input", { value: this.selectedCopy.label });
    this.eventManager.setMaxShownNeuronInput();
  }

  update() {
    const original = this.selected;
    const copy = this.selectedCopy;
    this.copyNeurons(copy, original);
    this.shrank ? original.shrink() : original.expand();
    original.setLabel(copy.label);
    original.setShownNeuronsNum(copy.getShownNeuronsNum());
    original.reconnectNeurons();
  }

  disable() {
    this.selected = null;
    this.selectedCopy.destroy();
    this.selectedCopy = null;
    this.shrank = false;
    this.enabled = false;
    closeEditLayer();
  }

  copyNeurons(from, to) {
    const diff = from.getNeuronNum() - to.getNeuronNum();

    for (let i = 0; i < Math.abs(diff); i++) {
      diff > 0 ? to.pushNeuron() : to.popNeuron();
    }
  }

  enable(layer) {
    openEditLayer();
    this.selected = layer;
    const copy = new HiddenLayer(0, 0, true);
    this.copyNeurons(layer, copy);
    copy.setLabel(layer.label);
    this.shrank = !layer.isShrank(); // will call toggleShrink. I wanted to use same function
    this.selectedCopy = copy;
    this.eventManager.setShownNeuronsNum(layer.getShownNeuronsNum());
    this.enabled = true;
    this.setup();
  }

  draw() {
    if (!this.enabled || !this.selectedCopy) return;

    const commands = [
      { func: "background", args: [255] },
      { func: "fill", args: [255] },
    ];
    executeDrawingCommands(commands);

    this.selectedCopy.draw();
  }
}
