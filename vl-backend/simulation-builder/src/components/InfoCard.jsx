import React from "react";
import { Paper, Typography } from "@mui/material";

const InfoCard = ({ title, children }) => (
  <Paper
    elevation={4}
    sx={{
      p: 3,
      mb: 3,
      bgcolor: "#E3F2FD",
      borderRadius: 3,
      borderLeft: "6px solid #1976D2",
    }}
  >
    <Typography variant="h6" color="#1976D2" gutterBottom fontWeight="bold">
      {title}
    </Typography>
    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
      {children}
    </Typography>
  </Paper>
);

export default InfoCard;
