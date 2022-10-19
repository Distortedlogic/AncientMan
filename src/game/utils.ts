export const calculateGameSize = () => {
  let width = 400;
  let height = 224; // 16 * 14 = 224
  const multiplier = Math.min(Math.floor(window.innerWidth / 400), Math.floor(window.innerHeight / 224)) || 1;
  if (multiplier > 1) {
    width += Math.floor((window.innerWidth - width * multiplier) / (16 * multiplier)) * 16;
    height += Math.floor((window.innerHeight - height * multiplier) / (16 * multiplier)) * 16;
  }
  return { width, height, multiplier };
};
