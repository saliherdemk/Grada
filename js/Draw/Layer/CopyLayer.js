class CopyLayer extends LayerView {
  constructor(x, y) {
    super(x, y, 50, 0);
  }

  updateNeuronsCoordinates() {
    super.updateNeuronsCoordinates(true);
  }

  setShownNeuronsNum(shownNeuronsNum) {
    super.setShownNeuronsNum(shownNeuronsNum, 4);
  }

  draw() {
    this.show();
    this.showInfoBox();
    this.neurons.forEach((neuron) => neuron.draw());
  }
}
