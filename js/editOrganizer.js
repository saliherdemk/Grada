class EditOrganizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.originX = (width - 500) / 2;
    this.originY = 150;
    this.w = 500;
    this.h = 500;
    this.setup();
  }

  setup() {
    let button = createButton("Click me");
    button.position(50, 50);
    button.mousePressed(() => {
      this.disable();
    });
    let button1 = createButton("Add neuron");
    button1.position(100, 100);
    button1.mousePressed(() => {
      this.selectedCopy.neurons.push(
        new Neuron(5, 0, this.selectedCopy.shrinked, this.canvas),
      );

      this.selectedCopy.updateNeuronsCoordinates();
    });

    let button2 = createButton("shrink");
    button2.position(200, 200);
    button2.mousePressed(() => {
      this.selectedCopy.shrink();
    });
    let button3 = createButton("expand");
    button3.position(200, 300);
    button3.mousePressed(() => {
      this.selectedCopy.expand();
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
      layer.neurons.length,
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
  }

  enable() {
    this.enabled = true;
  }

  isEnabled() {
    return this.enabled;
  }
}
