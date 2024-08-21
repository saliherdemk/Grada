// Global variables
let CENTER;
let PI;
let QUARTER_PI;
let HALF_PI;
let TWO_PI;
let MOVE;
let WAIT;
let HAND;

let atan2;
let dist;
let cos;
let sin;
let textWidth;
let cursor;

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
    PI = p.PI;
    QUARTER_PI = p.QUARTER_PI;
    HALF_PI = p.HALF_PI;
    TWO_PI = p.TWO_PI;
    MOVE = p.MOVE;
    WAIT = p.WAIT;
    HAND = p.HAND;

    atan2 = (y, x) => p.atan2(y, x);
    dist = (x1, y1, x2, y2) => p.dist(x1, y1, x2, y2);
    cos = (angle) => p.cos(angle);
    sin = (angle) => p.sin(angle);
    textWidth = (text) => p.textWidth(text);
    cursor = (type) => p.cursor(type);
  }
}
