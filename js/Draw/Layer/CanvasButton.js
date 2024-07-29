class CanvasButton {
  constructor(image, onClick) {
    this.x = 0;
    this.y = 0;
    this.w = 50;
    this.h = 25;
    this.onClick = onClick;
    this.rollover = false;
    this.img = image;
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

  over() {
    this.rollover = iManager.contains(mouseX, mouseY, this);
  }

  handlePressed() {
    this.over();
    this.rollover && this.onClick();
  }

  show() {
    const commands = [
      {
        func: "image",
        args: [this.img, this.x, this.y, this.w / 2, this.h],
      },
    ];

    executeDrawingCommands(this.canvas, commands);
  }

  draw() {
    this.show();
  }
}
