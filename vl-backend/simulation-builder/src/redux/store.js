// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import quantumReducer from './quantumSlice';

export const store = configureStore({
  reducer: {
    quantum: quantumReducer,
  },
  // Optional: turn off serializable check in dev if you get warnings (common with Redux Toolkit)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;