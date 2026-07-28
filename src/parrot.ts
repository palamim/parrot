type RGB = [number, number, number];

const PALETTE: Record<string, RGB> = {
  H: [232, 65, 47], // body/head red
  K: [58, 58, 64], // beak
  E: [255, 255, 255], // eye white
  P: [17, 17, 17], // pupil
  W: [47, 111, 232], // wing blue
  w: [30, 79, 160], // wing shade
  T: [31, 182, 182], // tail teal
  G: [47, 168, 79], // tail green
  Y: [245, 197, 24], // tail/belly yellow
  L: [17, 17, 17], // feet
};

const GRID = [
  "......HHHH........",
  ".....HHHHHHH......",
  "....HHHHHHHHH.....",
  "...HHHHHHHHHH.....",
  "..KKHHEPHHHHH.....",
  "..KKKHHHHHHHH.G...",
  "...KKHHHHHHHHTGG..",
  "....HHWWWWHHHTGGY.",
  "....HHWwWWHHHTGYY.",
  "....HHWWWWHHTGYY..",
  "....HHHHHHHHTGY...",
  ".....LHHHHHTG.....",
  ".....L.L...T......",
];

export function parrotBanner(): string {
  if (!process.stdout.isTTY) return "";

  const rows = GRID.map((row) =>
    [...row]
      .map((cell) => {
        const rgb = PALETTE[cell];
        if (!rgb) return "  ";
        const [r, g, b] = rgb;
        return `\x1b[38;2;${r};${g};${b}m██\x1b[0m`;
      })
      .join(""),
  );

  return `${rows.join("\n")}\n`;
}
