import { CharacterData } from "grid-engine";
import { GameObjects, Physics } from "phaser";
import { CustomHitbox } from "../CustomHitbox";
import type { GameScene } from "../scenes/GameScene";

export interface INpcData {
  position: { x: number; y: number };
  npcKey: string;
  delay: number;
  area: number;
  movementType: string;
}

export class NpcSprite extends Physics.Arcade.Sprite {
  scene: GameScene;
  container: GameObjects.Container;
  actionHitbox: CustomHitbox;

  position: INpcData["position"];
  npcKey: INpcData["npcKey"];
  area: INpcData["area"];
  delay: INpcData["delay"];

  constructor({ position, npcKey, delay, area }: INpcData, scene: GameScene, frame?: string | number | undefined) {
    super(scene, position.x, position.y, npcKey, frame);
    this.position = position;
    this.npcKey = npcKey;
    this.area = area;
    this.delay = delay;
    this.setDepth(1);
    this.createPlayerWalkingAnimation(npcKey, "walking_up");
    this.createPlayerWalkingAnimation(npcKey, "walking_right");
    this.createPlayerWalkingAnimation(npcKey, "walking_down");
    this.createPlayerWalkingAnimation(npcKey, "walking_left");
    this.actionHitbox = new CustomHitbox(this.scene, position.x, position.y, 14, 8, "attack");
    this.container = scene.add.container(0, 0, [this, this.actionHitbox]);
    scene.gridEngineConfig.characters.push(this.getCharacterData());
    scene.add.existing(this.container);

    // if (movementType === ENpcMovement.RANDOM) this.scene.gridEngine.moveRandomly(npcKey, delay, area);
  }

  getCharacterData(): CharacterData {
    return {
      id: this.npcKey,
      sprite: this,
      container: this.container,
      startPosition: this.position,
      speed: 1,
    };
  }

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
}
