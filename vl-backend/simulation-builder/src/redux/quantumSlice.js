// src/redux/quantumSlice.js
import { createSlice } from "@reduxjs/toolkit";

const quantumSlice = createSlice({
  name: "quantum",
  initialState: {
    activeStep: 1,            // 0 to 4
    theta: null,              // θ angle (null means not prepared)
    phi: null,                // ϕ angle (null means not prepared)
    basis: "Z",               // "Z", "X", or "Y"
    shots: 100,              // number of measurements
    slowMotion: true,         // show each collapse slowly
    isRunning: false,         // true while measuring
    results: [],              // array of "0" or "1" outcomes
    collapsedVector: null,    // {x,y,z} after last collapse (for animation)
    showIndividualOutcomes: false,
  },
  reducers: {
    nextStep: (state) => {
      state.activeStep = Math.min(state.activeStep + 1, 3);
    },
    prevStep: (state) => {
      state.activeStep = Math.max(state.activeStep - 1, 0);
    },
    setThetaPhi: (state, action) => {
      state.theta = action.payload.theta;
      state.phi = action.payload.phi;
      // Reset measurement when state changes
      state.results = [];
      state.collapsedVector = null;
      state.isRunning = false;
    },
    setBasis: (state, action) => {
      state.basis = action.payload;
    },
    setShots: (state, action) => {
      state.shots = action.payload;
    },
    toggleSlowMotion: (state) => {
      state.slowMotion = !state.slowMotion;
    },
    toggleShowIndividualOutcomes: (state) => {
      state.showIndividualOutcomes = !state.showIndividualOutcomes;
    },
    startRun: (state) => {
      state.isRunning = true;
      state.results = [];
      state.collapsedVector = null;
    },
    addResult: (state, action) => {
      state.results.push(action.payload.outcome);
      state.collapsedVector = action.payload.vector;
    },
    finishRun: (state) => {
      state.isRunning = false;
    },
    resetMeasurements: (state) => {
      state.results = [];
      state.collapsedVector = null;
      state.isRunning = false;
    },
    resetAll: (state) => {
      state.activeStep = 1;
      state.theta = null;
      state.phi = null;
      state.basis = "Z";
      state.shots = 100;
      state.slowMotion = true;
      state.isRunning = false;
      state.results = [];
      state.collapsedVector = null;
      state.showIndividualOutcomes = false;
    },
  },
});

export const {
  nextStep,
  prevStep,
  setThetaPhi,
  setBasis,
  setShots,
  toggleSlowMotion,
  toggleShowIndividualOutcomes,
  startRun,
  addResult,
  finishRun,
  resetMeasurements,
  resetAll,
} = quantumSlice.actions;

export default quantumSlice.reducer;