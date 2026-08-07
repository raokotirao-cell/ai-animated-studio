
"use strict";

/* =====================================================
   AI ANIMATED STUDIO
   CLEAN CORE SCRIPT
===================================================== */

alert("SCRIPT WORKING");

/* =====================================================
   PROJECT DATA
===================================================== */

let project = {
  name: "",
  storyTitle: "",
  storyText: "",
  scenes: [],
  characters: [],
  backgrounds: [],
  captions: [],
  resolution: "720p",
  status: "Ready"
};

/* =====================================================
   HELPER
===================================================== */

function $(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =====================================================
   PAGE NAVIGATION
===================================================== */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(function (page) {
    page.classList.remove("active");
  });

  const page = $(pageId);

  if (page) {
    page.classList.add("active");
  }

  document.querySelectorAll(".nav-item").forEach(function (button) {
    if (button.dataset.page === pageId) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  window.scrollTo(0, 0);
}

/* =====================================================
   PROJECT UI
===================================================== */

function updateProjectUI() {
  const name = $("projectNameDisplay");
  const scenes = $("sceneCountDisplay");
  const characters = $("characterCountDisplay");
  const status = $("projectStatusDisplay");

  if (name) {
    name.textContent = project.name || "No project created";
  }

  if (scenes) {
    scenes.textContent = project.scenes.length;
  }

  if (characters) {
    characters.textContent = project.characters.length;
  }

  if (status) {
    status.textContent = project.status || "Ready";
  }

  if ($("projectName")) {
    $("projectName").value = project.name || "";
  }

  if ($("videoResolution")) {
    $("videoResolution").value = project.resolution || "720p";
  }
}

/* =====================================================
   SAVE PROJECT
===================================================== */

function saveProject() {
  try {
    localStorage.setItem(
      "aiAnimatedStudioProject",
      JSON.stringify(project)
    );

    if (project.status === "Ready") {
      project.status = "Saved";
    }

    updateProjectUI();

    console.log("Project saved.");
  } catch (error) {
    console.error("Save error:", error);
  }
}

/* =====================================================
   LOAD PROJECT
===================================================== */

function loadProject() {
  try {
    const saved = localStorage.getItem(
      "aiAnimatedStudioProject"
    );

    if (!saved) {
      updateProjectUI();
      return;
    }

    const data = JSON.parse(saved);

    project = {
      name: data.name || "",
      storyTitle: data.storyTitle || "",
      storyText: data.storyText || "",

      scenes: Array.isArray(data.scenes)
        ? data.scenes
        : [],

      characters: Array.isArray(data.characters)
        ? data.characters
        : [],

      backgrounds: Array.isArray(data.backgrounds)
        ? data.backgrounds
        : [],

      captions: Array.isArray(data.captions)
        ? data.captions
        : [],

      resolution: data.resolution || "720p",

      status: "Saved"
    };

    updateStoryUI();
    renderScenes();
    renderCharacters();
    renderCaptions();
    renderBackgrounds();
    updateProjectUI();

    console.log("Project loaded.");
  } catch (error) {
    console.error("Load error:", error);

    project = {
      name: "",
      storyTitle: "",
      storyText: "",
      scenes: [],
      characters: [],
      backgrounds: [],
      captions: [],
      resolution: "720p",
      status: "Ready"
    };

    updateProjectUI();
  }
}

/* =====================================================
   NEW PROJECT
===================================================== */

function openNewProject() {
  const modal = $("newProjectModal");

  if (!modal) {
    console.warn("newProjectModal not found.");
    return;
  }

  modal.classList.remove("hidden");

  const input = $("newProjectName");

  if (input) {
    input.value = project.name || "";

    setTimeout(function () {
      input.focus();
    }, 100);
  }
}

function closeNewProject() {
  const modal = $("newProjectModal");

  if (modal) {
    modal.classList.add("hidden");
  }
}

function createProject() {
  const input = $("newProjectName");

  if (!input) {
    alert("Project name input not found.");
    return;
  }

  const name = input.value.trim();

  if (!name) {
    alert("Please enter a project name.");
    return;
  }

  project = {
    name: name,
    storyTitle: "",
    storyText: "",
    scenes: [],
    characters: [],
    backgrounds: [],
    captions: [],
    resolution: "720p",
    status: "Ready"
  };

  updateProjectUI();
  updateStoryUI();
  renderScenes();
  renderCharacters();
  renderCaptions();
  renderBackgrounds();

  saveProject();

  closeNewProject();

  showPage("story");

  alert("Project created successfully.");
}

/* =====================================================
   STORY
===================================================== */

function updateStoryUI() {
  if ($("storyTitle")) {
    $("storyTitle").value = project.storyTitle || "";
  }

  if ($("storyText")) {
    $("storyText").value = project.storyText || "";
  }
}

function saveStory() {
  if (!project.name) {
    alert("Please create a project first.");
    openNewProject();
    return;
  }

  project.storyTitle = $("storyTitle")
    ? $("storyTitle").value.trim()
    : "";

  project.storyText = $("storyText")
    ? $("storyText").value.trim()
    : "";

  project.status = "Story saved";

  saveProject();

  alert("Story saved successfully.");
}

/* =====================================================
   STORY → SCENES
===================================================== */

function createScenes() {
  if (!project.name) {
    alert("Please create a project first.");
    openNewProject();
    return;
  }

  const story = $("storyText")
    ? $("storyText").value.trim()
    : "";

  if (!story) {
    alert("Please write a story first.");
    return;
  }

  project.storyTitle = $("storyTitle")
    ? $("storyTitle").value.trim()
    : "";

  project.storyText = story;

  let parts = story
    .split(/\n\s*\n/)
    .map(function (text) {
      return text.trim();
    })
    .filter(Boolean);

  if (parts.length <= 1) {
    parts = story
      .split(/(?<=[.!?])\s+/)
      .map(function (text) {
        return text.trim();
      })
      .filter(Boolean);
  }

  project.scenes = parts.map(function (text, index) {
    return {
      id: Date.now() + index,
      number: index + 1,
      title: "Scene " + (index + 1),
      description: text,
      duration: 5,
      background: "",
      characters: [],
      dialogue: "",
      camera: "Static",
      animation: "None"
    };
  });

  project.status = "Scenes created";

  renderScenes();
  updateProjectUI();
  saveProject();

  showPage("scenes");

  alert(
    project.scenes.length +
      " scene(s) created successfully."
  );
}

/* =====================================================
   ADD SCENE
===================================================== */

function addScene() {
  if (!project.name) {
    alert("Please create a project first.");
    openNewProject();
    return;
  }

  const number = project.scenes.length + 1;

  project.scenes.push({
    id: Date.now(),
    number: number,
    title: "Scene " + number,
    description: "Describe this scene.",
    duration: 5,
    background: "",
    characters: [],
    dialogue: "",
    camera: "Static",
    animation: "None"
  });

  project.status = "Scene added";

  renderScenes();
  updateProjectUI();
  saveProject();
}

/* =====================================================
   RENDER SCENES
===================================================== */

function renderScenes() {
  const list = $("sceneList");

  if (!list) {
    return;
  }

  if (project.scenes.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div>🎬</div>
        <h3>No scenes yet</h3>
        <p>Create your first scene.</p>
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  project.scenes.forEach(function (scene, index) {
    const card = document.createElement("div");

    card.className = "scene-card";

    card.innerHTML = `
      <div class="scene-card-header">

        <div>
          <h3>🎬 Scene ${index + 1}</h3>

          <span>
            ${escapeHTML(
              scene.title || "Untitled Scene"
            )}
          </span>
        </div>

        <button
          type="button"
          class="secondary-btn"
          data-delete-scene="${index}">
          🗑️ Delete
        </button>

      </div>

      <div class="scene-editor-grid">

        <div class="scene-field">

          <label>Scene Title</label>

          <input
            type="text"
            data-scene-title="${index}"
            value="${escapeHTML(scene.title || "")}"
            placeholder="Scene title">

        </div>

        <div class="scene-field">

          <label>Duration (seconds)</label>

          <input
            type="number"
            min="1"
            max="300"
            data-scene-duration="${index}"
            value="${scene.duration || 5}">

        </div>

        <div class="scene-field scene-full">

          <label>Scene Description</label>

          <textarea
            rows="4"
            data-scene-description="${index}"
            placeholder="Describe what happens in this scene..."
          >${escapeHTML(
            scene.description || ""
          )}</textarea>

        </div>

        <div class="scene-field">

          <label>🌄 Background</label>

          <input
            type="text"
            data-scene-background="${index}"
            value="${escapeHTML(
              scene.background || ""
            )}"
            placeholder="Village, forest, city...">

        </div>

        <div class="scene-field">

          <label>👤 Characters</label>

          <input
            type="text"
            data-scene-characters="${index}"
            value="${escapeHTML(
              Array.isArray(scene.characters)
                ? scene.characters.join(", ")
                : scene.characters || ""
            )}"
            placeholder="Character names">

        </div>

        <div class="scene-field scene-full">

          <label>💬 Dialogue</label>

          <textarea
            rows="3"
            data-scene-dialogue="${index}"
            placeholder="Character dialogue..."
          >${escapeHTML(
            scene.dialogue || ""
          )}</textarea>

        </div>

        <div class="scene-field">

          <label>📷 Camera</label>

          <select data-scene-camera="${index}">

            <option value="Static"
              ${
                scene.camera === "Static"
                  ? "selected"
                  : ""
              }>
              Static
            </option>

            <option value="Zoom In"
              ${
                scene.camera === "Zoom In"
                  ? "selected"
                  : ""
              }>
              Zoom In
            </option>

            <option value="Zoom Out"
              ${
                scene.camera === "Zoom Out"
                  ? "selected"
                  : ""
              }>
              Zoom Out
            </option>

            <option value="Pan Left"
              ${
                scene.camera === "Pan Left"
                  ? "selected"
                  : ""
              }>
              Pan Left
            </option>

            <option value="Pan Right"
              ${
                scene.camera === "Pan Right"
                  ? "selected"
                  : ""
              }>
              Pan Right
            </option>

            <option value="Close Up"
              ${
                scene.camera === "Close Up"
                  ? "selected"
                  : ""
              }>
              Close Up
            </option>

          </select>

        </div>

        <div class="scene-field">

          <label>✨ Animation</label>

          <select data-scene-animation="${index}">

            <option value="None"
              ${
                scene.animation === "None"
                  ? "selected"
                  : ""
              }>
              None
            </option>

            <option value="Idle"
              ${
                scene.animation === "Idle"
                  ? "selected"
                  : ""
              }>
              Idle
            </option>

            <option value="Walk"
              ${
                scene.animation === "Walk"
                  ? "selected"
                  : ""
              }>
              Walk
            </option>

            <option value="Run"
              ${
                scene.animation === "Run"
                  ? "selected"
                  : ""
              }>
              Run
            </option>

            <option value="Talk"
              ${
                scene.animation === "Talk"
                  ? "selected"
                  : ""
              }>
              Talk
            </option>

            <option value="Action"
              ${
                scene.animation === "Action"
                  ? "selected"
                  : ""
              }>
              Action
            </option>

          </select>

        </div>

      </div>

      <div class="button-row">

        <button
          type="button"
          class="primary-btn"
          data-save-scene="${index}">
          💾 Save Scene
        </button>

      </div>
    `;

    list.appendChild(card);
  });

  list.querySelectorAll(
    "[data-save-scene]"
  ).forEach(function (button) {
    button.addEventListener("click", function () {
      saveScene(
        Number(button.dataset.saveScene)
      );
    });
  });

  list.querySelectorAll(
    "[data-delete-scene]"
  ).forEach(function (button) {
    button.addEventListener("click", function () {
      const index = Number(
        button.dataset.deleteScene
      );

      if (!confirm("Delete this scene?")) {
        return;
      }

      project.scenes.splice(index, 1);

      renumberScenes();

      project.status = "Scene deleted";

      renderScenes();
      updateProjectUI();
      saveProject();
    });
  });
}

/* =====================================================
   SAVE SCENE
===================================================== */

function saveScene(index) {
  const scene = project.scenes[index];

  if (!scene) {
    return;
  }

  const titleInput = document.querySelector(
    `[data-scene-title="${index}"]`
  );

  const descriptionInput = document.querySelector(
    `[data-scene-description="${index}"]`
  );

  const durationInput = document.querySelector(
    `[data-scene-duration="${index}"]`
  );

  const backgroundInput = document.querySelector(
    `[data-scene-background="${index}"]`
  );

  const charactersInput = document.querySelector(
    `[data-scene-characters="${index}"]`
  );

  const dialogueInput = document.querySelector(
    `[data-scene-dialogue="${index}"]`
  );

  const cameraInput = document.querySelector(
    `[data-scene-camera="${index}"]`
  );

  const animationInput = document.querySelector(
    `[data-scene-animation="${index}"]`
  );

  if (titleInput) {
    scene.title = titleInput.value.trim();
  }

  if (descriptionInput) {
    scene.description =
      descriptionInput.value.trim();
  }

  if (durationInput) {
    scene.duration = Math.max(
      1,
      Number(durationInput.value) || 5
    );
  }

  if (backgroundInput) {
    scene.background =
      backgroundInput.value.trim();
  }

  if (charactersInput) {
    scene.characters = charactersInput.value
      .split(",")
      .map(function (name) {
        return name.trim();
      })
      .filter(Boolean);
  }

  if (dialogueInput) {
    scene.dialogue =
      dialogueInput.value.trim();
  }

  if (cameraInput) {
    scene.camera = cameraInput.value;
  }

  if (animationInput) {
    scene.animation = animationInput.value;
  }

  project.status = "Scene saved";

  renderScenes();
  updateProjectUI();
  saveProject();

  alert(
    "Scene " +
      (index + 1) +
      " saved successfully."
  );
}

/* =====================================================
   EDIT SCENE
===================================================== */

function editScene(index) {
  const scene = project.scenes[index];

  if (!scene) {
    return;
  }

  const title = prompt(
    "Scene title:",
    scene.title
  );

  if (title === null) {
    return;
  }

  const description = prompt(
    "Scene description:",
    scene.description
  );

  if (description === null) {
    return;
  }

  scene.title =
    title.trim() ||
    "Scene " + (index + 1);

  scene.description =
    description.trim();

  project.status = "Scene updated";

  renderScenes();
  updateProjectUI();
  saveProject();
}

/* =====================================================
   RENUMBER SCENES
===================================================== */

function renumberScenes() {
  project.scenes.forEach(
    function (scene, index) {
      scene.number = index + 1;
    }
  );
}

/* =====================================================
   CHARACTERS
===================================================== */

function addCharacter() {
  if (!project.name) {
    alert("Please create a project first.");
    openNewProject();
    return;
  }

  const name = prompt(
    "Character name:"
  );

  if (!name || !name.trim()) {
    return;
  }

  project.characters.push({
    id: Date.now(),
    name: name.trim(),
    description: "",
    emoji: "👤"
  });

  project.status = "Character added";

  renderCharacters();
  updateProjectUI();
  saveProject();
}

/* =====================================================
   RENDER CHARACTERS
===================================================== */

function renderCharacters() {
  const list = $("characterList");

  if (!list) {
    return;
  }

  if (!project.characters) {
    project.characters = [];
  }

  if (project.characters.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div>👤</div>
        <h3>No characters yet</h3>
        <p>Add your first character.</p>
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  project.characters.forEach(
    function (character, index) {
      const card =
        document.createElement("div");

      card.className =
        "character-card";

      card.innerHTML = `
        <div class="character-avatar">
          ${escapeHTML(
            character.emoji || "👤"
          )}
        </div>

        <h3>
          ${escapeHTML(
            character.name
          )}
        </h3>

        <p>
          ${escapeHTML(
            character.description ||
            "No description yet."
          )}
        </p>

        <div class="button-row">

          <button
            type="button"
            class="secondary-btn"
            data-edit-character="${index}">
            ✏️ Edit
          </button>

          <button
            type="button"
            class="secondary-btn"
            data-delete-character="${index}">
            🗑️ Delete
          </button>

        </div>
      `;

      list.appendChild(card);
    }
  );

  list.querySelectorAll(
    "[data-edit-character]"
  ).forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        editCharacter(
          Number(
            button.dataset.editCharacter
          )
        );
      }
    );
  });

  list.querySelectorAll(
    "[data-delete-character]"
  ).forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        const index = Number(
          button.dataset.deleteCharacter
        );

        if (
          !confirm(
            "Delete this character?"
          )
        ) {
          return;
        }

        project.characters.splice(
          index,
          1
        );

        project.status =
          "Character deleted";

        renderCharacters();
        updateProjectUI();
        saveProject();
      }
    );
  });
}

