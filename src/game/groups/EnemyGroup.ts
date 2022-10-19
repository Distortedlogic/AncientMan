import { GameObjects } from "phaser";

export class EnemyGroup extends GameObjects.Group {
  constructor(
    scene: Phaser.Scene,
    children?:
      | GameObjects.GameObject[]
      | Phaser.Types.GameObjects.Group.GroupConfig
      | Phaser.Types.GameObjects.Group.GroupCreateConfig
      | undefined,
    config?: Phaser.Types.GameObjects.Group.GroupConfig | Phaser.Types.GameObjects.Group.GroupCreateConfig | undefined
  ) {
    super(scene, children, config);
  }
}
