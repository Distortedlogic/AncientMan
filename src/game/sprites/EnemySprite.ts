import { CharacterData, GridEngine } from "grid-engine";
import { Math as PhaserMath, Physics, Types } from "phaser";
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
  physics: Physics.Arcade.ArcadePhysics;
  sprite: Types.Physics.Arcade.SpriteWithDynamicBody;
  scene: GameScene;

  name: string;
  eEnemy: EEnemy;
  eEnemySpecies: EEnemySpecies;

  position: { x: number; y: number };
  enemyAI: EEnemyAi;
  speed: number;
  health: number;
  isAttacking = false;
  updateFollowHeroPosition = true;
  canSeeHero = false;
  isFollowingHero = false;
  lastKnowHeroPosition = { x: 0, y: 0 };

  constructor(
    scene: Phaser.Scene & { gridEngine: GridEngine },
    { position, enemyAI, enemyName, enemySpecies, enemyType, health, speed }: IEnemyData
  ) {
    super(scene, position.x, position.y, enemyType.toString(), `${enemySpecies}_idle_01`);
    this.position = position;
    this.enemyAI = enemyAI;
    this.name = enemyName;
    this.eEnemySpecies = enemySpecies;
    this.eEnemy = enemyType;
    this.health = health;
    this.speed = speed;

    this.setTint(this.getEnemyColor());
    this.body.setSize(14, 14);
    this.body.setOffset(9, 21);

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
    if (!this.anims.exists(`${enemySpecies}_die`)) {
      this.anims.create({
        key: `${enemySpecies}_die`,
        frames: this.scene.getFramesForAnimation(enemySpecies.toString(), "die"),
        frameRate: 8,
        repeat: 0,
        yoyo: false,
      });
    }
    this.anims.play(`${enemySpecies}_idle`);
    this.on("animationcomplete", (animation: any) => {
      if (animation.key.includes("attack")) {
        this.anims.play(`${enemySpecies}_idle`);
      }
    });

    this.scene.gridEngine.moveRandomly(enemyName, 1000, 4);
    this.scene.gridEngineConfig.characters.push(this.getCharacterData());
  }

  getCharacterData(): CharacterData {
    return {
      id: this.name,
      sprite: this,
      startPosition: { x: this.x / 16, y: this.y / 16 - 1 },
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
        this.scene.spawnItem({
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
