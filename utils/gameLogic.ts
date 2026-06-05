import { Direction, LevelConfig } from '../data/levels';

export interface CellCoord {
  r: number;
  c: number;
}

/**
 * Traces the path from the start cell following the arrow directions.
 * Returns the list of cell coordinates visited, and whether the path successfully reaches the target cell.
 */
export function tracePath(
  grid: Direction[][],
  start: CellCoord,
  target: CellCoord
): { path: CellCoord[]; hasReachedTarget: boolean } {
  const path: CellCoord[] = [];
  const visited = new Set<string>();
  let curr = { ...start };

  const rows = grid.length;
  const cols = grid[0].length;

  while (true) {
    path.push({ r: curr.r, c: curr.c });
    visited.add(`${curr.r},${curr.c}`);

    // If we've reached the target cell, stop tracing. We win!
    if (curr.r === target.r && curr.c === target.c) {
      return { path, hasReachedTarget: true };
    }

    const dir = grid[curr.r][curr.c];
    let nextR = curr.r;
    let nextC = curr.c;

    switch (dir) {
      case 'UP':
        nextR -= 1;
        break;
      case 'DOWN':
        nextR += 1;
        break;
      case 'LEFT':
        nextC -= 1;
        break;
      case 'RIGHT':
        nextC += 1;
        break;
    }

    // Check grid bounds
    if (nextR < 0 || nextR >= rows || nextC < 0 || nextC >= cols) {
      break;
    }

    // Check if we hit a loop.
    if (visited.has(`${nextR},${nextC}`)) {
      // Add the looping cell to the path to draw the complete loop visually, then terminate
      path.push({ r: nextR, c: nextC });
      break;
    }

    curr = { r: nextR, c: nextC };
  }

  return { path, hasReachedTarget: false };
}

/**
 * Rotates a direction 90 degrees clockwise.
 */
export function rotateClockwise(dir: Direction): Direction {
  switch (dir) {
    case 'UP':
      return 'RIGHT';
    case 'RIGHT':
      return 'DOWN';
    case 'DOWN':
      return 'LEFT';
    case 'LEFT':
      return 'UP';
  }
}

/**
 * Generates the initial grid by randomizing the solution grid.
 * Ensures the initial state does not already solve the puzzle.
 */
export function generateInitialGrid(level: LevelConfig): Direction[][] {
  const rows = level.rows;
  const cols = level.cols;
  let attempts = 0;

  while (attempts < 10) {
    const grid: Direction[][] = [];
    for (let r = 0; r < rows; r++) {
      grid.push([]);
      for (let c = 0; c < cols; c++) {
        const solDir = level.solution[r][c];
        // Rotate randomly between 0 and 3 times
        const rotations = Math.floor(Math.random() * 4);
        let currDir = solDir;
        for (let i = 0; i < rotations; i++) {
          currDir = rotateClockwise(currDir);
        }
        grid[r].push(currDir);
      }
    }

    // Verify it is not already solved. If it is, regenerate.
    const { hasReachedTarget } = tracePath(grid, level.start, level.target);
    if (!hasReachedTarget) {
      return grid;
    }
    attempts++;
  }

  // Fallback: Just rotate the start cell away from the target path if all else fails
  const grid: Direction[][] = level.solution.map((row) => [...row]);
  grid[level.start.r][level.start.c] = rotateClockwise(grid[level.start.r][level.start.c]);
  return grid;
}
