export const degToRad = (deg) => deg * Math.PI / 180;

export const getBlochVector = (theta, phi) => {
  const t = degToRad(theta);
  const p = degToRad(phi);
  return {
    x: Math.sin(t) * Math.cos(p),
    y: Math.sin(t) * Math.sin(p),
    z: Math.cos(t),
  };
};

export const getProbability = (theta, phi, basis) => {
  const t = degToRad(theta);
  const p = degToRad(phi);
  if (basis === 'Z') return { p0: Math.cos(t/2)**2, p1: Math.sin(t/2)**2 };
  if (basis === 'X') return { p0: 0.5 + 0.5*Math.sin(t)*Math.cos(p), p1: 0.5 - 0.5*Math.sin(t)*Math.cos(p) };
  if (basis === 'Y') return { p0: 0.5 + 0.5*Math.sin(t)*Math.sin(p), p1: 0.5 - 0.5*Math.sin(t)*Math.sin(p) };
  return { p0: 0.5, p1: 0.5 };
};

export const collapseVector = (basis, outcome) => {
  if (basis === 'Z') return outcome === '0' ? {x:0,y:0,z:1} : {x:0,y:0,z:-1};
  if (basis === 'X') return outcome === '0' ? {x:1,y:0,z:0} : {x:-1,y:0,z:0};
  return outcome === '0' ? {x:0,y:1,z:0} : {x:0,y:-1,z:0};
};

export const getLabels = (basis) => {
  if (basis === 'Z') return { pos: '|0⟩', neg: '|1⟩' };
  if (basis === 'X') return { pos: '|+⟩', neg: '|−⟩' };
  return { pos: '|+i⟩', neg: '|−i⟩' };
};