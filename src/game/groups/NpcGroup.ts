import { GameObjects } from "phaser";
import type { GameScene } from "../scenes/GameScene";
import { NpcSprite } from "../sprites/NpcSprite";
import { TypedSpriteGroup } from "./TypedSpriteGroup";

export class NpcGroup extends TypedSpriteGroup<NpcSprite> {
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

  addFromData(data: string, position: { x: number; y: number }) {
    const [npcKey, config] = data.trim().split(":");
    const [movementType, delay, area, direction] = config.split(";");
    this.add(
      new NpcSprite(
        {
          position,
          npcKey,
          delay: Number.parseInt(delay, 10),
          area: Number.parseInt(area, 10),
          movementType,
        },
        this.scene,
        `${npcKey}_idle_${direction}_01`
      )
    );
  }
}
