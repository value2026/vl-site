### Theory 

AC bridges are often used to measure the value of unknown impedance (self/mutual inductance of inductors or capacitance of capacitors accurately). A large number of AC bridges are available and Anderson's Bridge is an AC bridge used to measure self inductance of the coil. It is a modification of Wheatstones Bridge. It enables us to measure the inductance of a coil using capacitor and resistors and does not require repeated balancing of the bridge. The connections are shown in Fig: 1.

<div style="float: right; margin-left: 20px;">
  <img src="./images/figure_conn.jpg" alt="Figure 1" style="max-width: 300px; height: auto;">
  <p style="text-align: center; font-size: smaller; font-style: italic;">Figure 1: Connection diagram</p>
</div>

<p style="text-align: justify;">The bridge is balanced by a steady current by replacing the headphone H by moving coil galvanometer and A.C source by a battery. This is done by adjusting the variable resistance, r. After a steady balance has been obtained, inductive balance is obtained by using the A.C source and headphone.</p>

<p style="text-align: justify;"><br>
The condition for balance is that the potentials at the terminals D and E are same. Then the current flowing through branch AB is I<sub>1,</sub> through branch AE and EB is I<sub>2</sub>. The current flowing through branches AD and DC is I<sub>3</sub>, while that through branch BC is I<sub>1</sub>+I<sub>2</sub>. No current flows through branch DE.</p>

#### Circuit Details
Consider the mesh ABCDA

$$I_{1}P+(I_{1}+l_{2})Q-I_{3}(jL\omega+S)-I_{3}R=0$$


$$I_{1}(P+Q)+I_{2}Q=l_{3}(S+R+jL\omega).......(1)$$

This shows that potential drop along ABC is equal to that along ADC.

Consider the mesh ABEA, there is no e.m.f.

$$I_{1}P-I_{2}r-\frac{I_{2}}{jC\omega}=0$$

$$I_{1}P-I_{2}(r+\frac{1}{jC\omega})=0............(2)$$

Consider the mesh AEDA,
$$\frac{I_{2}}{jC\omega}=I_{3}R........(3)$$

i.e. potential difference from A to E is equal to that from A to D.
From (3) we get,
$$I_{2}=jI_{3}C\omega R.........(4)$$
<p>Now substitute the value of I<sub>3</sub> from (1) in (4)</p>

$$I_{2}\left[ \frac{S+R+jL\omega}{jC\omega R}-Q \right]=I_{1}[P+Q].........(5)$$

Dividing (5) by (2)

$$\frac{I_{1}(P+Q)}{I_{1}P}=\frac{I_{2}\left[ \frac{S+R+jl\omega}{jC\omega R}-Q \right]}{I_{2}\left[ r+\frac{1}{jc\omega} \right]}$$

$$\frac{(P+Q)}{P}\left[ r+\frac{1}{jC\omega} \right]=\frac{S+R+jL\omega-jC\omega RQ}{jC\omega R}..........(6)$$

Multiply and divide by R in the L.H.S of (6) and rearrange,

$$\frac{(P+Q)R}{P}\left[ \frac{rjC\omega + 1}{jC\omega R} \right]=\frac{R+S+jL\omega-jC\omega RQ}{jC\omega R}$$

$$PR+RQ+jPrC\omega R+jQrC\omega R=PR+PS+jL\omega P-PRjC\omega Q$$

$$RQ+j(P+Q)RC\omega r=PS+j[L\omega - RC\omega Q]P..........(7)$$

Equating real parts on both sides of (7)

$$\frac{R}{S}=\frac{P}{Q}..............(8)$$

Equation (8) represents the condition for balancing of the bridge.

Equating imaginary parts on both sides of (7)

$$L=\frac{RC[Pr+Qr+PQ]}{P}...........(9)$$

Substituting 

$$S=\frac{RQ}{P}$$

From (8) and (9) gives us

$$L=C[RQ+r(R+S)]...........(10)$$

At this condition of balancing there is minimum sound in the headphone.
Further we can make P=Q

$$L=CR(P+2r)........(11)$$

The inductive reactance can be calculated by


$$X_{L}=2\pi fL..........(12)$$

#### Notes:

1. Since the impedances of the arms should be of the same order of magnitude, the approximate value of L should be determined by some other method. Then satisfying the condition,
$$Q=R\sim L\omega$$
2. Sometimes it may be impossible to obtain the balance by varying r and S. Then the formula for L with a value of RQ which satisfies formula for S may require negative value of r. If the product  CRq is greater than L, then variable resistance r will be a negative quantity. It will, therefore, not possible to obtain a balance point under such conditions.Hence it is desirable to know the value of L approximately so that CRQ is less than L. A balance is then obtained with a positive value of r.  The value of P and R should be then be adjusted  so that r is a positive quantity and a balance can be obtained by varying the value of r.
To obtain balance point a cathode ray oscilloscope can be used in place of a headphone.


### Advantages
1. Fixed capacitor is used in terms of variable capacitor.
2. The bridge is used for accurate determination of inductance in millimeter range.

### Disadvantages:
1. Bridge is more complex
2. Difficult to attain balancing condition.

