<script>
  MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
  };
</script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

#### 1. Introduction

Quantum computing harnesses the principles of quantum mechanics to process information in fundamentally different ways than classical computers. Unlike classical computation, where operations are performed on bits using logical gates, quantum computation operates on **qubits** using **quantum gates**, which are reversible linear transformations.

Quantum gates are the fundamental building blocks of quantum circuits. Each gate is represented mathematically by a **unitary matrix**, and it transforms the state of qubits through matrix operations. By applying a sequence of such gates, a quantum system evolves from an initial state to a final state, where useful information can be extracted through measurement.

Basic quantum gates such as **Pauli gates (X, Y, Z)**, the **Hadamard gate**, and **phase gates** perform simple operations like flipping states, creating superpositions, and introducing phase shifts. When combined in a circuit, these gates can generate complex quantum phenomena such as **interference** and **entanglement**, which are essential for quantum algorithms.

For example, applying a Hadamard gate creates a superposition, while combining it with a **CNOT gate** can produce entangled states like Bell states. These gate operations form the foundation of more advanced quantum circuits used in algorithms such as search, optimization, and factorization.

#### 2. Quantum Bits (Qubits)

Unlike classical bits that are either 0 or 1, quantum bits (qubits) can exist in a **superposition** of both states simultaneously.

##### 2.1 Quantum State Representation

A single qubit state is represented as a vector in a 2-dimensional complex Hilbert space:

$$
|\psi\rangle = \alpha|0\rangle + \beta|1\rangle
$$

Where:

- $|0\rangle = \begin{bmatrix}1 & 0\end{bmatrix}$ (computational basis state 0)
- $|1\rangle = \begin{bmatrix}0 & 1\end{bmatrix}$ (computational basis state 1)
- $\alpha, \beta \in \mathbb{C}$ are complex amplitudes
- $|\alpha|^2 + |\beta|^2 = 1$

The probability of measuring state $|0\rangle$ is $|\alpha|^2$ and state $|1\rangle$ is $|\beta|^2$.

##### 2.2 Multi-Qubit Systems

For a system of $n$ qubits, the state vector lives in a $2^n$-dimensional Hilbert space:

$$
|\psi\rangle = \sum_{i=0}^{2^n-1} c_i|i\rangle
$$

With normalization:

$$
\sum_{i=0}^{2^n-1} |c_i|^2 = 1
$$

#### 3. Quantum Gates as Unitary Matrices

Quantum gates are linear operators that evolve quantum states. They are represented by **unitary matrices**:

$$
U^\dagger U = U U^\dagger = I
$$

Where $$U^\dagger$$ is the complex conjugate transpose (adjoint), and $$I$$ is the identity matrix.

##### Properties of Unitary Operations:

- **Reversibility**: Quantum operations are reversible
- **Determinism**: They are deterministic (unlike measurement)
- **Probability Conservation**: They preserve the normalization of quantum states

#### 4. Common Quantum Gates

##### 4.1 Single-Qubit Gates

###### Pauli Gates

**Pauli-X (NOT gate)**:

$$
X =
\begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}
$$

Flips $|0\rangle \rightarrow |1\rangle$ and $|1\rangle \rightarrow |0\rangle$

**Pauli-Y**:

$$
Y =
\begin{bmatrix}
0 & -i \\
i & 0
\end{bmatrix}
$$

**Pauli-Z**:

$$
Z =
\begin{bmatrix}
1 & 0 \\
0 & -1
\end{bmatrix}
$$

Applies a phase of -1 to $|1\rangle$

###### Hadamard Gate

$$
H = \frac{1}{\sqrt{2}}
\begin{bmatrix}
1 & 1 \\
1 & -1
\end{bmatrix}
$$

Creates superposition:

$$
H|0\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)
$$

###### Phase Gates

$$
S =
\begin{bmatrix}
1 & 0 \\
0 & i
\end{bmatrix}
$$

$$
T =
\begin{bmatrix}
1 & 0 \\
0 & e^{i\pi/4}
\end{bmatrix}
$$

##### 4.2 Two-Qubit Gates

###### CNOT (Controlled-NOT) Gate

$$
\text{CNOT} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 0 & 1 \\
0 & 0 & 1 & 0
\end{bmatrix}
$$

The CNOT gate flips the target qubit if the control qubit is $|1\rangle$.

###### SWAP Gate

$$
\text{SWAP} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

Exchanges the states of two qubits.


#### 5. Quantum Circuits

A quantum circuit is a sequence of quantum gates applied to qubits in a specific order. Circuit diagrams show:

- **Horizontal lines** represent qubits
- **Boxes** represent quantum gates
- **Reading left to right** shows the temporal order of operations
##### Circuit States Evolution

For a circuit with gates $U_1, U_2, \dots, U_n$ applied sequentially to initial state $|\psi_0\rangle$:

$$
|\psi_f\rangle = U_n \cdots U_2 U_1 |\psi_0\rangle
$$
The transformation is computed by matrix multiplication.
#### 6. Bell States (Two-Qubit Entanglement)
Bell states are maximally entangled two-qubit states. They form an orthonormal basis and cannot be factored into individual qubit states.

##### The Four Bell States:
$$
|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)
$$

$$
|\Phi^-\rangle = \frac{1}{\sqrt{2}}(|00\rangle - |11\rangle)
$$

$$
|\Psi^+\rangle = \frac{1}{\sqrt{2}}(|01\rangle + |10\rangle)
$$

$$
|\Psi^-\rangle = \frac{1}{\sqrt{2}}(|01\rangle - |10\rangle)
$$


##### Bell State Preparation (Bell Pair Circuit)

To create the Bell state $|\Phi^+\rangle$:

