<script>
  MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
  };
</script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

#### 1. What is Integer Factorization?

Integer factorization is the process of decomposing a composite number into its prime factors.

**Example:** $15 = 3 \times 5$

For small numbers this is simple, but for very large numbers (hundreds of digits), factorization becomes computationally difficult.

Modern cryptographic systems like **RSA** rely on this classical difficulty.

Shor’s Algorithm provides a quantum solution to factor large integers efficiently.



#### 2. Why is Factorization Hard Classically?

Classical factorization algorithms include:

- Trial Division  
- Pollard’s Rho Algorithm  
- Number Field Sieve  

These methods require **exponential or sub-exponential time** for large inputs.

As the number size increases, the required computation time increases dramatically.

Quantum computing offers a **polynomial-time alternative**.



#### 3. What is Shor’s Algorithm?

Shor’s Algorithm is a quantum algorithm introduced in 1994.

It factors large integers efficiently by reducing the problem to a **period-finding problem**.

The algorithm combines:

- Quantum parallelism  
- Modular exponentiation  
- Quantum Fourier Transform (QFT)  
- Classical post-processing  
#### 4. The Reduction: Factoring to Period Finding

Shor’s key insight was that factoring is not a standalone hard problem; it can be **reduced** mathematically to the problem of finding the period of a function.

1. **Why Period Finding?**  
   Period finding is about identifying repeating patterns. In modular arithmetic, the sequence $a^x \bmod N$ eventually repeats because there are only a finite number of possible values.

2. **How Period Leads to Factors (Key Idea)**  
   If $r$ is the period, then:
   $$
   a^r \equiv 1 \pmod N
   $$

   This implies:
   $$
   a^r - 1 \equiv 0 \pmod N
   $$

   Which can be factorized as:
   $$
   (a^{r/2} - 1)(a^{r/2} + 1) \equiv 0 \pmod N
   $$

   This means that $N$ divides the product $(a^{r/2} - 1)(a^{r/2} + 1)$.  
   If neither term is a multiple of $N$, then each term must share a **non-trivial factor** with $N$.

   Therefore, we compute:
   $$
   \gcd(a^{r/2} - 1, N), \quad \gcd(a^{r/2} + 1, N)
   $$

   These values reveal the prime factors of $N$.

3. **The "Bridge" Insight**  
   The period $r$ acts as a bridge between exponential behavior and factorization. Instead of factoring $N$ directly (which is hard), we extract hidden structure from modular arithmetic and use it to recover the factors.

4. **Important Conditions**  
   - $r$ must be **even**  
   - $a^{r/2} \not\equiv -1 \pmod N$  

   If these conditions are not satisfied, the result gives trivial factors (1 or $N$), and a different value of $a$ must be chosen.

5. **Hard for Classical, Easy for Quantum**  
   Classically, finding $r$ requires checking many values of $x$, which becomes infeasible for large $N$. Quantum computers exploit superposition and interference to extract the period efficiently.

#### 5. Quantum Parallelism: Processing the Whole Pattern

Quantum parallelism is often misunderstood as simply "trying all possibilities at once." In Shor’s algorithm, it is used specifically to **encode a pattern** into a single quantum state.

- **Creating the State:** We use two registers. The first starts in a superposition of all possible inputs $|x\rangle$. When we perform modular exponentiation, we get the state:
  $\sum_{x} |x\rangle \, |a^x \bmod N\rangle$
- **The Measurement Effect:** If we were to measure the second register and see a value $y$, the first register would "collapse" into a superposition of only those $x$ values where $a^x \bmod N = y$.
  Example: If $f(x)$ repeats every 4 steps ($r=4$), and we see $y$, the first register becomes $|x_0\rangle + |x_0+4\rangle + |x_0+8\rangle + \dots$
- **Capturing the Period:** This resulting state now contains the period $r$ hidden within the spacing between the $x$ values. Quantum parallelism allows us to create this periodic "grid" across all possible inputs simultaneously.



#### 6. Quantum Fourier Transform (QFT): Reading the Spacing

The most difficult part is reading the period $r$ out of the quantum state. We cannot just "look" at the register because measurement only gives us one random $x$ value, which tells us nothing about the spacing.

- **Constructive Interference:** The QFT acts like a prism for the quantum state. It uses **interference** to cancel out all the "wrong" answers and amplify the "right" ones.
- **From Time to Frequency:** Just as a musical ear identifies a pitch by its frequency (how often waves repeat), the QFT converts the spacing $r$ in our register into a specific frequency peak. 
- **The Result:** After QFT, the register is most likely to be in a state representing a value like $k/r$. Measuring this allows us to use classical math (continued fractions) to solve for the exact integer $r$.

#### 7. Summary of the Workflow

1. **Classical Reduction:** Turn a factoring problem into a period-finding problem ($a^x \bmod N$).
2. **Quantum Parallelism:** Create a superposition of $a^x \bmod N$ for all $x$ simultaneously.
3. **Quantum Interference (QFT):** Collimate the superposition so that the period $r$ becomes measurable.
4. **Classical Post-Processing:** Use the measured $r$ to calculate $\gcd(a^{r/2} \pm 1, N)$ and find the prime factors.