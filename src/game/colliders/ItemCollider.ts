import { Physics } from "phaser";
import type { GameScene } from "../scenes/GameScene";
import { EItems, ItemSprite } from "../sprites/ItemSprite";

export class ItemCollider extends Physics.Arcade.Collider {
  constructor(scene: GameScene) {
    const collideCallback: ArcadePhysicsCallback = (_objA, objB) => {
      const item = objB as ItemSprite;
      switch (item.eItem) {
        case EItems.Heart:
          scene.heroSprite.restoreHealth(20);
          break;
        case EItems.Coin:
          scene.heroSprite.collectCoin(1);
          break;
        case EItems.HeartContainer:
          scene.heroSprite.increaseMaxHealth(20);
          break;
        case EItems.Sword:
          scene.heroSprite.haveSword = true;
          break;
        case EItems.Push:
          scene.heroSprite.canPush = true;
          break;
      }
      item.setVisible(false);
      item.destroy();
    };
    super(scene.physics.world, true, scene.heroSprite.actionHitbox, scene.itemSpriteGroup, collideCallback, () => {}, collideCallback);
  }
}
