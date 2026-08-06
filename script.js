javascript
/* =========================================================
   AI ANIMATED STUDIO
   MAIN APPLICATION SCRIPT
========================================================= */

"use strict";


/* =========================================================
   GLOBAL PROJECT DATA
========================================================= */

let project = {
  name: "",
  storyTitle: "",
  storyText: "",
  scenes: [],
  characters: [],
  captions: [],
  resolution: "720p",
  status: "Ready"
};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function openPage(pageId) {

  const pages = document.querySelectorAll(".page");
  const navItems = document.querySelectorAll(".nav-item");

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const selectedPage = $(pageId);

  if (selectedPage) {
    selectedPage.classList.add("active");
  }

  navItems.forEach(item => {

    if (item.dataset.page === pageId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

document.querySelectorAll(".nav-item").forEach(item => {

  item.addEventListener("click", () => {

    const page = item.dataset.page;

    if (page) {
      openPage(page);
    }

  });

});


/* =========================================================
   DASHBOARD CARD NAVIGATION
========================================================= */

document.querySelectorAll(".dashboard-action").forEach(button => {

  button.addEventListener("click", () => {

    const page = button.dataset.page;

    if (page) {
      openPage(page);
    }

  });

});


/* =========================================================
   NEW PROJECT MODAL
========================================================= */

const newProjectModal = $("newProjectModal");

function openNewProjectModal() {

  if (!newProjectModal) return;

  newProjectModal.classList.remove("hidden");

  const input = $("newProjectName");

  if (input) {
    input.value = project.name || "";
    input.focus();
  }
}


function closeNewProjectModal() {

  if (!newProjectModal) return;

  newProjectModal.classList.add("hidden");
}


if ($("newProjectBtn")) {

  $("newProjectBtn").addEventListener(
    "click",
    openNewProjectModal
  );

}


if ($("dashboardNewProject")) {

  $("dashboardNewProject").addEventListener(
    "click",
    openNewProjectModal
  );

}


if ($("closeModalBtn")) {

  $("closeModalBtn").addEventListener(
    "click",
    closeNewProjectModal
  );

}


/* Close modal when clicking outside */

if (newProjectModal) {

  newProjectModal.addEventListener("click", event => {

    if (event.target === newProjectModal) {
      closeNewProjectModal();
    }

  });

}


/* =========================================================
   CREATE PROJECT
========================================================= */

if ($("createProjectBtn")) {

  $("createProjectBtn").addEventListener(
    "click",
    createProject
  );

}


function createProject() {

  const input = $("newProjectName");

  if (!input) return;

  const name = input.value.trim();

  if (!name) {

    alert("Please enter a project name.");

    input.focus();

    return;
  }

  project.name = name;

  project.storyTitle = "";
  project.storyText = "";

  project.scenes = [];
  project.characters = [];
  project.captions = [];

  project.status = "Ready";

  updateProjectUI();

  closeNewProjectModal();

  openPage("story");

  showMessage(
    "Project created successfully."
  );

}


/* =========================================================
   PROJECT UI
========================================================= */

function updateProjectUI() {

  if ($("projectNameDisplay")) {

    $("projectNameDisplay").textContent =
      project.name || "No project created";

  }

  if ($("sceneCountDisplay")) {

    $("sceneCountDisplay").textContent =
      project.scenes.length;

  }

  if ($("characterCountDisplay")) {

    $("characterCountDisplay").textContent =
      project.characters.length;

  }

  if ($("projectStatusDisplay")) {

    $("projectStatusDisplay").textContent =
      project.status;

  }

  if ($("projectName")) {

    $("projectName").value =
      project.name || "";

  }

  if ($("videoResolution")) {

    $("videoResolution").value =
      project.resolution || "720p";

  }

}


/* =========================================================
   SAVE PROJECT
========================================================= */

if ($("saveProjectBtn")) {

  $("saveProjectBtn").addEventListener(
    "click",
    saveProject
  );

}


function saveProject() {

  try {

    localStorage.setItem(
      "aiAnimatedStudioProject",
      JSON.stringify(project)
    );

    project.status = "Saved";

    updateProjectUI();

    showMessage("Project saved.");

  } catch (error) {

    console.error(error);

    alert(
      "Unable to save the project in this browser."
    );

  }

}


/* =========================================================
   LOAD PROJECT
========================================================= */

function loadProject() {

  try {

    const saved =
      localStorage.getItem(
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
      captions: Array.isArray(data.captions)
        ? data.captions
        : [],
      resolution: data.resolution || "720p",
      status: "Saved"
    };

    updateStoryUI();
    renderScenes();
    renderCharacters();
    updateProjectUI();

  } catch (error) {

    console.error(
      "Project loading failed:",
      error
    );

  }

}


/* =========================================================
   STORY
========================================================= */

if ($("saveStoryBtn")) {

  $("saveStoryBtn").addEventListener(
    "click",
    saveStory
  );

}


function saveStory() {

  const title =
    $("storyTitle")
      ? $("storyTitle").value.trim()
      : "";

  const text =
    $("storyText")
      ? $("storyText").value.trim()
      : "";

  if (!project.name) {

    alert(
      "Create a project first."
    );

    openNewProjectModal();

    return;
  }

  project.storyTitle = title;
  project.storyText = text;

  project.status = "Story saved";

  saveProject();

  updateProjectUI();

}


/* =========================================================
   STORY UI
========================================================= */

function updateStoryUI() {

  if ($("storyTitle")) {

    $("storyTitle").value =
      project.storyTitle || "";

  }

  if ($("storyText")) {

    $("storyText").value =
      project.storyText || "";

  }

}


/* =========================================================
   STORY → SCENES
========================================================= */

if ($("storyToScenesBtn")) {

  $("storyToScenesBtn").addEventListener(
    "click",
    createScenesFromStory
  );

}


function createScenesFromStory() {

  if (!project.name) {

    alert(
      "Create a project first."
    );

    openNewProjectModal();

    return;
  }

  const story =
    $("storyText")
      ? $("storyText").value.trim()
      : "";

  if (!story) {

    alert(
      "Please write your story first."
    );

    return;
  }

  project.storyText = story;

  /*
     Simple local scene splitting.

     Later this will be replaced/extended
     with the AI Story → Scenes module.
  */

  const paragraphs = story
    .split(/\n\s*\n/)
    .map(item => item.trim())
    .filter(Boolean);

  let sceneParts = paragraphs;

  /*
     If there are no paragraph breaks,
     create scenes from sentences.
  */

  if (sceneParts.length <= 1) {

    sceneParts = story
      .split(/(?<=[.!?])\s+/)
      .map(item => item.trim())
      .filter(Boolean);

  }

  project.scenes = sceneParts.map(
    (text, index) => {

      return {
        id: Date.now() + index,
        number: index + 1,
        title: `Scene ${index + 1}`,
        description: text,
        duration: 5,
        background: "",
        characters: [],
        animation: "None"
      };

    }
  );

  project.status = "Scenes created";

  renderScenes();

  updateProjectUI();

  saveProject();

  openPage("scenes");

}


/* =========================================================
   ADD SCENE
========================================================= */

if ($("addSceneBtn")) {

  $("addSceneBtn").addEventListener(
    "click",
    addScene
  );

}


function addScene() {

  if (!project.name) {

    alert(
      "Create a project first."
    );

    openNewProjectModal();

    return;
  }

  const number =
    project.scenes.length + 1;

  project.scenes.push({

    id: Date.now(),

    number,

    title: `Scene ${number}`,

    description:
      "New scene description",

    duration: 5,

    background: "",

    characters: [],

    animation: "None"

  });

  project.status = "Scene added";

  renderScenes();

  updateProjectUI();

  saveProject();

}


/* =========================================================
   RENDER SCENES
========================================================= */

function renderScenes() {

  const list = $("sceneList");

  if (!list) return;

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

  project.scenes.forEach(
    (scene, index) => {

      const card =
        document.createElement("div");

      card.className = "scene-card";

      card.innerHTML = `

        <div>

          <h3>
            ${escapeHTML(scene.title)}
          </h3>

          <p>
            ${escapeHTML(scene.description)}
          </p>

          <p>
            Duration:
            ${scene.duration}s
          </p>

        </div>

        <div class="button-row">

          <button
            class="secondary-btn edit-scene"
            data-index="${index}">
            Edit
          </button>

          <button
            class="secondary-btn delete-scene"
            data-index="${index}">
            Delete
          </button>

        </div>

      `;

      list.appendChild(card);

    }
  );

  document.querySelectorAll(".delete-scene")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.index);

          project.scenes.splice(
            index,
            1
          );

          renumberScenes();

          project.status =
            "Scene deleted";

          renderScenes();

          updateProjectUI();

          saveProject();

        }
      );

    });

  document.querySelectorAll(".edit-scene")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(button.dataset.index);

          editScene(index);

        }
      );

    });

}