1. Initialize two qubits to $|00\rangle$
2. Apply Hadamard gate to first qubit: $H|00\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |10\rangle)$
3. Apply CNOT gate with first qubit as control: $CNOT \cdot H|00\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle) = |\Phi^+\rangle$

##### Mathematical Representation:

State vector representation:

$$
|\Phi^+\rangle = 
\begin{bmatrix}
1/\sqrt{2} \\
0 \\
0 \\
1/\sqrt{2}
\end{bmatrix}
$$

(In basis ordering $|00\rangle, |01\rangle, |10\rangle, |11\rangle$)

#### 7. GHZ State (Three-Qubit Entanglement)


The GHZ state is a three-qubit entangled state with interesting properties.

##### GHZ State Definition:
$$
|GHZ\rangle = \frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)
$$
##### GHZ State Preparation Circuit:

1. Initialize three qubits to $|000\rangle$
2. Apply Hadamard to first qubit: $H|000\rangle = \frac{1}{\sqrt{2}}(|000\rangle + |100\rangle)$
3. Apply CNOT (control: qubit 1, target: qubit 2): Creates $\frac{1}{\sqrt{2}}(|000\rangle + |110\rangle)$
4. Apply CNOT (control: qubit 1, target: qubit 3): Creates $|GHZ\rangle = \frac{1}{\sqrt{2}}(|000\rangle + |111\rangle)$

##### Properties:

- **Three-qubit correlations**: Measuring all three qubits always gives either all 0s or all 1s
- **Perfect correlations**: GHZ state demonstrates perfect multi-partite correlation
- **Basis ordering**: $|000\rangle, |001\rangle, |010\rangle, |011\rangle, |100\rangle, |101\rangle, |110\rangle, |111\rangle$

#### 8. Quantum State Measurement

Measurement collapses a quantum state to a classical outcome according to the Born rule.

##### Born Rule:

For a state $|\psi\rangle = \sum_i c_i|i\rangle$ measured in the computational basis:

- **Probability** of obtaining outcome i: $P(i) = |c_i|^2$
- **State collapse**: Upon measurement of outcome i, state becomes $|i\rangle$

##### State Vector Visualization:

For a qubit state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$:

- Plot amplitudes $\alpha$ and $\beta$ as complex numbers
- Magnitude represents amplitude strength
- Phase represents phase relationship

##### Measurement Outcomes:

For Bell state $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$:

- Probability of measuring $|00\rangle$: $|\frac{1}{\sqrt{2}}|^2 = 0.5$ or $50\%$
- Probability of measuring $|11\rangle$: $|\frac{1}{\sqrt{2}}|^2 = 0.5$ or $50\%$
- Probability of measuring $|01\rangle$ or $|10\rangle$: $0\%$

#### 9. Matrix Decomposition of Quantum Gates

Complex quantum gates can be decomposed into simpler, fundamental gates. This is important for implementation on real quantum hardware.

##### 9.1 Universal Gate Sets

A set of quantum gates is **universal** if any quantum operation can be approximated arbitrarily closely using only gates from this set.

Common universal gate sets include:
$$
U = e^{i\alpha}
\begin{bmatrix}
e^{-i\beta/2}\cos(\gamma/2) & -e^{-i\delta/2}\sin(\gamma/2) \\
e^{i\delta/2}\sin(\gamma/2) & e^{i\beta/2}\cos(\gamma/2)
\end{bmatrix}
$$

##### 9.2 Basis Decomposition Example

Any single-qubit unitary can be decomposed as:

$$
U = e^{i\alpha}
\begin{bmatrix}
e^{-i\beta/2}\cos(\gamma/2) & -e^{-i\delta/2}\sin(\gamma/2) \\
e^{i\delta/2}\sin(\gamma/2) & e^{i\beta/2}\cos(\gamma/2)
\end{bmatrix}
$$

This is known as the **Euler decomposition** for single-qubit rotations.

##### 9.3 Circuit Optimization

Gate decomposition allows:

- **Hardware mapping**: Expressing gates in terms of available hardware gates
- **Circuit depth reduction**: Minimizing circuit length
- **Error mitigation**: Using noise-resilient gate sequences

#### 10. Quantum Circuit Simulation

##### 10.1 State Vector Simulation

In this simulation, we track the full quantum state vector through each gate application:

1. **Initialize**: State vector for $n$ qubits is length $2^n$
2. **Apply gates**: Multiply by unitary matrix of each gate
3. **Normalize**: Ensure state remains normalized after operations
4. **Measure**: Sample from probability distribution $|c_i|^2$ for each basis state

##### 10.2 Single Qubit Rotation Gates

General rotations around axis $\hat{n} = (n_x, n_y, n_z)$ by angle $\theta$:
$$
R_{\hat{n}}(\theta) =
\cos(\theta/2)I - i\sin(\theta/2)(n_x X + n_y Y + n_z Z)
$$

##### 10.3 Bloch Sphere Representation

For visualizing single-qubit states:

- **Point on sphere** represents qubit state
- **North pole** ($\uparrow$) represents $|0\rangle$
- **South pole** ($\downarrow$) represents $|1\rangle$
- **Equator** represents equal superposition states

#### 11. Practical Applications

##### 11.1 Quantum Superposition

Bell states demonstrate:

- **Entanglement**: Qubits correlated in a way impossible classically
- **Non-locality**: Measurement on one qubit affects the other
- **Quantum teleportation**: Transmit unknown quantum state using Bell pairs

##### 11.2 Quantum Algorithms

These gate operations form the basis of quantum algorithms:

- **Deutsch-Jozsa Algorithm**: Uses superposition and phase kickback
- **Grover's Search**: Uses amplitude amplification via controlled gates
- **Shor's Algorithm**: Factoring using quantum phase estimation
