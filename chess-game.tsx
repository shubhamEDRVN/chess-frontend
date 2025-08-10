"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera, Text } from "@react-three/drei"
import { ChessPiece } from "./components/chess-pieces"
import { ChessBoard } from "./components/chess-board"
import {
  type GameState,
  initialBoard,
  getValidMoves,
  isInCheck,
  isCheckmate,
  formatMove,
  type PieceColor,
} from "./utils/chess-logic"
import { Vector3 } from "three"

export default function ChessGame() {
  const [gameState, setGameState] = useState<GameState>({
    board: initialBoard,
    currentPlayer: "white",
    selectedPiece: null,
    validMoves: [],
    gameStatus: "playing",
    capturedPieces: [],
    moveHistory: [],
  })

  const [animatingPieces, setAnimatingPieces] = useState<Set<string>>(new Set())
  const [cameraPosition, setCameraPosition] = useState<[number, number, number]>([10, 8, 10])

  // Check for check/checkmate after each move
  useEffect(() => {
    const inCheck = isInCheck(gameState.board, gameState.currentPlayer)
    const inCheckmate = isCheckmate(gameState.board, gameState.currentPlayer)

    let newStatus: GameState["gameStatus"] = "playing"
    if (inCheckmate) {
      newStatus = "checkmate"
    } else if (inCheck) {
      newStatus = "check"
    }

    if (newStatus !== gameState.gameStatus) {
      setGameState((prev) => ({ ...prev, gameStatus: newStatus }))
    }
  }, [gameState.board, gameState.currentPlayer])

  const handleSquareClick = useCallback(
    (x: number, y: number) => {
      if (gameState.gameStatus === "checkmate") return

      setGameState((prevState) => {
        const piece = prevState.board[y][x]

        // If no piece is selected
        if (!prevState.selectedPiece) {
          if (piece && piece.color === prevState.currentPlayer) {
            return {
              ...prevState,
              selectedPiece: [x, y],
              validMoves: getValidMoves(prevState.board, [x, y]),
            }
          }
          return prevState
        }

        // If clicking on the same piece, deselect
        if (prevState.selectedPiece[0] === x && prevState.selectedPiece[1] === y) {
          return {
            ...prevState,
            selectedPiece: null,
            validMoves: [],
          }
        }

        // If clicking on a valid move
        const isValid = prevState.validMoves.some(([moveX, moveY]) => moveX === x && moveY === y)
        if (isValid) {
          const newBoard = prevState.board.map((row) => [...row])
          const movingPiece = newBoard[prevState.selectedPiece[1]][prevState.selectedPiece[0]]
          const capturedPiece = newBoard[y][x]

          if (movingPiece) {
            // Animate the piece
            const pieceKey = `${prevState.selectedPiece[0]}-${prevState.selectedPiece[1]}`
            setAnimatingPieces((prev) => new Set(prev).add(pieceKey))

            setTimeout(() => {
              setAnimatingPieces((prev) => {
                const newSet = new Set(prev)
                newSet.delete(pieceKey)
                return newSet
              })
            }, 600)

            // Move the piece
            newBoard[y][x] = { ...movingPiece, position: [x, y], hasMoved: true }
            newBoard[prevState.selectedPiece[1]][prevState.selectedPiece[0]] = null

            // Add to move history
            const moveNotation = formatMove(prevState.selectedPiece, [x, y], movingPiece, capturedPiece || undefined)
            const newMoveHistory = [...prevState.moveHistory, moveNotation]

            // Add captured piece
            const newCapturedPieces = capturedPiece
              ? [...prevState.capturedPieces, capturedPiece]
              : prevState.capturedPieces

            return {
              ...prevState,
              board: newBoard,
              currentPlayer: prevState.currentPlayer === "white" ? "black" : "white",
              selectedPiece: null,
              validMoves: [],
              capturedPieces: newCapturedPieces,
              moveHistory: newMoveHistory,
            }
          }
        }

        // If clicking on another piece of the same color
        if (piece && piece.color === prevState.currentPlayer) {
          return {
            ...prevState,
            selectedPiece: [x, y],
            validMoves: getValidMoves(prevState.board, [x, y]),
          }
        }

        return {
          ...prevState,
          selectedPiece: null,
          validMoves: [],
        }
      })
    },
    [gameState.gameStatus],
  )

  const resetGame = () => {
    setGameState({
      board: initialBoard,
      currentPlayer: "white",
      selectedPiece: null,
      validMoves: [],
      gameStatus: "playing",
      capturedPieces: [],
      moveHistory: [],
    })
    setAnimatingPieces(new Set())
  }

  const switchCamera = () => {
    setCameraPosition((prev) => (prev[2] > 0 ? [-10, 8, -10] : [10, 8, 10]))
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700">
      {/* Game UI */}
      <div className="absolute top-4 left-4 z-10 text-white bg-black/30 backdrop-blur-sm rounded-lg p-4">
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          3D Chess
        </h1>
        <div className="space-y-2">
          <p className="text-lg">
            Current Player:{" "}
            <span
              className={`capitalize font-semibold ${gameState.currentPlayer === "white" ? "text-blue-300" : "text-purple-300"}`}
            >
              {gameState.currentPlayer}
            </span>
          </p>

          {gameState.gameStatus === "check" && <p className="text-red-400 font-bold animate-pulse">CHECK!</p>}

          {gameState.gameStatus === "checkmate" && (
            <p className="text-red-500 font-bold text-xl animate-pulse">
              CHECKMATE! {gameState.currentPlayer === "white" ? "Black" : "White"} Wins!
            </p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => window.location.href = "https://chess-f06j.onrender.com"}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              New Game
            </button>
            <button
              onClick={switchCamera}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Switch View
            </button>
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="absolute top-4 right-4 z-10 text-white bg-black/30 backdrop-blur-sm rounded-lg p-4 max-w-xs">
        <h3 className="text-lg font-semibold mb-2">Move History</h3>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {gameState.moveHistory.slice(-10).map((move, index) => (
            <div key={index} className="text-sm">
              {Math.floor(index / 2) + 1}. {move}
            </div>
          ))}
        </div>
      </div>

      {/* Captured Pieces */}
      <div className="absolute bottom-4 left-4 z-10 text-white bg-black/30 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Captured</h3>
        <div className="flex flex-wrap gap-1">
          {gameState.capturedPieces.map((piece, index) => (
            <span key={index} className={`text-2xl ${piece.color === "white" ? "text-white" : "text-gray-400"}`}>
              {getPieceSymbol(piece.type)}
            </span>
          ))}
        </div>
      </div>

      <Canvas shadows camera={{ position: cameraPosition, fov: 50 }}>
        <PerspectiveCamera makeDefault position={cameraPosition} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2.1}
          target={[3.5, 0, 3.5]}
        />

        {/* Enhanced Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[15, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-far={50}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.4} color="#4a90e2" />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#9333ea" />

        <Environment preset="city" />

        {/* Chess Board */}
        <ChessBoard
          onSquareClick={handleSquareClick}
          validMoves={gameState.validMoves}
          selectedSquare={gameState.selectedPiece}
        />

        {/* Chess Pieces - Ensure all pieces are rendered */}
        {gameState.board.map((row, y) =>
          row.map((piece, x) => {
            if (!piece) return null

            const isSelected =
              gameState.selectedPiece && gameState.selectedPiece[0] === x && gameState.selectedPiece[1] === y
            const isAnimating = animatingPieces.has(`${x}-${y}`)

            return (
              <AnimatedChessPiece
                key={`${piece.id}-${x}-${y}`}
                type={piece.type}
                color={piece.color}
                boardPosition={[x, y]}
                isSelected={isSelected}
                isAnimating={isAnimating}
                onClick={() => handleSquareClick(x, y)}
              />
            )
          }),
        )}

        {/* Floating game status text */}
        {gameState.gameStatus !== "playing" && (
          <Text
            position={[3.5, 4, 3.5]}
            fontSize={1}
            color={gameState.gameStatus === "checkmate" ? "#ef4444" : "#f59e0b"}
            anchorX="center"
            anchorY="middle"
          >
            {gameState.gameStatus.toUpperCase()}
          </Text>
        )}
      </Canvas>
    </div>
  )
}

