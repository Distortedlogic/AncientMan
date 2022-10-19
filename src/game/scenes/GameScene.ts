import { Direction, GridEngine, GridEngineConfig, NoPathFoundStrategy } from "grid-engine";
import { GameObjects, Input, Math as PhaserMath, Scene, Types } from "phaser";
import { ATTACK_DELAY_TIME, ETile, SCENE_FADE_TIME } from "../constants";
import { EnemySprite } from "../sprites/EnemySprite";
import { HeroSprite, IHeroStatus } from "../sprites/HeroSprite";
import { EItem, ItemSprite, LOOT_ITEMS } from "../sprites/ItemSprite";
import { NpcSprite } from "../sprites/NpcSprite";
import { CustomCollider } from "../utils";
import { EEnemy, EEnemyAi } from "./../sprites/EnemySprite";
import { EItems } from "./../sprites/ItemSprite";

function getBackPosition(facingDirection: Direction, position: { x: number; y: number }) {
  switch (facingDirection) {
    case Direction.UP:
      return { x: position.x, y: position.y + 1 };
    case Direction.RIGHT:
      return { x: position.x - 1, y: position.y };
    case Direction.DOWN:
      return { x: position.x, y: position.y - 1 };
    case Direction.LEFT:
      return { x: position.x + 1, y: position.y };
    default:
      return position;
  }
}

function getStopFrame(direction: Direction, charId: string) {
  switch (direction) {
    case Direction.UP:
      return `${charId}_idle_up_01`;
    case Direction.RIGHT:
      return `${charId}_idle_right_01`;
    case Direction.DOWN:
      return `${charId}_idle_down_01`;
    case Direction.LEFT:
      return `${charId}_idle_left_01`;
    default:
      return "";
  }
}

interface IInitialSceneData {
  heroStatus: IHeroStatus;
  mapKey: "home_page_city_house_01";
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
  heroSprite: HeroSprite;
  initSceneData: IInitialSceneData;
  map: Phaser.Tilemaps.Tilemap;
  itemSpriteGroup: GameObjects.Group;
  enemySpriteGroup: GameObjects.Group;
  elementsLayers: GameObjects.Group;
  allLayers: GameObjects.Group;
  npcSprites: GameObjects.Group;
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

  spawnItem(position: { x: number; y: number }) {
    const itemChance = PhaserMath.Between(1, this.physics.config.debug ? 2 : 5);
    if (itemChance === 1) {
      const eItem = LOOT_ITEMS[PhaserMath.Between(0, LOOT_ITEMS.length - 1)];
      const sprite = new ItemSprite(this, position.x, position.y, eItem).setDepth(1).setOrigin(0, 0);
      this.itemSpriteGroup.add(sprite);
      sprite.anims.play(`${eItem}_idle`);
    }
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
    if (this.physics.config.debug) window.phaserGame = this.sys.game;
    this.cameras.main.setBounds(0, 0, Math.max(mapWidth, gameWidth), Math.max(mapHeight, gameHeight));
    if (mapWidth < gameWidth) this.cameras.main.setPosition((gameWidth - mapWidth) / 2);
    if (mapHeight < gameHeight) this.cameras.main.setPosition(this.cameras.main.x, (gameHeight - mapHeight) / 2);
    for (let i = 0; i < this.map.layers.length; i++) {
      const layer = this.map.createLayer(i, "tileset", 0, 0);
      for (const { value, name } of layer.layer.properties as { name: string; value: string }[]) {
        if (name === "type" && value === "elements") this.elementsLayers.add(layer);
      }
      this.allLayers.add(layer);
    }
  }

