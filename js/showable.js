let Showable = (Base) =>
  class extends Base {
    constructor(label, canvas) {
      super(label);
      this.canvas = canvas;
    }
    show() {
      throw new Error("Method 'show' must be implemented.");
    }
  };
