// src/components/SimulationRunner.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addResult, finishRun } from '../redux/quantumSlice';
import { getProbability, collapseVector } from '../utils/quantumMath';

const SimulationRunner = () => {
  const dispatch = useDispatch();
  const { isRunning, theta, phi, basis, shots, slowMotion } = useSelector((s) => s.quantum);

  useEffect(() => {
    if (isRunning) {
      const runSimulation = async () => {
        const { p0 } = getProbability(theta, phi, basis);

        for (let i = 0; i < shots; i++) {
          const outcome = Math.random() < p0 ? '0' : '1';
          const collapsed = collapseVector(basis, outcome);
          
          dispatch(addResult({ outcome, vector: collapsed }));

          if (slowMotion) {
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        }

        dispatch(finishRun());
      };

      runSimulation();
    }
  }, [isRunning, theta, phi, basis, shots, slowMotion, dispatch]);

  return null;
};

export default SimulationRunner;




