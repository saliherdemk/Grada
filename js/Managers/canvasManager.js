// Global variables
let CENTER;

class CanvasManager {
  constructor(instance) {
    this.p = instance;
  }

  getInstance() {
    return this.p;
  }

  setInstance(p) {
    this.p = p;
    CENTER = p.CENTER;
  }
}
