import React, { useState } from "react";
import { Box, Typography, Button, Container, Paper, useTheme, useMediaQuery } from "@mui/material";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import SimulationRunner from "./components/SimulationRunner";

const App = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [simulationStarted, setSimulationStarted] = useState(false);

  return (
    <Box sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      bgcolor: 'background.default', // Use theme's default background, typically white
    }}>
      <SimulationRunner />
      {/* Header - This was commented out in previous versions, keeping it commented */}
      {/* <Box sx={{ color: " blue", p: 3, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold">
         Quantum Measurement & Wavefunction Collapse
        </Typography>
      </Box> */}

      {simulationStarted ? (
        // Main 2 Panels for the simulation
        <Box sx={{ flex: 1, display: "flex", flexDirection: isMobile ? "column" : "row" }}>
          <Box sx={{ flex: isMobile ? "1" : "1", bgcolor: "rgba(216, 218, 226, 1)", p: 3 }}>
            <LeftPanel />
          </Box>
          <Box sx={{ flex: isMobile ? "1" : "2", bgcolor: "#e5e9f5ff", p: 3 }}>
            <RightPanel />
          </Box>
        </Box>
      ) : (
        // Landing Page
        <Container sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper 
            elevation={12} 
            sx={{ 
              p: 5, 
              borderRadius: 4, 
              maxWidth: '800px', 
              width: '100%', 
              bgcolor: 'background.paper', // Use theme's paper background, typically white
              boxShadow: theme.shadows[6], // Use a theme shadow for consistency
              color: 'text.primary', // Use theme's primary text color, typically black
            }}
          >
            <Typography 
              variant="h5" 
              component="h1" 
              fontWeight="bold" 
              gutterBottom 
              align="center"
              sx={{
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Quantum Measurements
            </Typography>
            
            <Typography variant="h6" sx={{ mt: 4, mb: 4, textAlign: 'center', fontWeight: '300', lineHeight: 1.6, color: 'text.secondary' }}>
               Here, you'll explore the fundamental principles of quantum measurement and observe how the act of measurement influences a quantum state. Prepare a qubit, choose your measurement basis, and witness the probabilistic nature of wavefunction collapse through repeated experiments.
            </Typography>

            <Box sx={{ mt: 5, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => setSimulationStarted(true)}
                sx={{
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  border: 0,
                  borderRadius: 3,
                  boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                  color: 'white',
                  height: 48,
                  padding: '0 30px',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                Start Simulation
              </Button>
            </Box>
          </Paper>
        </Container>
      )}
    </Box>
  );
};

export default App;