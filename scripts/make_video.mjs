import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const exec = promisify(execFile);
const FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
const OUT = "attached_assets";

const char   = `${OUT}/personagem_sem_fundo.png`;
const bg     = `${OUT}/cenario_oficina.png`;
const ss     = `${OUT}/screenshot_homepage.jpg`;
const scene1 = `${OUT}/scene1.mp4`;
const scene2 = `${OUT}/scene2.mp4`;
const final  = `${OUT}/apresentacao_central_desmanches.mp4`;

// Helper: run ffmpeg
async function ff(args) {
  console.log("ffmpeg", args.slice(0, 8).join(" "), "...");
  try {
    const r = await exec("ffmpeg", ["-y", ...args]);
    return r;
  } catch (e) {
    console.error("STDERR:", e.stderr?.slice(-1000));
    throw e;
  }
}

// ─── SCENE 1 ───────────────────────────────────────────────────────────────
// Workshop background + character (thumbs-up pose) slides in from left
// Duration: 9 seconds
async function makeScene1() {
  console.log("\n▶ Building Scene 1 — Oficina + Personagem...");

  // Crop the 2nd pose (thumbs up) from the character sheet:
  // image is 1536x1024 with 4 poses on top row → each ~384px wide
  // Pose 2 starts at x=383
  const cropChar = "crop=380:900:383:0";

  const filter = [
    // Scale background to 1280x720
    `[0:v]scale=1280:720,setsar=1[bg]`,
    // Crop thumbs-up pose and scale to height 560
    `[1:v]${cropChar},scale=-1:560[char]`,
    // Slide character in from left over 1.5s, settle at x=80
    `[bg][char]overlay=` +
      `x='if(lt(t,1.5), (-280)+(t/1.5)*360, 80)':` +
      `y='720-h-10'[out]`,
  ].join(";");

  await ff([
    "-loop", "1", "-t", "9", "-i", bg,
    "-loop", "1", "-t", "9", "-i", char,
    "-filter_complex", filter,
    "-map", "[out]",
    "-t", "9", "-r", "30", "-pix_fmt", "yuv420p",
    "-c:v", "libx264", "-preset", "fast",
    scene1,
  ]);
  console.log("✅ Scene 1 done");
}

// ─── SCENE 2 ───────────────────────────────────────────────────────────────
// Dark bg + app screenshot (right) + presenting character (left) + animated text
// Duration: 13 seconds
async function makeScene2() {
  console.log("\n▶ Building Scene 2 — Sistema + Dados...");

  // Bottom-center presenting pose: starts roughly at x=558, y=520 in 1536x1024
  const cropPresenting = "crop=420:504:558:520";

  const textOpts = `fontfile=${FONT}:fontcolor=white:fontsize=26`;
  const fadeIn = (delay) =>
    `alpha='if(lt(t,${delay}),0,if(lt(t,${delay + 0.8}),(t-${delay})/0.8,1))'`;

  const filter = [
    // Dark navy background
    `color=c=0x0d1b3e:s=1280x720:d=13,setsar=1[bg]`,
    // App screenshot: scale to fit right side
    `[0:v]scale=680:382[ss]`,
    // Presenting character cropped + scaled
    `[1:v]${cropPresenting},scale=-1:460[char]`,
    // Overlay screenshot on right side (fade in at t=1.5)
    `[bg][ss]overlay=x=590:y=169:enable='gte(t,1.5)'[v1]`,
    // Overlay character on left
    `[v1][char]overlay=x=10:y=260[v2]`,
    // Animated text lines appearing in sequence
    `[v2]drawtext=${textOpts}:text='Conheca a Central dos Desmanches!':fontsize=28:x=20:y=30:${fadeIn(0.5)}[v3]`,
    `[v3]drawtext=${textOpts}:text='+100 Desmanches Credenciados':fontcolor=0xf97316:fontsize=22:x=20:y=78:${fadeIn(2)}[v4]`,
    `[v4]drawtext=${textOpts}:text='Pecas para Carros\\, Motos e Pesados':fontcolor=white:fontsize=22:x=20:y=114:${fadeIn(3)}[v5]`,
    `[v5]drawtext=${textOpts}:text='Propostas Rapidas de Desmanches Legais':fontcolor=0x38bdf8:fontsize=22:x=20:y=150:${fadeIn(4)}[v6]`,
    `[v6]drawtext=${textOpts}:text='100% Credenciados pelo Detran':fontcolor=white:fontsize=22:x=20:y=186:${fadeIn(5)}[v7]`,
    `[v7]drawtext=${textOpts}:text='Cadastre-se Agora!':fontcolor=0xfbbf24:fontsize=32:x=20:y=232:${fadeIn(6.5)}[out]`,
  ].join(";");

  await ff([
    "-loop", "1", "-t", "13", "-i", ss,
    "-loop", "1", "-t", "13", "-i", char,
    "-filter_complex", filter,
    "-map", "[out]",
    "-t", "13", "-r", "30", "-pix_fmt", "yuv420p",
    "-c:v", "libx264", "-preset", "fast",
    scene2,
  ]);
  console.log("✅ Scene 2 done");
}

// ─── CONCAT with crossfade ──────────────────────────────────────────────────
async function concat() {
  console.log("\n▶ Concatenating scenes with crossfade...");

  // xfade: scene1 is 9s, crossfade starts at 9-0.8=8.2s
  const filter = `[0:v][1:v]xfade=transition=fade:duration=0.8:offset=8.2[out]`;

  await ff([
    "-i", scene1,
    "-i", scene2,
    "-filter_complex", filter,
    "-map", "[out]",
    "-pix_fmt", "yuv420p",
    "-c:v", "libx264", "-preset", "fast",
    final,
  ]);
  console.log("✅ Final video done:", final);
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
(async () => {
  try {
    await makeScene1();
    await makeScene2();
    await concat();

    const size = (fs.statSync(final).size / (1024 * 1024)).toFixed(2);
    console.log(`\n🎬 Vídeo gerado: ${final} (${size} MB)`);
  } catch (err) {
    console.error("Erro:", err.message);
    process.exit(1);
  }
})();
