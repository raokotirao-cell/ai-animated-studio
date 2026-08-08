"use strict";

/* =====================================================
   AI ANIMATED STUDIO
   CLEAN CORE SCRIPT
===================================================== */

console.log("AI Animated Studio script loaded.");

/* =====================================================
   PROJECT DATA
===================================================== */
let currentAnimationSceneIndex = 0;

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
   CHARACTER SYSTEM
===================================================== */

const addCharacterBtn =
    document.getElementById("addCharacterBtn");

const characterList =
    document.getElementById("characterList");

if (addCharacterBtn) {

    addCharacterBtn.addEventListener(
        "click",
        function () {

            const name =
                prompt("Enter character name:");

            if (!name) return;

            const character = {
                id: "char_" + Date.now(),
                name: name,
                type: "3D Cartoon",
                animation: "Idle",
                startPosition: "Left",
                endPosition: "Center",
                speed: 1
            };

            project.characters.push(character);

            renderCharacters();

        }
    );
}

function renderCharacters() {

    if (!characterList) return;

    characterList.innerHTML = "";

    if (!project.characters.length) {

        characterList.innerHTML = `
            <div class="empty-state">
                <div>👤</div>
                <h3>No characters yet</h3>
                <p>Add your first character.</p>
            </div>
        `;

        return;
    }

    project.characters.forEach(function(character) {

        const card =
            document.createElement("div");

        card.className = "character-card";

        card.innerHTML = `
            <div style="font-size:60px;">
                🧑‍🎨
            </div>

            <h3>${character.name}</h3>

            <p>🎭 ${character.type}</p>

            <p>✨ ${character.animation}</p>

            <p>
                ${character.startPosition}
                → 
                ${character.endPosition}
            </p>
        `;

        characterList.appendChild(card);

    });
}

/* =====================================================
   HELPER
===================================================== */

