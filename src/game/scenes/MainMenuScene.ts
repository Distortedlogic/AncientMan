import { Scene } from "phaser";
import { StartButton } from "../ui/StartButton";

export class MainMenuScene extends Scene {
  constructor() {
    super("MainMenuScene");
  }

  preload() {}

  create() {
    const { width: gameWidth, height: gameHeight } = this.cameras.main;
    this.add
      .image(gameWidth / 2, Math.ceil(gameHeight / 10), "game_logo")
      .setOrigin(0.5, 0)
      .setDepth(1);
    const scale = Math.max(Math.ceil(gameWidth / 480), Math.ceil(gameHeight / 216));
    this.add.image(0, 0, "main_menu_background").setScale(scale).setDepth(0).setOrigin(0, 0);
    new StartButton(this, gameWidth / 2, gameHeight / 2, "Start", { color: "#fff" }).setOrigin(0.5, 0.5);
  }
}
