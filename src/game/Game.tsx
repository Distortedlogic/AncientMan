import { Box } from "@chakra-ui/react";
import { GridEngine } from "grid-engine";
import { Game as PhaserGame } from "phaser";
import { useEffect } from "react";
import { BootScene } from "../game/scenes/BootScene";
import { GameOverScene } from "../game/scenes/GameOverScene";
import { GameScene } from "../game/scenes/GameScene";
import { MainMenuScene } from "../game/scenes/MainMenuScene";
import { calculateGameSize } from "../game/utils";

const { width, height, multiplier } = calculateGameSize();

const Game: React.FC = () => {
  useEffect(() => {
    new PhaserGame({
      type: Phaser.AUTO,
      title: "some-game-title",
      parent: "game-content",
      width,
      height,
      pixelArt: true,
      scale: { autoCenter: Phaser.Scale.CENTER_BOTH, mode: Phaser.Scale.ENVELOP },
      scene: [BootScene, MainMenuScene, GameScene, GameOverScene],
      physics: { default: "arcade", arcade: { debug: true, debugShowBody: true, debugShowVelocity: true, debugShowStaticBody: true } },
      plugins: { scene: [{ key: "gridEngine", plugin: GridEngine, mapping: "gridEngine" }] },
      backgroundColor: "#000000",
    });
  }, []);

  return (
    <Box
      id="game-content"
      width={`${width * multiplier}px`}
      height={`${height * multiplier}px`}
      margin="auto"
      padding={0}
      overflow="hidden"
      sx={{
        "& canvas": {
          imageRendering: "pixelated",
          boxShadow: "0px 0px 0px 3px rgba(0,0,0,0.75)",
        },
      }}
    />
  );
};

export default Game;
