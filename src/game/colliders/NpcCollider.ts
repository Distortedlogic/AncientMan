import { Direction } from "grid-engine";
import { Physics } from "phaser";
import { getStopFrame } from "../functions/getStopFrame";
import { GameScene } from "../scenes/GameScene";
import type { NpcSprite } from "../sprites/NpcSprite";
import { DialogText } from "../ui/DialogText";

const oppositeDirection = (direction: Direction) => {
  switch (direction) {
    case Direction.UP:
      return Direction.DOWN;
    case Direction.DOWN:
      return Direction.UP;
    case Direction.RIGHT:
      return Direction.LEFT;
    case Direction.LEFT:
      return Direction.RIGHT;
  }
  throw new Error("bad call");
};

export class NpcCollider extends Physics.Arcade.Collider {
  constructor(scene: GameScene) {
    const collideCallback: ArcadePhysicsCallback = (_objA, objB) => {
      if (scene.isShowingDialog) return;
      const npc = objB as NpcSprite;
      if (scene.gridEngine.isMoving(npc.texture.key)) return;
      const dialog = new DialogText(scene, npc.x, npc.y, npc.texture.key, {});
      scene.enterKey.on("down", () => {
        scene.gridEngine.moveRandomly(npc.texture.key);
        scene.time.delayedCall(100, () => {
          dialog.destroy(true);
          scene.isShowingDialog = false;
          const { delay, area } = (scene.npcSpriteGroup.getChildren() as NpcSprite[]).find(
            (npcData) => npcData.npcKey === npc.texture.key
          )!;
          scene.gridEngine.moveRandomly(npc.texture.key, delay, area);
        });
      });
      scene.isShowingDialog = true;
      const facingDirection = scene.gridEngine.getFacingDirection("hero");
      scene.gridEngine.stopMovement(npc.texture.key);
      npc.setFrame(getStopFrame(oppositeDirection(facingDirection), npc.texture.key));
    };
    super(scene.physics.world, true, scene.heroSprite.actionHitbox, scene.npcSpriteGroup, collideCallback, () => {}, collideCallback);
  }
}
