"use client"

import { useRef } from "react"
import type { Mesh } from "three"
import { useFrame } from "@react-three/fiber"

interface ChessBoardProps {
  onSquareClick: (x: number, y: number) => void
  validMoves: [number, number][]
  selectedSquare: [number, number] | null
}

export function ChessBoard({ onSquareClick, validMoves, selectedSquare }: ChessBoardProps) {
  return (
    <group>
      {/* Board base with elegant border */}
      <mesh position={[3.5, -0.15, 3.5]} receiveShadow>
        <boxGeometry args={[10, 0.3, 10]} />
        <meshPhongMaterial color="#654321" />
      </mesh>

      {/* Inner board frame */}
      <mesh position={[3.5, -0.05, 3.5]} receiveShadow>
        <boxGeometry args={[8.5, 0.1, 8.5]} />
        <meshPhongMaterial color="#8B4513" />
      </mesh>

      {/* Board squares */}
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 8 }, (_, col) => {
          const isLight = (row + col) % 2 === 0
          const isValidMove = validMoves.some(([x, y]) => x === col && y === row)
          const isSelected = selectedSquare && selectedSquare[0] === col && selectedSquare[1] === row

          return (
            <ChessSquare
              key={`${col}-${row}`}
              position={[col, 0, row]}
              isLight={isLight}
              isValidMove={isValidMove}
              isSelected={isSelected}
              onClick={() => onSquareClick(col, row)}
            />
          )
        }),
      )}

      {/* Board coordinates */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`coords-${i}`}>
          {/* File labels (a-h) */}
          <mesh position={[i, -0.1, -0.5]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial color="#8B4513" />
          </mesh>

          {/* Rank labels (1-8) */}
          <mesh position={[-0.5, -0.1, i]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial color="#8B4513" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface ChessSquareProps {
  position: [number, number, number]
  isLight: boolean
  isValidMove: boolean
  isSelected: boolean
  onClick: () => void
}

function ChessSquare({ position, isLight, isValidMove, isSelected, onClick }: ChessSquareProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && (isSelected || isValidMove)) {
      const intensity = isSelected ? 0.4 : 0.2
      const speed = isSelected ? 4 : 2
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * speed) * 0.02 * intensity
    }
  })

  const baseColor = isLight ? "#f0d9b5" : "#b58863"
  let emissive = "#000000"
  let emissiveIntensity = 0

  if (isSelected) {
    emissive = "#4a90e2"
    emissiveIntensity = 0.4
  } else if (isValidMove) {
    emissive = "#90EE90"
    emissiveIntensity = 0.3
  }

  return (
    <group>
      <mesh ref={meshRef} position={position} onClick={onClick} receiveShadow>
        <boxGeometry args={[1, 0.05, 1]} />
        <meshPhongMaterial color={baseColor} emissive={emissive} emissiveIntensity={emissiveIntensity} shininess={50} />
      </mesh>

      {/* Valid move indicator */}
      {isValidMove && (
        <mesh position={[position[0], position[1] + 0.1, position[2]]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 12]} />
          <meshPhongMaterial color="#90EE90" transparent opacity={0.8} emissive="#90EE90" emissiveIntensity={0.2} />
        </mesh>
      )}

      {/* Selection highlight ring */}
      {isSelected && (
        <mesh position={[position[0], position[1] + 0.08, position[2]]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial color="#4a90e2" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
