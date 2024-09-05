class ImageButton extends CanvasButton {
  constructor(imageKey, onClick) {
    super(onClick);
    this.img = null;
    this.changeImg(imageKey);
  }

  changeImg(imgKey) {
    this.img = imgKey == null ? null : mainOrganizer.getImageByKey(imgKey);
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
}
