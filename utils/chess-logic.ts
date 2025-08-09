export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king"
export type PieceColor = "white" | "black"

export interface ChessPiece {
  type: PieceType
  color: PieceColor
  position: [number, number]
  hasMoved?: boolean
  id: string
}

export interface GameState {
  board: (ChessPiece | null)[][]
  currentPlayer: PieceColor
  selectedPiece: [number, number] | null
  validMoves: [number, number][]
  gameStatus: "playing" | "check" | "checkmate" | "stalemate"
  capturedPieces: ChessPiece[]
  moveHistory: string[]
}

export const initialBoard: (ChessPiece | null)[][] = [
  // Black pieces (row 0)
  [
    { type: "rook", color: "black", position: [0, 0], id: "br1" },
    { type: "knight", color: "black", position: [1, 0], id: "bn1" },
    { type: "bishop", color: "black", position: [2, 0], id: "bb1" },
    { type: "queen", color: "black", position: [3, 0], id: "bq" },
    { type: "king", color: "black", position: [4, 0], id: "bk" },
    { type: "bishop", color: "black", position: [5, 0], id: "bb2" },
    { type: "knight", color: "black", position: [6, 0], id: "bn2" },
    { type: "rook", color: "black", position: [7, 0], id: "br2" },
  ],
  // Black pawns (row 1)
  [
    { type: "pawn", color: "black", position: [0, 1], id: "bp1" },
    { type: "pawn", color: "black", position: [1, 1], id: "bp2" },
    { type: "pawn", color: "black", position: [2, 1], id: "bp3" },
    { type: "pawn", color: "black", position: [3, 1], id: "bp4" },
    { type: "pawn", color: "black", position: [4, 1], id: "bp5" },
    { type: "pawn", color: "black", position: [5, 1], id: "bp6" },
    { type: "pawn", color: "black", position: [6, 1], id: "bp7" },
    { type: "pawn", color: "black", position: [7, 1], id: "bp8" },
  ],
  // Empty rows (2-5)
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  // White pawns (row 6)
  [
    { type: "pawn", color: "white", position: [0, 6], id: "wp1" },
    { type: "pawn", color: "white", position: [1, 6], id: "wp2" },
    { type: "pawn", color: "white", position: [2, 6], id: "wp3" },
    { type: "pawn", color: "white", position: [3, 6], id: "wp4" },
    { type: "pawn", color: "white", position: [4, 6], id: "wp5" },
    { type: "pawn", color: "white", position: [5, 6], id: "wp6" },
    { type: "pawn", color: "white", position: [6, 6], id: "wp7" },
    { type: "pawn", color: "white", position: [7, 6], id: "wp8" },
  ],
  // White pieces (row 7)
  [
    { type: "rook", color: "white", position: [0, 7], id: "wr1" },
    { type: "knight", color: "white", position: [1, 7], id: "wn1" },
    { type: "bishop", color: "white", position: [2, 7], id: "wb1" },
    { type: "queen", color: "white", position: [3, 7], id: "wq" },
    { type: "king", color: "white", position: [4, 7], id: "wk" },
    { type: "bishop", color: "white", position: [5, 7], id: "wb2" },
    { type: "knight", color: "white", position: [6, 7], id: "wn2" },
    { type: "rook", color: "white", position: [7, 7], id: "wr2" },
  ],
]

export function isValidMove(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number],
  piece: ChessPiece,
): boolean {
  const [fromX, fromY] = from
  const [toX, toY] = to
  const dx = toX - fromX
  const dy = toY - fromY
  const targetPiece = board[toY][toX]

  // Can't move to same square
  if (fromX === toX && fromY === toY) return false

  // Can't capture own piece
  if (targetPiece && targetPiece.color === piece.color) return false

  // Basic movement patterns
  switch (piece.type) {
    case "pawn":
      const direction = piece.color === "white" ? -1 : 1
      const startRow = piece.color === "white" ? 6 : 1

      if (dx === 0) {
        if (dy === direction && !targetPiece) return true
        if (fromY === startRow && dy === 2 * direction && !targetPiece) return true
      } else if (Math.abs(dx) === 1 && dy === direction && targetPiece) {
        return true
      }
      return false

    case "rook":
      if (dx === 0 || dy === 0) {
        return isPathClear(board, from, to)
      }
      return false

    case "knight":
      return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2)

    case "bishop":
      if (Math.abs(dx) === Math.abs(dy)) {
        return isPathClear(board, from, to)
      }
      return false

    case "queen":
      if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
        return isPathClear(board, from, to)
      }
      return false

    case "king":
      return Math.abs(dx) <= 1 && Math.abs(dy) <= 1

    default:
      return false
  }
}

function isPathClear(board: (ChessPiece | null)[][], from: [number, number], to: [number, number]): boolean {
  const [fromX, fromY] = from
  const [toX, toY] = to
  const dx = Math.sign(toX - fromX)
  const dy = Math.sign(toY - fromY)

  let x = fromX + dx
  let y = fromY + dy

  while (x !== toX || y !== toY) {
    if (board[y][x]) return false
    x += dx
    y += dy
  }

  return true
}

export function getValidMoves(board: (ChessPiece | null)[][], position: [number, number]): [number, number][] {
  const piece = board[position[1]][position[0]]
  if (!piece) return []

  const validMoves: [number, number][] = []

  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      if (isValidMove(board, position, [x, y], piece)) {
        // Check if this move would put own king in check
        if (!wouldBeInCheck(board, position, [x, y], piece.color)) {
          validMoves.push([x, y])
        }
      }
    }
  }

  return validMoves
}

export function findKing(board: (ChessPiece | null)[][], color: PieceColor): [number, number] | null {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x]
      if (piece && piece.type === "king" && piece.color === color) {
        return [x, y]
      }
    }
  }
  return null
}

export function isInCheck(board: (ChessPiece | null)[][], color: PieceColor): boolean {
  const kingPos = findKing(board, color)
  if (!kingPos) return false

  const opponentColor = color === "white" ? "black" : "white"

  // Check if any opponent piece can attack the king
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x]
      if (piece && piece.color === opponentColor) {
        if (isValidMove(board, [x, y], kingPos, piece)) {
          return true
        }
      }
    }
  }

  return false
}

function wouldBeInCheck(
  board: (ChessPiece | null)[][],
  from: [number, number],
  to: [number, number],
  color: PieceColor,
): boolean {
  // Create a copy of the board with the move made
  const newBoard = board.map((row) => [...row])
  const piece = newBoard[from[1]][from[0]]

  newBoard[to[1]][to[0]] = piece
  newBoard[from[1]][from[0]] = null

  return isInCheck(newBoard, color)
}

export function isCheckmate(board: (ChessPiece | null)[][], color: PieceColor): boolean {
  if (!isInCheck(board, color)) return false

  // Check if any piece can make a valid move
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x]
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, [x, y])
        if (validMoves.length > 0) {
          return false
        }
      }
    }
  }

  return true
}

export function formatMove(
  from: [number, number],
  to: [number, number],
  piece: ChessPiece,
  captured?: ChessPiece,
): string {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"]
  const fromSquare = `${files[from[0]]}${8 - from[1]}`
  const toSquare = `${files[to[0]]}${8 - to[1]}`

  const pieceSymbol = piece.type === "pawn" ? "" : piece.type.charAt(0).toUpperCase()
  const captureSymbol = captured ? "x" : ""

  return `${pieceSymbol}${captureSymbol}${toSquare}`
}
