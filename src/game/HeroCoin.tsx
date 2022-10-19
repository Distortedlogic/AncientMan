import { Box } from "@chakra-ui/react";

interface HeroCoinProps {
  gameSize: { width: number; height: number; multiplier: number };
  heroCoins: number;
}

export const HeroCoin: React.FC<HeroCoinProps> = ({ gameSize, heroCoins }) => {
  const { width, multiplier } = gameSize;
  const left = window.innerWidth - width * multiplier;
  const coinProps =
    heroCoins >= 999
      ? {
          fontSize: `${11 * multiplier}px`,
          textShadow: `-${multiplier}px 0 #FFFFFF, 0 ${multiplier}px #FFFFFF, ${multiplier}px 0 #FFFFFF, 0 -${multiplier}px #FFFFFF`,
          color: "#119923",
        }
      : {};
  return (
    <Box
      fontFamily='"Press Start 2P"'
      fontSize={`${12 * multiplier}px`}
      textTransform="uppercase"
      position="absolute"
      top={`${32 * multiplier}px`}
      left={`${16 * multiplier + left / 2}px`}
      display="flex"
      cursor="default"
      userSelect="none"
      style={{ imageRendering: "pixelated" }}
    >
      <Box
        backgroundSize={`${16 * multiplier}px ${16 * multiplier}px`}
        background={`url("/images/coin.png") no-repeat 0 0`}
        width={`${16 * multiplier}px`}
        height={`${16 * multiplier}px`}
      />
      <Box as="span" {...coinProps}>
        {heroCoins.toString().padStart(3, "0")}
      </Box>
    </Box>
  );
};
