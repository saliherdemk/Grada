class InputLayer extends IOLayer {
  constructor(name, data) {
    super(name, data, 300, 300, true);
    this.initializeDot();
    this.reInitializeNeurons();
  }

  initializeDot() {
    this.outputDot = new Dot(this, true);
  }

  dataCommands() {
    let commands = [];
    this.data.forEach((row, i) => {
      row.forEach((val, j) => {
        const a = this.createColCommand(val, i * 50, j * 50);
        commands.push(a);
      });
    });
    return commands;
  }

  outerCommands() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10, 10] },
      {
        func: "text",
        args: [this.name + " Input", this.x + 5, this.y - 20, this.w, this.h],
      },
      {
        func: "line",
        args: [this.x + 50, this.y + 15, this.x + 50, this.y + this.h - 15],
      },
    ];
    return commands;
  }
}
