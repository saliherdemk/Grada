class EditOrganizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.originX;
    this.originY;
    this.w = 500;
    this.h = 500;
    this.editPanel = getElementById("edit-panel");
    this.resize();
  }

  getCanvas() {
    return this.canvas;
  }

  setLayout() {
    this.editPanel.style.left = this.originX + "px";
    this.editPanel.style.top = this.originY + "px";
  }

  setup() {
    this.setLayout();

    addEventToElement("cancel-icon", "click", () => this.disable());

    const layer = this.selectedCopy;
    setElementProperties("set-neuron-num", { value: layer.getNeuronNum() });
    addEventToElement("set-neuron-num", "change", (e) => {
      const diff = e.target.value - layer.getNeuronNum();

      for (let i = 0; i < Math.abs(diff); i++) {
        diff > 0 ? layer.pushNeuron() : layer.popNeuron();
      }
    });

    addEventToElement("save-btn", "click", () => this.update());
  }

  update() {
    var original = this.getSelected();
    var copy = this.selectedCopy;
    original.origin.replace(copy.neurons.length);
    const currentSchema = schemas[0];
    currentSchema.initialize();
  }

  getSelected() {
    return this.selected;
  }

  setSelected(layer) {
    let x = this.originX + (this.w - layer.w) / 2;
    let y = this.originY + 200;

    this.selected = layer;
    this.selectedCopy = new DrawLayer(layer, this.canvas, x, y);
  }

  disable() {
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.editPanel.style.display = "none";
  }

  enable() {
    this.enabled = true;
    this.editPanel.style.display = "flex";
    this.setup();
  }

  isEnabled() {
    return this.enabled;
  }

  resize() {
    this.getCanvas().resizeCanvas(windowWidth, windowHeight);

    this.originX = (width - 500) / 2;

    this.originY = 150;
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
    executeDrawingCommands(this.canvas, commands);

    this.selectedCopy.draw();
    image(this.canvas, 0, 0);
  }
}
