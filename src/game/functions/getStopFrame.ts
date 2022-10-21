import { Direction } from "grid-engine";

export function getStopFrame(direction: Direction, charId: string) {
  switch (direction) {
    case Direction.UP:
      return `${charId}_idle_up_01`;
    case Direction.RIGHT:
      return `${charId}_idle_right_01`;
    case Direction.DOWN:
      return `${charId}_idle_down_01`;
    case Direction.LEFT:
      return `${charId}_idle_left_01`;
    default:
      return "";
  }
}
