import { Physics, Types } from "phaser";
import type { GameScene } from "../scenes/GameScene";

export enum ELootItem {
  Coin = "coin",
  Heart = "heart",
}

export enum EOtherItem {
  HeartContainer = "heart_container",
  Sword = "sword",
  Push = "push",
}

export const EItems = { ...ELootItem, ...EOtherItem };
export type EItems = typeof EItems;

export type EItem = typeof EItems[keyof typeof EItems];

export class ItemSprite extends Physics.Arcade.Sprite {
  physics: Physics.Arcade.ArcadePhysics;
  sprite: Types.Physics.Arcade.SpriteWithDynamicBody;
  scene: GameScene;

  eItem: EItem;

  constructor(scene: GameScene, x: number, y: number, eItem: EItem, frame?: string | number | undefined) {
    super(scene, x, y, eItem.toString(), frame);
    this.setDepth(1);
    this.body.setSize(14, 14);
    this.body.setOffset(9, 13);
    switch (eItem) {
      case EItems.Coin: {
        this.anims.play("coin_idle");
        break;
      }
      case EItems.Heart: {
        this.anims.play("heart_idle");
        break;
      }
    }
  }
}
