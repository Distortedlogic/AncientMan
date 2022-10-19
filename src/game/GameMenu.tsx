import { Box, List, ListItem } from "@chakra-ui/react";
import { useEffect, useState } from "react";

// {
// 	fontSize: `${11 * multiplier}px`,
// 	border: `${multiplier}px solid #ddd`,
// }

interface GameMenuProps {
  items: any[];
  position: string;
  gameSize: { width: number; height: number; multiplier: number };
  onSelected: (item: any) => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ items, position = "center", gameSize, onSelected }) => {
  const { width, height, multiplier } = gameSize;
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);

  useEffect(() => {
    const handleKeyPressed = (e: MouseEvent) => {
      switch (e.code) {
        case "Enter":
          onSelected(items[selectedItemIndex]);
          break;
        case "ArrowUp":
          if (selectedItemIndex > 0) {
            setSelectedItemIndex(selectedItemIndex - 1);
          }
          break;
        case "ArrowDown":
          if (items.length - 1 > selectedItemIndex) {
            setSelectedItemIndex(selectedItemIndex + 1);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyPressed);
    return () => window.removeEventListener("keydown", handleKeyPressed);
  }, [items, onSelected, selectedItemIndex]);

  const left = window.innerWidth - width * multiplier;
  const menuWidth = 160 * multiplier;

  const positionProps =
    position === "center"
      ? {
          minWidth: `${menuWidth}px`,
          left: "50%",
          top: `${(height * multiplier) / 2}px`,
        }
      : position === "left"
      ? {
          minWidth: `${menuWidth}px`,
          left: `${95 * multiplier + left / 2}px`,
          top: `${50 * multiplier}px`,
        }
      : {};

  return (
    <Box
      fontFamily='"Press Start 2P"'
      fontSize={`${10 * multiplier}px`}
      textTransform="uppercase"
      position="absolute"
      transform="translate(-50%, 0%)"
      {...positionProps}
    >
      <List
        cursor="pointer"
        padding={`${5 * multiplier}px`}
        marginBottom={`${5 * multiplier}px`}
        backgroundColor="#94785c"
        border={`${multiplier}px solid #79584f`}
        style={{ listStyle: "none" }}
      >
        {items.map((item, index) => (
          <ListItem
            key={index}
            cursor="pointer"
            padding={`${5 * multiplier}px`}
            marginBottom={`${5 * multiplier}px`}
            backgroundColor="#94785c"
            border={`${multiplier}px solid #79584f`}
            style={{ listStyle: "none" }}
            onMouseEnter={() => setSelectedItemIndex(index)}
            onClick={() => onSelected(items[selectedItemIndex])}
          >
            {item}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
