import { CharacterData } from "grid-engine";
import { Physics, Types } from "phaser";
import { NPC_MOVEMENT_RANDOM } from "../constants";
import type { GameScene } from "../scenes/GameScene";

export interface INpcData {
  position: { x: number; y: number };
  npcKey: string;
  delay: number;
  area: number;
  movementType: string;
}

export class NpcSprite extends Physics.Arcade.Sprite {
  physics: Physics.Arcade.ArcadePhysics;
  sprite: Types.Physics.Arcade.SpriteWithDynamicBody;
  scene: GameScene;
  npcKey: INpcData["npcKey"];
  area: number;
  delay: number;

  constructor({ position, npcKey, delay, area, movementType }: INpcData, scene: GameScene, frame?: string | number | undefined) {
    super(scene, position.x, position.y, npcKey, frame);
    this.npcKey = npcKey;
    this.area = area;
    this.delay = delay;
    this.setDepth(1);
    this.body.setSize(14, 14);
    this.body.setOffset(9, 13);
    this.createPlayerWalkingAnimation(npcKey, "walking_up");
    this.createPlayerWalkingAnimation(npcKey, "walking_right");
    this.createPlayerWalkingAnimation(npcKey, "walking_down");
    this.createPlayerWalkingAnimation(npcKey, "walking_left");
    this.scene.gridEngineConfig.characters.push(this.getCharacterData());
    if (movementType === NPC_MOVEMENT_RANDOM) this.scene.gridEngine.moveRandomly(npcKey, delay, area);
  }

  getCharacterData(): CharacterData {
    return {
      id: this.npcKey,
      sprite: this,
      startPosition: { x: this.x / 16, y: this.y / 16 - 1 },
      speed: 1,
      offsetY: 4,
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
