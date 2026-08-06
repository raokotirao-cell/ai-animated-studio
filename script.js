javascript
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
    function(scene, index) {

      const card =
        document.createElement("div");

      card.className =
        "scene-card";


      card.innerHTML = `

        <div>

          <h3>
            🎬 ${escapeHTML(scene.title)}
          </h3>

          <p>
            ${escapeHTML(scene.description)}
          </p>

          <p>
            ⏱️ ${scene.duration}s
          </p>

        </div>


        <div class="button-row">

          <button
            class="secondary-btn"
            data-edit-scene="${index}">
            ✏️ Edit
          </button>

          <button
            class="secondary-btn"
            data-delete-scene="${index}">
            🗑️ Delete
          </button>

        </div>

      `;


      list.appendChild(card);

    }
  );


  list.querySelectorAll(
    "[data-edit-scene]"
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        editScene(
          Number(
            button.dataset.editScene
          )
        );

      }
    );

  });


  list.querySelectorAll(
    "[data-delete-scene]"
  ).forEach(function(button) {

    button.addEventListener(
      "click",
      function() {

        const index =
          Number(
            button.dataset.deleteScene
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


        renderScenes();

        updateProjectUI();

        saveProject();

      }
    );

  });

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

    updateStoryUI();

    showPage("dashboard");


    console.log(
      "AI Animated Studio ready."
    );

  }
);



