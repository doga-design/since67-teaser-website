const link = document.getElementById("wall-link") as HTMLAnchorElement | null;
const wallUrlEnv = import.meta.env.VITE_WALL_OF_LOVE_URL;
const wallUrl =
  typeof wallUrlEnv === "string" && wallUrlEnv.length > 0
    ? wallUrlEnv
    : "https://walloflove.since67.ca/";

if (link) {
  link.href = wallUrl;
}

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

const THEME_LOOP_URL = publicAsset("public/assets/theme-loop.mp3");

function getAudioContextConstructor(): (typeof AudioContext) | null {
  const w = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * Seamless loop via Web Audio (buffer source loop is sample-continuous).
 * Primed silent on first user gesture, then brought to full volume when the main site appears.
 */
function createSeamlessThemeLoop(url: string) {
  let ctx: AudioContext | null = null;
  let buffer: AudioBuffer | null = null;
  let decodePromise: Promise<AudioBuffer> | null = null;
  let gain: GainNode | null = null;
  let source: AudioBufferSourceNode | null = null;

  const getCtx = (): AudioContext => {
    if (!ctx) {
      const AC = getAudioContextConstructor();
      if (!AC) {
        throw new Error("Web Audio API not available");
      }
      ctx = new AC();
    }
    return ctx;
  };

  const decode = async (): Promise<AudioBuffer> => {
    if (buffer) return buffer;
    if (!decodePromise) {
      decodePromise = (async () => {
        const c = getCtx();
        const res = await fetch(url);
        if (!res.ok) throw new Error("theme fetch failed");
        const ab = await res.arrayBuffer();
        return await c.decodeAudioData(ab.slice(0));
      })();
    }
    buffer = await decodePromise;
    return buffer;
  };

  const ensureLoopingSource = async (gainValue: number): Promise<void> => {
    const c = getCtx();
    await decode();
    if (!gain) {
      gain = c.createGain();
      gain.connect(c.destination);
    }
    gain.gain.setValueAtTime(gainValue, c.currentTime);
    if (!source) {
      const buf = buffer!;
      const src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(gain);
      src.start(0);
      source = src;
    }
  };

  return {
    preload(): void {
      void decode().catch(() => {});
    },

    startSilentFromUserGesture(): void {
      void (async () => {
        try {
          await ensureLoopingSource(0);
          await getCtx().resume();
        } catch {
          /* ignore */
        }
      })();
    },

    bringToFullVolume(): void {
      void (async () => {
        try {
          await ensureLoopingSource(0);
          const c = getCtx();
          if (gain) {
            gain.gain.setValueAtTime(1, c.currentTime);
          }
          await c.resume();
        } catch {
          /* ignore */
        }
      })();
    },
  };
}

const seamlessTheme = createSeamlessThemeLoop(THEME_LOOP_URL);
seamlessTheme.preload();

const preScreen = document.getElementById("pre-screen") as HTMLElement | null;
const preScreenCta = document.getElementById("pre-screen-cta") as HTMLButtonElement | null;
const introStage = document.getElementById("intro-video-stage") as HTMLElement | null;
const introVideo = document.getElementById("intro-video") as HTMLVideoElement | null;
const mainSite = document.getElementById("main-site") as HTMLElement | null;

if (preScreen && preScreenCta && introStage && introVideo && mainSite) {
  document.body.classList.add("is-pre-screening");
  mainSite.hidden = true;
  const introViewportMin = Math.min(window.innerWidth, window.innerHeight);
  const introVideoSrc =
    introViewportMin <= 768
      ? publicAsset("public/assets/website-intro-mobile.mp4")
      : publicAsset("public/assets/website-intro-video.mp4");
  introVideo.src = introVideoSrc;
  introVideo.preload = "auto";
  introVideo.load();
  let introStarted = false;

  const revealMainSite = () => {
    introStage.classList.remove("is-active");
    introStage.setAttribute("aria-hidden", "true");
    introVideo.pause();
    preScreen.hidden = true;
    mainSite.hidden = false;
    document.body.classList.remove("is-pre-screening", "is-intro-playing");
    seamlessTheme.bringToFullVolume();
  };

  const playIntro = () => {
    if (introStarted) return;
    introStarted = true;
    preScreen.hidden = true;
    introStage.classList.add("is-active");
    introStage.setAttribute("aria-hidden", "false");
    document.body.classList.remove("is-pre-screening");
    document.body.classList.add("is-intro-playing");

    introVideo.controls = false;
    introVideo.muted = false;
    introVideo.volume = 1;
    introVideo.currentTime = 0;

    seamlessTheme.startSilentFromUserGesture();

    void introVideo
      .play()
      .then(() => {
        introVideo.muted = false;
        introVideo.volume = 1;
      })
      .catch(() => {
        introStarted = false;
      });
  };

  preScreenCta.addEventListener("click", playIntro);
  introVideo.addEventListener("ended", revealMainSite);
}

const dirtVideos = document.querySelectorAll<HTMLVideoElement>("#dirt-video, .poster__dirt-video");
dirtVideos.forEach((dirtVideo) => {
  dirtVideo.muted = true;
  dirtVideo.setAttribute("playsinline", "");
  const tryPlay = () => {
    void dirtVideo.play().catch(() => {});
  };
  tryPlay();
  dirtVideo.addEventListener("loadeddata", tryPlay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlay();
  });
});
