### Theory
<div>
MD5 (Message Digest Algorithm 5) is a widely used cryptographic hash function that produces a fixed-size 128-bit hash value from variable-length input data. This proposal outlines an educational exercise to simulate the MD5 hashing process through a web-based application, providing students with a practical understanding of how MD5 works.
</div>
This exercise serves to reinforce student understanding of MD5 hashing by allowing them to:

- Understand the core concepts of the MD5 algorithm.
- Explore the steps involved in MD5 hash generation.
- Witness the application of MD5 in practice.
- Gain insights into MD5's properties, including collision resistance.


 MD5 Algorithm Steps

1. Initialize MD5 Buffer
   A = 0x67452301
   B = 0xefcdab89
   C = 0x98badcfe
   D = 0x10325476

2. Pre-processing the Message
   - Convert the input to binary.
   - Pad the message so its length (in bits) ≡ 448 mod 512.
   - Append the original length (in bits) as a 64-bit little-endian integer.

3. Divide the Message into 512-bit Chunks
   - Each chunk is further divided into sixteen 32-bit words: M[0..15]

4. Main Loop (64 operations per chunk)
   For each 512-bit chunk:
     a. Set initial values of A, B, C, D for this chunk.
     b. For i = 0 to 63:
        - Determine function F and index g:
          If 0 ≤ i ≤ 15: F = (B & C) | ((~B) & D), g = i
          If 16 ≤ i ≤ 31: F = (D & B) | ((~D) & C), g = (5×i + 1) mod 16
          If 32 ≤ i ≤ 47: F = B ^ C ^ D, g = (3×i + 5) mod 16
          If 48 ≤ i ≤ 63: F = C ^ (B | (~D)), g = (7×i) mod 16
        - Temp = D
        - D = C
        - C = B
        - B = B + LeftRotate((A + F + K[i] + M[g]), s[i])
        - A = Temp

5. Add this chunk's hash to result so far:
   A = A + AA
   B = B + BB
   C = C + CC
   D = D + DD

6. Final Output
   - Concatenate A, B, C, D to produce final 128-bit hash (in little endian format).
