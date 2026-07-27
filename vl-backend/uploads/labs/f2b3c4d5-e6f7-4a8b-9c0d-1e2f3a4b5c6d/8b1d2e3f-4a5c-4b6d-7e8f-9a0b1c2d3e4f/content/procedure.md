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

#### Step 1: Introduction 

Read the introduction and click start simulation button to start the Quantum Measurements simulation

![Step 1](./images/qc41.png)



#### Step 2: Prepare and Choose the Quantum State

Select and prepare the quantum state to be measured (for example, the basis state shown below or a superposition state).

$$
|0\rangle
$$

![Step 2](./images/qc42.png)



#### Step 3: Choose the Measurement Basis

Select the measurement basis:

- Computational (Z) Basis

$$
\{|0\rangle,\ |1\rangle\}
$$

- Hadamard (X) Basis

$$
\{|+\rangle,\ |-\rangle\}
$$

- Apply basis rotation if needed

![Step 3](./images/qc43.png)



#### Step 4: Run Quantum Shots

Execute the quantum circuit multiple times (100–10,000 shots) and collect measurement outcomes.

![Step 4](./images/qc44.png)



#### Step 5: Analyze Results and Statistics

Generate histograms, calculate probabilities, and compare with theoretical predictions.

![Step 5](./images/qc45.png)