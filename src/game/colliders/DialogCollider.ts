import { Physics } from "phaser";
import { CustomHitbox } from "../CustomHitbox";
import type { GameScene } from "../scenes/GameScene";
import { DialogText } from "../ui/DialogText";

export class DialogCollider extends Physics.Arcade.Collider {
  constructor(scene: GameScene, text: string, position: { x: number; y: number }) {
    const collideCallback: ArcadePhysicsCallback = (_objA, _objB) => {
      if (scene.isShowingDialog) return;
      const dialog = new DialogText(scene, position.x!, position.y!, text, {});
      scene.enterKey.on("down", () => {
        scene.isShowingDialog = false;
        dialog.destroy(true);
        this.destroy();
      });
      scene.isShowingDialog = true;
    };
    super(
      scene.physics.world,
      true,
      scene.heroSprite.actionHitbox,
      new CustomHitbox(scene, position.x, position.y, 16, 16, "dialog").setOrigin(0, 1),
      collideCallback,
      () => {},
      collideCallback
    );
  }
}
