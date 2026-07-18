import React, { useMemo, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getLabels, getProbability } from "../utils/quantumMath";
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  GlobalStyles,
  Chip,
  LinearProgress,
} from "@mui/material";

/* ---------- Tooltip ---------- */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <Paper
        sx={{
          p: 1.5,
          backgroundColor: "rgba(30, 30, 46, 0.95)",
          border: "1.5px solid rgba(139, 92, 246, 0.4)",
          borderRadius: 2,
        }}
        elevation={3}
      >
        <Typography variant="subtitle2" sx={{ color: "#e0e7ff" }}>
          {d.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "#c4b5fd", mt: 0.5 }}>
          Count: <strong>{d.count}</strong>
        </Typography>
        <Typography variant="body2" sx={{ color: "#c4b5fd" }}>
          Frequency: <strong>{(d.percent * 100).toFixed(2)}%</strong>
        </Typography>
      </Paper>
    );
  }
  return null;
};

const ResultsHistogram = () => {
  const { results, basis, shots, theta, phi, isRunning, slowMotion } =
    useSelector((state) => state.quantum);

  const labels = getLabels(basis);

  /* ---------- Count results ---------- */
  const counts = results.reduce(
    (acc, r) => {
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    },
    { 0: 0, 1: 0 }
  );

  const pTheory = getProbability(theta, phi, basis);

  /* ---------- Animated count build-up ---------- */
  const [animatedCounts, setAnimatedCounts] = useState({ 0: 0, 1: 0 });
  const animRef = useRef(null);
  const prevShots = useRef(shots);

  useEffect(() => {
    if (shots !== prevShots.current) {
      setAnimatedCounts({ 0: 0, 1: 0 });
      prevShots.current = shots;
    }
  }, [shots]);

  useEffect(() => {
    const target = { 0: counts[0], 1: counts[1] };

    if (animRef.current) clearInterval(animRef.current);

    const perTick = isRunning ? (slowMotion ? 150 : 80) : 10;

    animRef.current = setInterval(() => {
      setAnimatedCounts((prev) => {
        const r0 = target[0] - prev[0];
        const r1 = target[1] - prev[1];
        if (r0 <= 0 && r1 <= 0) {
          clearInterval(animRef.current);
          return target;
        }
        const total = Math.max(1, r0 + r1);
        const inc0 = Math.random() < r0 / total;
        return {
          0: prev[0] + (inc0 ? 1 : 0),
          1: prev[1] + (inc0 ? 0 : 1),
        };
      });
    }, perTick);

    return () => clearInterval(animRef.current);
  }, [counts[0], counts[1], isRunning, slowMotion]);

  /* ---------- Chart data ---------- */
  const data = useMemo(() => {
    const a0 = animatedCounts[0];
    const a1 = animatedCounts[1];
    return [
      {
        name: labels.pos,
        count: a0,
        percent: shots ? a0 / shots : 0,
      },
      {
        name: labels.neg,
        count: a1,
        percent: shots ? a1 / shots : 0,
      },
    ];
  }, [animatedCounts, shots, labels]);

  return (
    <>
      <GlobalStyles
        styles={`
          .stat-card {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
            border: 1px solid rgba(139, 92, 246, 0.2);
            transition: all 0.3s ease;
          }
          .stat-card:hover {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
            border-color: rgba(139, 92, 246, 0.4);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
          }
          .histogram-card {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
            border: 1px solid rgba(139, 92, 246, 0.15);
          }
          .table-card {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%);
            border: 1px solid rgba(59, 130, 246, 0.15);
          }
          .conclusion-card {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%);
            border: 1px solid rgba(34, 197, 94, 0.2);
          }
        `}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* ---------- Header Section ---------- */}
        <Box sx={{ mb: 0.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 0.5,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Measurement Results Analysis
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
            Quantum state measurement outcomes with theoretical comparison
          </Typography>
        </Box>

        {/* ---------- Stat Cards ---------- */}
        <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
          <Paper
            className="stat-card"
            sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}
            elevation={0}
          >
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                fontSize: "0.65rem",
                letterSpacing: 0.8,
                display: 'block'
              }}
            >
              Total Measurements
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mt: 0.5,
                fontSize: { xs: '1.75rem', sm: '2.125rem' }
              }}
            >
              {shots}
            </Typography>
          </Paper>

          <Paper
            className="stat-card"
            sx={{ flex: 1, p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}
            elevation={0}
          >
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                fontSize: "0.65rem",
                letterSpacing: 0.8,
                display: 'block'
              }}
            >
              Measurement Basis
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
            >
              <Chip
                label={basis.toUpperCase() + " Basis"}
                sx={{
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                  color: "white",
                  fontWeight: 700,
                  height: 28,
                  fontSize: "0.8rem",
                }}
              />
            </Box>
          </Paper>
        </Box>

        {/* ---------- Empty State ---------- */}
        {results.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              background:
                "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(59, 130, 246, 0.02) 100%)",
              border: "1px dashed rgba(139, 92, 246, 0.2)",
            }}
            elevation={0}
          >
            <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
              🔬 Run the measurement to see results
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block", fontSize: "0.8rem" }}
            >
              Execute the simulation to generate quantum measurement data
            </Typography>
          </Paper>
        ) : (
          <>
            {/* ---------- Histogram Card ---------- */}
            <Paper
              className="histogram-card"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                minHeight: 280,
              }}
              elevation={0}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  fontSize: "0.95rem",
                }}
              >
                Measurement Distribution
              </Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={data}>
                    <XAxis
                      dataKey="name"
                      stroke="rgba(200, 200, 200, 0.5)"
                      style={{
                        fontSize: "12px",
                        fill: "#000000",
                        fontWeight: 600,
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      stroke="rgba(200, 200, 200, 0.5)"
                      style={{
                        fontSize: "12px",
                        fill: "#000000",
                        fontWeight: 600,
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="url(#colorGradient)"
                      radius={[12, 12, 0, 0]}
                      isAnimationActive={true}
                      animationDuration={600}
                      animationEasing="ease-in-out"
                    />
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.9}
                        />
                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity={0.9}
                        />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            {/* ---------- Probability Table Card ---------- */}
            <Paper
              className="table-card"
              sx={{
                p: { xs: 1, sm: 2 },
                borderRadius: 3,
              }}
              elevation={0}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ fontSize: "1rem" }}>📈</span> Probability
                Comparison
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{ backgroundColor: "rgba(139, 92, 246, 0.08)" }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: { xs: '0.7rem', sm: '0.85rem' },
                          px: { xs: 0.5, sm: 2 }
                        }}
                      >
                        State
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: { xs: '0.7rem', sm: '0.85rem' },
                          px: { xs: 0.5, sm: 2 }
                        }}
                      >
                        Count
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: { xs: '0.7rem', sm: '0.85rem' },
                          px: { xs: 0.5, sm: 2 }
                        }}
                      >
                        Meas%
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: { xs: '0.7rem', sm: '0.85rem' },
                          px: { xs: 0.5, sm: 2 }
                        }}
                      >
                        Theory%
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                          fontSize: { xs: '0.7rem', sm: '0.85rem' },
                          px: { xs: 0.5, sm: 2 }
                        }}
                      >
                        Dev
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(139, 92, 246, 0.05)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, px: { xs: 0.5, sm: 2 } }}>
                        {labels.pos}
                      </TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{counts[0]}</TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {((counts[0] / shots) * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#22c55e", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {(pTheory.p0 * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <Chip
                          label={
                            Math.abs(
                              (counts[0] / shots) * 100 - pTheory.p0 * 100
                            ).toFixed(1) + "%"
                          }
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            backgroundColor: `rgba(${
                              Math.abs(
                                (counts[0] / shots) * 100 - pTheory.p0 * 100
                              ) < 5
                                ? "34, 197, 94"
                                : "249, 115, 22"
                            }, 0.15)`,
                            color: `${
                              Math.abs(
                                (counts[0] / shots) * 100 - pTheory.p0 * 100
                              ) < 5
                                ? "#22c55e"
                                : "#f97316"
                            }`,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(139, 92, 246, 0.05)",
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, px: { xs: 0.5, sm: 2 } }}>
                        {labels.neg}
                      </TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{counts[1]}</TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {((counts[1] / shots) * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#22c55e", fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {(pTheory.p1 * 100).toFixed(1)}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ px: { xs: 0.5, sm: 2 } }}>
                        <Chip
                          label={
                            Math.abs(
                              (counts[1] / shots) * 100 - pTheory.p1 * 100
                            ).toFixed(1) + "%"
                          }
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            backgroundColor: `rgba(${
                              Math.abs(
                                (counts[1] / shots) * 100 - pTheory.p1 * 100
                              ) < 5
                                ? "34, 197, 94"
                                : "249, 115, 22"
                            }, 0.15)`,
                            color: `${
                              Math.abs(
                                (counts[1] / shots) * 100 - pTheory.p1 * 100
                              ) < 5
                                ? "#22c55e"
                                : "#f97316"
                            }`,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* ---------- Conclusion Card ---------- */}
            <Paper
              className="conclusion-card"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
              }}
              elevation={0}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  mb: 1.2,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  color: "#22c55e",
                  fontSize: "0.95rem",
                }}
              >
                <span style={{ fontSize: "1rem" }}>✓</span> Conclusion
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, mb: 0.5, display: "block" }}
                  >
                    Measurement Summary:
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ lineHeight: 1.4, fontSize: "0.75rem", display: 'block' }}
                  >
                    Out of {shots} measurements in the{" "}
                    <strong>{basis.toUpperCase()}</strong> basis,
                    <strong>
                      {" "}
                      {counts[0]} results (
                      {((counts[0] / shots) * 100).toFixed(1)}%)
                    </strong>{" "}
                    collapsed to the {labels.pos} state and
                    <strong>
                      {" "}
                      {counts[1]} results (
                      {((counts[1] / shots) * 100).toFixed(1)}%)
                    </strong>{" "}
                    collapsed to the {labels.neg} state.
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, mb: 0.5, display: "block" }}
                  >
                    Comparison to Theory:
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ lineHeight: 1.4, fontSize: "0.75rem", display: 'block' }}
                  >
                    The theoretical probabilities predict{" "}
                    <strong>{(pTheory.p0 * 100).toFixed(1)}%</strong> for
                    {labels.pos} and{" "}
                    <strong>{(pTheory.p1 * 100).toFixed(1)}%</strong> for{" "}
                    {labels.neg}. The experimental results
                    <strong>
                      {Math.max(
                        Math.abs((counts[0] / shots) * 100 - pTheory.p0 * 100),
                        Math.abs((counts[1] / shots) * 100 - pTheory.p1 * 100)
                      ) < 5
                        ? " align well "
                        : " deviate "}
                    </strong>
                    with the theoretical predictions.
                  </Typography>
                </Box>

                {/* Progress Accuracy Bar */}
                <Box sx={{ mt: 0.5 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      display: "block",
                      fontSize: "0.75rem",
                    }}
                  >
                    Statistical Accuracy:{" "}
                    {(
                      100 -
                      Math.max(
                        Math.abs((counts[0] / shots) * 100 - pTheory.p0 * 100),
                        Math.abs((counts[1] / shots) * 100 - pTheory.p1 * 100)
                      )
                    ).toFixed(1)}
                    %
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      100 -
                      Math.max(
                        Math.abs((counts[0] / shots) * 100 - pTheory.p0 * 100),
                        Math.abs((counts[1] / shots) * 100 - pTheory.p1 * 100)
                      )
                    }
                    sx={{
                      backgroundColor: "rgba(34, 197, 94, 0.15)",
                      "& .MuiLinearProgress-bar": {
                        background:
                          "linear-gradient(90deg, #22c55e 0%, #10b981 100%)",
                      },
                      borderRadius: 2,
                      height: 6,
                    }}
                  />
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </>
  );
};

export default ResultsHistogram;
