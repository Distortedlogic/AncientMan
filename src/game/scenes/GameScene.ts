import { Direction, GridEngine, GridEngineConfig } from "grid-engine";
import { Input, Scene, Types } from "phaser";
import { DialogCollider } from "../colliders/DialogCollider";
import { EnemyCollider } from "../colliders/EnemyCollider";
import { EnvironmentCollider } from "../colliders/EnvironmentCollider";
import { ItemCollider } from "../colliders/ItemCollider";
import { NpcCollider } from "../colliders/NpcCollider";
import { TeleportCollider } from "../colliders/TeleportCollider";
import { SCENE_FADE_TIME } from "../constants";
import { getStopFrame } from "../functions/getStopFrame";
import { EnemyGroup } from "../groups/EnemyGroup";
import { ItemGroup } from "../groups/ItemGroup";
import { NpcGroup } from "../groups/NpcGroup";
import { EnemySprite } from "../sprites/EnemySprite";
import { HeroSprite, IHeroStatus } from "../sprites/HeroSprite";
import { NpcSprite } from "../sprites/NpcSprite";
import { EEnemyAi } from "./../sprites/EnemySprite";

export interface IInitialSceneData {
  heroStatus: IHeroStatus;
  mapKey: string;
}

interface IWasdKeys {
  up: Input.Keyboard.Key;
  down: Input.Keyboard.Key;
  left: Input.Keyboard.Key;
  right: Input.Keyboard.Key;
}

export class GameScene extends Scene {
  gridEngine: GridEngine;
  gridEngineConfig: GridEngineConfig = { characters: [] };

  initSceneData: IInitialSceneData;
  map: Phaser.Tilemaps.Tilemap;

  heroSprite: HeroSprite;
  itemSpriteGroup: ItemGroup;
  enemySpriteGroup: EnemyGroup;
  npcSpriteGroup: NpcGroup;

  enterKey: Input.Keyboard.Key;
  spaceKey: Input.Keyboard.Key;
  cursors: Types.Input.Keyboard.CursorKeys;
  wasd: IWasdKeys;

  isShowingDialog = false;
  isTeleporting = false;
  isSpaceJustDown: boolean;

  constructor() {
    super("GameScene");
  }

  init(initSceneData: IInitialSceneData) {
    this.initSceneData = initSceneData;
  }

  calculatePushTilePosition() {
    const facingDirection = this.gridEngine.getFacingDirection("hero");
    const position = this.gridEngine.getPosition("hero");
    switch (facingDirection) {
      case Direction.UP:
        return { x: position.x * 16, y: (position.y - 2) * 16 };
      case Direction.RIGHT:
        return { x: (position.x + 2) * 16, y: position.y * 16 };
      case Direction.DOWN:
        return { x: position.x * 16, y: (position.y + 2) * 16 };
      case Direction.LEFT:
        return { x: (position.x - 2) * 16, y: position.y * 16 };
      default:
        return { x: position.x * 16, y: position.y * 16 };
    }
  }

  createAnimations() {
    if (!this.anims.exists("heart_idle"))
      this.anims.create({
        key: "heart_idle",
        frames: this.getFramesForAnimation("heart", "idle"),
        frameRate: 4,
        repeat: -1,
        yoyo: false,
      });
    if (!this.anims.exists("coin_idle"))
      this.anims.create({
        key: "coin_idle",
        frames: this.getFramesForAnimation("coin", "idle"),
        frameRate: 4,
        repeat: -1,
        yoyo: false,
      });
  }

  createMap() {
    this.map = this.make.tilemap({ key: this.initSceneData.mapKey });
    this.map.addTilesetImage("tileset", "tileset");
    const mapWidth = this.map.widthInPixels;
    const mapHeight = this.map.heightInPixels;
    const gameWidth = this.sys.game.scale.gameSize.width;
    const gameHeight = this.sys.game.scale.gameSize.height;
    this.cameras.main.setBounds(0, 0, Math.max(mapWidth, gameWidth), Math.max(mapHeight, gameHeight));
    if (mapWidth < gameWidth) this.cameras.main.setPosition((gameWidth - mapWidth) / 2);
    if (mapHeight < gameHeight) this.cameras.main.setPosition(this.cameras.main.x, (gameHeight - mapHeight) / 2);
    for (let i = 0; i < this.map.layers.length; i++) {
      this.map.createLayer(i, "tileset", 0, 0);
    }
  }

