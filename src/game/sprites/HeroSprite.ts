import { CharacterData } from "grid-engine";
import { Math as PhaserMath, Physics, Types } from "phaser";
import { SCENE_FADE_TIME } from "../constants";
import type { GameScene } from "../scenes/GameScene";
import { CustomCollider } from "../utils";

export interface IHeroStatus {
  position: { x: number; y: number };
  previousPosition: { x: number; y: number };
  frame: string;
  facingDirection: string;
  health: number;
  maxHealth: number;
  coin: number;
  canPush: boolean;
  haveSword: boolean;
}

export interface IHeroSprite extends Types.Physics.Arcade.SpriteWithDynamicBody {
  maxHealth: number;
  health: number;
  coin: number;
  canPush: boolean;
  haveSword: boolean;
}

export class HeroSprite extends Physics.Arcade.Sprite {
  physics: Physics.Arcade.ArcadePhysics;
  sprite: Types.Physics.Arcade.SpriteWithDynamicBody;
  scene: GameScene;

  position: { x: number; y: number };
  previousPosition: { x: number; y: number };
  facingDirection: string;
  health: number;
  maxHealth: number;
  coin: number;
  canPush: boolean;
  haveSword: boolean;
  isTeleporting: boolean;
  isAttacking = false;

  actionCollider: CustomCollider;
  presenceCollider: CustomCollider;
  objectCollider: CustomCollider;

  constructor(
    { position, canPush, coin, facingDirection, haveSword, health, maxHealth, previousPosition }: IHeroStatus,
    scene: GameScene,
    texture: string | Phaser.Textures.Texture,
    frame?: string | number | undefined
  ) {
    super(scene, position.x, position.y, texture, frame);
    this.setDepth(1);

    this.position = position;
    this.canPush = canPush;
    this.coin = coin;
    this.facingDirection = facingDirection;
    this.haveSword = haveSword;
    this.health = health;
    this.maxHealth = maxHealth;
    this.previousPosition = previousPosition;

    this.updateHeroHealthUi(this.calculateHeroHealthStates());
    this.updateHeroCoinUi(coin);

    this.body.setSize(14, 14);
    this.body.setOffset(9, 13);

    this.createPlayerWalkingAnimation("hero", "walking_up");
    this.createPlayerWalkingAnimation("hero", "walking_right");
    this.createPlayerWalkingAnimation("hero", "walking_down");
    this.createPlayerWalkingAnimation("hero", "walking_left");

    this.createPlayerAttackAnimation("hero", "attack_up");
    this.createPlayerAttackAnimation("hero", "attack_right");
    this.createPlayerAttackAnimation("hero", "attack_down");
    this.createPlayerAttackAnimation("hero", "attack_left");

    this.on("animationcomplete", (animation: any) => {
      if (animation.key.includes("attack")) {
        this.isAttacking = false;
      }
    });
    this.on("animationstop", (animation: any) => {
      if (animation.key.includes("attack")) {
        this.isAttacking = false;
      }
    });
    this.actionCollider = new CustomCollider(this.scene, this.x + 9, this.y + 36, 14, 8, "attack", this.scene.isDebugMode);
    this.presenceCollider = new CustomCollider(
      this.scene,
      this.x + 16,
      this.y + 20,
      320, // TODO
      320, // TODO
      "presence",
      this.scene.isDebugMode,
      { x: 0.5, y: 0.5 }
    );
    this.objectCollider = new CustomCollider(this.scene, this.x + 16, this.y + 20, 24, 24, "object", this.scene.isDebugMode, {
      x: 0.5,
      y: 0.5,
    });

    this.scene.gridEngineConfig.characters.push(this.getCharacterData());
  }

  getCharacterData(): CharacterData {
    return {
      id: "hero",
      sprite: this,
      startPosition: this.position,
      offsetY: 4,
    };
  }

