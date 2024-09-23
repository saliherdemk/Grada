class Value {
  constructor(value, children = [], op = "") {
    this.data = value;
    this.children = new Set(children);
    this.op = op;
    this.grad = 0.0;
    this.backward = () => {};
  }

  getFixedData(fixedNum) {
    return this.data.toFixed(fixedNum);
  }

  getFixedGrad(fixedNum) {
    return this.grad.toFixed(fixedNum);
  }

  convert(val) {
    return val instanceof Value ? val : new Value(val);
  }

  add(other) {
    other = this.convert(other);
    let output = new Value(this.data + other.data, [this, other], "+");

    output.backward = () => {
      this.grad += 1.0 * output.grad;
      other.grad += 1.0 * output.grad;
    };

    return output;
  }

  mul(other) {
    other = this.convert(other);
    let output = new Value(this.data * other.data, [this, other], "*");

    output.backward = () => {
      this.grad += output.grad * other.data;
      other.grad += output.grad * this.data;
    };

    return output;
  }

  pow(other) {
    other = other instanceof Value ? other.data : other;
    let output = new Value(Math.pow(this.data, other), [this], "**" + other);

    output.backward = () => {
      this.grad += other * Math.pow(this.data, other - 1) * output.grad;
    };

    return output;
  }

  div(other) {
    other = this.convert(other);
    return this.mul(other.pow(-1));
  }

  neg() {
    return this.mul(-1);
  }

  sub(other) {
    other = this.convert(other);
    return this.add(other.neg());
  }

  exp() {
    let data = this.data;
    let output = new Value(Math.exp(data), [this], "exp");

    output.backward = () => {
      this.grad += output.data * output.grad;
    };

    return output;
  }

  abs() {
    let output = new Value(Math.abs(this.data), [this], "abs");

    output.backward = () => {
      this.grad += (this.data >= 0 ? 1 : -1) * output.grad;
    };

    return output;
  }

  log() {
    const clampValue = Math.max(this.data, 1e-15);
    let output = new Value(Math.log(clampValue), [this], "log"); // log(x) = ln(x)
    output.backward = () => {
      this.grad += (1 / clampValue) * output.grad;
    };
    return output;
  }

  setGrad(grad) {
    this.grad = grad;
  }

  setData(data) {
    this.data = data;
  }

  backprop() {
    let topo = [];
    let visited = new Set();

    function buildTopo(v) {
      if (!visited.has(v)) {
        visited.add(v);
        v.children.forEach((child) => {
          buildTopo(child);
        });
        topo.push(v);
      }
    }

    buildTopo(this);
    this.setGrad(1.0);
    for (let i = topo.length - 1; i >= 0; i--) {
      let node = topo[i];
      node.backward();
    }
  }

  backprop() {
    let topo = [];
    let visited = new Set();
    let stack = [this];

    while (stack.length) {
      let node = stack.pop();

      if (visited.has(node)) {
        topo.push(node);
      } else {
        visited.add(node);
        stack.push(node);
        node.children.forEach((child) => stack.push(child));
      }
    }

    this.setGrad(1.0);
    for (let i = topo.length - 1; i >= 0; i--) {
      topo[i].backward();
    }
  }
}