  create() {
    this.enterKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Input.Keyboard.KeyCodes.W,
      down: Input.Keyboard.KeyCodes.S,
      left: Input.Keyboard.KeyCodes.A,
      right: Input.Keyboard.KeyCodes.D,
    }) as IWasdKeys;
    this.createMap();
    this.itemSpriteGroup = new ItemGroup(this);
    this.enemySpriteGroup = new EnemyGroup(this);
    this.npcSpriteGroup = new NpcGroup(this);
    this.heroSprite = new HeroSprite(this);
    this.map.getObjectLayer("actions").objects.forEach(({ properties, x, y }) =>
      properties.forEach(({ name, value }: { name: string; value: string }) => {
        switch (name) {
          case "dialog":
            this.physics.world.colliders.add(new DialogCollider(this, value, { x: x!, y: y! }));
            break;
          case "npcData":
            this.npcSpriteGroup.addFromData(value, { x: x!, y: y! });
            break;
          case "itemData":
            this.itemSpriteGroup.addFromData(value, { x: x!, y: y! });
            break;
          case "enemyData":
            this.enemySpriteGroup.addFromData(value, { x: x!, y: y! });
            break;
          case "teleportTo":
            const [mapKey, position] = value.trim().split(":");
            const [xString, yString] = position.split(",");
            this.physics.world.colliders.add(
              new TeleportCollider(this, mapKey, { x: x!, y: y! }, { x: Number.parseInt(xString, 10), y: Number.parseInt(yString, 10) })
            );
            break;
        }
      })
    );
    this.createAnimations();
    this.gridEngine.create(this.map, this.gridEngineConfig);
    this.useGridEngineSubscriptions();

    this.physics.world.colliders.add(new ItemCollider(this));
    this.physics.world.colliders.add(new EnemyCollider(this));
    this.physics.world.colliders.add(new NpcCollider(this));
    this.physics.world.colliders.add(new EnvironmentCollider(this));

    this.cameras.main.fadeIn(SCENE_FADE_TIME);
    this.cameras.main.startFollow(this.heroSprite.container, true);
    this.cameras.main.setFollowOffset(-this.heroSprite.width, -this.heroSprite.height);
  }

  useColliders() {
    this.physics.add.overlap(this.heroSprite.presenceHitbox, this.enemySpriteGroup, (_objA, objB) => {
      const enemy = objB as EnemySprite;
      if (enemy.canSeeHero && enemy.enemyAI.toString() === EEnemyAi.Follow) {
        enemy.isFollowingHero = true;
        this.gridEngine.follow(enemy.name, "hero", 1, true);
      }
      enemy.canSeeHero = enemy.body.embedded;
    });
  }
  useGridEngineSubscriptions() {
    this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
      if (charId === "hero") this.heroSprite.anims.play(`hero_walking_${direction}`);
      else {
        const npc = (this.npcSpriteGroup.getChildren() as NpcSprite[]).find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) npc.anims.play(`${charId}_walking_${direction}`);
        else {
          const enemy = this.enemySpriteGroup.getChildren().find((enemySprite) => enemySprite.name === charId)!;
          if (enemy) enemy.anims.play(`${enemy.eEnemySpecies}_walking`);
        }
      }
    });
    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      if (charId === "hero") {
        this.heroSprite.anims.stop();
        this.heroSprite.setFrame(getStopFrame(direction, charId));
      } else {
        const npc = (this.npcSpriteGroup.getChildren() as NpcSprite[]).find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) {
          npc.anims.stop();
          npc.setFrame(getStopFrame(direction, charId));
        } else {
          const enemy = this.enemySpriteGroup.getMatching("name", charId)[0];
          if (enemy) enemy.anims.play(`${enemy.eEnemySpecies}_idle`, true);
        }
      }
    });
    this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      if (charId === "hero") this.heroSprite.setFrame(getStopFrame(direction, charId));
      else {
        const npc = (this.npcSpriteGroup.getChildren() as NpcSprite[]).find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) npc.setFrame(getStopFrame(direction, charId));
        else {
          const enemy = this.enemySpriteGroup.getChildren().find((enemySprite) => enemySprite.name === charId);
          if (enemy) enemy.anims.play(`${enemy.eEnemySpecies}_idle`);
        }
      }
    });
  }

  getFramesForAnimation(assetKey: string, animation: string) {
    return this.anims
      .generateFrameNames(assetKey)
      .filter(({ frame }) => {
        if (!(frame as string).includes(`${assetKey}_${animation}`)) return false;
        const [, index] = (frame as string).split(`${assetKey}_${animation}_`);
        return !Number.isNaN(Number.parseInt(index, 10));
      })
      .sort((a, b) => (a.frame! < b.frame! ? -1 : 1));
  }

  update() {
    this.isSpaceJustDown = Input.Keyboard.JustDown(this.spaceKey);
    if (this.isTeleporting || this.heroSprite.isAttacking || this.isShowingDialog) return;
    if (!this.gridEngine.isMoving("hero") && this.isSpaceJustDown && this.heroSprite.haveSword) {
      this.heroSprite.anims.play(`hero_attack_${this.gridEngine.getFacingDirection("hero")}`);
      this.heroSprite.isAttacking = true;
      return;
    }
    switch (true) {
      case this.cursors.left.isDown || this.wasd.left.isDown:
        this.gridEngine.move("hero", Direction.LEFT);
        break;
      case this.cursors.right.isDown || this.wasd.right.isDown:
        this.gridEngine.move("hero", Direction.RIGHT);
        break;
      case this.cursors.up.isDown || this.wasd.up.isDown:
        this.gridEngine.move("hero", Direction.UP);
        break;
      case this.cursors.down.isDown || this.wasd.down.isDown:
        this.gridEngine.move("hero", Direction.DOWN);
        break;
      default:
        break;
    }
    this.heroSprite.actionHitbox.update();
  }
}