function $(id) {
    return document.getElementById(id);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
   if (pageId === "captions") {
    refreshCaptionScenes();
}

    document.querySelectorAll(".nav-item").forEach(function (button) {
        if (button.dataset.page === pageId) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
   
if (page === "captions") {

    refreshCaptionScenes();

    renderCaptions();

}
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
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
        scenes.textContent = Array.isArray(project.scenes)
            ? project.scenes.length
            : 0;
    }

    if (characters) {
        characters.textContent = Array.isArray(project.characters)
            ? project.characters.length
            : 0;
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

        // Update status BEFORE saving
        if (project.status === "Ready") {
            project.status = "Saved";
        }

        // Make sure captions exist
        if (!Array.isArray(project.captions)) {
            project.captions = [];
        }

        // Save complete project
        localStorage.setItem(
            "aiAnimatedStudioProject",
            JSON.stringify(project)
        );

        updateProjectUI();

        console.log("Project saved successfully.");

    } catch (error) {

        console.error("Save error:", error);

        alert("Unable to save project.");
    }
}
/* =====================================================
   SAVE PROJECT BUTTON
===================================================== */

const saveProjectBtn = $("saveProjectBtn");

if (saveProjectBtn) {

    saveProjectBtn.addEventListener(
        "click",
        function () {

            saveProject();

            const status =
                $("saveProjectStatus");

            if (status) {
                status.textContent =
                    "Project saved successfully.";
            }

        }
    );
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

        console.log("Project loaded successfully.");
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
    renderBackgrounds();
    renderCaptions();

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

    if (parts.length === 0) {
        alert("Unable to create scenes.");
        return;
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

    if (!Array.isArray(project.scenes)) {
        project.scenes = [];
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

        const characters = Array.isArray(scene.characters)
            ? scene.characters.join(", ")
            : scene.characters || "";

        card.innerHTML = `
            <div class="scene-card-header">
                <div>
                    <h3>🎬 Scene ${index + 1}</h3>
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
                        placeholder="Describe what happens in this scene..."
                    >${escapeHTML(scene.description || "")}</textarea>
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
                        value="${escapeHTML(characters)}"
                        placeholder="Character names">
                </div>

                <div class="scene-field scene-full">
                    <label>💬 Dialogue</label>

                    <textarea
                        rows="3"
                        data-scene-dialogue="${index}"
                        placeholder="Character dialogue..."
                    >${escapeHTML(scene.dialogue || "")}</textarea>
                </div>

                <div class="scene-field">
                    <label>📷 Camera</label>

                    <select data-scene-camera="${index}">
                        <option value="Static" ${scene.camera === "Static" ? "selected" : ""}>
                            Static
                        </option>

                        <option value="Zoom In" ${scene.camera === "Zoom In" ? "selected" : ""}>
                            Zoom In
                        </option>

                        <option value="Zoom Out" ${scene.camera === "Zoom Out" ? "selected" : ""}>
                            Zoom Out
                        </option>

                        <option value="Pan Left" ${scene.camera === "Pan Left" ? "selected" : ""}>
                            Pan Left
                        </option>

                        <option value="Pan Right" ${scene.camera === "Pan Right" ? "selected" : ""}>
                            Pan Right
                        </option>

                        <option value="Close Up" ${scene.camera === "Close Up" ? "selected" : ""}>
                            Close Up
                        </option>
                    </select>
                </div>

                <div class="scene-field">
                    <label>✨ Animation</label>

                    <select data-scene-animation="${index}">
                        <option value="None" ${scene.animation === "None" ? "selected" : ""}>
                            None
                        </option>

                        <option value="Idle" ${scene.animation === "Idle" ? "selected" : ""}>
                            Idle
                        </option>

                        <option value="Walk" ${scene.animation === "Walk" ? "selected" : ""}>
                            Walk
                        </option>

                        <option value="Run" ${scene.animation === "Run" ? "selected" : ""}>
                            Run
                        </option>

                        <option value="Talk" ${scene.animation === "Talk" ? "selected" : ""}>
                            Talk
                        </option>

                        <option value="Action" ${scene.animation === "Action" ? "selected" : ""}>
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

    const name = prompt("Character name:");

    if (!name || !name.trim()) {
        return;
    }

    if (!Array.isArray(project.characters)) {
        project.characters = [];
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

    if (!Array.isArray(project.characters)) {
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
                    ${escapeHTML(character.emoji || "👤")}
                </div>

                <h3>
                    ${escapeHTML(character.name || "Unnamed Character")}
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

                if (!confirm("Delete this character?")) {
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
        character.name || ""
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
        character.name ||
        "Unnamed Character";

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

    if (!Array.isArray(project.captions)) {
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

    if (!Array.isArray(project.captions)) {
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
                    ${escapeHTML(caption.text || "")}
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

                if (!confirm("Delete this caption?")) {
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
    if (!Array.isArray(project.captions)) {
        return;
    }

    const caption =
        project.captions[index];

    if (!caption) {
        return;
    }

    const text = prompt(
        "Caption text:",
        caption.text || ""
    );

    if (text === null) {
        return;
    }

    if (!text.trim()) {
        alert("Caption cannot be empty.");
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
        alert("Please create a project first.");
        openNewProject();
        return;
    }

    const name = prompt(
        "Background name:"
    );

    if (!name || !name.trim()) {
        return;
    }

    if (!Array.isArray(project.backgrounds)) {
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
}

/* =====================================================
   RENDER BACKGROUNDS
===================================================== */

function renderBackgrounds() {
    const list = $("backgroundList");

    if (!list) {
        return;
    }

    if (!Array.isArray(project.backgrounds)) {
        project.backgrounds = [];
    }

    if (project.backgrounds.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div>🌄</div>
                <h3>No backgrounds yet</h3>
                <p>Add your first background.</p>
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
                        background.name ||
                        "Untitled Background"
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
    if (!Array.isArray(project.backgrounds)) {
        return;
    }

    const background =
        project.backgrounds[index];

    if (!background) {
        return;
    }

    const name =
        prompt(
            "Background name:",
            background.name || ""
        );

    if (name === null) {
        return;
    }

    const description =
        prompt(
            "Background description:",
            background.description || ""
        );

    if (description === null) {
        return;
    }

    background.name =
        name.trim() ||
        background.name ||
        "Untitled Background";

    background.description =
        description.trim();

    project.status =
        "Background updated";

    renderBackgrounds();
    updateProjectUI();
    saveProject();
}

/* =====================================================
SCENE EDITOR
===================================================== */

function refreshSceneEditor() {
    const sceneSelect = $("editorSceneSelect");
    const backgroundSelect = $("editorBackgroundSelect");
    const characterSelect = $("editorCharacterSelect");

    if (!sceneSelect) return;

    /* =========================
       SCENES
    ========================= */

    sceneSelect.innerHTML = `
        <option value="">Select a scene</option>
    `;

    if (Array.isArray(project.scenes)) {
        project.scenes.forEach(function (scene, index) {
            const option = document.createElement("option");

            option.value = index;
            option.textContent =
                "Scene " +
                (index + 1) +
                " - " +
                (scene.title || "Untitled");

            sceneSelect.appendChild(option);
        });
    }

    /* =========================
       BACKGROUNDS
    ========================= */

    if (backgroundSelect) {

        backgroundSelect.innerHTML = `
            <option value="">Select background</option>
        `;

        if (Array.isArray(project.backgrounds)) {

            project.backgrounds.forEach(function (background, index) {

                const option =
                    document.createElement("option");

                option.value = index;

                option.textContent =
                    background.name ||
                    "Background " + (index + 1);

                backgroundSelect.appendChild(option);
            });
        }
    }

    /* =========================
       CHARACTERS
    ========================= */

    if (characterSelect) {

        characterSelect.innerHTML = `
            <option value="">Select character</option>
        `;

        if (Array.isArray(project.characters)) {

            project.characters.forEach(function (character, index) {

                const option =
                    document.createElement("option");

                option.value = index;

                option.textContent =
                    character.name ||
                    "Character " + (index + 1);

                characterSelect.appendChild(option);
            });
        }
    }
}


/* =====================================================
LOAD SELECTED SCENE
===================================================== */

function loadSceneIntoEditor(index) {

    const scene =
        project.scenes[index];

    if (!scene) {
        return;
    }

    if ($("editorBackgroundSelect")) {

        $("editorBackgroundSelect").value =
            findBackgroundIndex(scene.background);
    }

    if ($("editorCharacterSelect")) {

        const characterName =
            Array.isArray(scene.characters)
                ? scene.characters[0] || ""
                : scene.characters || "";

        $("editorCharacterSelect").value =
            findCharacterIndex(characterName);
    }

    if ($("editorCameraSelect")) {

        $("editorCameraSelect").value =
            scene.camera || "Static";
    }

    if ($("editorAnimationSelect")) {

        $("editorAnimationSelect").value =
            scene.animation || "None";
    }

    if ($("editorSceneDescription")) {

        $("editorSceneDescription").value =
            scene.description || "";
    }

    if ($("editorSceneDialogue")) {

        $("editorSceneDialogue").value =
            scene.dialogue || "";
    }

    if ($("editorSceneDuration")) {

        $("editorSceneDuration").value =
            scene.duration || 5;
    }

    setSceneEditorStatus(
        "Scene loaded."
    );
}


/* =====================================================
FIND BACKGROUND
===================================================== */

function findBackgroundIndex(name) {

    if (!name) {
        return "";
    }

    if (!Array.isArray(project.backgrounds)) {
        return "";
    }

    const index =
        project.backgrounds.findIndex(
            function (background) {
                return background.name === name;
            }
        );

    return index >= 0
        ? String(index)
        : "";
}


/* =====================================================
FIND CHARACTER
===================================================== */

function findCharacterIndex(name) {

    if (!name) {
        return "";
    }

    if (!Array.isArray(project.characters)) {
        return "";
    }

    const index =
        project.characters.findIndex(
            function (character) {
                return character.name === name;
            }
        );

    return index >= 0
        ? String(index)
        : "";
}


/* =====================================================
SAVE SCENE EDITOR
===================================================== */

function saveEditorScene() {

    const sceneSelect =
        $("editorSceneSelect");

    if (!sceneSelect) {
        return;
    }

    const index =
        Number(sceneSelect.value);

    if (
        sceneSelect.value === "" ||
        !project.scenes[index]
    ) {

        setSceneEditorStatus(
            "Please select a scene first."
        );

        return;
    }

    const scene =
        project.scenes[index];


    /* =========================
       BACKGROUND
    ========================= */

    const backgroundIndex =
        $("editorBackgroundSelect")
            ? $("editorBackgroundSelect").value
            : "";

    if (
        backgroundIndex !== "" &&
        project.backgrounds[backgroundIndex]
    ) {

        scene.background =
            project.backgrounds[
                backgroundIndex
            ].name;

    } else {

        scene.background = "";
    }


    /* =========================
       CHARACTER
    ========================= */

    const characterIndex =
        $("editorCharacterSelect")
            ? $("editorCharacterSelect").value
            : "";

    if (
        characterIndex !== "" &&
        project.characters[characterIndex]
    ) {

        scene.characters = [
            project.characters[
                characterIndex
            ].name
        ];

    } else {

        scene.characters = [];
    }


    /* =========================
       CAMERA
    ========================= */

    if ($("editorCameraSelect")) {

        scene.camera =
            $("editorCameraSelect").value;
    }


    /* =========================
       ANIMATION
    ========================= */

    if ($("editorAnimationSelect")) {

        scene.animation =
            $("editorAnimationSelect").value;
    }


    /* =========================
       DESCRIPTION
    ========================= */

    if ($("editorSceneDescription")) {

        scene.description =
            $("editorSceneDescription")
                .value
                .trim();
    }


    /* =========================
       DIALOGUE
    ========================= */

    if ($("editorSceneDialogue")) {

        scene.dialogue =
            $("editorSceneDialogue")
                .value
                .trim();
    }


    /* =========================
       DURATION
    ========================= */

    if ($("editorSceneDuration")) {

        scene.duration =
            Math.max(
                1,
                Number(
                    $("editorSceneDuration").value
                ) || 5
            );
    }


    project.status =
        "Scene Editor saved";

    saveProject();

    renderScenes();

    updateProjectUI();

    setSceneEditorStatus(
        "✅ Scene saved successfully."
    );
}


/* =====================================================
SCENE EDITOR STATUS
===================================================== */

function setSceneEditorStatus(message) {

    const status =
        $("sceneEditorStatus");

    if (status) {
        status.textContent =
            message;
    }
}


/* =====================================================
INITIALIZE SCENE EDITOR
===================================================== */

function initSceneEditor() {

    const sceneSelect =
        $("editorSceneSelect");

    const saveButton =
        $("saveEditorSceneBtn");

    const refreshButton =
        $("refreshEditorBtn");


    /* =========================
       REFRESH
    ========================= */

    if (refreshButton) {

        refreshButton.onclick =
            function () {

                refreshSceneEditor();

                setSceneEditorStatus(
                    "🔄 Editor refreshed."
                );
            };
    }


    /* =========================
       SELECT SCENE
    ========================= */

    if (sceneSelect) {

        sceneSelect.addEventListener(
            "change",
            function () {

                if (
                    sceneSelect.value === ""
                ) {

                    setSceneEditorStatus(
                        "Please select a scene."
                    );

                    return;
                }

                loadSceneIntoEditor(
                    Number(
                        sceneSelect.value
                    )
                );
            }
        );
    }


    /* =========================
       SAVE
    ========================= */

    if (saveButton) {

        saveButton.onclick =
            saveEditorScene;
    }


    /* =========================
       INITIAL LOAD
    ========================= */

    refreshSceneEditor();
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
VOICE / NARRATION
===================================================== */

let voiceRecorder = null;
let voiceChunks = [];
let recordedVoiceUrl = "";


/* =====================================================
GENERATE VOICE
Browser Text-to-Speech
===================================================== */

function generateVoice() {

    if (!project.name) {
        alert("Please create a project first.");
        openNewProject();
        return;
    }

    const input = $("voiceText");

    if (!input) {
        alert("Voice text input not found.");
        return;
    }

    const text = input.value.trim();

    if (!text) {
        alert("Enter narration text first.");
        return;
    }

    if (!("speechSynthesis" in window)) {
        alert(
            "Your browser does not support voice generation."
        );
        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = function () {

        project.status =
            "Voice playing";

        updateProjectUI();
    };

    speech.onend = function () {

        project.status =
            "Voice completed";

        updateProjectUI();
    };

    speech.onerror = function () {

        project.status =
            "Voice error";

        updateProjectUI();

        alert(
            "Voice generation failed."
        );
    };

    window.speechSynthesis.speak(
        speech
    );
}


/* =====================================================
RECORD VOICE
===================================================== */

async function recordVoice() {

    if (!project.name) {
        alert("Please create a project first.");
        openNewProject();
        return;
    }

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {
        alert(
            "Voice recording is not supported by this browser."
        );
        return;
    }

    /* =========================
       STOP CURRENT RECORDING
    ========================= */

    if (
        voiceRecorder &&
        voiceRecorder.state === "recording"
    ) {

        voiceRecorder.stop();

        return;
    }


    /* =========================
       MICROPHONE
    ========================= */

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

        voiceChunks = [];

        voiceRecorder =
            new MediaRecorder(stream);


        voiceRecorder.ondataavailable =
            function (event) {

                if (event.data.size > 0) {
                    voiceChunks.push(
                        event.data
                    );
                }
            };


        voiceRecorder.onstop =
            function () {

                const blob =
                    new Blob(
                        voiceChunks,
                        {
                            type:
                                voiceRecorder.mimeType ||
                                "audio/webm"
                        }
                    );

                if (recordedVoiceUrl) {
                    URL.revokeObjectURL(
                        recordedVoiceUrl
                    );
                }

                recordedVoiceUrl =
                    URL.createObjectURL(blob);


                /* =========================
                   AUDIO PREVIEW
                ========================= */

                let audio =
                    $("recordedVoicePreview");

                if (!audio) {

                    audio =
                        document.createElement(
                            "audio"
                        );

                    audio.id =
                        "recordedVoicePreview";

                    audio.controls = true;

                    audio.style.width =
                        "100%";

                    const voiceModule =
                        $("voice");

                    if (voiceModule) {
                        voiceModule
                            .querySelector(
                                ".module-card"
                            )
                            ?.appendChild(audio);
                    }
                }

                audio.src =
                    recordedVoiceUrl;


                /* =========================
                   DOWNLOAD
                ========================= */

                let download =
                    $("downloadRecordedVoice");

                if (!download) {

                    download =
                        document.createElement(
                            "a"
                        );

                    download.id =
                        "downloadRecordedVoice";

                    download.className =
                        "secondary-btn";

                    download.textContent =
                        "⬇️ Download Voice";

                    download.style.display =
                        "inline-block";

                    download.style.marginTop =
                        "12px";

                    const voiceModule =
                        $("voice");

                    if (voiceModule) {
                        voiceModule
                            .querySelector(
                                ".module-card"
                            )
                            ?.appendChild(download);
                    }
                }

                download.href =
                    recordedVoiceUrl;

                download.download =
                    "recorded-voice.webm";


                project.status =
                    "Voice recorded";

                updateProjectUI();

                stream
                    .getTracks()
                    .forEach(
                        function (track) {
                            track.stop();
                        }
                    );

                alert(
                    "Voice recording completed."
                );
            };


        voiceRecorder.onstart =
            function () {

                project.status =
                    "Recording voice";

                updateProjectUI();

                const button =
                    $("recordVoiceBtn");

                if (button) {

                    button.textContent =
                        "⏹️ Stop Recording";
                }
            };


        voiceRecorder.start();

    } catch (error) {

        console.error(
            "Voice recording error:",
            error
        );

        alert(
            "Microphone permission was denied or recording failed."
        );
    }
}
/* =====================================================
MUSIC & SOUND EFFECTS
===================================================== */

let musicObjectUrl = "";
let sfxObjectUrl = "";


/* =====================================================
MUSIC FILE
===================================================== */

function loadMusicFile() {

    const input = $("musicFile");
    const audio = $("musicAudio");

    if (!input || !audio) {
        return;
    }

    const file = input.files[0];

    if (!file) {
        setMusicStatus(
            "Please select a music file."
        );
        return;
    }

    if (musicObjectUrl) {
        URL.revokeObjectURL(
            musicObjectUrl
        );
    }

    musicObjectUrl =
        URL.createObjectURL(file);

    audio.src =
        musicObjectUrl;

    audio.volume =
        Number(
            $("musicVolume")
                ? $("musicVolume").value
                : 0.5
        );

    project.status =
        "Music loaded";

    updateProjectUI();

    setMusicStatus(
        "🎵 Music loaded: " +
        file.name
    );
}


/* =====================================================
PLAY MUSIC
===================================================== */

function playMusic() {

    const audio =
        $("musicAudio");

    if (!audio || !audio.src) {

        alert(
            "Please select a music file first."
        );

        return;
    }

    audio.play()
        .then(function () {

            project.status =
                "Music playing";

            updateProjectUI();

            setMusicStatus(
                "▶️ Music playing."
            );

        })
        .catch(function (error) {

            console.error(
                "Music play error:",
                error
            );

            setMusicStatus(
                "Unable to play music."
            );
        });
}


/* =====================================================
STOP MUSIC
===================================================== */

function stopMusic() {

    const audio =
        $("musicAudio");

    if (!audio) {
        return;
    }

    audio.pause();

    audio.currentTime = 0;

    project.status =
        "Music stopped";

    updateProjectUI();

    setMusicStatus(
        "⏹️ Music stopped."
    );
}


/* =====================================================
MUSIC VOLUME
===================================================== */

function updateMusicVolume() {

    const volume =
        $("musicVolume");

    const audio =
        $("musicAudio");

    if (!volume) {
        return;
    }

    const value =
        Number(volume.value);

    if (audio) {
        audio.volume =
            value;
    }

    const display =
        $("musicVolumeValue");

    if (display) {

        display.textContent =
            Math.round(value * 100) +
            "%";
    }
}


/* =====================================================
SFX FILE
===================================================== */

function loadSfxFile() {

    const input =
        $("sfxFile");

    const audio =
        $("sfxAudio");

    if (!input || !audio) {
        return;
    }

    const file =
        input.files[0];

    if (!file) {

        setSfxStatus(
            "Please select a sound effect."
        );

        return;
    }

    if (sfxObjectUrl) {

        URL.revokeObjectURL(
            sfxObjectUrl
        );
    }

    sfxObjectUrl =
        URL.createObjectURL(file);

    audio.src =
        sfxObjectUrl;

    project.status =
        "Sound effect loaded";

    updateProjectUI();

    setSfxStatus(
        "🔊 SFX loaded: " +
        file.name
    );
}


/* =====================================================
PLAY SFX
===================================================== */

function playSfx() {

    const audio =
        $("sfxAudio");

    if (!audio || !audio.src) {

        alert(
            "Please select a sound effect first."
        );

        return;
    }

    audio.currentTime = 0;

    audio.play()
        .then(function () {

            project.status =
                "SFX playing";

            updateProjectUI();

            setSfxStatus(
                "▶️ Sound effect playing."
            );

        })
        .catch(function (error) {

            console.error(
                "SFX play error:",
                error
            );

            setSfxStatus(
                "Unable to play SFX."
            );
        });
}


/* =====================================================
STOP SFX
===================================================== */

function stopSfx() {

    const audio =
        $("sfxAudio");

    if (!audio) {
        return;
    }

    audio.pause();

    audio.currentTime = 0;

    project.status =
        "SFX stopped";

    updateProjectUI();

    setSfxStatus(
        "⏹️ Sound effect stopped."
    );
}


/* =====================================================
MUSIC STATUS
===================================================== */

function setMusicStatus(message) {

    const status =
        $("musicStatus");

    if (status) {
        status.textContent =
            message;
    }
}


/* =====================================================
SFX STATUS
===================================================== */

function setSfxStatus(message) {

    const status =
        $("sfxStatus");

    if (status) {
        status.textContent =
            message;
    }
}


/* =====================================================
INITIALIZE MUSIC
===================================================== */

function initMusicModule() {

    if ($("musicFile")) {

        $("musicFile").addEventListener(
            "change",
            loadMusicFile
        );
    }

    if ($("playMusicBtn")) {

        $("playMusicBtn").onclick =
            playMusic;
    }

    if ($("stopMusicBtn")) {

        $("stopMusicBtn").onclick =
            stopMusic;
    }

    if ($("musicVolume")) {

        $("musicVolume").addEventListener(
            "input",
            updateMusicVolume
        );
    }

    if ($("sfxFile")) {

        $("sfxFile").addEventListener(
            "change",
            loadSfxFile
        );
    }

    if ($("playSfxBtn")) {

        $("playSfxBtn").onclick =
            playSfx;
    }

    if ($("stopSfxBtn")) {

        $("stopSfxBtn").onclick =
            stopSfx;
    }

    updateMusicVolume();
}

/* =====================================================
   EXPORT
===================================================== */

function exportVideo() {

    const status =
        $("exportStatus");

    const scenes =
        Array.isArray(project.scenes)
            ? project.scenes
            : [];

    if (scenes.length === 0) {

        if (status) {
            status.textContent =
                "❌ Please create at least one scene.";
        }

        return;
    }

    const canvas =
        $("animationPreviewCanvas");

    if (!canvas) {

        if (status) {
            status.textContent =
                "❌ Preview canvas not found.";
        }

        return;
    }

    if (!window.MediaRecorder) {

        if (status) {
            status.textContent =
                "❌ Your browser does not support video export.";
        }

        return;
    }

    project.status =
        "Exporting video...";

    updateProjectUI();

    if (status) {
        status.textContent =
            "🎬 Preparing video export...";
    }


    /* =========================================
       TOTAL DURATION
    ========================================= */

    let totalDuration = 0;

    scenes.forEach(function (scene) {

        totalDuration +=
            Number(scene.duration) > 0
                ? Number(scene.duration)
                : 5;

    });


    /* =========================================
       CANVAS STREAM
    ========================================= */

    const canvasStream =
        canvas.captureStream(30);


    /* =========================================
       RECORDER MIME TYPE
    ========================================= */

    let mimeType = "";

    const mimeTypes = [

        "video/webm;codecs=vp9",

        "video/webm;codecs=vp8",

        "video/webm"

    ];

    for (
        let i = 0;
        i < mimeTypes.length;
        i++
    ) {

        if (
            MediaRecorder.isTypeSupported(
                mimeTypes[i]
            )
        ) {

            mimeType =
                mimeTypes[i];

            break;
        }
    }


    if (!mimeType) {

        if (status) {
            status.textContent =
                "❌ WebM export is not supported.";
        }

        return;
    }


    /* =========================================
       RECORDER
    ========================================= */

    const chunks = [];

    let recorder;

    try {

        recorder =
            new MediaRecorder(
                canvasStream,
                {
                    mimeType:
                        mimeType
                }
            );

    } catch (error) {

        console.error(
            "Recorder error:",
            error
        );

        if (status) {
            status.textContent =
                "❌ Unable to start video export.";
        }

        return;
    }


    recorder.ondataavailable =
        function (event) {

            if (
                event.data &&
                event.data.size > 0
            ) {

                chunks.push(
                    event.data
                );
            }
        };


    recorder.onstop =
        function () {

            const blob =
                new Blob(
                    chunks,
                    {
                        type:
                            mimeType
                    }
                );

            const url =
                URL.createObjectURL(blob);


            const download =
                document.createElement("a");

            download.href =
                url;

            download.download =
                (
                    project.name ||
                    "AI-Animated-Project"
                )
                .replace(
                    /[^a-z0-9-_]/gi,
                    "_"
                ) +
                ".webm";

            download.textContent =
                "⬇️ Download Video";

            download.className =
                "primary-btn";

            const exportModule =
                $("export");

            if (exportModule) {

                const card =
                    exportModule.querySelector(
                        ".module-card"
                    );

                if (card) {

                    card.appendChild(
                        download
                    );
                }
            }


            project.status =
                "Video exported";

            updateProjectUI();

            if (status) {

                status.textContent =
                    "✅ Video exported successfully.";
            }

            download.click();

            setTimeout(
                function () {
                    URL.revokeObjectURL(url);
                },
                60000
            );
        };


    recorder.onerror =
        function (event) {

            console.error(
                "Export error:",
                event
            );

            project.status =
                "Export failed";

            updateProjectUI();

            if (status) {
                status.textContent =
                    "❌ Video export failed.";
            }
        };


    /* =========================================
       START RECORDING
    ========================================= */

    previewIsPlaying =
        false;

    previewPausedTime =
        0;


    recorder.start();


    if (status) {
        status.textContent =
            "🔴 Recording animation...";
    }


    /* =========================================
       PLAY PREVIEW INTO RECORDER
    ========================================= */

    let startTime =
        performance.now();


    function renderExportFrame(
        timestamp
    ) {

        const elapsed =
            (
                timestamp -
                startTime
            ) / 1000;


        /* -------------------------------------
           DRAW CURRENT SCENE
        ------------------------------------- */

        let accumulated =
            0;

        let sceneToDraw =
            scenes[scenes.length - 1];

        let sceneTime = 0;

        for (
            let i = 0;
            i < scenes.length;
            i++
        ) {

            const sceneDuration =
                Number(
                    scenes[i].duration
                ) > 0
                    ? Number(
                        scenes[i].duration
                    )
                    : 5;

            if (
                elapsed <
                accumulated +
                sceneDuration
            ) {

                sceneToDraw =
                    scenes[i];

                sceneTime =
                    elapsed -
                    accumulated;

                break;
            }

            accumulated +=
                sceneDuration;
        }


        /* -------------------------------------
           TEMPORARY SCENE DRAW
        ------------------------------------- */

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#111";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#fff";

        ctx.textAlign =
            "center";

        ctx.font =
            "bold 48px Arial";

        ctx.fillText(
            sceneToDraw.title ||
                "Scene",
            canvas.width / 2,
            100
        );

        ctx.font =
            "26px Arial";

        ctx.fillStyle =
            "#ddd";

        ctx.fillText(
            String(
                sceneToDraw.description ||
                ""
            ).substring(0, 100),
            canvas.width / 2,
            155
        );


        /* -------------------------------------
           CHARACTER
        ------------------------------------- */

        const characters =
            Array.isArray(
                sceneToDraw.characters
            )
                ? sceneToDraw.characters
                : [];

        if (characters.length > 0) {

            const name =
                String(
                    characters[0] || ""
                );

            let character = null;

            if (
                Array.isArray(
                    project.characters
                )
            ) {

                character =
                    project.characters.find(
                        function (char) {

                            return String(
                                char.name || ""
                            )
                            .trim()
                            .toLowerCase() ===
                            name
                            .trim()
                            .toLowerCase();

                        }
                    );
            }

            ctx.font =
                "90px Arial";

            ctx.fillText(
                character &&
                character.emoji
                    ? character.emoji
                    : "👤",
                canvas.width / 2,
                canvas.height - 260
            );

            ctx.font =
                "bold 32px Arial";

            ctx.fillText(
                character &&
                character.name
                    ? character.name
                    : name,
                canvas.width / 2,
                canvas.height - 205
            );
        }


        /* -------------------------------------
           STOP
        ------------------------------------- */

        if (
            elapsed >=
            totalDuration
        ) {

            recorder.stop();

            return;
        }


        requestAnimationFrame(
            renderExportFrame
        );
    }


    requestAnimationFrame(
        renderExportFrame
    );
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
updateStoryUI();
renderScenes();
renderCharacters();
renderCaptions();
renderBackgrounds();

initSceneEditor();
initMusicModule();
showPage("dashboard");

        console.log(
            "AI Animated Studio ready."
        );
    }
);
/* =====================================================
   SCENE EDITOR - AUTO REFRESH WHEN PAGE OPENS
===================================================== */

function openSceneEditor() {

    refreshSceneEditor();

    const sceneSelect = $("editorSceneSelect");

    if (
        sceneSelect &&
        sceneSelect.value === "" &&
        project.scenes.length > 0
    ) {
        sceneSelect.value = "0";

        loadSceneIntoEditor(0);
    }
}


/* =====================================================
   NAVIGATION HOOK
===================================================== */

const originalShowPage = showPage;

showPage = function (pageId) {

    originalShowPage(pageId);

    if (pageId === "editor") {
        openSceneEditor();
    }

    if (pageId === "preview") {
        updateAnimationPreview();
    }
};
/* =====================================================
   ANIMATION PREVIEW ENGINE
===================================================== */

let previewAnimationFrame = null;
let previewStartTimestamp = null;
let previewPausedTime = 0;
let previewIsPlaying = false;


/* =====================================================
   UPDATE PREVIEW
===================================================== */

function updateAnimationPreview() {

    const canvas =
        $("animationPreviewCanvas");

    const playBtn =
        $("previewPlayBtn");

    const pauseBtn =
        $("previewPauseBtn");

    const restartBtn =
        $("previewRestartBtn");

    const volume =
        $("previewVolume");

    const currentTimeEl =
        $("previewCurrentTime");

    const timeline =
        $("previewTimeline");

    const durationEl =
        $("previewDuration");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    /* ---------------------------------------------
       GET SCENES
    --------------------------------------------- */

    const scenes =
        Array.isArray(project.scenes)
            ? project.scenes
            : [];


    if (scenes.length === 0) {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "#111";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "#fff";

        ctx.textAlign = "center";

        ctx.font = "42px Arial";

        ctx.fillText(
            "No Scenes",
            canvas.width / 2,
            canvas.height / 2
        );

        if (durationEl) {
            durationEl.textContent = "0.0s";
        }

        if (currentTimeEl) {
            currentTimeEl.textContent = "0.0s";
        }

        return;
    }


    /* ---------------------------------------------
       FIRST SCENE
    --------------------------------------------- */

    const scene =
        scenes[0];


    const duration =
        Number(scene.duration) > 0
            ? Number(scene.duration)
            : 5;


    if (durationEl) {
        durationEl.textContent =
            duration.toFixed(1) + "s";
    }


    if (timeline) {

        timeline.max =
            duration;

        timeline.value =
            Math.min(
                previewPausedTime,
                duration
            );
       }
           

/* ---------------------------------------------
   DRAW FRAME
--------------------------------------------- */
    

    function drawPreviewFrame(time) {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
const progress =
    duration > 0
        ? Math.min(time / duration, 1)
        : 0;
       
       let zoom = 1;

if (scene.camera === "Zoom In") {

    zoom = 1 + (progress * 0.20);

} else if (scene.camera === "Zoom Out") {

    zoom = 1.20 - (progress * 0.20);
}

 ctx.save();

ctx.translate(
    canvas.width / 2,
    canvas.height / 2
);

ctx.scale(zoom, zoom);

ctx.translate(
    -canvas.width / 2,
    -canvas.height / 2
);      
/* -----------------------------------------
   SCENE BACKGROUND
----------------------------------------- */

const backgroundName =
    String(scene.background || "").trim();

let background = null;

if (
    backgroundName &&
    Array.isArray(project.backgrounds)
) {

    background =
        project.backgrounds.find(
            function(bg) {

                return String(bg.name || "")
                    .trim()
                    .toLowerCase() ===
                    backgroundName.toLowerCase();

            }
        );
}


if (background) {

    ctx.fillStyle = "#284d32";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "#fff";

    ctx.font = "90px Arial";

    ctx.fillText(
        background.emoji || "🌄",
        canvas.width / 2,
        240
    );

    ctx.font = "bold 36px Arial";

    ctx.fillText(
        background.name || "Background",
        canvas.width / 2,
        300
    );

} else {

    ctx.fillStyle = "#111";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
}


/* -----------------------------------------
   SCENE CHARACTERS
----------------------------------------- */

const sceneCharacters =
    Array.isArray(scene.characters)
        ? scene.characters
        : [];

sceneCharacters.forEach(
    function(characterName) {

        const name =
            String(characterName || "")
                .trim();

        if (!name) {
            return;
        }

        let character = null;

        if (
            Array.isArray(project.characters)
        ) {

            character =
                project.characters.find(
                    function(char) {

                        return String(
                            char.name || ""
                        )
                        .trim()
                        .toLowerCase() ===
                        name.toLowerCase();

                    }
                );
        }

        const x =
    canvas.width / 2;

let y =
    canvas.height - 260;


/* -----------------------------------------
   CHARACTER ANIMATION
----------------------------------------- */

if (scene.animation === "Idle") {

    y +=
        Math.sin(time * 2) * 8;
}

        ctx.textAlign = "center";

        ctx.font = "90px Arial";

        ctx.fillText(
            character &&
            character.emoji
                ? character.emoji
                : "👤",
            x,
            y
        );

        ctx.fillStyle = "#fff";

        ctx.font =
            "bold 32px Arial";

        ctx.fillText(
            character &&
            character.name
                ? character.name
                : name,
            x,
            y + 55
        );
    }
);
ctx.restore();

        /* Scene title */

        ctx.fillStyle = "#fff";

        ctx.textAlign = "center";

        ctx.font =
            "bold 48px Arial";

        ctx.fillText(
            scene.title ||
            "Scene 1",
            canvas.width / 2,
            100
        );


        /* Scene description */

        if (scene.description) {

            ctx.font =
                "26px Arial";

            ctx.fillStyle =
                "#ddd";

            const description =
                String(
                    scene.description
                );

            ctx.fillText(
                description.substring(
                    0,
                    100
                ),
                canvas.width / 2,
                155
            );
        }


        /* -----------------------------------------
           CAPTION
        ----------------------------------------- */

        const captions =
            Array.isArray(project.captions)
                ? project.captions
                : [];


        captions.forEach(
            function(caption) {

                const captionScene =
                    Number(
                        caption.sceneIndex
                    );


                /*
                   Current Preview = Scene 1
                   Therefore sceneIndex = 0
                */

                if (
    captionScene !== currentAnimationSceneIndex
) {
    return;
}


                const start =
                    Number(caption.start) || 0;

                const end =
                    Number(caption.end) || 0;


                if (
                    time >= start &&
                    time <= end
                ) {

                    /* Caption background */

                    const boxWidth =
                        Math.min(
                            canvas.width - 120,
                            1000
                        );

                    const boxHeight =
                        90;

                    const boxX =
                        (canvas.width -
                            boxWidth) / 2;

                    const boxY =
                        canvas.height - 150;


                    ctx.fillStyle =
                        "rgba(0,0,0,0.75)";

                    ctx.fillRect(
                        boxX,
                        boxY,
                        boxWidth,
                        boxHeight
                    );


                    /* Caption text */

                    ctx.fillStyle =
                        "#fff";

                    ctx.font =
                        "bold 42px Arial";

                    ctx.textAlign =
                        "center";

                    ctx.fillText(
                        String(
                            caption.text || ""
                        ),
                        canvas.width / 2,
                        boxY + 58
                    );
                }

            }
        );


        /* -----------------------------------------
           TIME
        ----------------------------------------- */

        if (currentTimeEl) {

            currentTimeEl.textContent =
                time.toFixed(1) + "s";
        }


        if (timeline) {

            timeline.max =
                duration;

            timeline.value =
                time;
        }
    }


    /* ---------------------------------------------
       INITIAL FRAME
    --------------------------------------------- */

    drawPreviewFrame(
        previewPausedTime
    );


    /* ---------------------------------------------
       PLAY
    --------------------------------------------- */

    if (playBtn) {

        playBtn.onclick =
            function() {

                if (previewIsPlaying) {
                    return;
                }


                previewIsPlaying =
                    true;


                previewStartTimestamp =
                    performance.now() -
                    (
                        previewPausedTime *
                        1000
                    );


                function animate(
                    timestamp
                ) {

                    if (
                        !previewIsPlaying
                    ) {
                        return;
                    }


                    const elapsed =
                        (
                            timestamp -
                            previewStartTimestamp
                        ) / 1000;


                    previewPausedTime =
                        elapsed;


                    if (
                        previewPausedTime >=
                        duration
                    ) {

                        previewPausedTime =
                            duration;

                        previewIsPlaying =
                            false;

                        drawPreviewFrame(
                            previewPausedTime
                        );

                        return;
                    }


                    drawPreviewFrame(
                        previewPausedTime
                    );


                    previewAnimationFrame =
                        requestAnimationFrame(
                            animate
                        );
                }


                previewAnimationFrame =
                    requestAnimationFrame(
                        animate
                    );
            };
    }


    /* ---------------------------------------------
       PAUSE
    --------------------------------------------- */

    if (pauseBtn) {

        pauseBtn.onclick =
            function() {

                previewIsPlaying =
                    false;


                if (
                    previewAnimationFrame
                ) {

                    cancelAnimationFrame(
                        previewAnimationFrame
                    );

                    previewAnimationFrame =
                        null;
                }
            };
    }
   


    /* ---------------------------------------------
       RESTART
    --------------------------------------------- */

    if (restartBtn) {

        restartBtn.onclick =
            function() {

                previewIsPlaying =
                    false;


                if (
                    previewAnimationFrame
                ) {

                    cancelAnimationFrame(
                        previewAnimationFrame
                    );

                    previewAnimationFrame =
                        null;
                }


                previewPausedTime =
                    0;


                drawPreviewFrame(0);
            };
    }


    /* ---------------------------------------------
       TIMELINE
    --------------------------------------------- */

    if (timeline) {

        timeline.oninput =
            function() {

                previewIsPlaying =
                    false;


                if (
                    previewAnimationFrame
                ) {

                    cancelAnimationFrame(
                        previewAnimationFrame
                    );

                    previewAnimationFrame =
                        null;
                }


                previewPausedTime =
                    Number(
                        timeline.value
                    );


                drawPreviewFrame(
                    previewPausedTime
                );
            };
    }


    /* ---------------------------------------------
       VOLUME
    --------------------------------------------- */

    if (volume) {

        volume.oninput =
            function() {

                /*
                   Reserved for preview audio.
                   Current canvas preview has
                   no audio source.
                */

                console.log(
                    "Preview volume:",
                    volume.value
                );
            };
    }
}


/* =====================================================
   MUSIC & SOUND EFFECTS
===================================================== */

let musicObjectURL = null;
let sfxObjectURL = null;


/* -------------------------
   MUSIC FILE
------------------------- */

function setupMusicControls() {

    const musicFile = $("musicFile");
    const musicAudio = $("musicAudio");
    const playMusicBtn = $("playMusicBtn");
    const stopMusicBtn = $("stopMusicBtn");
    const musicVolume = $("musicVolume");
    const musicVolumeValue = $("musicVolumeValue");
    const musicStatus = $("musicStatus");

    if (!musicFile || !musicAudio) return;


    musicFile.addEventListener("change", function () {

        const file = musicFile.files[0];

        if (!file) return;

        if (musicObjectURL) {
            URL.revokeObjectURL(musicObjectURL);
        }

        musicObjectURL = URL.createObjectURL(file);

        musicAudio.src = musicObjectURL;
        musicAudio.load();

        musicStatus.textContent =
            "Music loaded: " + file.name;

    });


    if (playMusicBtn) {

        playMusicBtn.addEventListener("click", function () {

            if (!musicAudio.src) {

                musicStatus.textContent =
                    "Please select a music file first.";

                return;
            }

            musicAudio.play()
                .then(function () {

                    musicStatus.textContent =
                        "Playing music.";

                })
                .catch(function () {

                    musicStatus.textContent =
                        "Unable to play music.";

                });

        });

    }


    if (stopMusicBtn) {

        stopMusicBtn.addEventListener("click", function () {

            musicAudio.pause();
            musicAudio.currentTime = 0;

            musicStatus.textContent =
                "Music stopped.";

        });

    }


    if (musicVolume) {

        musicAudio.volume =
            Number(musicVolume.value);

        musicVolume.addEventListener("input", function () {

            const volume =
                Number(musicVolume.value);

            musicAudio.volume = volume;

            if (musicVolumeValue) {

                musicVolumeValue.textContent =
                    Math.round(volume * 100) + "%";

            }

        });

    }

}


/* -------------------------
   SOUND EFFECTS
------------------------- */

function setupSfxControls() {

    const sfxFile = $("sfxFile");
    const sfxAudio = $("sfxAudio");
    const playSfxBtn = $("playSfxBtn");
    const stopSfxBtn = $("stopSfxBtn");
    const sfxStatus = $("sfxStatus");

    if (!sfxFile || !sfxAudio) return;


    sfxFile.addEventListener("change", function () {

        const file = sfxFile.files[0];

        if (!file) return;

        if (sfxObjectURL) {
            URL.revokeObjectURL(sfxObjectURL);
        }

        sfxObjectURL =
            URL.createObjectURL(file);

        sfxAudio.src = sfxObjectURL;
        sfxAudio.load();

        sfxStatus.textContent =
            "Sound effect loaded: " + file.name;

    });


    if (playSfxBtn) {

        playSfxBtn.addEventListener("click", function () {

            if (!sfxAudio.src) {

                sfxStatus.textContent =
                    "Please select a sound effect first.";

                return;
            }

            sfxAudio.currentTime = 0;

            sfxAudio.play()
                .then(function () {

                    sfxStatus.textContent =
                        "Playing sound effect.";

                })
                .catch(function () {

                    sfxStatus.textContent =
                        "Unable to play sound effect.";

                });

        });

    }


    if (stopSfxBtn) {

        stopSfxBtn.addEventListener("click", function () {

            sfxAudio.pause();
            sfxAudio.currentTime = 0;

            sfxStatus.textContent =
                "Sound effect stopped.";

        });

    }

}


/* -------------------------
   START MUSIC / SFX
------------------------- */

setupMusicControls();
setupSfxControls();
/* =====================================================
   ANIMATION CONTROLS
===================================================== */

function refreshAnimationScenes() {

    const select = $("animationSceneSelect");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select a scene
        </option>
    `;

    if (!project.scenes) {
        project.scenes = [];
    }

    project.scenes.forEach(function(scene, index) {

        const option =
            document.createElement("option");

        option.value = index;

        option.textContent =
            "Scene " +
            (index + 1) +
            " - " +
            (scene.title || scene.name || "Scene");

        select.appendChild(option);

    });

}


/* -------------------------
   LOAD SELECTED SCENE
------------------------- */

function loadAnimationScene(index) {
   currentAnimationSceneIndex = Number(index);

    if (
        index === "" ||
        index === null ||
        index === undefined
    ) {
        return;
    }

    if (!project.scenes) {
        project.scenes = [];
    }

    const scene =
        project.scenes[Number(index)];

    if (!scene) return;


    const characterAnimation =
        $("characterAnimation");

    const cameraAnimation =
        $("cameraAnimation");

    const animationDuration =
        $("animationDuration");

    const sceneTransition =
        $("sceneTransition");


    if (characterAnimation) {

        characterAnimation.value =
            scene.animation || "None";

    }


    if (cameraAnimation) {

        cameraAnimation.value =
            scene.camera || "Static";

    }


    if (animationDuration) {

        animationDuration.value =
            scene.duration || 5;

    }


    if (sceneTransition) {

        sceneTransition.value =
            scene.transition || "None";

    }


    const status =
        $("animationStatus");

    if (status) {

        status.textContent =
            "Scene loaded.";

    }

}


/* -------------------------
   SAVE ANIMATION
------------------------- */

function saveAnimationSettings() {

    const select =
        $("animationSceneSelect");

    if (!select || select.value === "") {

        alert("Please select a scene first.");

        return;

    }


    if (!project.scenes) {
        project.scenes = [];
    }


    const index =
        Number(select.value);

    const scene =
        project.scenes[index];

    if (!scene) return;


    const characterAnimation =
        $("characterAnimation");

    const cameraAnimation =
        $("cameraAnimation");

    const animationDuration =
        $("animationDuration");

    const sceneTransition =
        $("sceneTransition");


    scene.animation =
        characterAnimation
            ? characterAnimation.value
            : "None";


    scene.camera =
        cameraAnimation
            ? cameraAnimation.value
            : "Static";


    scene.duration =
        animationDuration
            ? Math.max(
                1,
                Number(animationDuration.value) || 5
            )
            : 5;


    scene.transition =
        sceneTransition
            ? sceneTransition.value
            : "None";


    project.status =
        "Animation saved";


    saveProject();
    updateProjectUI();


    const status =
        $("animationStatus");

    if (status) {

        status.textContent =
            "Animation settings saved successfully.";

    }

}


/* -------------------------
   REFRESH ANIMATION
------------------------- */

function refreshAnimationControls() {

    refreshAnimationScenes();

    const select =
        $("animationSceneSelect");

    if (select && select.value !== "") {

        loadAnimationScene(select.value);

    }

}


/* -------------------------
   EVENT CONNECTIONS
------------------------- */

function setupAnimationControls() {

    const sceneSelect =
        $("animationSceneSelect");

    const saveButton =
        $("saveAnimationBtn");

    const refreshButton =
        $("refreshAnimationBtn");


    if (sceneSelect) {

        sceneSelect.addEventListener(
            "change",
            function() {

                loadAnimationScene(
                    sceneSelect.value
                );

            }
        );

    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            function() {

                saveAnimationSettings();

            }
        );

    }


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function() {

                refreshAnimationControls();

            }
        );

    }


    setTimeout(function() {
    refreshAnimationScenes();
}, 100);

}


