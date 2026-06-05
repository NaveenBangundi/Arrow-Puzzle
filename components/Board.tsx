import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Cell } from './Cell';
import { Direction, LevelConfig } from '../data/levels';
import { CellCoord } from '../utils/gameLogic';

interface BoardProps {
  level: LevelConfig;
  grid: Direction[][];
  activePath: CellCoord[];
  theme: 'light' | 'dark';
  onCellPress: (r: number, c: number) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const BOARD_PADDING = 32;
const CELL_MARGIN = 4;
const MAX_CELL_SIZE = 75;

export const Board: React.FC<BoardProps> = ({
  level,
  grid,
  activePath,
  theme,
  onCellPress,
}) => {
  const { rows, cols } = level;

  // Calculate cell size dynamically based on screen width
  const availableWidth = SCREEN_WIDTH - BOARD_PADDING;
  const computedCellSize = Math.floor(availableWidth / cols) - CELL_MARGIN * 2;
  const cellSize = Math.min(computedCellSize, MAX_CELL_SIZE);

  // Check if a coordinate is in the path
  const isCellInPath = (r: number, c: number) => {
    return activePath.some((coord) => coord.r === r && coord.c === c);
  };

  // Get cell center coordinates relative to the board
  const getCellCenter = (r: number, c: number) => {
    const cellSizeWithMargin = cellSize + CELL_MARGIN * 2;
    const x = c * cellSizeWithMargin + CELL_MARGIN + cellSize / 2;
    const y = r * cellSizeWithMargin + CELL_MARGIN + cellSize / 2;
    return { x, y };
  };

  // Render glowing line segments for the active path
  const renderPathLines = () => {
    if (activePath.length < 2) return null;

    const segments: React.ReactNode[] = [];
    const jointDots: React.ReactNode[] = [];

    // Helper to generate glowing lines
    const createLine = (
      key: string,
      top: number,
      left: number,
      width: number,
      height: number,
      isVertical: boolean
    ) => {
      return (
        <React.Fragment key={key}>
          {/* Neon outer glow */}
          <View
            style={[
              styles.pathGlowLine,
              {
                top: top - (isVertical ? 0 : 3),
                left: left - (isVertical ? 3 : 0),
                width: width + (isVertical ? 6 : 0),
                height: height + (isVertical ? 0 : 6),
                borderRadius: 4,
              },
            ]}
          />
          {/* Main solid path core */}
          <View
            style={[
              styles.pathCoreLine,
              {
                top,
                left,
                width,
                height,
                borderRadius: 3,
              },
            ]}
          />
        </React.Fragment>
      );
    };

    for (let i = 0; i < activePath.length - 1; i++) {
      const p1 = activePath[i];
      const p2 = activePath[i + 1];

      const c1 = getCellCenter(p1.r, p1.c);
      const c2 = getCellCenter(p2.r, p2.c);

      const isVertical = p1.c === p2.c;
      const key = `path-seg-${i}-${p1.r}-${p1.c}-${p2.r}-${p2.c}`;

      if (isVertical) {
        const top = Math.min(c1.y, c2.y);
        const height = Math.abs(c1.y - c2.y);
        const left = c1.x - 3; // 6px width -> center alignment is (x - width/2)
        const width = 6;
        segments.push(createLine(key, top, left, width, height, true));
      } else {
        const left = Math.min(c1.x, c2.x);
        const width = Math.abs(c1.x - c2.x);
        const top = c1.y - 3; // 6px height -> center alignment is (y - height/2)
        const height = 6;
        segments.push(createLine(key, top, left, width, height, false));
      }

      // Add a joint dot at each node in the path (to smoothly bridge corners)
      const dotKey = `joint-dot-${i}-${p1.r}-${p1.c}`;
      jointDots.push(
        <React.Fragment key={dotKey}>
          <View
            style={[
              styles.jointGlowDot,
              {
                top: c1.y - 8,
                left: c1.x - 8,
              },
            ]}
          />
          <View
            style={[
              styles.jointCoreDot,
              {
                top: c1.y - 5,
                left: c1.x - 5,
              },
            ]}
          />
        </React.Fragment>
      );
    }

    // Add final joint dot on the last cell in the path
    const lastCoord = activePath[activePath.length - 1];
    const lastCenter = getCellCenter(lastCoord.r, lastCoord.c);
    const lastDotKey = `joint-dot-last-${lastCoord.r}-${lastCoord.c}`;
    jointDots.push(
      <React.Fragment key={lastDotKey}>
        <View
          style={[
            styles.jointGlowDot,
            {
              top: lastCenter.y - 8,
              left: lastCenter.x - 8,
            },
          ]}
        />
        <View
          style={[
            styles.jointCoreDot,
            {
              top: lastCenter.y - 5,
              left: lastCenter.x - 5,
            },
          ]}
        />
      </React.Fragment>
    );

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {segments}
        {jointDots}
      </View>
    );
  };

  return (
    <View style={styles.boardContainer}>
      <View style={styles.grid}>
        {grid.map((row, r) => (
          <View key={`row-${r}`} style={styles.row}>
            {row.map((direction, c) => {
              const isStart = level.start.r === r && level.start.c === c;
              const isTarget = level.target.r === r && level.target.c === c;
              const isPartOfPath = isCellInPath(r, c);

              return (
                <Cell
                  key={`cell-${r}-${c}`}
                  direction={direction}
                  isStart={isStart}
                  isTarget={isTarget}
                  isPartOfPath={isPartOfPath}
                  theme={theme}
                  onPress={() => onCellPress(r, c)}
                  size={cellSize}
                />
              );
            })}
          </View>
        ))}
        {/* Glowing Path Overlay */}
        {renderPathLines()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  grid: {
    position: 'relative',
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  row: {
    flexDirection: 'row',
  },
  // Glowing Lines Styling
  pathGlowLine: {
    position: 'absolute',
    backgroundColor: 'rgba(6, 182, 212, 0.25)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  pathCoreLine: {
    position: 'absolute',
    backgroundColor: '#22d3ee',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  // Joint Dots Styling
  jointGlowDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.35)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  jointCoreDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    borderColor: '#06b6d4',
    borderWidth: 2,
  },
});
