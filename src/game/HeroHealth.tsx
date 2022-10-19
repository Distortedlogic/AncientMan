import { Box, Flex } from "@chakra-ui/react";
import healthImage from "./assets/images/health.png";

interface HeroHealthProps {
  gameSize: { width: number; height: number; multiplier: number };
  healthStates: any[];
}

export const HeroHealth: React.FC<HeroHealthProps> = ({ gameSize, healthStates }) => {
  const { width, multiplier } = gameSize;
  const left = window.innerWidth - width * multiplier;
  return (
    <Flex position="absolute" top={`${16 * multiplier}px`} left={`${16 * multiplier + left / 2}px`} style={{ imageRendering: "pixelated" }}>
      {healthStates.map((healthState, index) => {
        const position = healthState === "full" ? "0 0" : healthState === "half" ? `-${16 * multiplier}px 0` : `-${32 * multiplier}px 0`;
        return (
          <Box
            key={index}
            width={`${16 * multiplier}px`}
            height={`${16 * multiplier}px`}
            backgroundSize={`${48 * multiplier}px ${16 * multiplier}px`}
            background={`url("${healthImage}") no-repeat ${position}`}
          />
        );
      })}
    </Flex>
  );
};
