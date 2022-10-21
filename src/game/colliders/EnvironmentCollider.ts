import { Physics } from "phaser";
import { ATTACK_DELAY_TIME, ETile } from "../constants";
import type { GameScene } from "../scenes/GameScene";

export class EnvironmentCollider extends Physics.Arcade.Collider {
  constructor(scene: GameScene) {
    const collideCallback: ArcadePhysicsCallback = (_objA, objB) => {
      const tile = objB as any; //TODO as Phaser.Tilemaps.Tile;
      // Handles attack
      if (tile?.index > 0 && !tile.wasHandled) {
        switch (tile.index) {
          case ETile.BUSH:
            if (scene.heroSprite.isAttacking) {
              tile.wasHandled = true;
              scene.time.delayedCall(ATTACK_DELAY_TIME, () => {
                tile.setVisible(false);
                scene.itemSpriteGroup.spawnItem({ x: tile.pixelX, y: tile.pixelY });
                tile.destroy();
              });
            }
            break;
          case ETile.BOX:
            if (scene.heroSprite.canPush && scene.heroSprite.isAttacking) {
              const newPosition = scene.calculatePushTilePosition();
              const canBePushed = scene.map.layers.every(
                (layer) => !layer.tilemapLayer.getTileAtWorldXY(newPosition.x, newPosition.y)?.properties?.ge_collide
              );
              if (canBePushed && !tile.isMoved) {
                tile.isMoved = true;
                scene.tweens.add({
                  targets: tile,
                  pixelX: newPosition.x,
                  pixelY: newPosition.y,
                  ease: "Power2", // PhaserMath.Easing
                  duration: 700,
                  onComplete: () => {
                    tile.setVisible(false);
                    const newTile = tile.layer.tilemapLayer.putTileAt(ETile.BOX, newPosition.x / 16, newPosition.y / 16, true);
                    newTile.properties = { ...tile.properties };
                    newTile.isMoved = true;
                    tile.destroy();
                  },
                });
              }
            }
            break;
        }
      }
    };
    super(
      scene.physics.world,
      true,
      scene.heroSprite.actionHitbox,
      scene.map.getLayer("elements").tilemapLayer,
      collideCallback,
      () => {},
      collideCallback
    );
  }
}
