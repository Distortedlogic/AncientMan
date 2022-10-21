import { CharacterData } from "grid-engine";
import { GameObjects, Math as PhaserMath, Physics } from "phaser";
import { CustomHitbox } from "../CustomHitbox";
import type { GameScene } from "../scenes/GameScene";

export enum EEnemy {
  FigureOut = "figure out",
}

export enum EEnemySpecies {
  Slime = "slime",
}

export enum EEnemyAi {
  Follow = "follow",
}

interface IEnemyData {
  enemySpecies: EEnemySpecies;
  enemyType: EEnemy;
  position: { x: number; y: number };
  enemyName: string;
  speed: number;
  enemyAI: EEnemyAi;
  health: number;
}

export class EnemySprite extends Physics.Arcade.Sprite {
  scene: GameScene;
  container: GameObjects.Container;

  actionHitbox: CustomHitbox;

  name: string;
  eEnemy: EEnemy;
  eEnemySpecies: EEnemySpecies;
  enemyAI: EEnemyAi;

  health: number;
  speed: number;

  isAttacking = false;
  canSeeHero = false;
  isFollowingHero = false;

  constructor(scene: GameScene, { position, enemyAI, enemyName, enemySpecies, enemyType, health, speed }: IEnemyData) {
    super(scene, position.x, position.y, enemyType.toString(), `${enemySpecies}_idle_01`);

    this.name = enemyName;
    this.eEnemy = enemyType;
    this.eEnemySpecies = enemySpecies;
    this.enemyAI = enemyAI;
    this.health = health;
    this.speed = speed;

    this.setTint(this.getEnemyColor());
    this.createAnimations();
    this.actionHitbox = new CustomHitbox(this.scene, this.x + 9, this.y + 36, 14, 8, "attack");
    this.container = scene.add.container(this.x, this.y, [this, this.actionHitbox]);
    this.scene.gridEngineConfig.characters.push(this.getCharacterData());
  }

  update(...args: any[]): void {
    super.update(...args);
    this.canSeeHero = this.body.embedded;
    if (!this.canSeeHero && this.isFollowingHero) {
      this.isFollowingHero = false;
      this.scene.gridEngine.setSpeed(this.name, this.speed);
      this.scene.gridEngine.moveRandomly(this.name, 1000, 4);
    }
  }

  createAnimations() {
    if (!this.anims.exists(`${this.eEnemySpecies}_idle`)) {
      this.anims.create({
        key: `${this.eEnemySpecies}_idle`,
        frames: this.scene.getFramesForAnimation(this.eEnemySpecies.toString(), "idle"),
        frameRate: 8,
        repeat: -1,
        yoyo: false,
      });
    }
    if (!this.anims.exists(`${this.eEnemySpecies}_attack`)) {
      this.anims.create({
        key: `${this.eEnemySpecies}_attack`,
        frames: this.scene.getFramesForAnimation(this.eEnemySpecies.toString(), "attack"),
        frameRate: 12,
        repeat: 0,
        yoyo: false,
      });
    }
    if (!this.anims.exists(`${this.eEnemySpecies}_walking`)) {
      this.anims.create({
        key: `${this.eEnemySpecies}_walking`,
        frames: this.scene.getFramesForAnimation(this.eEnemySpecies.toString(), "walking"),
        frameRate: 8,
        repeat: -1,
        yoyo: false,
      });
    }
    if (!this.anims.exists(`${this.eEnemySpecies}_die`)) {
      this.anims.create({
        key: `${this.eEnemySpecies}_die`,
        frames: this.scene.getFramesForAnimation(this.eEnemySpecies.toString(), "die"),
        frameRate: 8,
        repeat: 0,
        yoyo: false,
      });
    }
    this.anims.play(`${this.eEnemySpecies}_idle`);
    this.on("animationcomplete", (animation: any) => {
      if (animation.key.includes("attack")) {
        this.anims.play(`${this.eEnemySpecies}_idle`);
      }
    });
  }

  getCharacterData(): CharacterData {
    return {
      id: this.name,
      sprite: this,
      container: this.container,
      startPosition: { x: this.x, y: this.y },
      speed: this.speed,
      offsetY: -4,
    };
  }

  static getEnemySpecies(eEnemy: EEnemy): EEnemySpecies {
    if (eEnemy.toString().includes("slime")) return EEnemySpecies.Slime;
    return EEnemySpecies.Slime;
  }

  getEnemyColor() {
    if (this.eEnemy.toString().includes("red")) return 0xf1374b;
    if (this.eEnemy.toString().includes("green")) return 0x2bbd6e;
    if (this.eEnemy.toString().includes("yellow")) return 0xffff4f;
    return 0x00a0dc;
  }

  getEnemyAttackSpeed() {
    if (this.eEnemy.toString().includes("red")) return 2000;
    if (this.eEnemy.toString().includes("green")) return 3000;
    if (this.eEnemy.toString().includes("yellow")) return 4000;
    return 5000;
  }

  takeDamage = (damage: number, isSpaceJustDown: boolean) => {
    if (isSpaceJustDown) {
      this.health -= damage;
      if (this.health < 0) {
        this.setVisible(false);
        const position = this.scene.gridEngine.getPosition(this.name);
        this.scene.itemSpriteGroup.spawnItem({
          x: position.x * 16,
          y: position.y * 16,
        });
        this.scene.gridEngine.setPosition(this.name, { x: 1, y: 1 });
        this.destroy();
      } else {
        this.scene.tweens.add({
          targets: this,
          alpha: 0,
          ease: PhaserMath.Easing.Elastic.InOut,
          duration: 70,
          repeat: 1,
          yoyo: true,
        });
      }
    }
  };
}
