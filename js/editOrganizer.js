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
    this.setShownNeuronContainer = getElementById("shown-neuron-container");
    this.buttonsContainer = getElementById("buttons-container");
    this.neuronNumContainer = getElementById("neuron-container");
  }

  getCanvas() {
    return this.canvas;
  }

  setLayout() {
    this.setShownNeuronContainer.style.left = this.originX + "px";
    this.setShownNeuronContainer.style.top = this.originY + "px";

    this.buttonsContainer.style.left = this.originX + "px";
    this.buttonsContainer.style.top = this.originY + 100 + "px";

    this.neuronNumContainer.style.left = this.originX + "px";
    this.neuronNumContainer.style.top = this.originY + this.h - 50 + "px";
  }

  setup() {
    let button = createButton("Click me");
    button.position(50, 50);
    button.mousePressed(() => {
      this.disable();
    });

    const layer = this.selectedCopy;
    this.setLayout();

    const properties = {
      value: layer.getShownNeuronNum(),
      max: layer.getNeuronNum().toString(),
      min: "3",
    };

    setElementProperties("set-shown-neuron", properties);

    addEventToElement("set-shown-neuron", "input", (e) => {
      const val = e.target.value;

      layer.setShownNeuronNum(val);
      setElementProperties("shown-neuron-label", { innerText: val });

      layer.expand();
      layer.shrink();
    });

    addEventToElement("shrink-btn", "click", () => layer.shrink());
    addEventToElement("expand-btn", "click", () => layer.expand());

    setElementProperties("set-neuron-num", { value: layer.getNeuronNum() });

    addEventToElement("set-neuron-num", "change", (e) => {
      const diff = e.target.value - layer.getNeuronNum();

      if (diff > 0) {
        for (let i = 0; i < diff; i++) {
          layer.addNeuron(
            new Neuron(5, 0, this.selectedCopy.isShrinked(), this.canvas),
          );
        }
      } else {
        for (let i = 0; i < -diff; i++) {
          layer.removeNeuron();
        }
      }

      layer.setShownNeuronNum(
        Math.min(layer.getNeuronNum(), layer.getShownNeuronNum()),
      );

      layer.updateNeuronsCoordinates();
      const newProperties = {
        max: layer.getNeuronNum().toString(),
        min: "3",
        value: layer.getShownNeuronNum(),
      };

      setElementProperties("set-shown-neuron", newProperties);
      setElementProperties("shown-neuron-label", {
        innerText: newProperties.value,
      });

      layer.expand();
      layer.shrink();
    });
  }

  draw() {
    if (!this.enabled) return;
    const commands = [
      { func: "clear", args: [] },
      { func: "background", args: [0, 50] },
      { func: "fill", args: [255] },
      { func: "rect", args: [this.originX, this.originY, this.w, this.h] },
    ];
    executeDrawingCommands(this.canvas, commands);

    this.selected && this.selectedCopy.draw();
    image(this.canvas, 0, 0);
  }

  getSelected() {
    return this.selected;
  }

  setSelected(layer) {
    let x = this.originX + (this.w - layer.w) / 2;
    let y = this.originY;

    this.selected = layer;
    this.selectedCopy = new Layer(
      layer.getNeuronNum(),
      x,
      y - 100,
      layer.label,
      this.canvas,
      layer.act_func,
    );
  }

  disable() {
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.editPanel.style.display = "none";
  }

  enable() {
    this.enabled = true;
    this.editPanel.style.display = "block";
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
}
