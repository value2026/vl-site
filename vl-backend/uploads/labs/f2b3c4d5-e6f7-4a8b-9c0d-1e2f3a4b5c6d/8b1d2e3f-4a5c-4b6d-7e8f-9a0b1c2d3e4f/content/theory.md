<script>
  MathJax = {
    chtml: { displayAlign: 'left', displayIndent: '0' },
    svg: { displayAlign: 'left', displayIndent: '0' },
    tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
  };
</script>
<style>
  mjx-container[display="true"], 
  .katex-display,
  .katex-display > .katex,
  .katex-display .katex {
    text-align: left !important;
    margin-left: 0 !important;
    padding-left: 0 !important;
    display: block !important;
  }
</style>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

#### Quantum State

A quantum state is a mathematical description of a quantum system. It represents all possible information about the system. In a qubit (quantum bit), the state can be represented as:

$$
|\psi\rangle = \alpha|0\rangle + \beta|1\rangle
$$

where $\alpha$ and $\beta$ are complex amplitudes with the normalization condition:

$$
|\alpha|^2 + |\beta|^2 = 1
$$

- $|0\rangle \text{ and } |1\rangle$: Basis states (computational basis)
- $|\alpha|^2$: Probability of measuring state $|0\rangle$
- $|\beta|^2$: Probability of measuring state $|1\rangle$



#### Measurement Postulate

Measurement is a fundamental operation in quantum mechanics. When we measure a quantum state:

1. The quantum state **collapses** to one of the basis states  
2. The outcome is **probabilistic** based on the amplitudes  
3. After measurement, the state is in the measured eigenstate  
4. **Repeated measurements** on the same prepared state yield the same result (no further collapse)  



#### Measurement Basis

A measurement basis is a set of orthogonal quantum states used to measure a quantum system. Common bases include:

- **Computational (Z) Basis**:

$$
\{|0\rangle,\ |1\rangle\}
$$

- **Hadamard (X) Basis**:

$$
\{|+\rangle,\ |-\rangle\}
$$

where

$$
|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)
$$

$$
|-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)
$$

- **Y Basis**: Related to phase information  

#### Mixed States

So far, we have described quantum systems using **pure states**, where the system is in a well-defined quantum state vector $|\psi\rangle$.

However, in many practical scenarios, a system may not be in a single pure state but rather in a **statistical mixture of different states**. Such systems are described using a **density matrix** $\rho$.

A mixed state is written as:

$$
\rho = \sum_i p_i |\psi_i\rangle \langle \psi_i|
$$

where:
- $p_i$ are classical probabilities ($\sum p_i = 1$)
- $|\psi_i\rangle$ are quantum states

Measurement probabilities are then computed as:

$$
P(k) = \text{Tr}(\rho \, |k\rangle \langle k|)
$$

Mixed states arise due to:
- Noise in quantum systems  
- Lack of complete information  
- Interaction with environment  

This provides a more general framework than pure state representation.
#### Generalized Measurement (POVM)

The measurement described earlier assumes **projective measurements**, where outcomes correspond directly to orthogonal basis states.

A more general framework is given by **Positive Operator-Valued Measures (POVMs)**.

A POVM consists of a set of measurement operators $\{E_i\}$ such that:

$$
E_i \geq 0, \quad \sum_i E_i = I
$$

The probability of obtaining outcome $i$ is:

$$
P(i) = \text{Tr}(\rho E_i)
$$

Key differences from projective measurement:

- POVMs are more general and flexible  
- They can describe noisy or partial measurements  
- They are widely used in quantum information and experiments  

Projective measurement is a **special case** of POVM.

#### Superposition

Superposition is a fundamental principle where a quantum system can exist in multiple states simultaneously until it is measured. Unlike classical bits, qubits can be in a linear combination of basis states.



#### Wave Function Collapse

When a measurement is performed:

- The quantum system's wave function "collapses" from a superposition to a definite state  
- The outcome depends on the measurement basis chosen  
- The result is non-deterministic but follows probabilistic rules given by Born's rule  



#### Measurement Statistics

**Key Statistical Concepts:**



##### Probability Distribution

The probability of measuring state $|k\rangle$ is given by:

$$
P(k) = |\langle k|\psi\rangle|^2
$$



##### Expected Value (Expectation)

For a quantum observable $O$:

$$
\langle O \rangle = \langle \psi|O|\psi \rangle
$$



##### Variance

Measures the spread of measurement outcomes:

$$
\text{Var}(O) = \langle O^2 \rangle - \langle O \rangle^2
$$



##### Standard Deviation

$$
\sigma = \sqrt{\text{Var}(O)}
$$





#### Key Takeaways

1. **Measurement Collapses Superposition**: A quantum state in superposition collapses to a definite state upon measurement  
2. **Probabilistic Nature**: Individual measurements are random, but statistical patterns emerge over many trials  
3. **Basis Dependency**: Measurement outcomes depend on the chosen basis  
4. **Born Rule**: Probability of outcome is proportional to squared amplitude  
5. **Simulation Importance**: Repeated measurements in simulations reveal quantum probability distributions  
6. **Statistics from Ensembles**: Understanding quantum mechanics requires analyzing statistical data from many measurement runs  