interface AnimatedChessPieceProps {
  type: any
  color: PieceColor
  boardPosition: [number, number]
  isSelected: boolean
  isAnimating: boolean
  onClick: () => void
}

function AnimatedChessPiece({ type, color, boardPosition, isSelected, isAnimating, onClick }: AnimatedChessPieceProps) {
  const meshRef = useRef<any>(null)
  const targetPosition = useRef(new Vector3(boardPosition[0], 0.5, boardPosition[1]))

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (isAnimating) {
        const currentPos = meshRef.current.position
        const target = targetPosition.current

        // Smooth interpolation with easing
        currentPos.lerp(target, delta * 10)

        // Add a slight arc to the movement
        const progress = 1 - currentPos.distanceTo(target) / 5
        currentPos.y = target.y + Math.sin(progress * Math.PI) * 0.5

        if (currentPos.distanceTo(target) < 0.01) {
          currentPos.copy(target)
        }
      } else {
        // Ensure pieces are at correct positions when not animating
        meshRef.current.position.set(boardPosition[0], 0.5, boardPosition[1])
      }
    }
  })

  // Update target position when board position changes
  if (targetPosition.current.x !== boardPosition[0] || targetPosition.current.z !== boardPosition[1]) {
    targetPosition.current.set(boardPosition[0], 0.5, boardPosition[1])
  }

  return (
    <group ref={meshRef} position={[boardPosition[0], 0.5, boardPosition[1]]}>
      <ChessPiece
        type={type}
        color={color}
        position={[0, 0, 0]}
        isSelected={isSelected}
        onClick={onClick}
        isAnimating={isAnimating}
        scale={0.8}
      />
    </group>
  )
}

function getPieceSymbol(type: string): string {
  const symbols = {
    pawn: "♟",
    rook: "♜",
    knight: "♞",
    bishop: "♝",
    queen: "♛",
    king: "♚",
  }
  return symbols[type as keyof typeof symbols] || "?"
}
