function mixin(targetClass, ...mixins) {
  mixins.forEach((mixin) => {
    Object.getOwnPropertyNames(mixin.prototype).forEach((name) => {
      if (name !== "constructor") {
        const original = targetClass.prototype[name];
        targetClass.prototype[name] = function (...args) {
          if (original) {
            original.apply(this, args);
          }
          mixin.prototype[name].apply(this, args);
        };
      }
    });
  });
}

function executeDrawingCommands(cnv, arr) {
  const parent = cnv instanceof p5.Graphics ? cnv : window;

  for (let i = 0; i < arr.length; i++) {
    let { func, args } = arr[i];
    if (typeof parent[func] === "function") {
      parent[func](...args);
    } else {
      console.error(`Function '${func}' does not exist on canvas`);
    }
  }
}

function getElementById(el) {
  return document.getElementById(el);
}

function setElementProperties(elId, properties) {
  const el = getElementById(elId);
  for (let prop in properties) {
    el[prop] = properties[prop];
  }
}

function addEventToElement(elId, eventName, func) {
  getElementById(elId).addEventListener(eventName, func);
}