/* =========================================================
   EDIT SCENE
========================================================= */

function editScene(index) {

  const scene =
    project.scenes[index];

  if (!scene) return;

  const title =
    prompt(
      "Scene title:",
      scene.title
    );

  if (title === null) return;

  const description =
    prompt(
      "Scene description:",
      scene.description
    );

  if (description === null) return;

  scene.title =
    title.trim() ||
    `Scene ${index + 1}`;

  scene.description =
    description.trim();

  project.status =
    "Scene updated";

  renderScenes();

  saveProject();

}


/* =========================================================
   RENUMBER SCENES
========================================================= */

function renumberScenes() {

  project.scenes.forEach(
    (scene, index) => {

      scene.number =
        index + 1;

    }
  );

}


/* =========================================================
   CHARACTERS
========================================================= */

if ($("addCharacterBtn")) {

  $("addCharacterBtn").addEventListener(
    "click",
    addCharacter
  );

}


function addCharacter() {

  if (!project.name) {

    alert(
      "Create a project first."
    );

    openNewProjectModal();

    return;
  }

  const name =
    prompt(
      "Character name:"
    );

  if (!name || !name.trim()) {
    return;
  }

  const character = {

    id: Date.now(),

    name:
      name.trim(),

    description:
      "",

    emoji:
      "👤"

  };

  project.characters.push(
    character
  );

  project.status =
    "Character added";

  renderCharacters();

  updateProjectUI();

  saveProject();

}


