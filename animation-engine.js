"use strict";

/* =====================================================
   AI ANIMATED STUDIO
   ANIMATION ENGINE
   ===================================================== */

(function initAnimationEngine() {

  const canvas =
    document.getElementById("animationPreviewCanvas");

  const playBtn =
    document.getElementById("previewPlayBtn");

  const pauseBtn =
    document.getElementById("previewPauseBtn");

  const restartBtn =
    document.getElementById("previewRestartBtn");

  const timeline =
    document.getElementById("previewTimeline");

  const currentTimeDisplay =
    document.getElementById("previewCurrentTime");

  const durationDisplay =
    document.getElementById("previewDuration");

  const volumeControl =
    document.getElementById("previewVolume");


  if (!canvas) {
    console.warn(
      "Animation Engine: preview canvas not found."
    );
    return;
  }


  const ctx =
    canvas.getContext("2d");


  if (!ctx) {
    console.error(
      "Animation Engine: Canvas context unavailable."
    );
    return;
  }


  /* =====================================================
     ENGINE STATE
     ===================================================== */

  let isPlaying = false;

  let animationFrameId = null;

  let currentTime = 0;

  let totalDuration = 0;

  let lastFrameTime = 0;

  let volume = 1;


  /* =====================================================
     SAFE PROJECT ACCESS
     ===================================================== */

  function getProject() {

    if (
      typeof project !== "undefined" &&
      project
    ) {
      return project;
    }

    return {
      scenes: [],
      characters: [],
      backgrounds: [],
      captions: []
    };
  }


  /* =====================================================
     GET TOTAL DURATION
     ===================================================== */

  function calculateTotalDuration() {

    const currentProject =
      getProject();

    if (
      !Array.isArray(
        currentProject.scenes
      )
    ) {
      return 0;
    }

    return currentProject.scenes.reduce(
      (total, scene) => {

        const duration =
          Number(scene.duration);

        return total +
          (
            Number.isFinite(duration) &&
            duration > 0
              ? duration
              : 5
          );

      },
      0
    );
  }


  /* =====================================================
     FIND ACTIVE SCENE
     ===================================================== */

  function getActiveScene() {

    const currentProject =
      getProject();

    if (
      !Array.isArray(
        currentProject.scenes
      ) ||
      currentProject.scenes.length === 0
    ) {
      return null;
    }


    let elapsed = 0;


    for (
      let index = 0;
      index < currentProject.scenes.length;
      index++
    ) {

      const scene =
        currentProject.scenes[index];

      const duration =
        Number(scene.duration) > 0
          ? Number(scene.duration)
          : 5;


      if (
        currentTime <
        elapsed + duration
      ) {

        return {
          scene,
          index,
          localTime:
            currentTime - elapsed,
          duration
        };

      }


      elapsed += duration;
    }


    const lastIndex =
      currentProject.scenes.length - 1;

    const lastScene =
      currentProject.scenes[lastIndex];

    return {
      scene: lastScene,
      index: lastIndex,
      localTime:
        Number(lastScene.duration) || 5,
      duration:
        Number(lastScene.duration) || 5
    };
  }


  /* =====================================================
     CLEAR CANVAS
     ===================================================== */

  function clearCanvas() {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#050811";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }


  /* =====================================================
     DRAW BACKGROUND
     ===================================================== */

  function drawBackground(scene) {

    const currentProject =
      getProject();

    let background = null;


    if (
      scene &&
      scene.backgroundIndex !== null &&
      scene.backgroundIndex !== undefined
    ) {

      background =
        currentProject.backgrounds &&
        currentProject.backgrounds[
          Number(scene.backgroundIndex)
        ];
    }


    if (
      background &&
      background.image
    ) {

      const image =
        new Image();

      image.onload = function() {

        ctx.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

      };

      image.src =
        background.image;

      return;
    }


    // Default background

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
      );

    gradient.addColorStop(
      0,
      "#18233d"
    );

    gradient.addColorStop(
      1,
      "#080d18"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );


    // Background icon

    ctx.font =
      "80px sans-serif";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      "🌄",
      canvas.width / 2,
      canvas.height / 2
    );
  }


  /* =====================================================
     DRAW CHARACTER
     ===================================================== */

  function drawCharacter(scene) {

    const currentProject =
      getProject();

    let character = null;


    if (
      scene &&
      scene.characterIndex !== null &&
      scene.characterIndex !== undefined
    ) {

      character =
        currentProject.characters &&
        currentProject.characters[
          Number(scene.characterIndex)
        ];
    }


    if (!character) {
      return;
    }


    const name =
      character.name ||
      "Character";


    const activeScene =
      getActiveScene();


    const localTime =
      activeScene
        ? activeScene.localTime
        : 0;


    // Simple movement animation

    let x =
      canvas.width / 2;


    const y =
      canvas.height * 0.68;


    if (
      scene.animation === "Walk" ||
      scene.animation === "Run"
    ) {

      const speed =
        scene.animation === "Run"
          ? 180
          : 90;


      x =
        (
          canvas.width * 0.15 +
          (
            localTime * speed
          )
        ) %
        (
          canvas.width * 0.7
        ) +
        canvas.width * 0.15;
    }


    // Idle movement

    if (
      scene.animation === "Idle"
    ) {

      y +=
        Math.sin(
          localTime * 3
        ) * 6;
    }


    // Talk movement

    let scale = 1;

    if (
      scene.animation === "Talk"
    ) {

      scale =
        1 +
        Math.sin(
          localTime * 12
        ) *
        0.025;
    }


    // Action

    if (
      scene.animation === "Action"
    ) {

      scale =
        1 +
        Math.sin(
          localTime * 8
        ) *
        0.08;
    }


    ctx.save();

    ctx.translate(
      x,
      y
    );

    ctx.scale(
      scale,
      scale
    );


    // Character body

    ctx.fillStyle =
      "#7c5cff";

    ctx.beginPath();

    ctx.arc(
      0,
      -80,
      45,
      0,
      Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
      "#35d39a";

    ctx.beginPath();

    ctx.roundRect(
      -55,
      -35,
      110,
      130,
      22
    );

    ctx.fill();


    // Character name

    ctx.fillStyle =
      "#ffffff";

    ctx.font =
      "600 20px system-ui";

    ctx.textAlign =
      "center";

    ctx.fillText(
      name,
      0,
      140
    );


    ctx.restore();
  }


  /* =====================================================
     CAMERA EFFECT
     ===================================================== */

  function applyCamera(scene) {

    if (!scene) {
      return;
    }


    const activeScene =
      getActiveScene();


    const localTime =
      activeScene
        ? activeScene.localTime
        : 0;


    const duration =
      activeScene
        ? activeScene.duration
        : 5;


    let progress =
      duration > 0
        ? localTime / duration
        : 0;


    progress =
      Math.max(
        0,
        Math.min(
          1,
          progress
        )
      );


    if (
      scene.camera === "Zoom In"
    ) {

      const scale =
        1 +
        progress * 0.12;


      ctx.translate(
        canvas.width / 2,
        canvas.height / 2
      );

      ctx.scale(
        scale,
        scale
      );

      ctx.translate(
        -canvas.width / 2,
        -canvas.height / 2
      );
    }


    if (
      scene.camera === "Zoom Out"
    ) {

      const scale =
        1.12 -
        progress * 0.12;


      ctx.translate(
        canvas.width / 2,
        canvas.height / 2
      );

      ctx.scale(
        scale,
        scale
      );

      ctx.translate(
        -canvas.width / 2,
        -canvas.height / 2
      );
    }


    if (
      scene.camera === "Pan Left"
    ) {

      ctx.translate(
        -progress * 80,
        0
      );
    }


    if (
      scene.camera === "Pan Right"
    ) {

      ctx.translate(
        progress * 80,
        0
      );
    }
  }


  /* =====================================================
     DRAW CAPTIONS
     ===================================================== */

  function drawCaptions() {

    const currentProject =
      getProject();


    if (
      !Array.isArray(
        currentProject.captions
      )
    ) {
      return;
    }


    const activeCaption =
      currentProject.captions.find(
        caption => {

          const start =
            Number(caption.start);

          const end =
            Number(caption.end);

          return (
            currentTime >= start &&
            currentTime <= end
          );
        }
      );


    if (!activeCaption) {
      return;
    }


    const text =
      activeCaption.text ||
      activeCaption.caption ||
      "";


    if (!text) {
      return;
    }


    ctx.save();


    ctx.font =
      "600 28px system-ui";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";


    const padding =
      18;

    const metrics =
      ctx.measureText(text);


    const width =
      metrics.width +
      padding * 2;


    const height =
      52;


    const x =
      canvas.width / 2;


    const y =
      canvas.height - 70;


    ctx.fillStyle =
      "rgba(0,0,0,0.70)";


    ctx.beginPath();

    ctx.roundRect(
      x - width / 2,
      y - height / 2,
      width,
      height,
      12
    );

    ctx.fill();


    ctx.fillStyle =
      "#ffffff";


    ctx.fillText(
      text,
      x,
      y
    );


    ctx.restore();
  }


  /* =====================================================
     RENDER FRAME
     ===================================================== */

  function renderFrame() {

    totalDuration =
      calculateTotalDuration();


    clearCanvas();


    const active =
      getActiveScene();


    if (!active) {

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "600 24px system-ui";

      ctx.textAlign =
        "center";

      ctx.fillText(
        "Create a scene to start preview",
        canvas.width / 2,
        canvas.height / 2
      );

      updateUI();

      return;
    }


    const scene =
      active.scene;


    ctx.save();


    applyCamera(scene);


    drawBackground(scene);

    drawCharacter(scene);


    ctx.restore();


    drawCaptions();


    updateUI();
  }


  /* =====================================================
     UPDATE UI
     ===================================================== */

  function updateUI() {

    totalDuration =
      calculateTotalDuration();


    if (
      currentTime >
      totalDuration
    ) {

      currentTime =
        totalDuration;
    }


    if (timeline) {

      timeline.max =
        String(
          Math.max(
            totalDuration,
            0.1
          )
        );

      timeline.value =
        String(currentTime);
    }


    if (currentTimeDisplay) {

      currentTimeDisplay.textContent =
        currentTime.toFixed(1) +
        "s";
    }


    if (durationDisplay) {

      durationDisplay.textContent =
        totalDuration.toFixed(1) +
        "s";
    }
  }


  /* =====================================================
     PLAY
     ===================================================== */

  function play() {

    totalDuration =
      calculateTotalDuration();


    if (
      totalDuration <= 0
    ) {

      renderFrame();

      return;
    }


    if (
      currentTime >=
      totalDuration
    ) {

      currentTime = 0;
    }


    if (isPlaying) {
      return;
    }


    isPlaying = true;

    lastFrameTime =
      performance.now();


    function loop(timestamp) {

      if (!isPlaying) {
        return;
      }


      const delta =
        (
          timestamp -
          lastFrameTime
        ) / 1000;


      lastFrameTime =
        timestamp;


      currentTime +=
        delta;


      if (
        currentTime >=
        totalDuration
      ) {

        currentTime =
          totalDuration;

        isPlaying =
          false;
      }


      renderFrame();


      if (isPlaying) {

        animationFrameId =
          requestAnimationFrame(
            loop
          );
      }
    }


    animationFrameId =
      requestAnimationFrame(
        loop
      );
  }


  /* =====================================================
     PAUSE
     ===================================================== */

  function pause() {

    isPlaying =
      false;


    if (
      animationFrameId !== null
    ) {

      cancelAnimationFrame(
        animationFrameId
      );

      animationFrameId =
        null;
    }
  }


  /* =====================================================
     RESTART
     ===================================================== */

  function restart() {

    pause();

    currentTime =
      0;

    renderFrame();
  }


  /* =====================================================
     TIMELINE
     ===================================================== */

  if (timeline) {

    timeline.addEventListener(
      "input",
      function() {

        currentTime =
          Number(
            timeline.value
          ) || 0;

        renderFrame();
      }
    );
  }


  /* =====================================================
     VOLUME
     ===================================================== */

  if (volumeControl) {

    volumeControl.addEventListener(
      "input",
      function() {

        volume =
          Number(
            volumeControl.value
          ) || 0;

        window.animationPreviewVolume =
          volume;
      }
    );
  }


  /* =====================================================
     BUTTON EVENTS
     ===================================================== */

  if (playBtn) {

    playBtn.addEventListener(
      "click",
      play
    );
  }


  if (pauseBtn) {

    pauseBtn.addEventListener(
      "click",
      pause
    );
  }


  if (restartBtn) {

    restartBtn.addEventListener(
      "click",
      restart
    );
  }


  /* =====================================================
     REFRESH ENGINE
     ===================================================== */

  function refreshAnimationEngine() {

    pause();

    totalDuration =
      calculateTotalDuration();


    if (
      currentTime >
      totalDuration
    ) {

      currentTime =
        totalDuration;
    }


    renderFrame();
  }


  /* =====================================================
     GLOBAL ACCESS
     ===================================================== */

  window.animationEngine = {

    play,
    pause,
    restart,
    renderFrame,
    refresh:
      refreshAnimationEngine,

    getCurrentTime:
      function() {
        return currentTime;
      },

    getDuration:
      function() {
        return totalDuration;
      }
  };


  /* =====================================================
     INITIAL RENDER
     ===================================================== */

  renderFrame();


  console.log(
    "AI Animated Studio Animation Engine loaded."
  );

})();
