import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Text, Html } from "@react-three/drei";
import { useSelector } from "react-redux";
import { Box, Button, Typography, Stack } from "@mui/material";
import { BlockMath, InlineMath } from "react-katex";
import { motion, AnimatePresence } from "framer-motion";
import InfoIcon from "@mui/icons-material/Info";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import "katex/dist/katex.min.css";

// Helper for circular grid lines
const createCircle = (radius, axis = "xy", segments = 64) => {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    if (axis === "xy") points.push(new THREE.Vector3(x, y, 0));
    else if (axis === "yz") points.push(new THREE.Vector3(0, x, y));
    else if (axis === "xz") points.push(new THREE.Vector3(x, 0, y));
  }
  return points;
};

const BlochSphereCanvas = ({ x, y, z, theta, phi, basis, small }) => {
  const [showInfo, setShowInfo] = useState(false);

  const radTheta = ((theta ?? 0) * Math.PI) / 180;
  const radPhi = ((phi ?? 0) * Math.PI) / 180;

  const thetaArc = [];
  for (let t = 0; t <= radTheta; t += 0.05) {
    thetaArc.push(
      new THREE.Vector3(
        1.25 * Math.sin(t) * Math.cos(radPhi),
        1.25 * Math.sin(t) * Math.sin(radPhi),
        1.25 * Math.cos(t)
      )
    );
  }

  const phiArc = [];
  for (let p = 0; p <= radPhi; p += 0.05) {
    phiArc.push(
      new THREE.Vector3(
        1.25 * Math.sin(radTheta) * Math.cos(p),
        1.25 * Math.sin(radTheta) * Math.sin(p),
        0
      )
    );
  }

  // Collapse pulse effect inside the 3D scene
  const CollapsePulse = () => {
    const { collapsedVector } = useSelector((s) => s.quantum);
    const [pulses, setPulses] = useState([]);
    const timeRef = useRef(0);
    const [, setTick] = useState(0);

    // Add a pulse entry each time collapsedVector changes
    useEffect(() => {
      if (collapsedVector) {
        setPulses((p) => [
          ...p,
          {
            id: Date.now(),
            start: performance.now() / 1000,
            vec: {
              x: collapsedVector.x,
              y: collapsedVector.y,
              z: collapsedVector.z,
            },
          },
        ]);
      }
    }, [collapsedVector]);

    // update timeRef every frame, purge finished pulses, and force a render tick so animation frames update
    useFrame(() => {
      timeRef.current = performance.now() / 1000;
      setPulses((prev) =>
        prev.filter((pl) => timeRef.current - pl.start < 1.0)
      );
      setTick((t) => t + 1);
    });

    return (
      <group>
        {pulses.map((pl) => {
          const age = Math.max(0, timeRef.current - pl.start);
          const dur = 1.0;
          const t = Math.min(1, age / dur);
          const scale = 0.6 + t * 3.0;
          const opacity = Math.max(0, 1 - t);

          return (
            <mesh
              key={pl.id}
              position={[1.25 * pl.vec.x, 1.25 * pl.vec.y, 1.25 * pl.vec.z]}
              scale={[scale, scale, scale]}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                transparent
                opacity={opacity}
                emissive="#FFCA28"
                emissiveIntensity={0.8 * opacity}
                color="#FFCA28"
                roughness={0.2}
                metalness={0.6}
              />
            </mesh>
          );
        })}
      </group>
    );
  };

  // Theta label position: center of theta arc at θ/2, adjusted to avoid arc overlap
  const thetaLabelPos =
    radTheta < 0.087
      ? [0, 0, 1.0]
      : radTheta > 3.054
      ? [0, 0, -1.0]
      : [
          1.0 * Math.sin(radTheta / 2) * Math.cos(radPhi),
          1.0 * Math.sin(radTheta / 2) * Math.sin(radPhi),
          1.0 * Math.cos(radTheta / 2) +
            (Math.cos(radTheta / 2) >= 0 ? 0.2 : -0.2),
        ];

  // Phi label position: center of phi arc at ϕ/2
  const phiLabelPos = [
    1.125 * Math.sin(radTheta) * Math.cos(radPhi / 2),
    1.125 * Math.sin(radTheta) * Math.sin(radPhi / 2),
    0.2,
  ];

  // Info panel animation variants
  const infoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <Box sx={{ position: "relative", cursor: "grab" }}>
      {!small && (
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#ECEFF1",
            color: "#212121",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            fontSize: { xs: "0.9rem", sm: "1rem" },
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            zIndex: 10,
          }}
        >
          <AutorenewIcon sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }} />
          Drag to rotate and zoom
        </Typography>
      )}
      <Canvas
        camera={{ position: [0, 0, small ? 8 : 6.25], fov: 60 }}
        style={{
          height: "min(80vh, 700px)",
          width: "100%",
          position: "relative",
        }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0); // Transparent background
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[6.25, 6.25, 6.25]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-6.25, -6.25, -6.25]} intensity={0.4} />

        <OrbitControls enableDamping dampingFactor={0.05} enableZoom={true} />

        {!small && (
          <Html fullscreen>
            {/* Legend Panel */}
            <div
              style={{
                position: "absolute",
                top: "15px",
                right: "clamp(40px, 8vw, 50px)",
                fontSize: "14px",
                fontFamily: "monospace",
                background: "#ECEFF1",
                color: "#212121",
                padding: "10px 14px",
                borderRadius: "8px",
                boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
                maxWidth: "200px",
                boxSizing: "border-box",
                zIndex: 20, // Increased zIndex to ensure legend stays above other elements
              }}
            >
              <style>
                {`
          @media (max-width: 400px) {
            div[style*="right: clamp(40px, 8vw, 50px)"] {
              font-size: 12px;
              padding: 8px 10px;
              max-width: 160px;
            }
          }
        `}
              </style>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#FFCA28",
                    borderRadius: 3,
                  }}
                ></div>
                <span>Bloch Vector</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#7E57C2",
                    borderRadius: 3,
                  }}
                ></div>
                <span>θ (Theta)</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: "#26C6DA",
                    borderRadius: 3,
                  }}
                ></div>
                <span>ϕ (Phi)</span>
              </div>
              {basis && (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor:
                          basis === "X"
                            ? "#F44336"
                            : basis === "Y"
                            ? "#43A047"
                            : "#29B6F6",
                        borderRadius: 3,
                      }}
                    ></div>
                    <span>
                      Pauli-{basis} ({basis} Axis)
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor:
                          basis === "X"
                            ? "#C62828"
                            : basis === "Y"
                            ? "#388E3C"
                            : "#0277BD",
                        borderRadius: 3,
                      }}
                    ></div>
                    <span>⟨σ{basis}⟩</span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        backgroundColor: "#E0E7ED",
                        borderRadius: 3,
                      }}
                    ></div>
                    <span>Expectation Projection</span>
                  </div>
                </>
              )}
            </div>

            {/* Info Button */}
            <Button
              variant="contained"
              onClick={() => setShowInfo((prev) => !prev)}
              sx={{
                position: "absolute",
                top: "15px",
                left: "15px",
                bgcolor: "#1976D2",
                color: "#FFFFFF",
                borderRadius: 2,
                px: 2,
                py: 0.5,
                textTransform: "none",
                fontWeight: "medium",
                "&:hover": {
                  bgcolor: "#D81B60",
                  transform: "scale(1.05)",
                  transition: "all 0.2s ease",
                },
                zIndex: 20, // Increased zIndex to ensure button stays above other elements
              }}
            >
              <InfoIcon sx={{ mr: 0.5, fontSize: 20 }} />
              {showInfo ? "Hide Info" : "Show Info"}
            </Button>

            {/* Qubit Info Panel */}

            {showInfo && (
              <motion.div
                variants={infoVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: "absolute",
                  top: "70px", // Increased top spacing to avoid overlap with button
                  left: "clamp(20px, 5vw, 30px)", // Moved to left side to avoid overlap with legend
                  background: "#ECEFF1",
                  color: "#212121",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
                  maxWidth: "min(280px, 80vw)", // Slightly wider but constrained by viewport
                  maxHeight: "60vh", // Limit height to avoid clipping
                  overflowY: "auto", // Enable scrolling for overflow content
                  zIndex: 15, // Lower than button and legend to avoid overlap
                }}
              >
                <style>
                  {`
              @media (max-width: 600px) {
                div[style*="left: clamp(20px, 5vw, 30px)"] {
                  max-width: 90vw;
                  max-height: 50vh;
                  padding: 10px 12px;
                  font-size: 0.85rem;
                }
              }
            `}
                </style>
                <Typography variant="h6" fontWeight="bold" color="#1976D2" mb={1}>
                  Qubit Information
                </Typography>
                <Stack spacing={1}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
                    >
                      What is a Bloch Sphere?
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                      A Bloch Sphere is a 3D tool to visualize a qubit's state. It
                      maps quantum states to points on a unit sphere using angles
                      θ and ϕ.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.9rem", fontWeight: "bold" }}
                    >
                      Why is it Needed?
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                      It helps understand qubit superpositions, design quantum
                      operations, and analyze measurement outcomes like Pauli
                      operator expectations.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                      State:
                    </Typography>
                    <BlockMath
                      math={`
                \\begin{aligned}
                |\\psi\\rangle =\\ & \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle \\\\\\
                & +\\ e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle
                \\end{aligned}
              `}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                      Parameters:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                    >
                      <InlineMath math="θ" /> = {theta}°<br />
                      <InlineMath math="ϕ" /> = {phi}°
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                      Bloch Vector:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                    >
                      x = <InlineMath math="sin θ cos ϕ" /> = {x}
                      <br />
                      y = <InlineMath math="sin θ sin ϕ" /> = {y}
                      <br />
                      z = <InlineMath math="cos θ" /> = {z}
                    </Typography>
                  </Box>
                  {basis && (
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: "0.9rem" }}>
                        Expectation Value:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                      >
                        <InlineMath
                          math={`\\langle \\sigma_${basis.toLowerCase()} \\rangle`}
                        />{" "}
                        = {basis === "X" ? x : basis === "Y" ? y : z}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </motion.div>
            )}
          </Html>
        )}

        <group rotation={[-Math.PI / 2, 0, 0]}>
          <mesh receiveShadow>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshStandardMaterial
              color="white"
              wireframe
              transparent
              opacity={0.2}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={6}
                array={
                  new Float32Array([
                    -2.5, 0, 0, 2.5, 0, 0, 0, -2.5, 0, 0, 2.5, 0, 0, 0, -2.5, 0,
                    0, 2.5,
                  ])
                }
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#607D8B" linewidth={basis ? 2 : 4} />
          </lineSegments>
          {basis === "X" && (
            <Line
              points={[
                new THREE.Vector3(-2.5, 0, 0),
                new THREE.Vector3(2.5, 0, 0),
              ]}
              color="#F44336"
              lineWidth={5}
            />
          )}
          {basis === "Y" && (
            <Line
              points={[
                new THREE.Vector3(0, -2.5, 0),
                new THREE.Vector3(0, 2.5, 0),
              ]}
              color="#43A047"
              lineWidth={5}
            />
          )}
          {basis === "Z" && (
            <Line
              points={[
                new THREE.Vector3(0, 0, -2.5),
                new THREE.Vector3(0, 0, 2.5),
              ]}
              color="#29B6F6"
              lineWidth={5}
            />
          )}
          <Line
            points={createCircle(2.5, "xy")}
            color="#607D8B"
            lineWidth={2.5}
          />
          <Line
            points={createCircle(2.5, "yz")}
            color="#607D8B"
            lineWidth={2.5}
          />
          <Line
            points={createCircle(2.5, "xz")}
            color="#607D8B"
            lineWidth={2.5}
          />
          <group>
            <Line
              points={[
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(1.25 * x, 1.25 * y, 1.25 * z),
              ]}
              color="#FFCA28"
              lineWidth={4}
            />
            <mesh position={[1.25 * x, 1.25 * y, 1.25 * z]} castShadow>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshStandardMaterial
                color="#FFCA28"
                emissive="#FFCA28"
                emissiveIntensity={0.3}
                roughness={0.4}
                metalness={0.6}
              />
            </mesh>
          </group>
          {basis === "X" && (
            <>
              <Line
                points={[
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(1.25 * x, 0, 0),
                ]}
                color="#C62828"
                lineWidth={8}
              />
              <Line
                points={[
                  new THREE.Vector3(1.25 * x, 1.25 * y, 1.25 * z),
                  new THREE.Vector3(1.25 * x, 0, 0),
                ]}
                color="#607D8B"
                dashed
                dashSize={0.125}
                gapSize={0.0625}
                lineWidth={2.5}
              />
              {!small && (
                <Text
                  position={[1.25 * x, 0, 0.125]}
                  rotation={[Math.PI / 2, 0, 0]}
                  fontSize={0.18}
                  color="#607D8B"
                  outlineColor="#212121"
                  outlineWidth={0.005}
                >
                  ⟨σx⟩ = {x.toFixed(3)}
                </Text>
              )}
            </>
          )}

          {basis === "Y" && (
            <>
              <Line
                points={[
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(0, 1.25 * y, 0),
                ]}
                color="#388E3C"
                lineWidth={8}
              />
              <Line
                points={[
                  new THREE.Vector3(1.25 * x, 1.25 * y, 1.25 * z),
                  new THREE.Vector3(0, 1.25 * y, 0),
                ]}
                color="#607D8B"
                dashed
                dashSize={0.125}
                gapSize={0.0625}
                lineWidth={2.5}
              />
              {!small && (
                <Text
                  position={[0, 1.25 * y, 0.125]}
                  rotation={[Math.PI / 2, 0, 0]}
                  fontSize={0.18}
                  color="#607D8B"
                  outlineColor="#212121"
                  outlineWidth={0.005}
                >
                  ⟨σy⟩ = {y.toFixed(3)}
                </Text>
              )}
            </>
          )}
          {basis === "Z" && (
            <>
              <Line
                points={[
                  new THREE.Vector3(0, 0, 0),
                  new THREE.Vector3(0, 0, 1.25 * z),
                ]}
                color="#0277BD"
                lineWidth={8}
              />
              <Line
                points={[
                  new THREE.Vector3(1.25 * x, 1.25 * y, 1.25 * z),
                  new THREE.Vector3(0, 0, 1.25 * z),
                ]}
                color="#607D8B"
                dashed
                dashSize={0.125}
                gapSize={0.0625}
                lineWidth={2.5}
              />
              {!small && (
                <Text
                  position={[0, 0, 1.25 * z + (z >= 0 ? 0.125 : -0.125)]}
                  rotation={[Math.PI / 2, 0, 0]}
                  fontSize={0.18}
                  color="#607D8B"
                  outlineColor="#212121"
                  outlineWidth={0.005}
                >
                  ⟨σz⟩ = {z.toFixed(3)}
                </Text>
              )}
            </>
          )}

          <CollapsePulse />

          <Line
            points={thetaArc}
            color="#7E57C2"
            dashed
            dashSize={0.125}
            gapSize={0.0625}
            lineWidth={2.5}
          />
          {!small && (
            <Text
              position={thetaLabelPos}
              rotation={[Math.PI / 2, 0, 0]}
              fontSize={0.18}
              color="#7E57C2"
              outlineColor="#212121"
              outlineWidth={0.005}
            >
              θ = {theta}°
            </Text>
          )}
          <Line
            points={phiArc}
            color="#26C6DA"
            dashed
            dashSize={0.125}
            gapSize={0.0625}
            lineWidth={2.5}
          />
          {!small && (
            <Text
              position={phiLabelPos}
              rotation={[Math.PI / 2, 0, 0]}
              fontSize={0.18}
              color="#26C6DA"
              outlineColor="#212121"
              outlineWidth={0.005}
            >
              ϕ = {phi}°
            </Text>
          )}
          <Text
            position={[2.75, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#F44336"
            outlineColor="#212121"
            outlineWidth={0.005}
          >
            +X
          </Text>
          <Text
            position={[-2.75, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#F44336"
            outlineColor="#212121"
            outlineWidth={0.005}
          >
            -X
          </Text>
          <Text
            position={[0, 2.75, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#43A047"
            outlineColor="#212121"
            outlineWidth={0.005}
          >
            +Y
          </Text>
          <Text
            position={[0, -2.75, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#43A047"
            outlineColor="#212121"
            outlineWidth={0.005}
          >
            -Y
          </Text>
          <Text
            position={[0, 0, 2.75]}
            rotation={[Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#29B6F6"
            outlineColor="#212121"
            outlineWidth={0.005}
          >
            |0⟩ (Z+)
          </Text>
          <Text
            position={[0, 0, -2.75]}
            rotation={[Math.PI / 2, 0, 0]}
            fontSize={0.2}
            color="#29B6F6"
            outlineColor="#212121"
            outlineWidth={0.005}
          >
            |1⟩ (Z−)
          </Text>
        </group>
      </Canvas>
    </Box>
  );
};

const BlochSphere = ({ small = false }) => {
  const { theta = 0, phi = 0, basis } = useSelector((state) => state.quantum);

  const radTheta = (theta * Math.PI) / 180;
  const radPhi = (phi * Math.PI) / 180;

  const x = +(Math.sin(radTheta) * Math.cos(radPhi)).toFixed(3);
  const y = +(Math.sin(radTheta) * Math.sin(radPhi)).toFixed(3);
  const z = +Math.cos(radTheta).toFixed(3);

  return (
    <Box sx={{ maxWidth: "100%", p: small ? 0 : { xs: 1, sm: 2 } }}>
      <BlochSphereCanvas
        x={x}
        y={y}
        z={z}
        theta={theta}
        phi={phi}
        basis={basis}
        small={small}
      />
    </Box>
  );
};

export default BlochSphere;
