import { GameObjects, Math as PhaserMath } from "phaser";
import type { GameScene } from "../scenes/GameScene";
import { EItem, EItems, ItemSprite, LOOT_ITEMS } from "../sprites/ItemSprite";
import { TypedSpriteGroup } from "./TypedSpriteGroup";

export class ItemGroup extends TypedSpriteGroup<ItemSprite> {
  scene: GameScene;

  constructor(
    scene: GameScene,
    children?:
      | GameObjects.GameObject[]
      | Phaser.Types.GameObjects.Group.GroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig
      | undefined,
    config?: Phaser.Types.GameObjects.Group.GroupConfig | Phaser.Types.GameObjects.Group.GroupCreateConfig | undefined
  ) {
    super(scene.physics.world, scene, children, config);
    scene.add.existing(this);
  }

  spawnItem(position: { x: number; y: number }) {
    const itemChance = PhaserMath.Between(1, this.scene.physics.config.debug ? 2 : 5);
    if (itemChance === 1) {
      const eItem = LOOT_ITEMS[PhaserMath.Between(0, LOOT_ITEMS.length - 1)];
      const sprite = new ItemSprite(this.scene, position.x, position.y, eItem).setDepth(1).setOrigin(0, 0);
      this.add(sprite);
      sprite.anims.play(`${eItem}_idle`);
    }
  }

  addFromData(value: String, { x, y }: { x: number; y: number }) {
    const [itemType] = value.split(":") as [EItem];
    if (itemType === EItems.Sword) {
      if (!this.scene.heroSprite.haveSword) this.add(new ItemSprite(this.scene, x!, y!, itemType).setDepth(1).setOrigin(0, 1));
    } else if (itemType === EItems.Push) {
      if (!this.scene.heroSprite.canPush) this.add(new ItemSprite(this.scene, x!, y!, itemType).setDepth(1).setOrigin(0, 1));
    } else this.add(new ItemSprite(this.scene, x!, y!, itemType).setDepth(1).setOrigin(0, 1));
  }
}