/* =========================================================
   RENDER CHARACTERS
========================================================= */

function renderCharacters() {

  const list =
    $("characterList");

  if (!list) return;

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
    (character, index) => {

      const card =
        document.createElement("div");

      card.className =
        "character-card";

      card.innerHTML = `

        <div class="character-avatar">
          ${character.emoji || "👤"}
        </div>

        <h3>
          ${escapeHTML(character.name)}
        </h3>

        <p>
          ${
            escapeHTML(
              character.description ||
              "Character description not added yet."
            )
          }
        </p>

        <div class="button-row">

          <button
            class="secondary-btn edit-character"
            data-index="${index}">
            Edit
          </button>

          <button
            class="secondary-btn delete-character"
            data-index="${index}">
            Delete
          </button>

        </div>

      `;

      list.appendChild(card);

    }
  );


  document.querySelectorAll(
    ".delete-character"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const index =
          Number(button.dataset.index);

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


  document.querySelectorAll(
    ".edit-character"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const index =
          Number(button.dataset.index);

        editCharacter(index);

      }
    );

  });

}


/* =========================================================
   EDIT CHARACTER
========================================================= */

function editCharacter(index) {

  const character =
    project.characters[index];

  if (!character) return;

  const name =
    prompt(
      "Character name:",
      character.name
    );

  if (name === null) return;

  const description =
    prompt(
      "Character description:",
      character.description
    );

  if (description === null) return;

  character.name =
    name.trim() ||
    character.name;

  character.description =
    description.trim();

  project.status =
    "Character updated";

  renderCharacters();

  saveProject();

}


/* =========================================================
   CAPTIONS
========================================================= */

if ($("addCaptionBtn")) {

  $("addCaptionBtn").addEventListener(
    "click",
    addCaption
  );

}


function addCaption() {

  const text =
    $("captionText")
      ? $("captionText").value.trim()
      : "";

  if (!text) {

    alert(
      "Enter caption text first."
    );

    return;
  }

  project.captions.push({

    id: Date.now(),

    text

  });

  project.status =
    "Caption added";

  $("captionText").value = "";

  saveProject();

  showMessage(
    "Caption added."
  );

}


/* =========================================================
   SETTINGS
========================================================= */

if ($("saveSettingsBtn")) {

  $("saveSettingsBtn").addEventListener(
    "click",
    saveSettings
  );

}


