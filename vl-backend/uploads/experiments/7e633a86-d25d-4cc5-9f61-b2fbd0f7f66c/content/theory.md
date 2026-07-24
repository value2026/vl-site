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
In quantum computing, linear algebra forms the fundamental mathematical framework used to describe quantum systems and their evolution. Unlike classical computing, where information is processed using bits and logical operations, quantum computing represents information using vectors and transformations in complex vector spaces.

The state of a quantum system is represented as a vector in a complex Hilbert space, and all operations performed on this system—such as quantum gates—are modeled as matrix transformations. This means that understanding how vectors and matrices behave is essential for analyzing how quantum computations work.

Every quantum operation can be viewed as a transformation that changes the state of a qubit while preserving its physical properties, such as total probability. These transformations are represented by **unitary matrices**, which ensure that the system remains valid according to the laws of quantum mechanics.

By applying concepts such as vector representation, matrix multiplication, and tensor products, we can track how quantum states evolve through a sequence of operations. These tools allow us to model everything from simple single-qubit transformations to complex multi-qubit systems and circuits.

Thus, linear algebra is not just a supporting tool—it is the language through which quantum computation is defined and understood.


#### Qubits as Vectors

A single qubit can be represented as a two-dimensional column vector. The standard computational basis states are denoted using Dirac notation.

$$
|0\rangle = \begin{bmatrix} 1 \\ 0 \end{bmatrix}
$$

$$
|1\rangle = \begin{bmatrix} 0 \\ 1 \end{bmatrix}
$$

Any pure state of a single qubit is a linear combination (superposition) of these basis states:

$$
|\psi\rangle = \alpha |0\rangle + \beta |1\rangle
$$

Vector representation:

$$
|\psi\rangle = \begin{bmatrix} \alpha \\ \beta \end{bmatrix}
$$

where $\alpha$ and $\beta$ are complex probability amplitudes such that:

$$
|\alpha|^2 + |\beta|^2 = 1
$$



#### Quantum Gates as Matrices

Quantum logic gates manipulate qubit states. These operations are linear and can be represented using matrices. Because quantum operations must preserve total probability, these matrices must be **unitary**, meaning:

$$
U^\dagger U = I
$$

where $U^\dagger$ is the conjugate transpose of $U$

For example:

Pauli-X gate (Quantum NOT gate)

$$
X = \begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}
$$

Hadamard gate

$$
H = \frac{1}{\sqrt{2}}
\begin{bmatrix}
1 & 1 \\
1 & -1
\end{bmatrix}
$$



#### Matrix Multiplication

When a quantum gate operates on a qubit, the operation is mathematically represented by matrix-vector multiplication.

For example, applying the X gate to the basis state:

$$
X|0\rangle =
\begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}
\begin{bmatrix}
1 \\
0
\end{bmatrix}
$$

Result:

$$
\begin{bmatrix}
0 \\
1
\end{bmatrix}
= |1\rangle
$$

This shows that the X gate flips the state from $|0\rangle$ to $|1\rangle$.

When multiple quantum gates are applied sequentially, the overall operation corresponds to matrix-matrix multiplication.



#### Tensor Products (Kronecker Product)

To represent multi-qubit systems, we use the **tensor product**, denoted by ⊗.


If two qubits are in states:

$$
|u\rangle \otimes |v\rangle
$$

Example:

$$
|0\rangle \otimes |0\rangle = |00\rangle
$$

Vector representation:

$$
\begin{bmatrix}
1 \\
0
\end{bmatrix}
\otimes
\begin{bmatrix}
1 \\
0
\end{bmatrix}
=
\begin{bmatrix}
1 \\
0 \\
0 \\
0
\end{bmatrix}
$$

If gate $A$ acts on the first qubit and gate $B$ acts on the second qubit, the combined operation is:

$$
A \otimes B
$$

Tensor products allow single-qubit operations to be combined into larger multi-qubit systems.



#### Conclusion

By understanding matrix operations such as matrix multiplication and tensor products, we can predict how quantum states evolve during computation. These linear algebra operations form the mathematical foundation for quantum algorithms and quantum circuit execution.