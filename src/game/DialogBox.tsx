import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import dialogBorderBox from "./assets/images/dialog_borderbox.png";

import { Message } from "./Message";

interface DialogBoxProps {
  messages: string[];
  characterName: String;
  onDone: Function;
  gameSize: { width: number; height: number; multiplier: number };
}

export const DialogBox: React.FC<DialogBoxProps> = ({ messages, characterName, onDone, gameSize }) => {
  const { width, height, multiplier } = gameSize;
  const messageBoxHeight = Math.ceil((height / 3.5) * multiplier);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [messageEnded, setMessageEnded] = useState(false);
  const [forceShowFullMessage, setForceShowFullMessage] = useState(false);
  const handleClick = useCallback(() => {
    if (messageEnded) {
      setMessageEnded(false);
      setForceShowFullMessage(false);
      if (currentMessage < messages.length - 1) {
        setCurrentMessage(currentMessage + 1);
      } else {
        setCurrentMessage(0);
        onDone();
      }
    } else {
      setMessageEnded(true);
      setForceShowFullMessage(true);
    }
  }, [currentMessage, messageEnded, messages.length, onDone]);

  useEffect(() => {
    const handleKeyPressed: EventListenerOrEventListenerObject = (e) => {
      if (["Enter", "Space", "Escape"].includes(e.code)) {
        handleClick();
      }
    };
    window.addEventListener("keydown", handleKeyPressed);
    return () => window.removeEventListener("keydown", handleKeyPressed);
  }, [handleClick]);

  return (
    <Box
      fontFamily='"Press Start 2P"'
      textTransform="uppercase"
      backgroundColor="#e2b27e"
      border="solid"
      padding={`${8 * multiplier}px`}
      position="absolute"
      top={`${Math.ceil(height * multiplier - (messageBoxHeight + messageBoxHeight * 0.1))}px`}
      width={`${Math.ceil(width * 0.8 * multiplier)}px`}
      left="50%"
      transform="translate(-50%, 0%)"
      minHeight={`${messageBoxHeight}px`}
      style={{
        imageRendering: "pixelated",
        borderImage: `url("${dialogBorderBox}") 6 / ${6 * multiplier}px ${6 * multiplier}px ${6 * multiplier}px ${
          6 * multiplier
        }px stretch`,
      }}
    >
      <Box fontSize={`${8 * multiplier}px`} marginBottom={`${6 * multiplier}px`} fontWeight="bold">
        {characterName}
      </Box>
      <Message
        action={messages[currentMessage].action}
        message={messages[currentMessage].message}
        key={currentMessage}
        multiplier={multiplier}
        forceShowFullMessage={forceShowFullMessage}
        onMessageEnded={() => {
          setMessageEnded(true);
        }}
      />
      <Box
        fontSize={`${8 * multiplier}px`}
        cursor="pointer"
        textAlign="end"
        position="absolute"
        right={`${6 * multiplier}px`}
        bottom={`${6 * multiplier}px`}
        onClick={handleClick}
      >
        {currentMessage === messages.length - 1 && messageEnded ? "Ok" : "Next"}
      </Box>
    </Box>
  );
};
