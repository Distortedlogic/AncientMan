import { GameObjects } from "phaser";
import type { GameScene } from "../scenes/GameScene";
import { EEnemy, EEnemyAi, EnemySprite } from "../sprites/EnemySprite";
import { TypedSpriteGroup } from "./TypedSpriteGroup";

export class EnemyGroup extends TypedSpriteGroup<EnemySprite> {
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

  addFromData(value: string, position: { x: number; y: number }) {
    const [enemyType, enemyAI, speed, health] = value.split(":") as [EEnemy, EEnemyAi, string, string];
    this.add(
      new EnemySprite(this.scene, {
        position,
        speed: Number.parseInt(speed, 10),
        enemyType,
        enemySpecies: EnemySprite.getEnemySpecies(enemyType),
        enemyAI,
        enemyName: `${enemyType}_${this.countActive()}`,
        health: Number.parseInt(health, 10),
      })
    );
  }
}