/* =====================================================
   EDIT CHARACTER
===================================================== */

function editCharacter(index) {
  const character =
    project.characters[index];

  if (!character) {
    return;
  }

  const name = prompt(
    "Character name:",
    character.name
  );

  if (name === null) {
    return;
  }

  const description = prompt(
    "Character description:",
    character.description || ""
  );

  if (description === null) {
    return;
  }

  character.name =
    name.trim() ||
    character.name;

  character.description =
    description.trim();

  project.status =
    "Character updated";

  renderCharacters();
  updateProjectUI();
  saveProject();
}

/* =====================================================
   CAPTIONS
===================================================== */

function addCaption() {
  if (!project.name) {
    alert("Please create a project first.");
    openNewProject();
    return;
  }

  const input = $("captionText");

  if (!input) {
    alert("Caption input not found.");
    return;
  }

  const text = input.value.trim();

  if (!text) {
    alert("Enter caption text first.");
    return;
  }

  if (!project.captions) {
    project.captions = [];
  }

  project.captions.push({
    id: Date.now(),
    text: text
  });

  input.value = "";

  project.status =
    "Caption added";

  renderCaptions();
  updateProjectUI();
  saveProject();

  alert("Caption added.");
}

/* =====================================================
   RENDER CAPTIONS
===================================================== */

