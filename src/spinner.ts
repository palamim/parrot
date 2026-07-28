const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

export function startSpinner(label: string): () => void {
  if (!process.stdout.isTTY) {
    process.stdout.write(`${label}...\n`);
    return () => {};
  }

  const start = Date.now();
  let frame = 0;

  const render = () => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    process.stdout.write(
      `\r${CYAN}${FRAMES[frame]}${RESET} ${label}${DIM} (${elapsed}s)${RESET}\x1b[K`,
    );
    frame = (frame + 1) % FRAMES.length;
  };

  render();
  const timer = setInterval(render, 80);

  return () => {
    clearInterval(timer);
    process.stdout.write("\r\x1b[K");
  };
}
