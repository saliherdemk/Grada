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
  }

  showSelected() {
    this.selectedCopy.draw();
  }

  draw() {
    this.canvas.fill(255);
    this.canvas.rect(this.originX, this.originY, this.w, this.h);
    this.selected && this.showSelected();
    this.enabled && image(this.canvas, 0, 0);
  }

  getSelected() {
    return this.selected;
  }

  setSelected(layer) {
    let x = this.originX + (this.w - layer.w) / 2;
    let y = this.originY;

    this.selected = layer;
    this.selectedCopy = new Layer(
      layer.nin,
      layer.nout,
      x,
      y - 100,
      layer.label,
      layer.act_func,
    );

    let cnv = this.canvas;
    this.selectedCopy.show = () => {
      let cpy = this.selectedCopy;
      cnv.fill(255);
      cnv.rect(cpy.x, cpy.y, 50, cpy.h);
      cnv.fill(0);
      cnv.text(cpy.label, cpy.x, cpy.y - 10);
      cnv.fill(255);
    };

    this.selectedCopy.neurons.forEach((neuron) => {
      neuron.show = () => {
        cnv.fill(255);
        cnv.circle(neuron.x, neuron.y, 25, 25);
        cnv.fill(0);
        cnv.text(neuron.output?.data.toFixed(2), neuron.x + 30, neuron.y);
        cnv.text(neuron.output?.grad.toFixed(2), neuron.x + 30, neuron.y + 25);
        fill(255);
      };
    });
  }

  disable() {
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
    this.canvas.clear();
  }

  enable() {
    this.canvas.background(0, 50);

    this.enabled = true;
  }
}
