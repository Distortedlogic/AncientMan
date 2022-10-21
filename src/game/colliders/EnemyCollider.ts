import { Physics } from "phaser";
import { ATTACK_DELAY_TIME } from "../constants";
import type { GameScene } from "../scenes/GameScene";
import type { EnemySprite } from "../sprites/EnemySprite";

export class EnemyCollider extends Physics.Arcade.Collider {
  constructor(scene: GameScene) {
    const collideCallback: ArcadePhysicsCallback = (_objA, objB) => {
      const enemy = objB as EnemySprite;
      if (enemy.isAttacking || scene.gridEngine.isMoving(enemy.name)) return;
      enemy.anims.play(`${enemy.eEnemySpecies}_attack`);
      scene.heroSprite.takeDamage(10);
      enemy.isAttacking = true;
      scene.time.delayedCall(enemy.getEnemyAttackSpeed(), () => {
        enemy.isAttacking = false;
      });
      if (scene.heroSprite.isAttacking) {
        const isSpaceJustDown = Boolean(scene.isSpaceJustDown);
        scene.time.delayedCall(ATTACK_DELAY_TIME, () => enemy.takeDamage(25, isSpaceJustDown));
      }
    };
    super(scene.physics.world, true, scene.heroSprite.actionHitbox, scene.enemySpriteGroup, collideCallback, () => {}, collideCallback);
  }
}
