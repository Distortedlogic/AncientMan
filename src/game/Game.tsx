import { Box } from "@chakra-ui/react";
import { GridEngine } from "grid-engine";
import { Game as PhaserGame } from "phaser";
import { useCallback, useEffect, useState } from "react";
import { dialogs } from "../dialogs";
import { DialogBox } from "../game/DialogBox";
import { GameMenu } from "../game/GameMenu";
import { HeroCoin } from "../game/HeroCoin";
import { HeroHealth } from "../game/HeroHealth";
import { BootScene } from "../game/scenes/BootScene";
import { GameOverScene } from "../game/scenes/GameOverScene";
import { GameScene } from "../game/scenes/GameScene";
import { MainMenuScene } from "../game/scenes/MainMenuScene";
import { calculateGameSize } from "../game/utils";

const { width, height, multiplier } = calculateGameSize();

const Game: React.FC = () => {
  const [messages, setMessages] = useState([]);
  const [characterName, setCharacterName] = useState("");
  const [gameMenuItems, setGameMenuItems] = useState([]);
  const [gameMenuPosition, setGameMenuPosition] = useState("center");
  const [heroHealthStates, setHeroHealthStates] = useState([]);
  const [heroCoins, setHeroCoins] = useState(null);
  const [game, setGame] = useState<Phaser.Game>();

  const handleMessageIsDone = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent(`${characterName}-dialog-finished`, {
        detail: {},
      })
    );
    setMessages([]);
    setCharacterName("");
  }, [characterName]);

  const handleMenuItemSelected = useCallback((selectedItem) => {
    setGameMenuItems([]);
    window.dispatchEvent(
      new CustomEvent("menu-item-selected", {
        detail: {
          selectedItem,
        },
      })
    );
  }, []);

  useEffect(() => {
    setGame(
      new PhaserGame({
        type: Phaser.AUTO,
        title: "some-game-title",
        parent: "game-content",
        width,
        height,
        pixelArt: true,
        scale: { autoCenter: Phaser.Scale.CENTER_BOTH, mode: Phaser.Scale.ENVELOP },
        scene: [BootScene, MainMenuScene, GameScene, GameOverScene],
        physics: { default: "arcade" },
        plugins: { scene: [{ key: "gridEngine", plugin: GridEngine, mapping: "gridEngine" }] },
        backgroundColor: "#000000",
      })
    );
  }, []);

  useEffect(() => {
    const dialogBoxEventListener = ({ detail }) => {
      // TODO fallback
      setCharacterName(detail.characterName);
      setMessages(dialogs[detail.characterName]);
    };
    window.addEventListener("new-dialog", dialogBoxEventListener);

    const gameMenuEventListener = ({ detail }) => {
      setGameMenuItems(detail.menuItems);
      setGameMenuPosition(detail.menuPosition);
    };
    window.addEventListener("menu-items", gameMenuEventListener);

    const heroHealthEventListener = ({ detail }) => {
      setHeroHealthStates(detail.healthStates);
    };
    window.addEventListener("hero-health", heroHealthEventListener);

    const heroCoinEventListener = ({ detail }) => {
      setHeroCoins(detail.heroCoins);
    };
    window.addEventListener("hero-coin", heroCoinEventListener);

    return () => {
      window.removeEventListener("new-dialog", dialogBoxEventListener);
      window.removeEventListener("menu-items", gameMenuEventListener);
      window.removeEventListener("hero-health", heroHealthEventListener);
      window.removeEventListener("hero-coin", heroCoinEventListener);
    };
  }, [setCharacterName, setMessages]);

  return (
    <>
      {game && (
        <Box maxH="100vh" color="#FFFFFF">
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
                "-ms-interpolation-mode": "nearest-neighbor",
                boxShadow: "0px 0px 0px 3px rgba(0,0,0,0.75)",
              },
            }}
          >
            {/* this is where the game canvas will be rendered */}
          </Box>
          {heroHealthStates.length > 0 && (
            <HeroHealth
              gameSize={{
                width,
                height,
                multiplier,
              }}
              healthStates={heroHealthStates}
            />
          )}
          {heroCoins !== null && (
            <HeroCoin
              gameSize={{
                width,
                height,
                multiplier,
              }}
              heroCoins={heroCoins}
            />
          )}
          {messages.length > 0 && (
            <DialogBox
              onDone={handleMessageIsDone}
              characterName={characterName}
              messages={messages}
              gameSize={{
                width,
                height,
                multiplier,
              }}
            />
          )}
          {gameMenuItems.length > 0 && (
            <GameMenu
              items={gameMenuItems}
              gameSize={{
                width,
                height,
                multiplier,
              }}
              position={gameMenuPosition}
              onSelected={handleMenuItemSelected}
            />
          )}
        </Box>
      )}
    </>
  );
};

export default Game;
