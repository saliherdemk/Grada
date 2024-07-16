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
        new Neuron(5, 0, this.selectedCopy.shrinked),
      );

      this.selectedCopy.neurons.forEach((neuron) => {
        neuron.show = () => {
          this.showNeurons(neuron);
        };
      });

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

  showSelected() {
    this.selectedCopy.draw();
  }

  draw() {
    this.canvas.clear();
    this.canvas.background(0, 50);

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
      layer.neurons.length,
      x,
      y - 100,
      layer.label,
      layer.act_func,
    );

    this.selectedCopy.show = () => {
      this.showLayers(this.selectedCopy);
    };

    this.selectedCopy.neurons.forEach((neuron) => {
      neuron.show = () => {
        this.showNeurons(neuron);
      };
    });
  }

  showInfoBox(layer) {
    let cnv = this.canvas;
    cnv.fill(0);
    cnv.textSize(18);
    cnv.textAlign(CENTER, TOP);

    cnv.textLeading(7);
    cnv.text(`.\n.\n.`, layer.x, layer.infoBoxY + 10, 50, 100);

    cnv.textAlign(CENTER, CENTER);
    cnv.text(
      layer.neurons.length - layer.shownNeuronsNum,
      layer.x,
      layer.infoBoxY + 15,
      50,
      100,
    );
    cnv.textAlign(CENTER, BOTTOM);

    cnv.textLeading(7);
    cnv.text(`.\n.\n.`, layer.x, layer.infoBoxY, 50, 120);
  }

  showLayers(layer) {
    let cnv = this.canvas;
    cnv.fill(255);
    cnv.rect(layer.x, layer.y, 50, layer.h);
    cnv.fill(0);
    cnv.text(layer.label, layer.x, layer.y - 10);
    cnv.fill(255);

    layer.shrinked && this.showInfoBox(layer);
  }

  showNeurons(neuron) {
    let cnv = this.canvas;
    cnv.fill(255);
    cnv.circle(neuron.x, neuron.y, 25, 25);
    cnv.fill(0);
    cnv.text(neuron.output?.data.toFixed(2), neuron.x + 30, neuron.y);
    cnv.text(neuron.output?.grad.toFixed(2), neuron.x + 30, neuron.y + 25);
    fill(255);
  }

  disable() {
    this.enabled = false;
    this.selected = null;
    this.selectedCopy = null;
  }

  enable() {
    this.enabled = true;
  }
}
