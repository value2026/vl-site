// LeftPanelDesignedFull.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  nextStep,
  prevStep,
  setThetaPhi,
  setBasis,
  setShots,
  toggleSlowMotion,
  startRun,
  resetAll,
  resetMeasurements,
} from "../redux/quantumSlice";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Paper,
  Typography,
  Stack,
  Slider,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ReplayIcon from "@mui/icons-material/Replay";
import ScienceIcon from "@mui/icons-material/Science";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import { getProbability, getLabels } from "../utils/quantumMath";

export default function LeftPanelDesignedFull() {
  const dispatch = useDispatch();
  const {
    activeStep,
    theta,
    phi,
    basis,
    shots,
    slowMotion,
    isRunning,
    results,
  } = useSelector((s) => s.quantum);

  // local controls for Step 1 to get smooth animations before committing
  const [localTheta, setLocalTheta] = useState(theta);
  const [localPhi, setLocalPhi] = useState(phi);
  const [selectedPreset, setSelectedPreset] = useState(null);

  useEffect(() => setLocalTheta(theta), [theta]);
  useEffect(() => setLocalPhi(phi), [phi]);

  const presets = [
    {
      name: "|0⟩",
      theta: 0,
      phi: 0,
      tag: "Z+",
      color: "#0ea5a4",
      desc: "Ground state — north pole.",
    },
    {
      name: "|1⟩",
      theta: 180,
      phi: 0,
      tag: "Z−",
      color: "#f97316",
      desc: "Excited state — south pole.",
    },
    {
      name: "|+⟩",
      theta: 90,
      phi: 0,
      tag: "X+",
      color: "#7c3aed",
      desc: "Equal superposition on +X.",
    },
    {
      name: "|−⟩",
      theta: 90,
      phi: 180,
      tag: "X−",
      color: "#ef4444",
      desc: "Equal superposition on −X (phase π).",
    },
    {
      name: "|+i⟩",
      theta: 90,
      phi: 90,
      tag: "Y+",
      color: "#f59e0b",
      desc: "+Y phase (π/2).",
    },
  ];

  const applyPreset = (p) => {
    setLocalTheta(p.theta);
    setLocalPhi(p.phi);
    setSelectedPreset(p);
    setTimeout(
      () => dispatch(setThetaPhi({ theta: p.theta, phi: p.phi })),
      120
    );
  };

  const commitAngles = () =>
    dispatch(
      setThetaPhi({ theta: Math.round(localTheta), phi: Math.round(localPhi) })
    );

  const Step1 = (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}
    >
      {/* Header Card */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.04))",
            border: "1px solid rgba(124,58,237,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>
            Step 1 — Prepare Qubit State
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Drag sliders or tap a preset to set |ψ⟩ on the Bloch sphere.
          </Typography>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", display: "block", mb: 0.5 }}>
              💡 Concept: State Preparation
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
              A qubit can exist in a superposition of |0⟩ and |1⟩. 
              <strong> θ (Theta)</strong> controls the probability between |0⟩ and |1⟩.
              <strong> ϕ (Phi)</strong> controls the quantum phase, determining the state's relation to X and Y axes.
            </Typography>
          </Box>
        </Paper>
      </motion.div>

      {/* Main Compact Panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={3}
          sx={{ p: 2.5, borderRadius: 4, overflow: "hidden" }}
        >
          <Stack spacing={3}>
            {/* Designer Presets - Compact Cards */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1.5, color: "#334155" }}
              >
                Presets
              </Typography>

              <Stack spacing={1.5}>
                {presets.map((p) => {
                  const isSelected = selectedPreset?.name === p.name;
                  return (
                    <motion.button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      whileHover={{ scale: 1.025 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        all: "unset",
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          background: isSelected
                            ? "linear-gradient(90deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))"
                            : "rgba(255,255,255,0.7)",
                          border: `1.5px solid ${
                            isSelected
                              ? "rgba(124,58,237,0.4)"
                              : "rgba(0,0,0,0.06)"
                          }`,
                          boxShadow: isSelected
                            ? "0 8px 25px rgba(124,58,237,0.12)"
                            : "0 2px 8px rgba(0,0,0,0.04)",
                          transition: "all 0.25s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            bgcolor: p.color,
                            color: "white",
                            fontWeight: 800,
                            fontSize: "0.95rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                          }}
                        >
                          {p.name}
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 700 }}
                          >
                            {p.tag}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ lineHeight: 1.2 }}
                          >
                            {p.desc}
                          </Typography>
                        </Box>

                        {isSelected && (
                          <Box
                            sx={{
                              bgcolor: "#7c3aed",
                              color: "white",
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 10,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            Active
                          </Box>
                        )}
                      </Box>
                    </motion.button>
                  );
                })}
              </Stack>
            </Box>

            

            {/* Custom Angles - Compact Sliders */}
            {/* <Box> */}
              {/* <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1.5, color: "#334155" }}
              >
                Custom Angles
              </Typography> */}

              {/* <Box sx={{ display: "grid", gap: 2 }}>
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      θ (Polar)
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="#7c3aed"
                    >
                      {Math.round(localTheta)}°
                    </Typography>
                  </Stack>
                  <Slider
                    value={localTheta}
                    min={0}
                    max={180}
                    onChange={(_, v) => setLocalTheta(v)}
                    onChangeCommitted={commitAngles}
                    sx={{
                      height: 6,
                      "& .MuiSlider-track": {
                        background: "linear-gradient(90deg, #06b6d4, #7c3aed)",
                      },
                      "& .MuiSlider-thumb": { height: 18, width: 18 },
                    }}
                  />
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      ϕ (Azimuthal)
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="#f97316"
                    >
                      {Math.round(localPhi)}°
                    </Typography>
                  </Stack>
                  <Slider
                    value={localPhi}
                    min={0}
                    max={360}
                    onChange={(_, v) => setLocalPhi(v)}
                    onChangeCommitted={commitAngles}
                    sx={{
                      height: 6,
                      "& .MuiSlider-track": {
                        background: "linear-gradient(90deg, #f97316, #f59e0b)",
                      },
                      "& .MuiSlider-thumb": { height: 18, width: 18 },
                    }}
                  />
                </Box>
              </Box>
            </Box> */}

            {/* Current Selection Preview */}
            {selectedPreset && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  bgcolor: "rgba(124,58,237,0.04)",
                  borderColor: "rgba(124,58,237,0.2)",
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Current State
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, color: "#7c3aed" }}
                >
                  {selectedPreset.name} → {selectedPreset.tag}
                </Typography>
              </Paper>
            )}
          </Stack>
        </Paper>
      </motion.div>

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => dispatch(nextStep())}
            sx={{
              py: 1.6,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
              boxShadow: "0 10px 30px rgba(124,58,237,0.25)",
              "&:hover": {
                background: "linear-gradient(90deg, #6d28d9, #0891b2)",
              },
            }}
          >
            Next: Choose Basis
          </Button>

          <Button
            variant="outlined"
            onClick={() => {
              setLocalTheta(0);
              setLocalPhi(0);
              dispatch(setThetaPhi({ theta: 0, phi: 0 }));
              setSelectedPreset(presets[0]);
            }}
            sx={{ width: 100, borderRadius: 3 }}
            startIcon={<RestartAltIcon />}
          >
            Reset
          </Button>
        </Stack>
      </motion.div>
    </Box>
  );

  // Step 2
  const probs = getProbability(theta, phi, basis);
  const labels = getLabels(basis);

  const Step2 = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(245,158,11,0.04))",
            border: "1px solid rgba(249,115,22,0.12)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>
            Step 2 — Choose Measurement Basis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Select the axis for measurement. This orients the sphere to show
            outcomes.
          </Typography>

          <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#334155", display: "block", mb: 0.5 }}>
              💡 Concept: Measurement Basis
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
              Measuring a qubit forces it to collapse into one of two states depending on the basis chosen. 
              The <strong>Z-basis</strong> asks "Are you |0⟩ or |1⟩?", while the <strong>X-basis</strong> asks "Are you |+⟩ or |−⟩?". 
              Your choice determines which aspect of the superposition is observed.
            </Typography>
          </Box>
        </Paper>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={3}
          sx={{ p: 2.5, borderRadius: 4, overflow: "hidden" }}
        >
          <Stack spacing={2}>
            {[
              {
                value: "Z",
                label: "Z-basis",
                desc: "|0⟩ / |1⟩",
                color: "#0ea5e9",
              },
              {
                value: "X",
                label: "X-basis",
                desc: "|+⟩ / |−⟩",
                color: "#7c3aed",
              },
              {
                value: "Y",
                label: "Y-basis",
                desc: "|+i⟩ / |−i⟩",
                color: "#f59e0b",
              },
            ].map((b) => (
              <motion.button
                key={b.value}
                onClick={() => dispatch(setBasis(b.value))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background:
                      basis === b.value
                        ? `linear-gradient(90deg, ${b.color}20, ${b.color}10)`
                        : "rgba(255,255,255,0.7)",
                    border: `1.5px solid ${
                      basis === b.value ? `${b.color}80` : "rgba(0,0,0,0.06)"
                    }`,
                    boxShadow:
                      basis === b.value
                        ? `0 8px 25px ${b.color}20`
                        : "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.25s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: b.color,
                      color: "white",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    {b.value}
                  </Box>

                  <Box sx={{ flex: 1, textAlign: "left" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {b.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.2 }}
                    >
                      {b.desc}
                    </Typography>
                  </Box>

                  {basis === b.value && (
                    <Box
                      sx={{
                        bgcolor: b.color,
                        color: "white",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 10,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      Selected
                    </Box>
                  )}
                </Box>
              </motion.button>
            ))}
          </Stack>

          <Divider sx={{ my: 2.5, opacity: 0.6 }} />

          <Box textAlign="center">
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "#334155", mb: 1 }}
            >
              Theoretical Probabilities
            </Typography>
            <Stack
              direction="row"
              justifyContent="space-around"
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#0ea5e9" }}
                >
                  {(probs.p0 * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {labels.pos}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#f97316" }}
                >
                  {(probs.p1 * 100).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {labels.neg}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => dispatch(prevStep())}
            sx={{ borderRadius: 3, py: 1.5, width: 140 }}
          >
            Back
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => dispatch(nextStep())}
            sx={{
              py: 1.6,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(90deg, #f97316, #f59e0b)",
              boxShadow: "0 10px 30px rgba(249,115,22,0.25)",
              "&:hover": {
                background: "linear-gradient(90deg, #ea580c, #d97706)",
              },
            }}
          >
            Next: Run Shots
          </Button>
        </Stack>
      </motion.div>
    </Box>
  );

  // Step 3
  const Step3 = (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(217, 70, 239, 0.06), rgba(236, 72, 153, 0.04))",
            border: "1px solid rgba(217, 70, 239, 0.12)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>
            Step 3 — Run Measurement
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure and run the quantum experiment.
          </Typography>
        </Paper>
      </motion.div>

      {/* Settings Panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          elevation={3}
          sx={{ p: 2.5, borderRadius: 4, overflow: "hidden" }}
        >
          <Stack spacing={2.5}>
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#334155" }}
                >
                  Number of Measurements (Shots)
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={800}
                  sx={{
                    color: "#be185d",
                    background: "rgba(236, 72, 153, 0.1)",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  {shots.toLocaleString()}
                </Typography>
              </Stack>
              <Slider
                value={shots}
                onChange={(_, v) => dispatch(setShots(v))}
                step={null}
                marks={[
                  { value: 10, label: "10" },
                  { value: 50, label: "50" },
                  { value: 100, label: "100" },
                  { value: 150, label: "150" },
                  { value: 200, label: "200" },
                ]}
                min={10}
                max={200}
                sx={{
                  height: 6,
                  mt: 1,
                  "& .MuiSlider-track": {
                    background: "linear-gradient(90deg, #ec4899, #d946ef)",
                  },
                  "& .MuiSlider-thumb": {
                    height: 18,
                    width: 18,
                    backgroundColor: "#fff",
                    border: "2px solid #be185d",
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(34, 197, 94, 0.08))",
                border: "1px solid rgba(6, 182, 212, 0.2)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "#334155",
                  display: "block",
                  mb: 0.8,
                  fontSize: "0.85rem",
                }}
              >
                💡 Key Quantum Principles
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  lineHeight: 1.5,
                  fontSize: "0.8rem",
                  display: "block",
                  mb: 0.6,
                }}
              >
                <strong>• Individual Randomness:</strong> Each single
                measurement outcome appears random and follows the probability
                distribution
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  lineHeight: 1.5,
                  fontSize: "0.8rem",
                  display: "block",
                  mb: 0.6,
                }}
              >
                <strong>• Pattern Emergence:</strong> Multiple measurements
                reveal the underlying probability distribution that governs the
                quantum system
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  lineHeight: 1.5,
                  fontSize: "0.8rem",
                  display: "block",
                  mb: 0.6,
                }}
              >
                <strong>• Wave Collapse:</strong> Measurement is
                irreversible—detecting a state permanently collapses the quantum
                system into that definite state
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                  fontSize: "0.8rem",
                  display: "block",
                  mt: 1,
                  fontStyle: "italic",
                  color: "#0891b2",
                }}
              >
                🔄 <strong>Why Repeated Measurements?</strong> A single quantum
                measurement result is unpredictable. By running multiple
                measurements (increasing the shots), we gather statistical
                evidence of the true probability distribution. This reveals the
                hidden quantum pattern beneath the randomness.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </motion.div>

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <Stack direction="column" spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => dispatch(startRun())}
            disabled={isRunning}
            startIcon={<PlayCircleOutlineIcon />}
            sx={{
              py: 1.6,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: "1rem",
              background: "linear-gradient(90deg, #ec4899, #d946ef)",
              boxShadow: "0 10px 30px rgba(217, 70, 239, 0.25)",
              "&:hover": {
                background: "linear-gradient(90deg, #be185d, #a21caf)",
              },
            }}
          >
            Run Measurement
          </Button>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              onClick={() => dispatch(prevStep())}
              sx={{ borderRadius: 3, py: 1.5, width: "100%" }}
            >
              Back
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => dispatch(resetMeasurements())}
              sx={{ borderRadius: 3, py: 1.5, width: "100%" }}
            >
              Reset Measurements
            </Button>
          </Stack>
        </Stack>
      </motion.div>
    </Box>
  );

  // Render chosen step
  return (
    <Box>
      {activeStep === 1 && Step1}
      {activeStep === 2 && Step2}
      {activeStep === 3 && Step3}
    </Box>
  );
}
