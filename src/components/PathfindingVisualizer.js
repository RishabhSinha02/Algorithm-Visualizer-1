import React, { Component } from "react";
import Node from "./Node";
import { Button } from "@mui/material";
import buttonStyles from "./ButtonStyle";
import { connect } from "react-redux";
import * as dijkstra from "../algorithms/pathfinding/dijkstra";
import * as astar from "../algorithms/pathfinding/astar";

import "./PathfindingVisualizer.css";
import Info from "../info";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
    this.props.showModel(true);
  }

  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid });
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  animatePathfindingAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }

  // Call this function on button click
  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra.dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder =
      dijkstra.getNodesInShortestPathOrder(finishNode);
    this.animatePathfindingAlgorithm(
      visitedNodesInOrder,
      nodesInShortestPathOrder
    );
  }

  // Call this function on button click
  visualizeAstar() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = astar.astar(grid, startNode, finishNode);
    const nodesInShortestPathOrder =
      astar.getNodesInShortestPathOrder(finishNode);
    this.animatePathfindingAlgorithm(
      visitedNodesInOrder,
      nodesInShortestPathOrder
    );
  }

  onVisualiseHandler = () => {
    switch (this.props.method) {
      case "djiktra":
        this.visualizeDijkstra(this);
        break;
      case "a*":
        break;
      default:
        break;
    }
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    return (
      <div className="PathfindingVisualizer">
        {this.props.children}
        <Button
          style={buttonStyles}
          className="float"
          variant="contained"
          color="secondary"
          onClick={this.onVisualiseHandler}
        >
          Visualise
        </Button>
        <div className="grid-wrapper">
          <Info onClick={() => this.props.showModel(true)} />
          <div className="grid">
            {grid.map((row, rowIdx) => {
              return (
                <div key={rowIdx} className="grid-row">
                  {row.map((node, nodeIdx) => {
                    const { row, col, isFinish, isStart, isWall } = node;
                    return (
                      <Node
                        key={nodeIdx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={mouseIsPressed}
                        onMouseDown={(row, col) =>
                          this.handleMouseDown(row, col)
                        }
                        onMouseEnter={(row, col) =>
                          this.handleMouseEnter(row, col)
                        }
                        onMouseUp={() => this.handleMouseUp()}
                        row={row}
                      ></Node>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  const node = {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
    cost: calculateCost(row, col),
  };

  return node;
};

const calculateCost = (nodeRow, nodeCol) => {
  const rowCost = Math.abs(nodeRow - FINISH_NODE_ROW);
  const colCost = Math.abs(nodeCol - FINISH_NODE_COL);

  return rowCost + colCost;
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const mapStateToProps = (state) => {
  return {
    method: state.path.method,
  };
};
export default connect(mapStateToProps)(PathfindingVisualizer);
