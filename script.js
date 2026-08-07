alert("SCRIPT WORKING");
"use strict";

/* =====================================================
   AI ANIMATED STUDIO
   CLEAN CORE SCRIPT
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
   HELPERS
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

  document.querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.remove("active");

    });


  const page = $(pageId);

  if (page) {
    page.classList.add("active");
  }


  document.querySelectorAll(".nav-item")
    .forEach(function(button) {

      if (
        button.dataset.page === pageId
      ) {

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

  const name =
    $("projectNameDisplay");

  const scenes =
    $("sceneCountDisplay");

  const characters =
    $("characterCountDisplay");

  const status =
    $("projectStatusDisplay");


  if (name) {

    name.textContent =
      project.name ||
      "No project created";

  }


  if (scenes) {

    scenes.textContent =
      project.scenes.length;

  }


  if (characters) {

    characters.textContent =
      project.characters.length;

  }


  if (status) {

    status.textContent =
      project.status;

  }


  if ($("projectName")) {

    $("projectName").value =
      project.name;

  }


  if ($("videoResolution")) {

    $("videoResolution").value =
      project.resolution;

  }

}


/* =====================================================
   SAVE
===================================================== */

function saveProject() {

  try {

    localStorage.setItem(
      "aiAnimatedStudioProject",
      JSON.stringify(project)
    );

    project.status = "Saved";

    updateProjectUI();

  } catch (error) {

    console.error(error);

  }

}


/* =====================================================
   LOAD
===================================================== */

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


    const data =
      JSON.parse(saved);


    project = {

      name: data.name || "",

      storyTitle:
        data.storyTitle || "",

      storyText:
        data.storyText || "",

      scenes:
        Array.isArray(data.scenes)
          ? data.scenes
          : [],

      characters:
        Array.isArray(data.characters)
          ? data.characters
          : [],
       backgrounds:
  Array.isArray(data.backgrounds)
    ? data.backgrounds
    : [],

      captions:
        Array.isArray(data.captions)
          ? data.captions
          : [],

      resolution:
        data.resolution || "720p",

      status: "Saved"

    };


    updateStoryUI();

    renderScenes();

    renderCharacters();

    updateProjectUI();

  } catch (error) {

    console.error(
      "Load error:",
      error
    );

  }

}


/* =====================================================
   NEW PROJECT
===================================================== */

function openNewProject() {

  const modal =
    $("newProjectModal");

  if (!modal) return;

  modal.classList.remove("hidden");


  const input =
    $("newProjectName");

  if (input) {

    input.value =
      project.name || "";

    input.focus();

  }

}


function closeNewProject() {

  const modal =
    $("newProjectModal");

  if (modal) {

    modal.classList.add("hidden");

  }

}


