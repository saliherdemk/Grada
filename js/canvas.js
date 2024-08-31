let mainOrganizer;
let editLayerOrganizer;
let editMLPOrganizer;
let iManager;
let tableOrganizer;
let datasetOrganizer;
let themeManager;
let actFuncManager;
let errFuncManager;

let canvasManager;

let mainSketch = function (p) {
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight).parent(document.body);

    themeManager = new ThemeManager();
    canvasManager = new CanvasManager(p);
    mainOrganizer = new MainOrganizer();
    editMLPOrganizer = new EditMLPOrganizer();
    iManager = new InteractionManager();
    tableOrganizer = new TableOrganizer();
    datasetOrganizer = new DatasetOrganizer();
    actFuncManager = new ActivationFunctionManager();
    errFuncManager = new ErrorFunctionManager();
  };

  p.draw = function () {
    canvasManager.setInstance(p);
    p.background(255);

    iManager.applyTransforms();
    mainOrganizer.draw();
  };

  p.mousePressed = function () {
    !editLayerOrganizer.isEnabled() && iManager.handlePress();
  };

  p.mouseDragged = function () {
    !editLayerOrganizer.isEnabled() && iManager.handleDrag();
  };

  p.mouseReleased = function () {
    iManager.handleRelease();
  };

  // touches[0].x, touches[0].y We don't need simultaneous touches
  p.touchStarted = function () {
    p.mousePressed();
  };

  p.touchMoved = function () {
    p.mouseDragged();
  };

  p.touchEnded = function () {
    p.mouseReleased();
  };

  p.keyPressed = function () {
    const k = p.key.toLowerCase();
    if (k == "e") {
      mainOrganizer.mlpViews.forEach((mlpView) => mlpView.handleKeyPressed());
    }

    if (k == "escape") {
      editMLPOrganizer.disable();
      editLayerOrganizer.disable();
      tableOrganizer.disable();
      mainOrganizer.enable();
    }
  };

  p.doubleClicked = function () {
    iManager.handleDoubleClicked();
  };
  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.mouseWheel = function (event) {
    scaleCanvas(event, p);
  };
};

let editSketch = function (p) {
  p.setup = function () {
    p.createCanvas(500, 500).parent("canvas-parent").addClass("editCanvas");
    editLayerOrganizer = new EditLayerOrganizer();
  };

  p.draw = function () {
    canvasManager.setInstance(p);
    editLayerOrganizer.draw();
  };

  p.keyPressed = function () {
    const k = p.key.toLowerCase();
    if (k == "escape" && editLayerOrganizer.isEnabled()) {
      editLayerOrganizer.disable();
    }
  };
};

new p5(editSketch);
new p5(mainSketch);