function renderCaptions() {
  const list = $("captionList");

  if (!list) {
    return;
  }

  if (!project.captions) {
    project.captions = [];
  }

  if (project.captions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div>💬</div>
        <h3>No captions yet</h3>
        <p>Add your first caption.</p>
      </div>
    `;

    return;
  }

  list.innerHTML = "";

  project.captions.forEach(
    function (caption, index) {
      const card =
        document.createElement("div");

      card.className =
        "character-card";

      card.innerHTML = `
        <div class="character-avatar">
          💬
        </div>

        <h3>
          Caption ${index + 1}
        </h3>

        <p>
          ${escapeHTML(
            caption.text
          )}
        </p>

        <div class="button-row">

          <button
            type="button"
            class="secondary-btn"
            data-edit-caption="${index}">
            ✏️ Edit
          </button>

          <button
            type="button"
            class="secondary-btn"
            data-delete-caption="${index}">
            🗑️ Delete
          </button>

        </div>
      `;

      list.appendChild(card);
    }
  );

  list.querySelectorAll(
    "[data-edit-caption]"
  ).forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        editCaption(
          Number(
            button.dataset.editCaption
          )
        );
      }
    );
  });

  list.querySelectorAll(
    "[data-delete-caption]"
  ).forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        const index = Number(
          button.dataset.deleteCaption
        );

        if (
          !confirm(
            "Delete this caption?"
          )
        ) {
          return;
        }

        project.captions.splice(
          index,
          1
        );

        project.status =
          "Caption deleted";

        renderCaptions();
        updateProjectUI();
        saveProject();
      }
    );
  });
}

/* =====================================================
   EDIT CAPTION
===================================================== */

function editCaption(index) {
  if (!project.captions) {
    return;
  }

  const caption =
    project.captions[index];

  if (!caption) {
    return;
  }

  const text = prompt(
    "Caption text:",
    caption.text
  );

  if (text === null) {
    return;
  }

  if (!text.trim()) {
    alert(
      "Caption cannot be empty."
    );

    return;
  }

  caption.text =
    text.trim();

  project.status =
    "Caption updated";

  renderCaptions();
  updateProjectUI();
  saveProject();
}

/* =====================================================
   BACKGROUNDS
===================================================== */

function addBackground() {
  if (!project.name) {
    alert(
      "Please create a project first."
    );

    openNewProject();
    return;
  }

  const name = prompt(
    "Background name:"
  );

  if (!name || !name.trim()) {
    return;
  }

  if (!project.backgrounds) {
    project.backgrounds = [];
  }

  project.backgrounds.push({
    id: Date.now(),
    name: name.trim(),
    description: "",
    emoji: "🌄"
  });

  project.status =
    "Background added";

  renderBackgrounds();
  updateProjectUI();
  saveProject();

  alert("Background added.");
}

/* =====================================================
   RENDER BACKGROUNDS
===================================================== */

function renderBackgrounds() {
  const list = $("backgroundList");

  if (!list) {
    return;
  }

  if (!project.backgrounds) {
    project.backgrounds = [];
  }

  if (project.backgrounds.length === 0) {
    list.innerHTML = `
      <div class="empty-state">

        <div>🌄</div>

        <h3>
          No backgrounds yet
        </h3>

        <p>
          Add your first background.
        </p>

      </div>
    `;

    return;
  }

  list.innerHTML = "";

  project.backgrounds.forEach(
    function (background, index) {
      const card =
        document.createElement("div");

      card.className =
        "character-card";

      card.innerHTML = `
        <div class="character-avatar">
          ${escapeHTML(
            background.emoji || "🌄"
          )}
        </div>

        <h3>
          ${escapeHTML(
            background.name
          )}
        </h3>

        <p>
          ${escapeHTML(
            background.description ||
            "No description yet."
          )}
        </p>

        <div class="button-row">

          <button
            type="button"
            class="secondary-btn"
            data-edit-background="${index}">
            ✏️ Edit
          </button>

          <button
            type="button"
            class="secondary-btn"
            data-delete-background="${index}">
            🗑️ Delete
          </button>

        </div>
      `;

      list.appendChild(card);
    }
  );

  list.querySelectorAll(
    "[data-edit-background]"
  ).forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        editBackground(
          Number(
            button.dataset.editBackground
          )
        );
      }
    );
  });

  list.querySelectorAll(
    "[data-delete-background]"
  ).forEach(function (button) {
    button.addEventListener(
      "click",
      function () {
        const index = Number(
          button.dataset.deleteBackground
        );

        if (
          !confirm(
            "Delete this background?"
          )
        ) {
          return;
        }

        project.backgrounds.splice(
          index,
          1
        );

        project.status =
          "Background deleted";

        renderBackgrounds();
        updateProjectUI();
        saveProject();
      }
    );
  });
}

/* =====================================================
   EDIT BACKGROUND
===================================================== */

function editBackground(index) {
  if (!project.backgrounds) {
    return;
  }

  const background =
    project.backgrounds[index];

  if (!background) {
    return;
  }

  const name = prompt(
    "Background name:",
    background.name
  );

  if (name === null) {
    return;
  }

  const description = prompt(
    "Background description:",
    background.description || ""
  );

  if (description === null) {
    return;
  }

  background.name =
    name.trim() ||
    background.name;

  background.description =
    description.trim();

  project.status =
    "Background updated";

  renderBackgrounds();
  updateProjectUI();
  saveProject();
}

/* =====================================================
   SETTINGS
===================================================== */

function saveSettings() {
  if ($("projectName")) {
    const name =
      $("projectName").value.trim();

    if (name) {
      project.name = name;
    }
  }

  if ($("videoResolution")) {
    project.resolution =
      $("videoResolution").value;
  }

  project.status =
    "Settings saved";

  updateProjectUI();
  saveProject();

  alert("Settings saved.");
}

/* =====================================================
   VOICE
===================================================== */

function generateVoice() {
  if (!project.name) {
    alert(
      "Please create a project first."
    );

    openNewProject();
    return;
  }

  const text = $("voiceText")
    ? $("voiceText").value.trim()
    : "";

  if (!text) {
    alert(
      "Enter narration text first."
    );

    return;
  }

  project.status =
    "Voice generation pending";

  updateProjectUI();

  alert(
    "Voice generation engine will be added in the next stage."
  );
}

function recordVoice() {
  if (!project.name) {
    alert(
      "Please create a project first."
    );

    openNewProject();
    return;
  }

  alert(
    "Voice recording module will be added in the next stage."
  );
}

/* =====================================================
   EXPORT
===================================================== */

function exportVideo() {
  const status =
    $("exportStatus");

  project.status =
    "Export engine pending";

  updateProjectUI();

  if (status) {
    status.textContent =
      "Video export engine will be added in the next stage.";
  }
}

/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    /* =========================================
       LOAD PROJECT
    ========================================= */

    loadProject();

    /* =========================================
       SIDEBAR NAVIGATION
    ========================================= */

    document.querySelectorAll(
      ".nav-item"
    ).forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          const page =
            button.dataset.page;

          if (page) {
            showPage(page);
          }

        }
      );

    });

    /* =========================================
       DASHBOARD BUTTONS
    ========================================= */

    document.querySelectorAll(
      ".dashboard-action"
    ).forEach(function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          const page =
            button.dataset.page;

          if (page) {
            showPage(page);
          }

        }
      );

    });

    /* =========================================
       NEW PROJECT
    ========================================= */

    if ($("newProjectBtn")) {
      $("newProjectBtn").onclick =
        openNewProject;
    }

    if ($("dashboardNewProject")) {
      $("dashboardNewProject").onclick =
        openNewProject;
    }

    /* =========================================
       CLOSE MODAL
    ========================================= */

    if ($("closeModalBtn")) {
      $("closeModalBtn").onclick =
        closeNewProject;
    }

    /* =========================================
       CREATE PROJECT
    ========================================= */

    if ($("createProjectBtn")) {
      $("createProjectBtn").onclick =
        createProject;
    }

    /* =========================================
       STORY
    ========================================= */

    if ($("saveStoryBtn")) {
      $("saveStoryBtn").onclick =
        saveStory;
    }

    if ($("storyToScenesBtn")) {
      $("storyToScenesBtn").onclick =
        createScenes;
    }

    /* =========================================
       SCENES
    ========================================= */

    if ($("addSceneBtn")) {
      $("addSceneBtn").onclick =
        addScene;
    }

    /* =========================================
       CHARACTERS
    ========================================= */

    if ($("addCharacterBtn")) {
      $("addCharacterBtn").onclick =
        addCharacter;
    }

    /* =========================================
       BACKGROUNDS
    ========================================= */

    if ($("addBackgroundBtn")) {
      $("addBackgroundBtn").onclick =
        addBackground;
    }

    /* =========================================
       CAPTIONS
    ========================================= */

    if ($("addCaptionBtn")) {
      $("addCaptionBtn").onclick =
        addCaption;
    }

    /* =========================================
       VOICE
    ========================================= */

    if ($("generateVoiceBtn")) {
      $("generateVoiceBtn").onclick =
        generateVoice;
    }

    if ($("recordVoiceBtn")) {
      $("recordVoiceBtn").onclick =
        recordVoice;
    }

    /* =========================================
       SETTINGS
    ========================================= */

    if ($("saveSettingsBtn")) {
      $("saveSettingsBtn").onclick =
        saveSettings;
    }

    /* =========================================
       EXPORT
    ========================================= */

    if ($("exportVideoBtn")) {
      $("exportVideoBtn").onclick =
        exportVideo;
    }

    /* =========================================
       SAVE PROJECT
    ========================================= */

    if ($("saveProjectBtn")) {
      $("saveProjectBtn").onclick =
        saveProject;
    }

    /* =========================================
       MODAL BACKGROUND CLICK
    ========================================= */

    const modal =
      $("newProjectModal");

    if (modal) {
      modal.addEventListener(
        "click",
        function (event) {

          if (
            event.target === modal
          ) {
            closeNewProject();
          }

        }
      );
    }

    /* =========================================
       ESCAPE CLOSE MODAL
    ========================================= */

    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {
          closeNewProject();
        }

      }
    );

    /* =========================================
       KEYBOARD SAVE
    ========================================= */

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          (event.ctrlKey ||
            event.metaKey) &&
          event.key.toLowerCase() === "s"
        ) {

          event.preventDefault();

          saveProject();
        }

      }
    );

    /* =========================================
       FINAL UI REFRESH
    ========================================= */

    updateProjectUI();

    renderScenes();
    renderCharacters();
    renderCaptions();
    renderBackgrounds();
    updateStoryUI();

    showPage("dashboard");

    console.log(
      "AI Animated Studio ready."
    );
  }
);