function createProject() {

  const input =
    $("newProjectName");

  if (!input) return;


  const name =
    input.value.trim();


  if (!name) {

    alert(
      "Please enter a project name."
    );

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

  saveProject();

  closeNewProject();

  showPage("story");

}


/* =====================================================
   STORY
===================================================== */

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


function saveStory() {

  if (!project.name) {

    alert(
      "Please create a project first."
    );

    openNewProject();

    return;

  }


  project.storyTitle =
    $("storyTitle")
      ? $("storyTitle").value.trim()
      : "";


  project.storyText =
    $("storyText")
      ? $("storyText").value.trim()
      : "";


  project.status =
    "Story saved";


  saveProject();

  alert(
    "Story saved successfully."
  );

}


/* =====================================================
   STORY → SCENES
===================================================== */

function createScenes() {

  if (!project.name) {

    alert(
      "Please create a project first."
    );

    openNewProject();

    return;

  }


  const story =
    $("storyText")
      ? $("storyText").value.trim()
      : "";


  if (!story) {

    alert(
      "Please write a story first."
    );

    return;

  }


  project.storyTitle =
    $("storyTitle")
      ? $("storyTitle").value.trim()
      : "";


  project.storyText =
    story;


  let parts =
    story
      .split(/\n\s*\n/)
      .map(function(text) {

        return text.trim();

      })
      .filter(Boolean);


  if (parts.length <= 1) {

    parts =
      story
        .split(/(?<=[.!?])\s+/)
        .map(function(text) {

          return text.trim();

        })
        .filter(Boolean);

  }


  project.scenes =
    parts.map(function(text, index) {

      return {

        id:
          Date.now() + index,

        number:
          index + 1,

        title:
          "Scene " + (index + 1),

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

    });


  project.status =
    "Scenes created";


  renderScenes();

  updateProjectUI();

  saveProject();

  showPage("scenes");

}


/* =====================================================
   ADD SCENE
===================================================== */

function addScene() {

  if (!project.name) {

    alert(
      "Please create a project first."
    );

    openNewProject();

    return;

  }


  const number =
    project.scenes.length + 1;


  project.scenes.push({

    id: Date.now(),

    number: number,

    title:
      "Scene " + number,

    description:
      "Describe this scene.",

    duration: 5,

    background: "",

    characters: [],

    dialogue: "",

    camera: "Static",

    animation: "None"

  });


  project.status =
    "Scene added";


  renderScenes();

  updateProjectUI();

  saveProject();

}


/* =====================================================
   RENDER SCENES
===================================================== */

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

  project.scenes.forEach(function(scene, index) {

    const card = document.createElement("div");

    card.className = "scene-card";

    card.innerHTML = `

      <div class="scene-card-header">

        <div>
          <h3>
            🎬 Scene ${index + 1}
          </h3>

          <span>
            ${escapeHTML(scene.title || "Untitled Scene")}
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
            placeholder="Describe what happens in this scene...">${escapeHTML(scene.description || "")}</textarea>

        </div>


        <div class="scene-field">

          <label>🌄 Background</label>

          <input
            type="text"
            data-scene-background="${index}"
            value="${escapeHTML(scene.background || "")}"
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
            placeholder="Character dialogue...">${escapeHTML(scene.dialogue || "")}</textarea>

        </div>


        <div class="scene-field">

          <label>📷 Camera</label>

          <select data-scene-camera="${index}">

            <option value="Static"
              ${scene.camera === "Static" ? "selected" : ""}>
              Static
            </option>

            <option value="Zoom In"
              ${scene.camera === "Zoom In" ? "selected" : ""}>
              Zoom In
            </option>

            <option value="Zoom Out"
              ${scene.camera === "Zoom Out" ? "selected" : ""}>
              Zoom Out
            </option>

            <option value="Pan Left"
              ${scene.camera === "Pan Left" ? "selected" : ""}>
              Pan Left
            </option>

            <option value="Pan Right"
              ${scene.camera === "Pan Right" ? "selected" : ""}>
              Pan Right
            </option>

            <option value="Close Up"
              ${scene.camera === "Close Up" ? "selected" : ""}>
              Close Up
            </option>

          </select>

        </div>


        <div class="scene-field">

          <label>✨ Animation</label>

          <select data-scene-animation="${index}">

            <option value="None"
              ${scene.animation === "None" ? "selected" : ""}>
              None
            </option>

            <option value="Idle"
              ${scene.animation === "Idle" ? "selected" : ""}>
              Idle
            </option>

            <option value="Walk"
              ${scene.animation === "Walk" ? "selected" : ""}>
              Walk
            </option>

            <option value="Run"
              ${scene.animation === "Run" ? "selected" : ""}>
              Run
            </option>

            <option value="Talk"
              ${scene.animation === "Talk" ? "selected" : ""}>
              Talk
            </option>

            <option value="Action"
              ${scene.animation === "Action" ? "selected" : ""}>
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


  /* SAVE SCENE */

  list.querySelectorAll(
    "[data-save-scene]"
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        saveScene(
          Number(button.dataset.saveScene)
        );

      }
    );

  });


  /* DELETE SCENE */

  list.querySelectorAll(
    "[data-delete-scene]"
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const index =
          Number(button.dataset.deleteScene);

        if (!confirm("Delete this scene?")) {
          return;
        }

        project.scenes.splice(index, 1);

        renumberScenes();

        project.status = "Scene deleted";

        renderScenes();
        updateProjectUI();
        saveProject();

      }
    );

  });

}
function saveScene(index) {

  const scene = project.scenes[index];

  if (!scene) return;


  const titleInput =
    document.querySelector(
      `[data-scene-title="${index}"]`
    );

  const descriptionInput =
    document.querySelector(
      `[data-scene-description="${index}"]`
    );

  const durationInput =
    document.querySelector(
      `[data-scene-duration="${index}"]`
    );

  const backgroundInput =
    document.querySelector(
      `[data-scene-background="${index}"]`
    );

  const charactersInput =
    document.querySelector(
      `[data-scene-characters="${index}"]`
    );

  const dialogueInput =
    document.querySelector(
      `[data-scene-dialogue="${index}"]`
    );

  const cameraInput =
    document.querySelector(
      `[data-scene-camera="${index}"]`
    );

  const animationInput =
    document.querySelector(
      `[data-scene-animation="${index}"]`
    );


  scene.title =
    titleInput
      ? titleInput.value.trim()
      : scene.title;


  scene.description =
    descriptionInput
      ? descriptionInput.value.trim()
      : scene.description;


  scene.duration =
    durationInput
      ? Math.max(
          1,
          Number(durationInput.value) || 5
        )
      : 5;


  scene.background =
    backgroundInput
      ? backgroundInput.value.trim()
      : "";


  scene.characters =
    charactersInput
      ? charactersInput.value
          .split(",")
          .map(function(name) {
            return name.trim();
          })
          .filter(Boolean)
      : [];


  scene.dialogue =
    dialogueInput
      ? dialogueInput.value.trim()
      : "";


  scene.camera =
    cameraInput
      ? cameraInput.value
      : "Static";


  scene.animation =
    animationInput
      ? animationInput.value
      : "None";


  project.status =
    "Scene saved";


  renderScenes();

  updateProjectUI();

  saveProject();

  alert(
    "Scene " + (index + 1) +
    " saved successfully."
  );

}

/* =====================================================
   EDIT SCENE
===================================================== */

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
    "Scene " + (index + 1);


  scene.description =
    description.trim();


  project.status =
    "Scene updated";


  renderScenes();

  updateProjectUI();

  saveProject();

}


/* =====================================================
   RENUMBER
===================================================== */

function renumberScenes() {

  project.scenes.forEach(
    function(scene, index) {

      scene.number =
        index + 1;

    }
  );

}


/* =====================================================
   CHARACTERS
===================================================== */

function addCharacter() {

  if (!project.name) {

    alert(
      "Please create a project first."
    );

    openNewProject();

    return;

  }


  const name =
    prompt(
      "Character name:"
    );


  if (!name || !name.trim()) {

    return;

  }


  project.characters.push({

    id: Date.now(),

    name:
      name.trim(),

    description:
      "",

    emoji:
      "👤"

  });


  project.status =
    "Character added";


  renderCharacters();

  updateProjectUI();

  saveProject();

}


function renderCharacters() {

  const list =
    $("characterList");

  if (!list) return;


  if (
    project.characters.length === 0
  ) {

    list.innerHTML = `

      <div class="empty-state">

        <div>👤</div>

        <h3>No characters yet</h3>

        <p>
          Add your first character.
        </p>

      </div>

    `;

    return;

  }


  list.innerHTML = "";


  project.characters.forEach(
    function(character, index) {

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
              "No description yet."
            )
          }
        </p>


        <div class="button-row">

          <button
            class="secondary-btn"
            data-edit-character="${index}">
            ✏️ Edit
          </button>

          <button
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
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const index =
          Number(
            button.dataset
              .editCharacter
          );


        editCharacter(index);

      }
    );

  });


  list.querySelectorAll(
    "[data-delete-character]"
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const index =
          Number(
            button.dataset
              .deleteCharacter
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

  updateProjectUI();

  saveProject();

}


/* =====================================================
   CAPTIONS
===================================================== */

function addCaption() {

  const input =
    $("captionText");

  if (!input) return;


  const text =
    input.value.trim();


  if (!text) {

    alert(
      "Enter caption text first."
    );

    return;

  }


  project.captions.push({

    id: Date.now(),

    text: text

  });


  input.value = "";

  project.status =
    "Caption added";


  saveProject();

  alert(
    "Caption added."
  );

}


/* =====================================================
   SETTINGS
===================================================== */

function saveSettings() {

  if ($("projectName")) {

    const name =
      $("projectName")
        .value
        .trim();


    if (name) {

      project.name =
        name;

    }

  }


  if ($("videoResolution")) {

    project.resolution =
      $("videoResolution")
        .value;

  }


  project.status =
    "Settings saved";


  updateProjectUI();

  saveProject();

  alert(
    "Settings saved."
  );

}


/* =====================================================
   EXPORT PLACEHOLDER
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
  function() {

    loadProject();


    /* Sidebar */

    document.querySelectorAll(
      ".nav-item"
    ).forEach(function(button) {

      button.addEventListener(
        "click",
        function(event) {

          event.preventDefault();

          const page =
            button.dataset.page;

          if (page) {

            showPage(page);

          }

        }
      );

    });


    /* Dashboard buttons */

    document.querySelectorAll(
      ".dashboard-action"
    ).forEach(function(button) {

      button.addEventListener(
        "click",
        function(event) {

          event.preventDefault();

          const page =
            button.dataset.page;

          if (page) {

            showPage(page);

          }

        }
      );

    });


    /* New Project */

    if ($("newProjectBtn")) {

      $("newProjectBtn").onclick =
        openNewProject;

    }


    if ($("dashboardNewProject")) {

      $("dashboardNewProject").onclick =
        openNewProject;

    }


    /* Close modal */

    if ($("closeModalBtn")) {

      $("closeModalBtn").onclick =
        closeNewProject;

    }


    /* Create project */

    if ($("createProjectBtn")) {

      $("createProjectBtn").onclick =
        createProject;

    }


    /* Story */

    if ($("saveStoryBtn")) {

      $("saveStoryBtn").onclick =
        saveStory;

    }


    if ($("storyToScenesBtn")) {

      $("storyToScenesBtn").onclick =
        createScenes;

    }


    /* Scenes */

    if ($("addSceneBtn")) {

      $("addSceneBtn").onclick =
        addScene;

    }


    /* Characters */

    if ($("addCharacterBtn")) {

      $("addCharacterBtn").onclick =
        addCharacter;

    }
/* Backgrounds */

const addBackgroundBtn =
  $("addBackgroundBtn");

if (addBackgroundBtn) {

  addBackgroundBtn.addEventListener(
    "click",
    addBackground
  );

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

  const name =
    prompt(
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

    name:
      name.trim(),

    description:
      "",

    emoji:
      "🌄"

  });

  project.status =
    "Background added";

  renderBackgrounds();

  updateProjectUI();

  saveProject();

}


/* =====================================================
   RENDER BACKGROUNDS
===================================================== */

function renderBackgrounds() {

  const list =
    $("backgroundList");

  if (!list) return;

  if (!project.backgrounds) {
    project.backgrounds = [];
  }

  if (
    project.backgrounds.length === 0
  ) {

    list.innerHTML = `

      <div class="empty-state">

        <div>🌄</div>

        <h3>No backgrounds yet</h3>

        <p>
          Add your first background.
        </p>

      </div>

    `;

    return;
  }

  list.innerHTML = "";

  project.backgrounds.forEach(
    function(background, index) {

      const card =
        document.createElement("div");

      card.className =
        "character-card";

      card.innerHTML = `

        <div class="character-avatar">
          ${background.emoji || "🌄"}
        </div>

        <h3>
          ${escapeHTML(background.name)}
        </h3>

        <p>
          ${
            escapeHTML(
              background.description ||
              "No description yet."
            )
          }
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


  /* EDIT */

  list.querySelectorAll(
    "[data-edit-background]"
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        editBackground(
          Number(
            button.dataset.editBackground
          )
        );

      }
    );

  });


  /* DELETE */

  list.querySelectorAll(
    "[data-delete-background]"
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const index =
          Number(
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

  if (!project.backgrounds) return;

  const background =
    project.backgrounds[index];

  if (!background) return;

  const name =
    prompt(
      "Background name:",
      background.name
    );

  if (name === null) return;

  const description =
    prompt(
      "Background description:",
      background.description || ""
    );

  if (description === null) return;

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

    /* Captions */

    if ($("addCaptionBtn")) {

      $("addCaptionBtn").onclick =
        addCaption;

    }
     


    /* Settings */

    if ($("saveSettingsBtn")) {

      $("saveSettingsBtn").onclick =
        saveSettings;

    }


    /* Export */

    if ($("exportVideoBtn")) {

      $("exportVideoBtn").onclick =
        exportVideo;

    }


    /* Save button */

    if ($("saveProjectBtn")) {

      $("saveProjectBtn").onclick =
        saveProject;

    }


    /* Modal background */

    const modal =
      $("newProjectModal");


    if (modal) {

      modal.addEventListener(
        "click",
        function(event) {

          if (
            event.target === modal
          ) {

            closeNewProject();

          }

        }
      );

    }


    /* Keyboard save */

    document.addEventListener(
      "keydown",
      function(event) {

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

updateProjectUI();

renderScenes();

renderCharacters();

renderBackgrounds();

updateStoryUI();

showPage("dashboard");


    console.log(
      "AI Animated Studio ready."
    );

  }
);



