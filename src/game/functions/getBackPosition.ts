import { Direction } from "grid-engine";

export function getBackPosition(facingDirection: Direction, position: { x: number; y: number }) {
  switch (facingDirection) {
    case Direction.UP:
      return { x: position.x, y: position.y + 1 };
    case Direction.RIGHT:
      return { x: position.x - 1, y: position.y };
    case Direction.DOWN:
      return { x: position.x, y: position.y - 1 };
    case Direction.LEFT:
      return { x: position.x + 1, y: position.y };
    default:
      return position;
  }
}
