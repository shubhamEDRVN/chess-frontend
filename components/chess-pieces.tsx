"use client"

import { useRef, useMemo } from "react"
import type { Mesh } from "three"
import { useFrame } from "@react-three/fiber"
import type { PieceType, PieceColor } from "../utils/chess-logic"

interface ChessPieceProps {
  type: PieceType
  color: PieceColor
  position: [number, number, number]
  isSelected?: boolean
  onClick?: () => void
  isAnimating?: boolean
  scale?: number
}

export function ChessPiece({ type, color, position, isSelected, onClick, isAnimating, scale = 0.8 }: ChessPieceProps) {
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<any>(null)

  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.1 + 0.2
      if (groupRef.current) {
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
      }
    } else if (meshRef.current && !isAnimating) {
      meshRef.current.position.y = position[1]
      if (groupRef.current) {
        groupRef.current.rotation.y = 0
      }
    }
  })

  const materialColor = color === "white" ? "#f8f8f8" : "#1a1a1a"
  const emissiveColor = isSelected ? (color === "white" ? "#4a90e2" : "#357abd") : "#000000"
  const emissiveIntensity = isSelected ? 0.4 : 0

  const pieceGeometry = useMemo(() => {
    switch (type) {
      case "pawn":
        return <PawnGeometry />
      case "rook":
        return <RookGeometry />
      case "knight":
        return <KnightGeometry />
      case "bishop":
        return <BishopGeometry />
      case "queen":
        return <QueenGeometry />
      case "king":
        return <KingGeometry />
      default:
        return <PawnGeometry />
    }
  }, [type])

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <mesh ref={meshRef} onClick={onClick} castShadow receiveShadow position={[0, 0, 0]}>
        {pieceGeometry}
        <meshPhongMaterial
          color={materialColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          shininess={100}
          specular="#ffffff"
        />
      </mesh>

      {/* Subtle glow effect for selected pieces */}
      {isSelected && (
        <mesh position={[0, 0, 0]} scale={1.2}>
          {pieceGeometry}
          <meshBasicMaterial color={color === "white" ? "#4a90e2" : "#357abd"} transparent opacity={0.2} />
        </mesh>
      )}
    </group>
  )
}

function PawnGeometry() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.15, 12]} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 0.3, 12]} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.12, 12, 8]} />
      </mesh>
    </group>
  )
}

function RookGeometry() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.15, 8]} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.4, 8]} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.15, 8]} />
      </mesh>
      {/* Crenellations */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.2, 0.7, Math.sin(angle) * 0.2]}>
          <boxGeometry args={[0.08, 0.15, 0.08]} />
        </mesh>
      ))}
    </group>
  )
}

function KnightGeometry() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.2, 12]} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.6, 12]} />
      </mesh>
      {/* Horse head approximation */}
      <mesh position={[0, 0.8, 0.1]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
      </mesh>
      <mesh position={[0, 1.0, 0.25]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.2, 0.3, 0.15]} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.1, 1.2, 0.3]}>
        <coneGeometry args={[0.05, 0.15, 4]} />
      </mesh>
      <mesh position={[0.1, 1.2, 0.3]}>
        <coneGeometry args={[0.05, 0.15, 4]} />
      </mesh>
    </group>
  )
}

function BishopGeometry() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.35, 0.2, 12]} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.6, 12]} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.2, 12, 8]} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.15, 0.4, 12]} />
      </mesh>
      {/* Cross on top */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.05, 0.2, 0.05]} />
      </mesh>
      <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 0.15, 0.05]} />
      </mesh>
    </group>
  )
}

function QueenGeometry() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.2, 12]} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 0.8, 12]} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.3, 0.25, 0.3, 12]} />
      </mesh>
      {/* Crown points */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh key={i} position={[Math.cos(angle) * 0.25, 1.3, Math.sin(angle) * 0.25]}>
          <coneGeometry args={[0.08, 0.3, 6]} />
        </mesh>
      ))}
      {/* Center crown point */}
      <mesh position={[0, 1.4, 0]}>
        <coneGeometry args={[0.1, 0.4, 6]} />
      </mesh>
    </group>
  )
}

function KingGeometry() {
  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.2, 12]} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.28, 0.35, 0.8, 12]} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.32, 0.28, 0.4, 12]} />
      </mesh>
      {/* Crown base */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.3, 0.32, 0.2, 12]} />
      </mesh>
      {/* Cross on top */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
      </mesh>
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
      </mesh>
    </group>
  )
}
