import { Physics } from "phaser";
import { SCENE_FADE_TIME } from "../constants";
import { CustomHitbox } from "../CustomHitbox";
import type { GameScene, IInitialSceneData } from "../scenes/GameScene";

export class TeleportCollider extends Physics.Arcade.Collider {
  constructor(scene: GameScene, mapKey: string, triggerPosition: { x: number; y: number }, targetPosition: { x: number; y: number }) {
    const collideCallback: ArcadePhysicsCallback = () => {
      console.log("TELEPORT");
      const facingDirection = scene.gridEngine.getFacingDirection("hero");
      scene.cameras.main.fadeOut(SCENE_FADE_TIME);
      scene.isTeleporting = true;
      scene.time.delayedCall(SCENE_FADE_TIME, () => {
        scene.isTeleporting = false;
        const sceneInitData: IInitialSceneData = {
          heroStatus: {
            position: targetPosition,
            frame: `hero_idle_${facingDirection}_01`,
            facingDirection,
            health: scene.heroSprite.health,
            maxHealth: scene.heroSprite.maxHealth,
            coin: scene.heroSprite.coin,
            canPush: scene.heroSprite.canPush,
            haveSword: scene.heroSprite.haveSword,
          },
          mapKey,
        };
        scene.scene.restart(sceneInitData);
      });
      scene.physics.world.removeCollider(this);
    };
    super(
      scene.physics.world,
      true,
      scene.heroSprite.actionHitbox,
      new CustomHitbox(scene, triggerPosition.x, triggerPosition.y, 16, 16, "teleport"),
      collideCallback,
      () => {},
      collideCallback
    );
  }
}