  create() {
    this.itemSpriteGroup = this.add.group();
    this.enemySpriteGroup = this.add.group();
    this.elementsLayers = this.add.group();
    this.allLayers = this.add.group();
    this.npcSprites = this.add.group();
    this.enterKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Input.Keyboard.KeyCodes.W,
      down: Input.Keyboard.KeyCodes.S,
      left: Input.Keyboard.KeyCodes.A,
      right: Input.Keyboard.KeyCodes.D,
    }) as IWasdKeys;
    const camera = this.cameras.main;
    camera.fadeIn(SCENE_FADE_TIME);
    this.createMap();
    this.heroSprite = new HeroSprite(this.initSceneData.heroStatus, this, "hero");
    camera.startFollow(this.heroSprite, true);
    camera.setFollowOffset(-this.heroSprite.width, -this.heroSprite.height);
    this.map.getObjectLayer("actions").objects.forEach(({ properties, x, y }) => {
      properties.forEach(({ name, value }: { name: string; value: string }) => {
        switch (name) {
          case "dialog": {
            this.physics.add.overlap(this.heroSprite.actionCollider, new CustomCollider(this, x!, y!, 16, 16, "dialog"), () => {
              if (this.isShowingDialog) return;
              if (Input.Keyboard.JustDown(this.enterKey)) {
                const characterName = value;
                window.dispatchEvent(new CustomEvent("new-dialog", { detail: { characterName } }));
                const dialogBoxFinishedEventListener = () => {
                  window.removeEventListener(`${characterName}-dialog-finished`, dialogBoxFinishedEventListener);
                  Input.Keyboard.JustDown(this.enterKey);
                  Input.Keyboard.JustDown(this.spaceKey);
                  this.time.delayedCall(100, () => {
                    this.isShowingDialog = false;
                  });
                };
                window.addEventListener(`${characterName}-dialog-finished`, dialogBoxFinishedEventListener);
                this.isShowingDialog = true;
              }
            });
            break;
          }
          case "npcData": {
            const [npcKey, config] = value.trim().split(":");
            const [movementType, delay, area, direction] = config.split(";");
            this.npcSprites.add(
              new NpcSprite(
                { position: { x: x!, y: y! }, npcKey, delay: Number.parseInt(delay, 10), area: Number.parseInt(area, 10), movementType },
                this,
                `${npcKey}_idle_${direction}_01`
              )
            );
            break;
          }
          case "itemData": {
            const [itemType] = value.split(":") as [EItem];
            if (itemType === EItems.Sword) {
              if (!this.heroSprite.haveSword) this.itemSpriteGroup.add(new ItemSprite(this, x!, y!, itemType).setDepth(1).setOrigin(0, 1));
            } else if (itemType === EItems.Push) {
              if (!this.heroSprite.canPush) this.itemSpriteGroup.add(new ItemSprite(this, x!, y!, itemType).setDepth(1).setOrigin(0, 1));
            } else this.itemSpriteGroup.add(new ItemSprite(this, x!, y!, itemType).setDepth(1).setOrigin(0, 1));
            break;
          }
          case "enemyData": {
            const [enemyType, enemyAI, speed, health] = value.split(":") as [EEnemy, EEnemyAi, string, string];
            this.enemySpriteGroup.add(
              new EnemySprite(this, {
                position: { x: x!, y: y! },
                speed: Number.parseInt(speed, 10),
                enemyType,
                enemySpecies: EnemySprite.getEnemySpecies(enemyType),
                enemyAI,
                enemyName: `${enemyType}_${this.enemySpriteGroup.countActive()}`,
                health: Number.parseInt(health, 10),
              })
            );
            break;
          }
          case "teleportTo": {
            const [teleportToMapKey, position] = value.trim().split(":");
            const [xString, yString] = position.split(",");
            const teleportToX = Number.parseInt(xString, 10);
            const teleportToY = Number.parseInt(yString, 10);
            const overlapCollider = this.physics.add.overlap(this.heroSprite, new CustomCollider(this, x!, y!, 16, 16, "teleport"), () => {
              // camera.stopFollow();
              this.physics.world.removeCollider(overlapCollider);
              const facingDirection = this.gridEngine.getFacingDirection("hero");
              camera.fadeOut(SCENE_FADE_TIME);
              // this.scene.pause();
              this.isTeleporting = true;
              // this.gridEngine.stopMovement('hero');
              this.time.delayedCall(SCENE_FADE_TIME, () => {
                this.isTeleporting = false;
                this.scene.restart({
                  heroStatus: {
                    position: { x: teleportToX, y: teleportToY },
                    previousPosition: this.heroSprite.calculatePreviousTeleportPosition(),
                    frame: `hero_idle_${facingDirection}_01`,
                    facingDirection,
                    health: this.heroSprite.health,
                    maxHealth: this.heroSprite.maxHealth,
                    coin: this.heroSprite.coin,
                    canPush: this.heroSprite.canPush,
                    haveSword: this.heroSprite.haveSword,
                  },
                  mapKey: teleportToMapKey,
                });
              });
            });
            break;
          }
          default: {
            break;
          }
        }
      });
    });
    this.add.existing(this.enemySpriteGroup);
    this.add.existing(this.npcSprites);
    this.createAnimations();
    this.gridEngine.create(this.map, this.gridEngineConfig);
    this.useColliders();
    this.useGridEngineSubscriptions();
  }

  useColliders() {
    this.physics.add.collider(this.heroSprite, this.allLayers);
    this.physics.add.overlap(this.heroSprite, this.itemSpriteGroup, (objA, objB) => {
      const item = [objA, objB].find((obj) => obj !== this.heroSprite)! as ItemSprite;
      if (item.eItem === EItems.Heart) {
        this.heroSprite.restoreHealth(20);
        item.setVisible(false);
        item.destroy();
      }
      if (item.eItem === EItems.Coin) {
        this.heroSprite.collectCoin(1);
        item.setVisible(false);
        item.destroy();
      }
      if (item.eItem === EItems.HeartContainer) {
        this.heroSprite.increaseMaxHealth(20);
        item.setVisible(false);
        item.destroy();
      }
      if (item.eItem === EItems.Sword) {
        const customEvent = new CustomEvent("new-dialog", {
          detail: {
            characterName: item.eItem,
          },
        });
        window.dispatchEvent(customEvent);
        this.isShowingDialog = true;
        const dialogBoxFinishedEventListener = () => {
          window.removeEventListener(`${item.eItem}-dialog-finished`, dialogBoxFinishedEventListener);
          this.time.delayedCall(100, () => {
            this.isShowingDialog = false;
          });
        };
        window.addEventListener(`${item.eItem}-dialog-finished`, dialogBoxFinishedEventListener);
        this.heroSprite.haveSword = true;
        item.setVisible(false);
        item.destroy();
      }
      if (item.eItem === EItems.Push) {
        window.dispatchEvent(new CustomEvent("new-dialog", { detail: { characterName: item.eItem } }));
        this.isShowingDialog = true;
        const dialogBoxFinishedEventListener = () => {
          window.removeEventListener(`${item.eItem}-dialog-finished`, dialogBoxFinishedEventListener);
          this.time.delayedCall(100, () => {
            this.isShowingDialog = false;
          });
        };
        window.addEventListener(`${item.eItem}-dialog-finished`, dialogBoxFinishedEventListener);
        this.heroSprite.canPush = true;
        item.setVisible(false);
        item.destroy();
      }
    });
    this.physics.add.overlap(this.heroSprite.objectCollider, this.enemySpriteGroup, (objA, objB) => {
      const enemy = [objA, objB].find((obj) => obj !== this.heroSprite.objectCollider)! as EnemySprite;
      if (enemy.isAttacking || this.gridEngine.isMoving(enemy.name)) return;
      enemy.anims.play(`${enemy.eEnemySpecies}_attack`);
      this.heroSprite.takeDamage(10);
      enemy.isAttacking = true;
      this.time.delayedCall(enemy.getEnemyAttackSpeed(), () => {
        enemy.isAttacking = false;
      });
    });
    this.physics.add.overlap(this.heroSprite.presenceCollider, this.enemySpriteGroup, (objA, objB) => {
      const enemy = [objA, objB].find((obj) => obj !== this.heroSprite.presenceCollider)! as EnemySprite;
      if (enemy.canSeeHero && enemy.enemyAI.toString() === EEnemyAi.Follow) {
        enemy.isFollowingHero = true;
        if (enemy.updateFollowHeroPosition) {
          const facingDirection = this.gridEngine.getFacingDirection("hero");
          const heroPosition = this.gridEngine.getPosition("hero");
          const heroBackPosition = getBackPosition(facingDirection, heroPosition);
          if (enemy.lastKnowHeroPosition.x !== heroBackPosition.x || enemy.lastKnowHeroPosition.y !== heroBackPosition.y) {
            const enemyPosition = this.gridEngine.getPosition(enemy.name);
            enemy.lastKnowHeroPosition = heroBackPosition;
            if (heroBackPosition.x === enemyPosition.x && heroBackPosition.y === enemyPosition.y) {
              enemy.updateFollowHeroPosition = false;
              // TODO can attack I guess
              return;
            }
            enemy.updateFollowHeroPosition = false;
            this.time.delayedCall(1000, () => {
              enemy.updateFollowHeroPosition = true;
            });
            this.gridEngine.setSpeed(enemy.name, Math.ceil(enemy.speed * 1.5));
            this.gridEngine.moveTo(enemy.name, heroBackPosition, {
              noPathFoundStrategy: NoPathFoundStrategy.CLOSEST_REACHABLE,
            });
          }
        }
      }
      enemy.canSeeHero = enemy.body.embedded;
    });
    this.physics.add.overlap(this.heroSprite.actionCollider, this.npcSprites, (objA, objB) => {
      if (this.isShowingDialog) return;
      const npc = [objA, objB].find((obj) => obj !== this.heroSprite.actionCollider)! as NpcSprite;
      if (Input.Keyboard.JustDown(this.enterKey)) {
        if (this.gridEngine.isMoving(npc.texture.key)) return;
        const characterName = npc.texture.key;
        const customEvent = new CustomEvent("new-dialog", { detail: { characterName } });
        window.dispatchEvent(customEvent);
        const dialogBoxFinishedEventListener = () => {
          window.removeEventListener(`${characterName}-dialog-finished`, dialogBoxFinishedEventListener);
          this.gridEngine.moveRandomly(characterName);
          // just to consume the JustDown
          Input.Keyboard.JustDown(this.enterKey);
          Input.Keyboard.JustDown(this.spaceKey);
          this.time.delayedCall(100, () => {
            this.isShowingDialog = false;
            const { delay, area } = (this.npcSprites.getChildren() as NpcSprite[]).find((npcData) => npcData.npcKey === characterName)!;
            this.gridEngine.moveRandomly(characterName, delay, area);
          });
        };
        window.addEventListener(`${characterName}-dialog-finished`, dialogBoxFinishedEventListener);
        this.isShowingDialog = true;
        const facingDirection = this.gridEngine.getFacingDirection("hero");
        this.gridEngine.stopMovement(characterName);
        npc.setFrame(getStopFrame(oppositeDirection(facingDirection), characterName));
      }
    });
    this.physics.add.overlap(this.heroSprite.actionCollider, this.elementsLayers, (objA, objB) => {
      const tile = [objA, objB].find((obj) => obj !== this.heroSprite.actionCollider)! as any; //TODO as Phaser.Tilemaps.Tile;
      // Handles attack
      if (tile?.index > 0 && !tile.wasHandled) {
        switch (tile.index) {
          case ETile.BUSH:
            if (this.heroSprite.isAttacking) {
              tile.wasHandled = true;
              this.time.delayedCall(ATTACK_DELAY_TIME, () => {
                tile.setVisible(false);
                this.spawnItem({ x: tile.pixelX, y: tile.pixelY });
                tile.destroy();
              });
            }
            break;
          case ETile.BOX:
            if (this.heroSprite.canPush && this.heroSprite.isAttacking) {
              const newPosition = this.calculatePushTilePosition();
              const canBePushed = this.map.layers.every(
                (layer) => !layer.tilemapLayer.getTileAtWorldXY(newPosition.x, newPosition.y)?.properties?.ge_collide
              );
              if (canBePushed && !tile.isMoved) {
                tile.isMoved = true;
                this.tweens.add({
                  targets: tile,
                  pixelX: newPosition.x,
                  pixelY: newPosition.y,
                  ease: "Power2", // PhaserMath.Easing
                  duration: 700,
                  onComplete: () => {
                    tile.setVisible(false);
                    const newTile = tile.layer.tilemapLayer.putTileAt(ETile.BOX, newPosition.x / 16, newPosition.y / 16, true);
                    newTile.properties = { ...tile.properties };
                    newTile.isMoved = true;
                    tile.destroy();
                  },
                });
              }
            }
            break;
        }
      }
    });
    this.physics.add.overlap(this.heroSprite.actionCollider, this.enemySpriteGroup, (heroSprite, enemySprite) => {
      const enemy = enemySprite as EnemySprite;
      const hero = heroSprite as HeroSprite;
      if (hero.isAttacking) {
        const isSpaceJustDown = Boolean(this.isSpaceJustDown);
        this.time.delayedCall(ATTACK_DELAY_TIME, () => enemy.takeDamage(25, isSpaceJustDown));
      }
    });
  }

  useGridEngineSubscriptions() {
    this.gridEngine.movementStarted().subscribe(({ charId, direction }) => {
      if (charId === "hero") this.heroSprite.anims.play(`hero_walking_${direction}`);
      else {
        const npc = (this.npcSprites.getChildren() as NpcSprite[]).find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) npc.anims.play(`${charId}_walking_${direction}`);
        else {
          const enemy = this.enemySpriteGroup.getChildren().find((enemySprite) => enemySprite.name === charId)! as EnemySprite;
          if (enemy) enemy.anims.play(`${enemy.eEnemySpecies}_walking`);
        }
      }
    });
    this.gridEngine.movementStopped().subscribe(({ charId, direction }) => {
      if (charId === "hero") {
        this.heroSprite.anims.stop();
        this.heroSprite.setFrame(getStopFrame(direction, charId));
      } else {
        const npc = (this.npcSprites.getChildren() as NpcSprite[]).find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) {
          npc.anims.stop();
          npc.setFrame(getStopFrame(direction, charId));
        } else {
          const enemy = (this.enemySpriteGroup.getChildren() as EnemySprite[]).find((enemySprite) => enemySprite.name === charId);
          if (enemy) enemy.anims.play(`${enemy.eEnemySpecies}_idle`, true);
        }
      }
    });
    this.gridEngine.directionChanged().subscribe(({ charId, direction }) => {
      if (charId === "hero") this.heroSprite.setFrame(getStopFrame(direction, charId));
      else {
        const npc = (this.npcSprites.getChildren() as NpcSprite[]).find((npcSprite) => npcSprite.texture.key === charId);
        if (npc) npc.setFrame(getStopFrame(direction, charId));
        else {
          const enemy = (this.enemySpriteGroup.getChildren() as EnemySprite[]).find((enemySprite) => enemySprite.name === charId);
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
        const parts = (frame as string).split(`${assetKey}_${animation}_`);
        return Boolean(!Number.isNaN(Number.parseInt(parts[1], 10)));
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
    for (const enemy of this.enemySpriteGroup.getChildren() as EnemySprite[]) {
      enemy.canSeeHero = enemy.body.embedded;
      if (!enemy.canSeeHero && enemy.isFollowingHero) {
        enemy.isFollowingHero = false;
        this.gridEngine.setSpeed(enemy.name, enemy.speed);
        this.gridEngine.moveRandomly(enemy.name, 1000, 4);
      }
    }
    this.heroSprite.actionCollider.update();
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
  }
}