  calculateHeroHealthState(health: number) {
    if (health > 10) return "full";
    if (health > 0) return "half";
    return "empty";
  }

  calculateHeroHealthStates() {
    return Array.from({ length: this.maxHealth / 20 })
      .fill(null)
      .map((_, index) => this.calculateHeroHealthState(Math.max(this.health - 20 * index, 0)));
  }

  updateHeroHealthUi(healthStates: ("full" | "half" | "empty")[]) {
    const customEvent = new CustomEvent("hero-health", {
      detail: {
        healthStates,
      },
    });
    window.dispatchEvent(customEvent);
  }

  updateHeroCoinUi(heroCoins: any) {
    const customEvent = new CustomEvent("hero-coin", {
      detail: {
        heroCoins,
      },
    });
    window.dispatchEvent(customEvent);
  }

  calculatePreviousTeleportPosition() {
    const currentPosition = this.scene.gridEngine.getPosition("hero");
    const facingDirection = this.scene.gridEngine.getFacingDirection("hero");
    switch (facingDirection) {
      case "up":
        return { x: currentPosition.x, y: currentPosition.y + 1 };
      case "right":
        return { x: currentPosition.x - 1, y: currentPosition.y };
      case "down":
        return { x: currentPosition.x, y: currentPosition.y - 1 };
      case "left":
        return { x: currentPosition.x + 1, y: currentPosition.y };
      default:
        return currentPosition;
    }
  }

  restoreHealth = (restore: number) => {
    this.health = Math.min(this.health + restore, this.maxHealth);
    this.updateHeroHealthUi(this.calculateHeroHealthStates());
  };
  increaseMaxHealth = (increase: number) => {
    this.maxHealth += increase;
    this.updateHeroHealthUi(this.calculateHeroHealthStates());
  };
  collectCoin = (coinQuantity: number) => {
    this.coin = Math.min(this.coin + coinQuantity, 999);
    this.updateHeroCoinUi(this.coin);
  };
  takeDamage = (damage: number) => {
    this.scene.time.delayedCall(180, () => {
      this.health -= damage;
      if (this.health <= 0) {
        this.scene.cameras.main.fadeOut(SCENE_FADE_TIME);
        this.updateHeroHealthUi([]);
        this.updateHeroCoinUi(null);
        this.scene.time.delayedCall(SCENE_FADE_TIME, () => {
          this.isTeleporting = false;
          this.scene.scene.start("GameOverScene");
        });
      } else {
        this.updateHeroHealthUi(this.calculateHeroHealthStates());
        this.scene.tweens.add({
          targets: this.sprite,
          alpha: 0,
          ease: PhaserMath.Easing.Elastic.InOut,
          duration: 70,
          repeat: 1,
          yoyo: true,
        });
      }
    });
  };

  createPlayerWalkingAnimation(assetKey: string, animationName: string) {
    this.anims.create({
      key: `${assetKey}_${animationName}`,
      frames: [
        { key: assetKey, frame: `${assetKey}_${animationName}_01` },
        { key: assetKey, frame: `${assetKey}_${animationName.replace("walking", "idle")}_01` },
        { key: assetKey, frame: `${assetKey}_${animationName}_02` },
      ],
      frameRate: 4,
      repeat: -1,
      yoyo: true,
    });
  }

  createPlayerAttackAnimation(assetKey: string, animationName: string) {
    this.anims.create({
      key: `${assetKey}_${animationName}`,
      frames: [
        { key: assetKey, frame: `${assetKey}_${animationName}_01` },
        { key: assetKey, frame: `${assetKey}_${animationName}_02` },
        { key: assetKey, frame: `${assetKey}_${animationName}_03` },
        { key: assetKey, frame: `${assetKey}_${animationName}_04` },
        { key: assetKey, frame: `${assetKey}_${animationName.replace("attack", "idle")}_01` },
      ],
      frameRate: 16,
      repeat: 0,
      yoyo: false,
    });
  }
}
