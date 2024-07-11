from __future__ import annotations


class Value:
    def __init__(self, value):
        self.value = value

    def __str__(self) -> str:
        return f"Value({self.value})"

    def __add__(self, other) -> Value:
        if isinstance(other, Value):
            return Value(self.value + other.value)
        elif isinstance(other, (int, float)):
            return Value(self.value + other)
        return NotImplemented

    def __radd__(self, other) -> Value:
        return self.__add__(other)

    def __mul__(self, other) -> Value:
        if isinstance(other, Value):
            return Value(self.value * other.value)
        elif isinstance(other, (int, float)):
            return Value(self.value * other)
        return NotImplemented

    def __rmul__(self, other) -> Value:
        return self.__mul__(other)


v1 = Value(5)
v2 = Value(6)

print(v1 + 6.0 + v2)

print(v1 * 6.0 * v2)
