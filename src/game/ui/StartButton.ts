import { Direction } from "grid-engine";
import { GameObjects, Scene, Types } from "phaser";

export class StartButton extends GameObjects.Text {
  constructor(scene: Scene, x: number, y: number, text: string, style: Types.GameObjects.Text.TextStyle) {
    super(scene, x, y, text, style);

    this.setInteractive({ useHandCursor: true })
      .on("pointerover", this.enterHoverState)
      .on("pointerout", this.enterRestState)
      .on("pointerdown", this.enterActiveState)
      .on("pointerup", this.pointerup);

    this.scene.add.existing(this);
  }
  pointerup() {
    this.setStyle({ fill: "#ff0" });
    this.scene.scene.start("GameScene", {
      heroStatus: {
        position: { x: 4, y: 3 },
        frame: "hero_idle_down_01",
        facingDirection: Direction.DOWN,
        health: 60,
        maxHealth: 60,
        coin: 0,
        canPush: false,
        haveSword: false,
      },
      mapKey: "home_page_city_house_01",
    });
  }

  enterHoverState() {
    this.setStyle({ fill: "#ff0" });
  }

  enterRestState() {
    this.setStyle({ fill: "#0f0" });
  }

  enterActiveState() {
    this.setStyle({ fill: "#0ff" });
  }
}