function saveSettings() {

  if ($("projectName")) {

    const name =
      $("projectName")
        .value
        .trim();

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

}


/* =========================================================
   EXPORT PLACEHOLDER
========================================================= */

if ($("exportVideoBtn")) {

  $("exportVideoBtn").addEventListener(
    "click",
    () => {

      project.status =
        "Export module not ready";

      updateProjectUI();

      if ($("exportStatus")) {

        $("exportStatus").textContent =
          "Export engine will be connected in the next development stage.";

      }

    }
  );

}


/* =========================================================
   VOICE PLACEHOLDER
========================================================= */

if ($("generateVoiceBtn")) {

  $("generateVoiceBtn").addEventListener(
    "click",
    () => {

      alert(
        "Voice generation module will be connected later."
      );

    }
  );

}


if ($("recordVoiceBtn")) {

  $("recordVoiceBtn").addEventListener(
    "click",
    () => {

      alert(
        "Voice recording module will be added later."
      );

    }
  );

}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(value) {

  if (value === undefined ||
      value === null) {

    return "";

  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(message) {

  console.log(
    "[AI Animated Studio]",
    message
  );

}


/* =========================================================
   KEYBOARD SHORTCUT
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    /*
       Ctrl/Cmd + S
       Save project
    */

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


/* =========================================================
   INITIALIZE APPLICATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadProject();

    updateProjectUI();

    renderScenes();

    renderCharacters();

    updateStoryUI();

    openPage("dashboard");

    console.log(
      "AI Animated Studio initialized."
    );

  }
);
javascript
/* =========================================================
   STORY → SCENES PRO MODULE
   AI ANIMATED STUDIO
========================================================= */

(function initStoryScenesPro() {

  /* -------------------------------------------------------
     EXTRA SCENE DATA
  ------------------------------------------------------- */

  function normalizeScene(scene, index) {

    return {
      id: scene.id || Date.now() + index,

      number: index + 1,

      title:
        scene.title ||
        `Scene ${index + 1}`,

      description:
        scene.description || "",

      duration:
        Number(scene.duration) || 5,

      background:
        scene.background || "",

      characters:
        Array.isArray(scene.characters)
          ? scene.characters
          : [],

      dialogue:
        scene.dialogue || "",

      camera:
        scene.camera || "Static",

      animation:
        scene.animation || "None"
    };

  }


  /* -------------------------------------------------------
     UPGRADE EXISTING SCENES
  ------------------------------------------------------- */

  project.scenes =
    project.scenes.map(
      normalizeScene
    );


  /* -------------------------------------------------------
     SCENE EDITOR MODAL
  ------------------------------------------------------- */

  const modal =
    document.createElement("div");

  modal.id =
    "sceneEditorModal";

  modal.className =
    "modal hidden";

  modal.innerHTML = `

    <div class="modal-content scene-editor-modal">

      <button
        id="closeSceneEditor"
        class="modal-close">
        ×
      </button>

      <h2>🎬 Edit Scene</h2>

      <p>
        Configure this scene for animation.
      </p>


      <label>
        Scene Title
      </label>

      <input
        id="sceneEditTitle"
        type="text"
        placeholder="Scene title"
      >


      <label>
        Scene Description
      </label>

      <textarea
        id="sceneEditDescription"
        rows="5"
        placeholder="Describe what happens in this scene..."
      ></textarea>


      <label>
        Characters
      </label>

      <input
        id="sceneEditCharacters"
        type="text"
        placeholder="Example: Ravi, Anu"
      >


      <label>
        Background
      </label>

      <input
        id="sceneEditBackground"
        type="text"
        placeholder="Example: Village, Forest, City"
      >


      <label>
        Dialogue
      </label>

      <textarea
        id="sceneEditDialogue"
        rows="4"
        placeholder="Character dialogue or narration..."
      ></textarea>


      <label>
        Camera
      </label>

      <select id="sceneEditCamera">

        <option value="Static">
          Static
        </option>

        <option value="Wide Shot">
          Wide Shot
        </option>

        <option value="Medium Shot">
          Medium Shot
        </option>

        <option value="Close Up">
          Close Up
        </option>

        <option value="Zoom In">
          Zoom In
        </option>

        <option value="Zoom Out">
          Zoom Out
        </option>

        <option value="Pan Left">
          Pan Left
        </option>

        <option value="Pan Right">
          Pan Right
        </option>

      </select>


      <label>
        Animation
      </label>

      <select id="sceneEditAnimation">

        <option value="None">
          None
        </option>

        <option value="Fade In">
          Fade In
        </option>

        <option value="Fade Out">
          Fade Out
        </option>

        <option value="Walk">
          Walk
        </option>

        <option value="Talk">
          Talk
        </option>

        <option value="Action">
          Action
        </option>

        <option value="Camera Movement">
          Camera Movement
        </option>

      </select>


      <label>
        Duration (seconds)
      </label>

      <input
        id="sceneEditDuration"
        type="number"
        min="1"
        max="300"
        value="5"
      >


      <div class="button-row">

        <button
          id="saveSceneEditor"
          class="primary-btn">
          💾 Save Scene
        </button>

        <button
          id="cancelSceneEditor"
          class="secondary-btn">
          Cancel
        </button>

      </div>

    </div>

  `;

  document.body.appendChild(modal);


  let editingSceneIndex = -1;


  /* -------------------------------------------------------
     OPEN SCENE EDITOR
  ------------------------------------------------------- */

  function openSceneEditor(index) {

    const scene =
      project.scenes[index];

    if (!scene) return;

    editingSceneIndex = index;

    $("sceneEditTitle").value =
      scene.title || "";

    $("sceneEditDescription").value =
      scene.description || "";

    $("sceneEditCharacters").value =
      Array.isArray(scene.characters)
        ? scene.characters.join(", ")
        : "";

    $("sceneEditBackground").value =
      scene.background || "";

    $("sceneEditDialogue").value =
      scene.dialogue || "";

    $("sceneEditCamera").value =
      scene.camera || "Static";

    $("sceneEditAnimation").value =
      scene.animation || "None";

    $("sceneEditDuration").value =
      scene.duration || 5;

    modal.classList.remove("hidden");

  }


  /* -------------------------------------------------------
     CLOSE SCENE EDITOR
  ------------------------------------------------------- */

  function closeSceneEditor() {

    modal.classList.add("hidden");

    editingSceneIndex = -1;

  }


  $("closeSceneEditor")
    .addEventListener(
      "click",
      closeSceneEditor
    );


  $("cancelSceneEditor")
    .addEventListener(
      "click",
      closeSceneEditor
    );


  modal.addEventListener(
    "click",
    event => {

      if (event.target === modal) {

        closeSceneEditor();

      }

    }
  );


  /* -------------------------------------------------------
     SAVE SCENE
  ------------------------------------------------------- */

  $("saveSceneEditor")
    .addEventListener(
      "click",
      () => {

        if (
          editingSceneIndex < 0
        ) {
          return;
        }

        const scene =
          project.scenes[
            editingSceneIndex
          ];

        if (!scene) return;


        scene.title =
          $("sceneEditTitle")
            .value
            .trim() ||
          `Scene ${
            editingSceneIndex + 1
          }`;


        scene.description =
          $("sceneEditDescription")
            .value
            .trim();


        scene.characters =
          $("sceneEditCharacters")
            .value
            .split(",")
            .map(
              name => name.trim()
            )
            .filter(Boolean);


        scene.background =
          $("sceneEditBackground")
            .value
            .trim();


        scene.dialogue =
          $("sceneEditDialogue")
            .value
            .trim();


        scene.camera =
          $("sceneEditCamera")
            .value;


        scene.animation =
          $("sceneEditAnimation")
            .value;


        scene.duration =
          Math.max(
            1,
            Number(
              $("sceneEditDuration")
                .value
            ) || 5
          );


        project.status =
          "Scene updated";


        renderScenesPro();

        updateProjectUI();

        saveProject();

        closeSceneEditor();

      }
    );


  /* -------------------------------------------------------
     PRO SCENE RENDER
  ------------------------------------------------------- */

  function renderScenesPro() {

    const list =
      $("sceneList");

    if (!list) return;


    if (
      project.scenes.length === 0
    ) {

      list.innerHTML = `

        <div class="empty-state">

          <div>🎬</div>

          <h3>No scenes yet</h3>

          <p>
            Create your first scene.
          </p>

        </div>

      `;

      return;

    }


    list.innerHTML = "";


    project.scenes.forEach(
      (scene, index) => {

        const card =
          document.createElement("div");

        card.className =
          "scene-card";


        const characterText =
          scene.characters.length
            ? scene.characters.join(", ")
            : "None";


        card.innerHTML = `

          <div style="width:100%">

            <div style="
              display:flex;
              align-items:center;
              justify-content:space-between;
              gap:12px;
              margin-bottom:10px;
            ">

              <h3>
                🎬
                ${escapeHTML(
                  scene.title
                )}
              </h3>

              <span style="
                color:var(--muted);
                font-size:12px;
              ">
                ${scene.duration}s
              </span>

            </div>


            <p style="
              margin-bottom:10px;
            ">
              ${escapeHTML(
                scene.description
              )}
            </p>


            <div style="
              display:grid;
              grid-template-columns:
                repeat(auto-fit,minmax(130px,1fr));
              gap:8px;
              margin-top:10px;
            ">


              <div style="
                background:var(--panel-light);
                padding:9px;
                border-radius:8px;
              ">

                <small
                  style="color:var(--muted)">
                  👤 Characters
                </small>

                <div style="
                  margin-top:4px;
                  font-size:12px;
                ">
                  ${escapeHTML(
                    characterText
                  )}
                </div>

              </div>


              <div style="
                background:var(--panel-light);
                padding:9px;
                border-radius:8px;
              ">

                <small
                  style="color:var(--muted)">
                  🌄 Background
                </small>

                <div style="
                  margin-top:4px;
                  font-size:12px;
                ">
                  ${escapeHTML(
                    scene.background ||
                    "Not set"
                  )}
                </div>

              </div>


              <div style="
                background:var(--panel-light);
                padding:9px;
                border-radius:8px;
              ">

                <small
                  style="color:var(--muted)">
                  🎥 Camera
                </small>

                <div style="
                  margin-top:4px;
                  font-size:12px;
                ">
                  ${escapeHTML(
                    scene.camera
                  )}
                </div>

              </div>


              <div style="
                background:var(--panel-light);
                padding:9px;
                border-radius:8px;
              ">

                <small
                  style="color:var(--muted)">
                  ✨ Animation
                </small>

                <div style="
                  margin-top:4px;
                  font-size:12px;
                ">
                  ${escapeHTML(
                    scene.animation
                  )}
                </div>

              </div>

            </div>


            ${
              scene.dialogue
                ? `
                  <div style="
                    margin-top:12px;
                    padding:10px;
                    background:#0c1324;
                    border-left:3px solid var(--primary);
                    border-radius:6px;
                  ">

                    <small
                      style="color:var(--muted)">
                      💬 Dialogue
                    </small>

                    <div style="
                      margin-top:5px;
                      font-size:13px;
                    ">
                      ${escapeHTML(
                        scene.dialogue
                      )}
                    </div>

                  </div>
                `
                : ""
            }


            <div class="button-row">

              <button
                class="primary-btn"
                data-edit-pro="${index}">
                ✏️ Edit Scene
              </button>


              <button
                class="secondary-btn"
                data-duplicate-pro="${index}">
                📋 Duplicate
              </button>


              <button
                class="secondary-btn"
                data-delete-pro="${index}">
                🗑️ Delete
              </button>

            </div>

          </div>

        `;


        list.appendChild(card);

      }
    );


    /* -----------------------------------------------------
       EDIT BUTTONS
    ----------------------------------------------------- */

    list.querySelectorAll(
      "[data-edit-pro]"
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          openSceneEditor(
            Number(
              button.dataset.editPro
            )
          );

        }
      );

    });


    /* -----------------------------------------------------
       DUPLICATE BUTTONS
    ----------------------------------------------------- */

    list.querySelectorAll(
      "[data-duplicate-pro]"
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset
                .duplicatePro
            );

          const original =
            project.scenes[index];

          if (!original) return;


          const copy =
            JSON.parse(
              JSON.stringify(
                original
              )
            );


          copy.id =
            Date.now();


          copy.title =
            `${original.title} Copy`;


          project.scenes.splice(
            index + 1,
            0,
            copy
          );


          renumberScenes();

          project.status =
            "Scene duplicated";


          renderScenesPro();

          updateProjectUI();

          saveProject();

        }
      );

    });


    /* -----------------------------------------------------
       DELETE BUTTONS
    ----------------------------------------------------- */

    list.querySelectorAll(
      "[data-delete-pro]"
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const index =
            Number(
              button.dataset
                .deletePro
            );


          if (
            !confirm(
              "Delete this scene?"
            )
          ) {
            return;
          }


          project.scenes.splice(
            index,
            1
          );


          renumberScenes();


          project.status =
            "Scene deleted";


          renderScenesPro();

          updateProjectUI();

          saveProject();

        }
      );

    });

  }


  /* -------------------------------------------------------
     ENHANCED STORY → SCENES
  ------------------------------------------------------- */

  const originalStoryButton =
    $("storyToScenesBtn");


  if (originalStoryButton) {

    originalStoryButton.onclick =
      function () {

        if (!project.name) {

          alert(
            "Create a project first."
          );

          openNewProjectModal();

          return;

        }


        const story =
          $("storyText")
            .value
            .trim();


        if (!story) {

          alert(
            "Please write your story first."
          );

          return;

        }


        project.storyTitle =
          $("storyTitle")
            .value
            .trim();


        project.storyText =
          story;


        /*
          Split by paragraphs first.
        */

        let parts =
          story
            .split(/\n\s*\n/)
            .map(
              item =>
                item.trim()
            )
            .filter(Boolean);


        /*
          If there are not multiple
          paragraphs, split sentences.
        */

        if (parts.length <= 1) {

          parts =
            story
              .split(
                /(?<=[.!?])\s+/
              )
              .map(
                item =>
                  item.trim()
              )
              .filter(Boolean);

        }


        /*
          Create scene objects.
        */

        project.scenes =
          parts.map(
            (text, index) => {

              return {

                id:
                  Date.now() +
                  index,

                number:
                  index + 1,

                title:
                  `Scene ${
                    index + 1
                  }`,

                description:
                  text,

                duration:
                  5,

                background:
                  "",

                characters:
                  [],

                dialogue:
                  "",

                camera:
                  "Static",

                animation:
                  "None"

              };

            }
          );


        project.status =
          "Scenes created";


        renderScenesPro();

        updateProjectUI();

        saveProject();

        openPage("scenes");

      };

  }


  /* -------------------------------------------------------
     ADD SCENE UPGRADE
  ------------------------------------------------------- */

  const addSceneButton =
    $("addSceneBtn");


  if (addSceneButton) {

    addSceneButton.onclick =
      function () {

        if (!project.name) {

          alert(
            "Create a project first."
          );

          openNewProjectModal();

          return;

        }


        const number =
          project.scenes.length + 1;


        project.scenes.push({

          id:
            Date.now(),

          number,

          title:
            `Scene ${number}`,

          description:
            "Describe what happens in this scene.",

          duration:
            5,

          background:
            "",

          characters:
            [],

          dialogue:
            "",

          camera:
            "Static",

          animation:
            "None"

        });


        project.status =
          "Scene added";


        renderScenesPro();

        updateProjectUI();

        saveProject();


        /*
          Immediately open the
          new scene editor.
        */

        openSceneEditor(
          project.scenes.length - 1
        );

      };

  }


  /* -------------------------------------------------------
     INITIAL PRO RENDER
  ------------------------------------------------------- */

  renderScenesPro();


  /*
    Make the pro renderer available
    to the rest of the application.
  */

  window.renderScenesPro =
    renderScenesPro;

})();