/* =====================================================
   START ANIMATION CONTROLS
===================================================== */

setupAnimationControls();
/* =====================================================
   CAPTIONS
===================================================== */

function refreshCaptionScenes() {

    const select = $("captionSceneSelect");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Select a scene
        </option>
    `;

    if (!project.scenes) {
        project.scenes = [];
    }

    project.scenes.forEach(function(scene, index) {

        const option =
            document.createElement("option");

        option.value = index;

        option.textContent =
            "Scene " +
            (index + 1) +
            " - " +
            (scene.title ||
             scene.name ||
             "Scene");

        select.appendChild(option);

    });

}
function renderCaptions() {

    const list = $("captionList");

    if (!list) return;

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

    project.captions.forEach(function(caption, index) {

        const card =
            document.createElement("div");

        card.className = "character-card";

        card.innerHTML = `
            <div>💬</div>

            <strong>
                ${escapeHTML(caption.text)}
            </strong>

            <p>
                Scene ${Number(caption.sceneIndex) + 1}
                |
                ${caption.start}s -
                ${caption.end}s
            </p>

            <button
                type="button"
                class="secondary-btn"
                data-delete-caption="${index}">
                🗑️ Delete
            </button>
        `;

        list.appendChild(card);

    });

    list
        .querySelectorAll("[data-delete-caption]")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const index =
                        Number(
                            button.dataset.deleteCaption
                        );

                    project.captions.splice(index, 1);

                    project.status =
                        "Caption deleted";

                    renderCaptions();
                    saveProject();

                }
            );

        });

}

function addCaption() {

    const sceneSelect =
        $("captionSceneSelect");

    const textInput =
        $("captionText");

    const startInput =
        $("captionStart");

    const endInput =
        $("captionEnd");

    if (!sceneSelect || sceneSelect.value === "") {

        alert("Please select a scene first.");

        return;
    }

    const text =
        textInput.value.trim();

    if (!text) {

        alert("Please enter caption text.");

        return;
    }

    const start =
        Number(startInput.value);

    const end =
        Number(endInput.value);

    if (end <= start) {

        alert(
            "End time must be greater than start time."
        );

        return;
    }

    if (!project.captions) {
        project.captions = [];
    }

    project.captions.push({

        id: Date.now(),

        sceneIndex:
            Number(sceneSelect.value),

        text: text,

        start: start,

        end: end

    });

    project.status =
        "Caption added";

    renderCaptions();
    saveProject();

    textInput.value = "";

    const status =
        $("captionStatus");

    if (status) {

        status.textContent =
            "Caption added successfully.";

    }

}

function clearCaptions() {

    if (!project.captions ||
        project.captions.length === 0) {

        return;
    }

    if (!confirm("Clear all captions?")) {

        return;
    }

    project.captions = [];

    project.status =
        "Captions cleared";

    renderCaptions();
    saveProject();

}

const addCaptionBtn =
    $("addCaptionBtn");

if (addCaptionBtn) {

    addCaptionBtn.addEventListener(
        "click",
        addCaption
    );

}


const clearCaptionsBtn =
    $("clearCaptionsBtn");

if (clearCaptionsBtn) {

    clearCaptionsBtn.addEventListener(
        "click",
        clearCaptions
    );

}


