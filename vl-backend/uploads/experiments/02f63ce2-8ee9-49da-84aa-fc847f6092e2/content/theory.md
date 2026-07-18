<script>
  MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']]
    }
  };
</script>
<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

#### Quantum Job Scheduling Using Variational Quantum Optimization

In many real-world systems such as manufacturing pipelines, cloud computing workflows, and task scheduling in distributed systems, multiple jobs must be executed while respecting constraints such as machine availability and task dependencies. Finding the optimal ordering of jobs that satisfies all constraints while minimizing total completion time is a **combinatorial optimization problem**.

Quantum computing offers new approaches for solving such optimization problems by representing possible solutions as **quantum states** and searching for the optimal configuration using quantum algorithms. One commonly used technique for this type of problem is the **Variational Quantum Eigensolver (VQE)**, which combines quantum circuits with classical optimization.



#### Job Representation Using Qubits

In this experiment, each job in the schedule is represented by a **qubit**.

A qubit is the fundamental unit of quantum information and can exist in a superposition of states. By assigning one qubit to each job, the quantum system can represent many possible scheduling configurations simultaneously.

This approach follows the mapping:

**1 Job = 1 Qubit**

If there are $N$ jobs, the quantum system uses $N$ qubits, allowing it to represent up to: $2^N$ possible scheduling configurations.

This exponential representation allows quantum systems to explore a large solution space more efficiently than classical brute-force methods.



#### Encoding Scheduling Constraints

Real scheduling problems include constraints such as:

- One task must finish before another begins
- Certain jobs must run on specific machines
- Jobs cannot overlap on the same machine

Instead of solving constraints directly, quantum optimization converts them into **penalty terms** in an energy function called the **Hamiltonian**.

Each rule contributes a penalty term that increases the energy when the rule is violated.

For example:

Frontend Dev must finish before Cloud Engineer.

This constraint is encoded using a Hamiltonian term such as:

$$
H = c \cdot Z_i Z_j
$$

Where:

- $c$ represents the penalty weight of the rule  

- $Z_i \text{ and } Z_j$ are Pauli-Z operators acting on the qubits representing jobs $i \text{ and } j$

Interpretation:

- Correct order → low energy
- Incorrect order → higher energy penalty

The goal of the optimization algorithm is to find the configuration with the **lowest total energy**, which corresponds to the best valid schedule.



#### The Hamiltonian Energy Function

The Hamiltonian represents the **objective function** of the scheduling problem.

It combines all penalty terms from the constraints:

$$
H = \sum_i H_i
$$

Properties of the Hamiltonian:

- Lower energy means fewer rule violations
- Higher energy means more constraint violations

Therefore, the optimization task becomes:

**Find the quantum state that minimizes the Hamiltonian energy.**

This state corresponds to the **optimal schedule**.



#### Ansatz Circuit and Parameterized Quantum Gates

To explore possible scheduling configurations, the algorithm uses a **parameterized quantum circuit**, called an **ansatz**.

The ansatz circuit prepares a quantum state using adjustable parameters.

In this experiment, each qubit receives a **rotation gate**: $R_x(\theta)$

Where:

- $R_x$ is a rotation around the X-axis of the Bloch sphere  

- $\theta$ is a tunable parameter

These parameters influence the probability distribution of scheduling outcomes. By adjusting them, the circuit explores different candidate schedules.

The ansatz therefore acts as a **search mechanism** that generates possible solutions.



#### Variational Quantum Eigensolver (VQE)

The **Variational Quantum Eigensolver (VQE)** is a hybrid quantum–classical optimization algorithm.

It works through an iterative process:

1. A parameterized quantum circuit prepares a quantum state.
2. The quantum computer evaluates the **energy of the Hamiltonian**.
3. A classical optimizer updates the circuit parameters.
4. The process repeats until the energy reaches a minimum.

The algorithm aims to find the **lowest energy eigenstate** of the Hamiltonian, which corresponds to the optimal solution.



#### Classical Optimizer

The parameter updates in VQE are performed using a **classical optimization algorithm**.

Common optimizers include:

- COBYLA
- SPSA
- Gradient-based optimizers

These algorithms adjust the parameters $\theta$ in the ansatz circuit to minimize the Hamiltonian energy.

At each iteration, the optimizer evaluates whether the energy improves and updates the parameters accordingly.



#### Energy Minimization and Optimal Scheduling

During the optimization process, the energy value gradually decreases as the algorithm searches for better solutions.

Key observations:

- Early iterations explore many possible configurations
- Later iterations converge toward the optimal configuration
- The lowest energy state represents the best schedule that satisfies constraints

Once the optimization completes, the system outputs the **final job schedule** with the minimum energy.



#### Final Schedule Interpretation

The resulting schedule represents:

- The ordering of jobs
- Machine allocation
- Dependency satisfaction

Because constraint violations increase the Hamiltonian energy, the final solution typically represents a schedule that satisfies most or all constraints.

Thus, the quantum optimization process transforms a complex scheduling problem into an **energy minimization problem**, which is naturally suited to quantum algorithms such as VQE.



#### Significance of Quantum Optimization

Quantum optimization techniques like VQE are particularly useful for problems with large search spaces, including:

- Job scheduling
- Supply chain optimization
- Traffic routing
- Resource allocation
- Portfolio optimization

Although current quantum hardware is still limited, hybrid algorithms such as VQE provide a promising framework for solving complex optimization problems in the future.