class ThemeManager {
  constructor() {}

  getColor(themeColor) {
    return this.getTheme(themeColor).defaultColor;
  }

  getTheme(themeColor) {
    let defaultColor;
    let activeColor;

    switch (themeColor) {
      case "blue":
        activeColor = [0, 86, 179];
        defaultColor = [0, 123, 255];
        break;
      case "red":
        activeColor = [199, 44, 72];
        defaultColor = [244, 63, 94];
        break;
      case "cyan":
        activeColor = [5, 156, 176];
        defaultColor = [6, 182, 212];
        break;
      case "yellow":
        activeColor = [200, 155, 19];
        defaultColor = [250, 204, 21];
        break;
      case "green":
        activeColor = [60, 141, 96];
        defaultColor = [74, 222, 128];
        break;
      case "white":
        activeColor = [255, 255, 255];
        defaultColor = [230, 230, 230];
        break;
      case "gray":
        activeColor = [107, 114, 128];
        defaultColor = [74, 74, 74];
        break;
      case "sky":
        activeColor = [74, 144, 226];
        defaultColor = [28, 100, 242];
        break;
      default:
        activeColor = [0, 0, 0];
        defaultColor = [0, 0, 0];
        break;
    }
    return { defaultColor, activeColor };
  }
}
