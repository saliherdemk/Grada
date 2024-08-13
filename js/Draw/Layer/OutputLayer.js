class OutputLayer extends IOLayer {
  constructor(name, data) {
    super(name, data, 800, 300, false);
    this.initializeDot();
    this.reInitializeNeurons();
  }

  initializeDot() {
    this.inputDot = new Dot(this);
  }

  dataCommands() {
    let commands = [];
    this.data.forEach((val, i) => {
      const a = this.createColCommand(val, (i + 1) * 50, 0);
      commands.push(a);
    });
    return commands;
  }

  outerCommands() {
    const commands = [
      { func: "rect", args: [this.x, this.y, this.w, this.h, 10, 10] },
      {
        func: "text",
        args: [this.name + " Output", this.x + 5, this.y - 20, this.w, this.h],
      },
      {
        func: "line",
        args: [
          this.x + this.w - 50,
          this.y + 15,
          this.x + this.w - 50,
          this.y + this.h - 15,
        ],
      },
    ];
    return commands;
  }
}
