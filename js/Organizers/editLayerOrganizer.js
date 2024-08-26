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
    this.eventManager.setMaxShownNeuronInput();
  }

  update() {
    const original = this.selected;
    const copy = this.selectedCopy;
    this.copyNeurons(copy, original);
    if (copy.isShrank()) {
      original.shrink();
      original.setShownNeuronsNum(copy.getShownNeuronsNum());
    } else {
      original.expand();
      original.setShownNeuronsNum(copy.getNeuronNum());
    }
    original.setLabel(copy.label);
    original.reconnectNeurons();
    original.postUpdateCoordinates();
  }

  disable() {
    this.selected = null;
    this.selectedCopy.destroy();
    this.selectedCopy = null;
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
    const copy = new CopyLayer(0, 0);
    this.copyNeurons(layer, copy);
    layer.isShrank() ? copy.shrink() : copy.expand();
    copy.setLabel(layer.label);
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
