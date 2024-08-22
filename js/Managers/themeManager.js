class ThemeManager {
  constructor() {
    let CYAN;
    let BLUE;
    let ROSE;
    let YELLOW;
    let GREEN;
    let WHITE;
    let GRAY;
    let SKY;
  }

  getTheme(themeColor) {
    let defaultColor;
    let activeColor;

    switch (themeColor) {
      case "blue":
        defaultColor = [0, 86, 179];
        activeColor = [0, 123, 255];
        break;
      case "red":
        defaultColor = [244, 63, 94];
        activeColor = [199, 44, 72];
        break;
      case "cyan":
        defaultColor = [5, 156, 176];
        activeColor = [6, 182, 212];
        break;
      case "yellow":
        defaultColor = [200, 155, 19];
        activeColor = [250, 204, 21];
        break;
      case "green":
        defaultColor = [60, 141, 96];
        activeColor = [74, 222, 128];
        break;
      case "white":
        defaultColor = [255, 255, 255];
        activeColor = [230, 230, 230];
        break;
      case "gray":
        defaultColor = [107, 114, 128];
        activeColor = [74, 74, 74];
        break;
      case "sky":
        defaultColor = [74, 144, 226];
        activeColor = [28, 100, 242];
        break;
      default:
        defaultColor = [74, 144, 226];
        activeColor = [28, 100, 242];
        break;
    }
    return { defaultColor, activeColor };
  }
}
