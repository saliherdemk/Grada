class CanvasButton {
  constructor(imageKey, onClick) {
    this.x = 0;
    this.y = 0;
    this.w = 25;
    this.h = 25;
    this.onClick = onClick;
    this.img;
    this.changeImg(imageKey);
  }

  destroy() {
    this.onClick = null;
    this.img = null;
  }

  changeImg(imgKey) {
    this.img = organizer.getImageByKey(imgKey);
  }

  setCoordinates(x, y) {
    this.x = x;
    this.y = y;
  }

  handlePressed() {
    iManager.isHovered(this) && this.onClick();
  }

  show() {
    const commands = [
      {
        func: "image",
        args: [this.img, this.x, this.y, this.w, this.h],
      },
    ];

    executeDrawingCommands(commands);
  }

  draw() {
    this.show();
  }
}
