#### 1: Data Selection
<img src="./images/Screenshot From 2026-03-10 19-10-14.png" width="100%"/>

1. Navigate to the "Data Selection" stage in the simulation.
2. Choose a dataset from the available options (e.g., Linear Dataset, Circular Dataset, Xor Dataset). 
3. Observe the "Dataset Distribution" scatter plot. The objective is to find a boundary separating the classes (green vs. red).
4. Click **Next Step**.

####  2: Classical SVM
<img src="./images/Screenshot From 2026-03-10 19-10-19.png" width="100%"/>
<img src="./images/Screenshot From 2026-03-10 19-10-24.png" width="100%"/>

1. In the "Classical SVM" stage, review the prompt. This step trains a classical Support Vector Machine using a Linear Kernel.
2. Click the **Run Classical SVM** button.
3. Once completed, view the results:
   - Identify the straight line (hyperplane) separating the classes.
   - Note the **Accuracy** (e.g., 98%).
   - Highlighted points denote the **Support Vectors** defining the margin.
4. Click **Next Step**.

####  3: Quantum Feature Map
<img src="./images/Screenshot From 2026-03-10 19-10-28.png" width="100%"/>

1. In the "Quantum Feature Map" stage, configure the map parameters to map data into a high-dimensional quantum state space:
   - **Feature Map Type:** Set to `ZZFeatureMap`.
   - **Circuit Depth (Repetitions):** Set the slider (e.g., 2).
   - **Entanglement:** Select from Linear, Full, or Circular (e.g., **Full**).
2. Observe the generated "Quantum Feature Map Circuit (ZZFeatureMap)" showing Hadamard and Phase Gates.
3. Review the "Kernel Matrix Heatmap" resulting from mapping to the quantum space.
4. Click **Next Step**.

####  4: Quantum SVM
<img src="./images/Screenshot From 2026-03-10 19-10-31.png" width="100%"/>
<img src="./images/Screenshot From 2026-03-10 19-10-36.png" width="100%"/>

1. In the "Quantum SVM" stage, read the background on how the quantum computer calculation matrix is fed to a classical SVM optimizer.

2. Click the **Run QSVM** button.

3. Once completed, view the results:
   - See the "Quantum SVM Decision Boundary", which finds a linear hyperplane in a high-dimensional quantum space, translating to a non-linear complex boundary in the 2D space.
   - Note the **Accuracy** (e.g., 99%).
4. Click **Next Step**.

####  5: Comparison
<img src="./images/Screenshot From 2026-03-10 19-10-39.png" width="100%"/>

1. Compare the Classical SVM and Quantum SVM decision boundaries side-by-side.
2. Review the accuracies (e.g., Classical 98% vs Quantum 99%).
3. Read the **Conclusion**. For linearly separable data, models perform well across the board, proving that QSVM acts properly on basic problems.
4. If needed, click **Restart** to try another dataset or configuration.