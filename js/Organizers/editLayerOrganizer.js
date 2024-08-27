class EditLayerOrganizer extends EditOrganizer {
  constructor() {
    super();
    this.selectedCopy = null;
    this.w = 500; // make this responsive to parent element
    this.h = 500;
    this.eventManager = new EventManager(this);
  }

  toggleShrink() {
    const copy = this.selectedCopy;
    copy.isShrank() ? copy.expand() : copy.shrink();
    this.setInfoText();
  }

  setInfoText() {
    const layer = this.selectedCopy;
    const btn = getElementById("toggle-shrink-btn");
    const text = layer.isShrank() ? layer.getShownNeuronsNum() : "all";

    btn.innerText = layer.isShrank() ? "Shrank" : "Expanded";
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
    this.setInfoText();
    setElementProperties("set-neuron-num", {
      value: this.selectedCopy.getNeuronNum(),
    });

    setElementProperties("label-input", { value: this.selectedCopy.label });
    setElementProperties("act-function-select", {
      value: this.selectedCopy.actFunc,
    });
    this.eventManager.setMaxShownNeuronInput();
    this.eventManager.setRestrictions();
  }

  enable(layer) {
    openEditLayer();
    this.selected = layer;
    this.selectedCopy = this.createCopy(layer);
    this.eventManager.setShownNeuronsNum(layer.getShownNeuronsNum());
    this.enabled = true;
    this.setup();
  }

  createCopy(layer) {
    const copy = new CopyLayer(0, 0);
    copy.copyNeurons(layer);
    layer.isShrank() ? copy.shrink() : copy.expand();
    copy.setLabel(layer.label);
    copy.setActFunc(layer.actFunc);
    return copy;
  }

  update() {
    this.selected.replace(this.selectedCopy);
  }

  disable() {
    this.selected = null;
    this.selectedCopy.destroy();
    this.selectedCopy = null;
    this.enabled = false;
    closeEditLayer();
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
