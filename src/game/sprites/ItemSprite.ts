import { CharacterData } from "grid-engine";
import { GameObjects, Physics } from "phaser";
import { CustomHitbox } from "../CustomHitbox";
import type { GameScene } from "../scenes/GameScene";

export enum ELootItem {
  Coin = "coin",
  Heart = "heart",
}

export const LOOT_ITEMS = Object.values(ELootItem);

export enum EOtherItem {
  HeartContainer = "heart_container",
  Sword = "sword",
  Push = "push",
}

export const EItems = { ...ELootItem, ...EOtherItem };
export type EItems = typeof EItems;

export type EItem = typeof EItems[keyof typeof EItems];

export class ItemSprite extends Physics.Arcade.Sprite {
  scene: GameScene;
  container: GameObjects.Container;
  actionHitbox: CustomHitbox;

  eItem: EItem;

  constructor(scene: GameScene, x: number, y: number, eItem: EItem, frame?: string | number | undefined) {
    super(scene, x, y, eItem.toString(), frame);
    this.eItem = eItem;
    this.setDepth(1);
    this.actionHitbox = new CustomHitbox(this.scene, this.x + 9, this.y + 36, 14, 8, "attack");
    this.container = scene.add.container(this.x, this.y, [this, this.actionHitbox]);
    this.scene.gridEngineConfig.characters.push(this.getCharacterData());
    switch (eItem) {
      case EItems.Coin:
        this.anims.play("coin_idle");
        break;
      case EItems.Heart:
        this.anims.play("heart_idle");
        break;
    }
  }

  getCharacterData(): CharacterData {
    return {
      id: this.eItem,
      sprite: this,
      container: this.container,
      startPosition: { x: this.x, y: this.y },
    };
  }
}
