<script>
  MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
  };
</script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

#### Introduction

Support Vector Machines (SVMs) are supervised learning algorithms used for classification and regression. The primary goal of an SVM is to find an optimal hyperplane that separates data points of different classes with the maximum margin, ensuring better generalization on unseen data.

In many real-world scenarios, datasets are not linearly separable in their original feature space. Classical SVMs address this limitation using the kernel trick, which implicitly maps data into a higher-dimensional feature space where a linear separation becomes possible. However, designing effective kernels and computing them for large or complex datasets can be computationally expensive.

With the emergence of quantum computing, there is growing interest in leveraging quantum systems to enhance machine learning models. One key idea is that quantum computers naturally operate in high-dimensional Hilbert spaces, which can be exploited for feature representation.

Quantum Support Vector Machines (QSVMs) extend classical SVMs by using quantum feature mapping and quantum kernel estimation. Instead of manually designing kernels, QSVMs use quantum circuits to encode classical data into quantum states, enabling access to richer and potentially more expressive feature spaces.



#### Quantum Support Vector Machines (QSVM)

Quantum Support Vector Machines (QSVMs) leverage quantum computing principles to enhance the classical SVM algorithm. The core idea is to use a quantum computer to map classical data into a high-dimensional quantum Hilbert space, which might uncover patterns that are difficult to find classically.

#### Quantum Feature Mapping

The most significant advantage of a QSVM is its utilization of _Quantum Feature Maps_. A quantum feature map $\phi(x)$ maps a classical data vector $x$ to a quantum state $|\Phi(x)\rangle$. This mapping is performed using a parameterized quantum circuit known as a data encoding circuit.

By encoding data into quantum states, the quantum computer naturally operates in a Hilbert space whose dimension scales exponentially with the number of qubits.

#### Quantum Kernel Estimation

The quantum kernel is the inner product of the quantum states representing two data points, $x_i$ and $x_j$:

$$ K(x_i, x_j) = |\langle\Phi(x_i)|\Phi(x_j)\rangle|^2 $$

A quantum computer can estimate this kernel by preparing the states $|\Phi(x_i)\rangle$ and $|\Phi(x_j)\rangle$, and then applying a specific quantum circuit (like a Swap Test or inversion circuit) followed by measurements. The classical SVM optimization problem then uses this quantum-evaluated kernel matrix to find the support vectors and the optimal hyperplane.

#### How it works

1.  **Dataset Selection**: We typically start with a non-linear dataset like the XOR dataset, which is a standard benchmark for non-linear classifiers.
2.  **Quantum Feature Mapping**: Choose a quantum circuit architecture (e.g., ZZFeatureMap) to encode the classical data into quantum states. The choice of feature map significantly impacts the performance of the QSVM.
3.  **Kernel Matrix Calculation**: Use the quantum simulator or hardware to calculate the kernel matrix for all pairs of training data points by measuring the fidelity between their corresponding quantum states.
4.  **Training and Classification**: Feed the computed quantum kernel matrix into a classical SVM optimization algorithm (like `scikit-learn`'s SVC) to train the model.
5.  **Visualization**: Display the decision boundaries, margins, support vectors, and evaluate the prediction accuracy to see how well the quantum-enhanced model separates the classes compared to standard classical kernels.
