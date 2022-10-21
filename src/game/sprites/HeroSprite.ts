import { CharacterData, Direction } from "grid-engine";
import { GameObjects, Math as PhaserMath, Physics } from "phaser";
import { SCENE_FADE_TIME } from "../constants";
import { CustomHitbox } from "../CustomHitbox";
import type { GameScene } from "../scenes/GameScene";

export interface IHeroStatus {
  position: { x: number; y: number };
  frame: string;
  facingDirection: Direction;
  health: number;
  maxHealth: number;
  coin: number;
  canPush: boolean;
  haveSword: boolean;
}

export class HeroSprite extends Physics.Arcade.Sprite {
  scene: GameScene;
  container: GameObjects.Container;

  position: { x: number; y: number };
  facingDirection: Direction;

  health: number;
  maxHealth: number;
  coin: number;
  canPush: boolean;
  haveSword: boolean;
  isTeleporting: boolean;
  isAttacking = false;

  actionHitbox: CustomHitbox;
  presenceHitbox: CustomHitbox;
  objectHitbox: CustomHitbox;

  constructor(scene: GameScene, frame?: string | number | undefined) {
    const { position, canPush, coin, facingDirection, haveSword, health, maxHealth } = scene.initSceneData.heroStatus;
    super(scene, position.x, position.y, "hero", frame);
    this.setDepth(1);

    this.position = position;
    this.canPush = canPush;
    this.coin = coin;
    this.facingDirection = facingDirection;
    this.haveSword = haveSword;
    this.health = health;
    this.maxHealth = maxHealth;

    this.createPlayerWalkingAnimation("hero", "walking_up");
    this.createPlayerWalkingAnimation("hero", "walking_right");
    this.createPlayerWalkingAnimation("hero", "walking_down");
    this.createPlayerWalkingAnimation("hero", "walking_left");

    this.createPlayerAttackAnimation("hero", "attack_up");
    this.createPlayerAttackAnimation("hero", "attack_right");
    this.createPlayerAttackAnimation("hero", "attack_down");
    this.createPlayerAttackAnimation("hero", "attack_left");

    this.on("animationcomplete", (animation: any) => {
      if (animation.key.includes("attack")) this.isAttacking = false;
    });
    this.on("animationstop", (animation: any) => {
      if (animation.key.includes("attack")) this.isAttacking = false;
    });

    const actionBoxSize = { width: 16, height: 8 };
    this.actionHitbox = new CustomHitbox(
      scene,
      position.x + this.width / 2,
      position.y + this.height + actionBoxSize.height / 2,
      actionBoxSize.width,
      actionBoxSize.height,
      "attack"
    );
    this.presenceHitbox = new CustomHitbox(scene, position.x + this.width / 2, position.y + this.height / 2, 240, 240, "presence");
    this.objectHitbox = new CustomHitbox(scene, position.x + this.width / 2, position.y + this.height / 2, 32, 32, "object");

    this.container = scene.add.container(0, 0, [this, this.presenceHitbox, this.actionHitbox, this.objectHitbox]);
    scene.gridEngineConfig.characters.push(this.getCharacterData());
    console.log("this", this);
  }

  getCharacterData(): CharacterData {
    return {
      id: "hero",
      sprite: this,
      container: this.container,
      startPosition: this.position,
    };
  }

  restoreHealth = (restore: number) => {
    this.health = Math.min(this.health + restore, this.maxHealth);
  };

  increaseMaxHealth = (increase: number) => {
    this.maxHealth += increase;
  };

  collectCoin = (qty: number) => {
    this.coin = Math.min(this.coin + qty, 999);
  };

  die() {
    this.scene.cameras.main.fadeOut(SCENE_FADE_TIME);
    this.scene.time.delayedCall(SCENE_FADE_TIME, () => {
      this.isTeleporting = false;
      this.scene.scene.start("GameOverScene");
    });
  }

  takeDamage = (damage: number) => {
    this.health -= damage;
    if (this.health <= 0) this.die();
    else {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        ease: PhaserMath.Easing.Elastic.InOut,
        duration: 70,
        repeat: 1,
        yoyo: true,
      });
    }
  };

  createPlayerWalkingAnimation(charId: string, animationName: string) {
    this.anims.create({
      key: `${charId}_${animationName}`,
      frames: [
        { key: charId, frame: `${charId}_${animationName}_01` },
        { key: charId, frame: `${charId}_${animationName.replace("walking", "idle")}_01` },
        { key: charId, frame: `${charId}_${animationName}_02` },
      ],
      frameRate: 4,
      repeat: -1,
      yoyo: true,
    });
  }

  createPlayerAttackAnimation(charId: string, animationName: string) {
    this.anims.create({
      key: `${charId}_${animationName}`,
      frames: [
        { key: charId, frame: `${charId}_${animationName}_01` },
        { key: charId, frame: `${charId}_${animationName}_02` },
        { key: charId, frame: `${charId}_${animationName}_03` },
        { key: charId, frame: `${charId}_${animationName}_04` },
        { key: charId, frame: `${charId}_${animationName.replace("attack", "idle")}_01` },
      ],
      frameRate: 16,
      repeat: 0,
      yoyo: false,
    });
  }
}
