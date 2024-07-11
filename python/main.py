from __future__ import annotations
import math
import random
import enum


class Value:
    def __init__(self, value, children=(), op=""):
        self.data = value
        self.children = set(children)
        self.label = ""
        self.op = op
        self.grad = 0.0
        self.backward = lambda: None

    def __str__(self) -> str:
        return f"Value({self.data})"

    def __repr__(self) -> str:
        return f"Value({self.data})"

    def __add__(self, other) -> Value:
        other = Value(other) if isinstance(other, (int, float)) else other
        output = Value(self.data + other.data, (self, other), "+")

        def _backward():
            self.grad += 1.0 * output.grad
            other.grad += 1.0 * output.grad

        output.backward = _backward
        return output

    def __radd__(self, other) -> Value:
        return self.__add__(other)

    def __mul__(self, other) -> Value:
        other = Value(other) if isinstance(other, (int, float)) else other
        output = Value(self.data * other.data, (self, other), "*")

        def _backward():
            self.grad += output.grad * other.data
            other.grad += output.grad * self.data

        output.backward = _backward
        return output

    def __rmul__(self, other) -> Value:
        return self.__mul__(other)

    def __pow__(self, other):
        other = other if isinstance(other, (int, float)) else other.data

        output = Value(self.data**other, (self,), f"**{other}")

        def _backward():
            self.grad += other * (self.data ** (other - 1)) * output.grad

        output.backward = _backward
        return output

    def __rpow__(self, other) -> Value:
        return self.__pow__(other)

    def __truediv__(self, other):
        other = Value(other) if isinstance(other, (int, float)) else other
        return self * (other**-1)

    def __rtruediv__(self, other) -> Value:
        other = Value(other) if isinstance(other, (int, float)) else other
        return other * (self**-1)

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)

    def __rsub__(self, other) -> Value:
        return self.__sub__(other)

    def exp(self):
        data = self.data
        output = Value(math.exp(data), (self,), "exp")

        def _backward():
            self.grad += output.data * output.grad

        output.backward = _backward
        return output

    def set_label(self, label):
        self.label = label

    def set_grad(self, grad):
        self.grad = grad

    def backprop(self, initial=True):
        # if initial: self.set_grad(1.0)
        # self.backward()
        # for child in self.children:
        #     child.backprop(False)

        topo = []
        visited = set()

        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v.children:
                    build_topo(child)
                topo.append(v)

        build_topo(self)
        self.set_grad(1.0)
        for node in reversed(topo):
            node.backward()


class ActivationFunction(enum.Enum):
    TANH = "tanh"
    RELU = "relu"
    SIGMOID = "sigmoid"


def tanh(x: Value) -> Value:
    e = (2 * x).exp()
    output = (e - 1) / (e + 1)

    return output


def relu(x: Value) -> Value:
    data = x.data
    output = Value(max(0, data), (x,), "relu")

    def _backward():
        x.grad += int(data > 0)

    output.backward = _backward
    return output


def sigmoid(x: Value) -> Value:
    output = 1 / (1 + (-x).exp())

    return output


def softmax(x: Value) -> Value:
    pass


activation_functions = {
    ActivationFunction.TANH: tanh,
    ActivationFunction.RELU: relu,
    ActivationFunction.SIGMOID: sigmoid,
}


class Neuron:
    def __init__(self, nin):
        self.w = [Value(random.uniform(-1, 1)) for _ in range(nin)]
        self.b = Value(random.uniform(-1, 1))
        self.act_func = ActivationFunction.TANH

    def __call__(self, x):
        # w * x + b
        act = sum(wi * xi for wi, xi in zip(self.w, x)) + self.b
        output = activation_functions[self.act_func](act)
        return output

    def parameters(self):
        return self.w + [self.b]

    def change_act_func(self, act_func):
        self.act_func = act_func


class Layer:
    def __init__(self, nin, nout, act_func=ActivationFunction.TANH):
        self.neurons = [Neuron(nin) for _ in range(nout)]
        self.act_func = act_func

    def __call__(self, x):
        outs = [n(x) for n in self.neurons]
        return outs[0] if len(outs) == 1 else outs

    def parameters(self):
        return [p for neuron in self.neurons for p in neuron.parameters()]

    def change_act_func(self, act_func):
        self.act_func = act_func
        for neuron in self.neurons:
            neuron.change_act_func(self.act_func)


class MLP:
    def __init__(self, nin, nouts):
        sz = [nin] + nouts
        self.layers = [Layer(sz[i], sz[i + 1]) for i in range(len(nouts))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]


x = [2.0, 3.0, -1.0]
m = MLP(3, [4, 4, 1])
print(m(x))
