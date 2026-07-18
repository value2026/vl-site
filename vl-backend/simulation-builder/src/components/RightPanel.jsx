import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, Button, Grow, Stack } from "@mui/material";
import { useSelector } from "react-redux";
import BlochSphere from "./BlochSphere";
import ResultsHistogram from "./ResultsHistogram";
import PsychologyIcon from '@mui/icons-material/Psychology';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const RightPanel = () => {
  const { activeStep, results, basis, isRunning, theta, phi } = useSelector(
    (s) => s.quantum
  );

  const [measurementState, setMeasurementState] = useState("idle"); // idle, running, finished
  const [showHistogram, setShowHistogram] = useState(false);

  useEffect(() => {
    if (activeStep !== 3) {
      setMeasurementState("idle");
      setShowHistogram(false);
    }
  }, [activeStep]);

  useEffect(() => {
    if (activeStep === 3) {
      if (isRunning) {
        setMeasurementState("running");
        // show histogram immediately while the run is in progress
        setShowHistogram(true);
      } else if (!isRunning && results.length > 0) {
        setMeasurementState("finished");
        setShowHistogram(true);
      } else if (!isRunning && results.length === 0) {
        setMeasurementState("idle");
        setShowHistogram(false);
      }
    }
  }, [isRunning, results, activeStep]);

  // If we are in the preparation/basis step but haven't prepared a state yet, keep it blank
  if ((activeStep === 1 || activeStep === 2) && theta === null) {
    return null;
  }

  if (activeStep === 0) {
    return (
      <Box textAlign="center">
        <Typography variant="h6" mb={2}>
          Example: Superposition state
        </Typography>
        <BlochSphere x={1} y={0} z={0} theta={90} phi={0} observable="X" />
      </Box>
    );
  }

  if (activeStep === 1 || activeStep === 2) {
    return (
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ width: '100%' }}>
          <BlochSphere />
        </Box>
        
        <Grow in={theta !== null} timeout={800}>
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2.5, 
                mx: 2, 
                maxWidth: 600, 
                borderRadius: 3, 
                bgcolor: 'white', 
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <InfoOutlinedIcon sx={{ color: '#7c3aed', mt: 0.3 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>
                    {activeStep === 1 ? "Visualizing the Quantum State" : "Measurement Orientation"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {activeStep === 1 ? (
                      <>
                        The yellow arrow points to the current state <strong>|ψ⟩</strong>. 
                        Since θ = {theta}°, your qubit is in a 
                        {theta === 0 ? " pure |0⟩ state." : theta === 180 ? " pure |1⟩ state." : " superposition of |0⟩ and |1⟩."}
                      </>
                    ) : (
                      <>
                        The sphere is now ready for <strong>{basis}-basis</strong> measurement. 
                        Notice the colored axis—this is the "question" we will ask the qubit in Step 3.
                      </>
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Grow>
      </Box>
    );
  }

  if (activeStep === 3) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
          px: 1
        }}
      >
        <Box sx={{ 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          width: '100%'
        }}>
           <Box sx={{ width: '100%' }}>
              <BlochSphere />
           </Box>
           {isRunning && (
             <Paper sx={{ 
               p: 1.5, 
               mt: -2, 
               mx: 2, 
               maxWidth: '600px',
               bgcolor: 'rgba(25, 118, 210, 0.05)', 
               border: '1px solid rgba(25, 118, 210, 0.2)', 
               borderRadius: 2,
               position: 'relative',
               zIndex: 1
             }}>
               <Typography variant="caption" sx={{ fontWeight: 700, color: "#1976d2", display: "block", fontSize: '0.8rem' }}>
                 🔍 Observation: Wavefunction Collapse
               </Typography>
               <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.4, fontSize: '0.75rem' }}>
                 Notice the <strong>yellow pulses</strong>? Each pulse is a single measurement collapsing the state into 0 or 1.
               </Typography>
             </Paper>
           )}
        </Box>


        <Grow in={showHistogram} timeout={600}>
          <Box sx={{ width: "100%", maxWidth: 820, margin: '0 auto', pb: 4 }}>
            <ResultsHistogram />
          </Box>
        </Grow>

        {!showHistogram && measurementState === "finished" && (
          <Box mt={1} textAlign="center" pb={4}>
            <Button variant="contained" onClick={() => setShowHistogram(true)}>
              Show Results
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default RightPanel;
