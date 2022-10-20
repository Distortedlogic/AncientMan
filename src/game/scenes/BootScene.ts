import { Loader, Scene } from "phaser";

export class BootScene extends Scene {
  fontSize = 16;

  constructor() {
    super("BootScene");
  }

  useProgressBar() {
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    const { width: mainCameraWidth, height: mainCameraHeight } = this.cameras.main;
    const barPositionX = Math.ceil((mainCameraWidth - mainCameraWidth * 0.7) / 2);
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(barPositionX, Math.ceil(mainCameraHeight / 6), Math.ceil(mainCameraWidth * 0.7), Math.ceil(mainCameraHeight / 10));
    const loadingText = this.add.text(mainCameraWidth / 2, Math.ceil(mainCameraHeight / 10), "loading...", {
      fontFamily: '"Press Start 2P"',
      fontSize: `${this.fontSize}px`,
      color: "#ffffff",
    });
    loadingText.setOrigin(0.5);
    loadingText.setResolution(30);
    const percentText = this.add.text(
      mainCameraWidth / 2,
      Math.ceil(mainCameraHeight / 6 + this.fontSize / 2 + mainCameraHeight / 60),
      "0%",
      {
        fontFamily: '"Press Start 2P"',
        fontSize: `${this.fontSize}px`,
        color: "#ffffff",
      }
    );
    percentText.setOrigin(0.5);
    percentText.setResolution(30);
    const assetText = this.add.text(mainCameraWidth / 2, Math.ceil(mainCameraHeight / 3), "", {
      fontFamily: '"Press Start 2P"',
      fontSize: `${this.fontSize / 2}px`,
      color: "#ffffff",
    });
    assetText.setOrigin(0.5);
    assetText.setResolution(30);
    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        barPositionX,
        Math.ceil(mainCameraHeight / 6),
        Math.ceil(mainCameraWidth * 0.7) * value,
        Math.ceil(mainCameraHeight / 10)
      );
      percentText.setText(`${value * 100}%`);
    });
    this.load.on("fileprogress", (file: Loader.File) => {
      assetText.setText(`loading: ${file.key}`);
    });
    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
      assetText.destroy();
    });
  }

  preload() {
    this.useProgressBar();
    this.load.tilemapTiledJSON("home_page_city", "/sprites/maps/cities/home_page_city.json");
    this.load.tilemapTiledJSON("home_page_city_house_01", "/sprites/maps/houses/home_page_city_house_01.json");
    this.load.tilemapTiledJSON("home_page_city_house_02", "/sprites/maps/houses/home_page_city_house_02.json");
    this.load.tilemapTiledJSON("home_page_city_house_03", "/sprites/maps/houses/home_page_city_house_03.json");
    this.load.atlas("hero", "/sprites/atlas/hero.png", "/sprites/atlas/hero.json");
    this.load.atlas("slime", "/sprites/atlas/slime.png", "/sprites/atlas/slime.json");
    this.load.atlas("heart", "/sprites/atlas/heart.png", "/sprites/atlas/heart.json");
    this.load.atlas("coin", "/sprites/atlas/coin.png", "/sprites/atlas/coin.json");
    this.load.atlas("npc_01", "/sprites/atlas/npc_01.png", "/sprites/atlas/npc_01.json");
    this.load.atlas("npc_02", "/sprites/atlas/npc_02.png", "/sprites/atlas/npc_02.json");
    this.load.atlas("npc_03", "/sprites/atlas/npc_03.png", "/sprites/atlas/npc_03.json");
    this.load.atlas("npc_04", "/sprites/atlas/npc_04.png", "/sprites/atlas/npc_04.json");
    this.load.image("tileset", "/sprites/maps/tilesets/tileset.png");
    this.load.image("main_menu_background", "/images/main_menu_background.png");
    this.load.image("game_over_background", "/images/game_over_background.png");
    this.load.image("game_logo", "/images/game_logo.png");
    this.load.image("heart_container", "/images/heart_container.png");
    this.load.image("sword", "/images/sword.png");
    this.load.image("push", "/images/push.png");
  }

  create() {
    this.scene.start("MainMenuScene");
  }
}
