const THEME_LOOP_URL = "assets/theme-loop.mp3";

function getAudioContextConstructor() {
  return window.AudioContext || window.webkitAudioContext || null;
}

/**
 * Seamless loop via Web Audio (buffer source loop is sample-continuous).
 * Primed silent on first user gesture, then brought to full volume when the main site appears.
 */
function createSeamlessThemeLoop(url) {
  let ctx = null;
  let buffer = null;
  let decodePromise = null;
  let gain = null;
  let source = null;

  const getCtx = () => {
    if (!ctx) {
      const AC = getAudioContextConstructor();
      if (!AC) throw new Error("Web Audio API not available");
      ctx = new AC();
    }
    return ctx;
  };

  const decode = async () => {
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

  const ensureLoopingSource = async (gainValue) => {
    const c = getCtx();
    await decode();
    if (!gain) {
      gain = c.createGain();
      gain.connect(c.destination);
    }
    gain.gain.setValueAtTime(gainValue, c.currentTime);
    if (!source) {
      const src = c.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.connect(gain);
      src.start(0);
      source = src;
    }
  };

  return {
    preload() {
      decode().catch(() => {});
    },

    startSilentFromUserGesture() {
      (async () => {
        try {
          await ensureLoopingSource(0);
          await getCtx().resume();
        } catch {
          /* ignore */
        }
      })();
    },

    bringToFullVolume() {
      (async () => {
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

const preScreen = document.getElementById("pre-screen");
const preScreenCta = document.getElementById("pre-screen-cta");
const introStage = document.getElementById("intro-video-stage");
const introVideo = document.getElementById("intro-video");
const mainSite = document.getElementById("main-site");

if (preScreen && preScreenCta && introStage && introVideo && mainSite) {
  document.body.classList.add("is-pre-screening");
  mainSite.hidden = true;

  const introViewportMin = Math.min(window.innerWidth, window.innerHeight);
  const introVideoSrc =
    introViewportMin <= 768
      ? "assets/website-intro-mobile.mp4"
      : "assets/website-intro-video.mp4";
  introVideo.src = introVideoSrc;
  introVideo.preload = "auto";
  introVideo.load();

  let introStarted = false;
  let mainRevealed = false;
  let introEndFallbackTimer;

  const clearIntroEndFallback = () => {
    if (introEndFallbackTimer !== undefined) {
      window.clearTimeout(introEndFallbackTimer);
      introEndFallbackTimer = undefined;
    }
  };

  const revealMainSite = () => {
    if (mainRevealed) return;
    mainRevealed = true;
    clearIntroEndFallback();
    introStage.classList.remove("is-active");
    introStage.setAttribute("aria-hidden", "true");
    introVideo.pause();
    preScreen.hidden = true;
    mainSite.hidden = false;
    document.body.classList.remove("is-pre-screening", "is-intro-playing");
    seamlessTheme.bringToFullVolume();
  };

  const armIntroEndFallback = () => {
    clearIntroEndFallback();
    if (Number.isFinite(introVideo.duration) && introVideo.duration > 0) {
      introEndFallbackTimer = window.setTimeout(revealMainSite, (introVideo.duration + 1) * 1000);
    }
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

    introVideo
      .play()
      .then(() => {
        introVideo.muted = false;
        introVideo.volume = 1;
        armIntroEndFallback();
      })
      .catch(() => {
        revealMainSite();
      });
  };

  preScreenCta.addEventListener("click", playIntro);
  introVideo.addEventListener("ended", revealMainSite);
  introVideo.addEventListener("error", () => {
    if (introStarted) revealMainSite();
  });
  introVideo.addEventListener("loadedmetadata", () => {
    if (introStarted) armIntroEndFallback();
  });
}

const loopAutoplayVideos = document.querySelectorAll(
  "#dirt-video, .poster__dirt-video, #logo-video, .poster__texture-scratches-video"
);
loopAutoplayVideos.forEach((vid) => {
  vid.muted = true;
  vid.setAttribute("playsinline", "");
  const tryPlay = () => {
    vid.play().catch(() => {});
  };
  tryPlay();
  vid.addEventListener("loadeddata", tryPlay);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlay();
  });
});
