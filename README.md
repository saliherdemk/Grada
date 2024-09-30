## Grada

Grada is an interactive tool that allows you to observe real-time changes as you train a multilayer perceptron (MLP).

There are no built-in libraries like TensorFlow, PyTorch, or NumPy used here; this is an extension of Karpathy's [micrograd](https://github.com/karpathy/micrograd). All the logic can be found in the python and js/MLP folders. Since this is a scalar-valued engine, it comes with some limitations. If the parameters are too large, the time required for each step becomes too long, which means training on some datasets could take an impractical amount of time.

In the matrix branch, I am working on implementing a Tensor object to address this issue. The implementation is mostly complete, but tests are still ongoing. You can follow that branch for further optimizations.

My goal is to create an interactive, real-time training experience for a handwritten digit dataset, where you can observe the changes as they happen and feed live data into the network.

# Live Demo
Available [here](https://saliherdemk.github.io/Grada/)


<video controls>
    <source src="https://github.com/saliherdemk/Grada/blob/master/media/demo.mp4" type="video/mp4">
    Your browser does not support the video tag.
</video>