/* =========================================================
   SAFE NAVIGATION FIX
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const pages = document.querySelectorAll(".page");
  const navButtons = document.querySelectorAll(".nav-item");
  const dashboardButtons =
    document.querySelectorAll(".dashboard-action");

  function showPage(pageId) {

    pages.forEach(function (page) {
      page.classList.remove("active");
    });

    const target = document.getElementById(pageId);

    if (target) {
      target.classList.add("active");
    }

    navButtons.forEach(function (button) {

      if (button.dataset.page === pageId) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }

    });

    window.scrollTo(0, 0);
  }


  /* Sidebar buttons */

  navButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

      event.preventDefault();

      const pageId =
        button.getAttribute("data-page");

      if (pageId) {
        showPage(pageId);
      }

    });

  });


  /* Dashboard buttons */

  dashboardButtons.forEach(function (button) {

    button.addEventListener("click", function (event) {

      event.preventDefault();

      const pageId =
        button.getAttribute("data-page");

      if (pageId) {
        showPage(pageId);
      }

    });

  });


  /* New Project button */

  const newProjectButton =
    document.getElementById("newProjectBtn");

  const dashboardNewProject =
    document.getElementById("dashboardNewProject");

  const modal =
    document.getElementById("newProjectModal");

  function openModal() {

    if (modal) {
      modal.classList.remove("hidden");
    }

  }

  if (newProjectButton) {
    newProjectButton.onclick = openModal;
  }

  if (dashboardNewProject) {
    dashboardNewProject.onclick = openModal;
  }


  /* Close modal */

  const closeModal =
    document.getElementById("closeModalBtn");

  if (closeModal) {

    closeModal.onclick = function () {

      if (modal) {
        modal.classList.add("hidden");
      }

    };

  }


  /* Start on Dashboard */

  showPage("dashboard");

});



