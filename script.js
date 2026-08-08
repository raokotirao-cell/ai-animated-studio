"use strict";

/* =========================================================
   AI ANIMATED STUDIO
   CLEAN CORE SCRIPT
   ========================================================= */

console.log("AI Animated Studio script loaded.");

/* =========================================================
   PROJECT DATA
   ========================================================= */

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

/* =========================================================
   GLOBAL PREVIEW STATE
   ========================================================= */

let previewAnimationFrame = null;
let previewStartTimestamp = null;
let previewPausedTime = 0;
let previewIsPlaying = false;

/* =========================================================
   VOICE STATE
   ========================================================= */

let voiceRecorder = null;
let voiceChunks = [];
let recordedVoiceUrl = "";

/* =========================================================
   AUDIO STATE
   ========================================================= */

let musicObjectURL = null;
let sfxObjectURL = null;

/* =========================================================
   HELPER
   ========================================================= */

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

function safeNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

/* =========================================================
   DEFAULT OBJECTS
   ========================================================= */

function createDefaultScene(number) {
    return {
        id: Date.now() + number,
        number: number,
        title: "Scene " + number,
        description: "Describe this scene.",
        duration: 5,
        background: "",
        characters: [],
        dialogue: "",
        camera: "Static",
        animation: "None",
        transition: "None"
    };
}

function createDefaultCharacter(name) {
    return {
        id: Date.now(),
        name: name,
        description: "",
        emoji: "👤",
        type: "3D Cartoon",
        animation: "Idle",
        startPosition: "Left",
        endPosition: "Center",
        speed: 1
    };
}

function createDefaultBackground(name) {
    return {
        id: Date.now(),
        name: name,
        description: "",
        emoji: "🌄"
    };
}

/* =========================================================
   PROJECT UI
   ========================================================= */

function updateProjectUI() {
    const name = $("projectNameDisplay");
    const scenes = $("sceneCountDisplay");
    const characters = $("characterCountDisplay");
    const status = $("projectStatusDisplay");

    if (name) {
        name.textContent =
            project.name || "No project created";
    }

    if (scenes) {
        scenes.textContent =
            Array.isArray(project.scenes)
                ? project.scenes.length
                : 0;
    }

    if (characters) {
        characters.textContent =
            Array.isArray(project.characters)
                ? project.characters.length
                : 0;
    }

    if (status) {
        status.textContent =
            project.status || "Ready";
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

function saveProject() {
    try {
        if (!Array.isArray(project.scenes)) {
            project.scenes = [];
        }

        if (!Array.isArray(project.characters)) {
            project.characters = [];
        }

        if (!Array.isArray(project.backgrounds)) {
            project.backgrounds = [];
        }

        if (!Array.isArray(project.captions)) {
            project.captions = [];
        }

        if (project.status === "Ready") {
            project.status = "Saved";
        }

        localStorage.setItem(
            "aiAnimatedStudioProject",
            JSON.stringify(project)
        );

        updateProjectUI();

        console.log(
            "Project saved successfully."
        );
    } catch (error) {
        console.error(
            "Save error:",
            error
        );

        alert(
            "Unable to save project."
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

        const data =
            JSON.parse(saved);

        project = {
            name: data.name || "",
            storyTitle: data.storyTitle || "",
            storyText: data.storyText || "",

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

            status:
                data.status || "Saved"
        };

        normalizeProject();

        updateStoryUI();
        renderScenes();
        renderCharacters();
        renderBackgrounds();
        renderCaptions();
        updateProjectUI();

        console.log(
            "Project loaded successfully."
        );
    } catch (error) {
        console.error(
            "Load error:",
            error
        );

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

/* =========================================================
   NORMALIZE PROJECT
   ========================================================= */

function normalizeProject() {
    if (!Array.isArray(project.scenes)) {
        project.scenes = [];
    }

    if (!Array.isArray(project.characters)) {
        project.characters = [];
    }

    if (!Array.isArray(project.backgrounds)) {
        project.backgrounds = [];
    }

    if (!Array.isArray(project.captions)) {
        project.captions = [];
    }

    project.scenes.forEach(
        function(scene, index) {

            scene.number =
                index + 1;

            scene.title =
                scene.title ||
                "Scene " + (index + 1);

            scene.description =
                scene.description || "";

            scene.duration =
                Math.max(
                    1,
                    safeNumber(
                        scene.duration,
                        5
                    )
                );

            scene.background =
                scene.background || "";

            scene.dialogue =
                scene.dialogue || "";

            scene.camera =
                scene.camera || "Static";

            scene.animation =
                scene.animation || "None";

            scene.transition =
                scene.transition || "None";

            if (!Array.isArray(scene.characters)) {
                scene.characters = [];
            }

            /*
             * Old character format:
             * ["Raju"]
             *
             * New format:
             * [
             *   {
             *      characterId,
             *      animation,
             *      startPosition,
             *      endPosition,
             *      speed
             *   }
             * ]
             *
             * Convert old format automatically.
             */

            scene.characters =
                scene.characters.map(
                    function(item) {

                        if (
                            typeof item ===
                            "string"
                        ) {

                            const character =
                                project.characters.find(
                                    function(char) {
                                        return (
                                            String(
                                                char.name || ""
                                            )
                                            .toLowerCase() ===
                                            item
                                                .trim()
                                                .toLowerCase()
                                        );
                                    }
                                );

                            if (character) {
                                return {
                                    characterId:
                                        character.id,

                                    animation:
                                        character.animation ||
                                        "Idle",

                                    startPosition:
                                        character.startPosition ||
                                        "Left",

                                    endPosition:
                                        character.endPosition ||
                                        "Center",

                                    speed:
                                        safeNumber(
                                            character.speed,
                                            1
                                        )
                                };
                            }

                            return {
                                characterId: null,
                                name: item,
                                animation: "Idle",
                                startPosition: "Left",
                                endPosition: "Center",
                                speed: 1
                            };
                        }

                        return item;
                    }
                );
        }
    );
}

/* =========================================================
   NEW PROJECT
   ========================================================= */

function openNewProject() {
    const modal =
        $("newProjectModal");

    if (!modal) {
        console.warn(
            "newProjectModal not found."
        );
        return;
    }

    modal.classList.remove("hidden");

    const input =
        $("newProjectName");

    if (input) {
        input.value =
            project.name || "";

        setTimeout(
            function() {
                input.focus();
            },
            100
        );
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

    if (!input) {
        alert(
            "Project name input not found."
        );
        return;
    }

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
    renderBackgrounds();
    renderCaptions();

    saveProject();

    closeNewProject();

    showPage("story");

    alert(
        "Project created successfully."
    );
}

/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageId) {
    document.querySelectorAll(
        ".page"
    ).forEach(
        function(page) {
            page.classList.remove(
                "active"
            );
        }
    );

    const page =
        $(pageId);

    if (page) {
        page.classList.add(
            "active"
        );
    }

    document.querySelectorAll(
        ".nav-item"
    ).forEach(
        function(button) {

            if (
                button.dataset.page ===
                pageId
            ) {
                button.classList.add(
                    "active"
                );
            } else {
                button.classList.remove(
                    "active"
                );
            }
        }
    );

    if (pageId === "captions") {
        refreshCaptionScenes();
        renderCaptions();
    }

    if (pageId === "editor") {
        refreshSceneEditor();
    }

    if (pageId === "animation") {
        refreshAnimationControls();
    }

    if (pageId === "preview") {
        updateAnimationPreview();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================================================
   STORY
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

/* =========================================================
   STORY → SCENES
   ========================================================= */

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
            .map(
                function(text) {
                    return text.trim();
                }
            )
            .filter(Boolean);

    if (parts.length <= 1) {
        parts =
            story
                .split(/(?<=[.!?])\s+/)
                .map(
                    function(text) {
                        return text.trim();
                    }
                )
                .filter(Boolean);
    }

    if (!parts.length) {
        alert(
            "Unable to create scenes."
        );
        return;
    }

    project.scenes =
        parts.map(
            function(text, index) {
                return {
                    id:
                        Date.now() +
                        index,

                    number:
                        index + 1,

                    title:
                        "Scene " +
                        (index + 1),

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
                        "None",

                    transition:
                        "None"
                };
            }
        );

    project.status =
        "Scenes created";

    renderScenes();
    updateProjectUI();
    saveProject();

    showPage("scenes");

    alert(
        project.scenes.length +
        " scene(s) created successfully."
    );
}

/* =========================================================
   ADD SCENE
   ========================================================= */

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

    project.scenes.push(
        createDefaultScene(
            number
        )
    );

    project.status =
        "Scene added";

    renderScenes();
    updateProjectUI();
    saveProject();
}

/* =========================================================
   RENDER SCENES
   ========================================================= */

function renderScenes() {
    const list =
        $("sceneList");

    if (!list) {
        return;
    }

    if (!Array.isArray(project.scenes)) {
        project.scenes = [];
    }

    if (
        project.scenes.length === 0
    ) {

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
        function(scene, index) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "scene-card";

            const characterNames =
                getSceneCharacterNames(
                    scene
                );

            card.innerHTML = `
                <div class="scene-card-header">
                    <div>
                        <h3>
                            🎬 Scene ${index + 1}
                        </h3>

                        <span>
                            ${escapeHTML(
                                scene.title ||
                                "Untitled Scene"
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
                            value="${escapeHTML(
                                scene.title || ""
                            )}"
                            placeholder="Scene title">
                    </div>

                    <div class="scene-field">
                        <label>
                            Duration (seconds)
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="300"
                            data-scene-duration="${index}"
                            value="${safeNumber(
                                scene.duration,
                                5
                            )}">
                    </div>

                    <div class="scene-field scene-full">
                        <label>
                            Scene Description
                        </label>

                        <textarea
                            rows="4"
                            data-scene-description="${index}"
                            placeholder="Describe what happens in this scene..."
                        >${escapeHTML(
                            scene.description || ""
                        )}</textarea>
                    </div>

                    <div class="scene-field">
                        <label>
                            🌄 Background
                        </label>

                        <input
                            type="text"
                            data-scene-background="${index}"
                            value="${escapeHTML(
                                scene.background || ""
                            )}"
                            placeholder="Village, forest, city...">
                    </div>

                    <div class="scene-field">
                        <label>
                            👤 Characters
                        </label>

                        <input
                            type="text"
                            data-scene-characters="${index}"
                            value="${escapeHTML(
                                characterNames
                            )}"
                            placeholder="Character names">
                    </div>

                    <div class="scene-field scene-full">
                        <label>
                            💬 Dialogue
                        </label>

                        <textarea
                            rows="3"
                            data-scene-dialogue="${index}"
                            placeholder="Character dialogue..."
                        >${escapeHTML(
                            scene.dialogue || ""
                        )}</textarea>
                    </div>

                    <div class="scene-field">
                        <label>
                            📷 Camera
                        </label>

                        <select
                            data-scene-camera="${index}">

                            <option
                                value="Static"
                                ${scene.camera === "Static"
                                    ? "selected"
                                    : ""}>
                                Static
                            </option>

                            <option
                                value="Zoom In"
                                ${scene.camera === "Zoom In"
                                    ? "selected"
                                    : ""}>
                                Zoom In
                            </option>

                            <option
                                value="Zoom Out"
                                ${scene.camera === "Zoom Out"
                                    ? "selected"
                                    : ""}>
                                Zoom Out
                            </option>

                            <option
                                value="Pan Left"
                                ${scene.camera === "Pan Left"
                                    ? "selected"
                                    : ""}>
                                Pan Left
                            </option>

                            <option
                                value="Pan Right"
                                ${scene.camera === "Pan Right"
                                    ? "selected"
                                    : ""}>
                                Pan Right
                            </option>

                            <option
                                value="Close Up"
                                ${scene.camera === "Close Up"
                                    ? "selected"
                                    : ""}>
                                Close Up
                            </option>
                        </select>
                    </div>

                    <div class="scene-field">
                        <label>
                            ✨ Animation
                        </label>

                        <select
                            data-scene-animation="${index}">

                            <option
                                value="None"
                                ${scene.animation === "None"
                                    ? "selected"
                                    : ""}>
                                None
                            </option>

                            <option
                                value="Idle"
                                ${scene.animation === "Idle"
                                    ? "selected"
                                    : ""}>
                                Idle
                            </option>

                            <option
                                value="Walk"
                                ${scene.animation === "Walk"
                                    ? "selected"
                                    : ""}>
                                Walk
                            </option>

                            <option
                                value="Run"
                                ${scene.animation === "Run"
                                    ? "selected"
                                    : ""}>
                                Run
                            </option>

                            <option
                                value="Talk"
                                ${scene.animation === "Talk"
                                    ? "selected"
                                    : ""}>
                                Talk
                            </option>

                            <option
                                value="Action"
                                ${scene.animation === "Action"
                                    ? "selected"
                                    : ""}>
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
        }
    );

    list.querySelectorAll(
        "[data-save-scene]"
    ).forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    saveScene(
                        Number(
                            button.dataset.saveScene
                        )
                    );

                }
            );
        }
    );

    list.querySelectorAll(
        "[data-delete-scene]"
    ).forEach(
        function(button) {

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
        }
    );
}

/* =========================================================
   GET SCENE CHARACTER NAMES
   ========================================================= */

function getSceneCharacterNames(scene) {
    if (
        !scene ||
        !Array.isArray(scene.characters)
    ) {
        return "";
    }

    return scene.characters
        .map(
            function(item) {

                if (
                    typeof item ===
                    "string"
                ) {
                    return item;
                }

                const character =
                    project.characters.find(
                        function(char) {
                            return String(
                                char.id
                            ) === String(
                                item.characterId
                            );
                        }
                    );

                return character
                    ? character.name
                    : item.name || "";
            }
        )
        .filter(Boolean)
        .join(", ");
}

/* =========================================================
   SAVE SCENE
   ========================================================= */

function saveScene(index) {
    const scene =
        project.scenes[index];

    if (!scene) {
        return;
    }

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

    if (titleInput) {
        scene.title =
            titleInput.value.trim();
    }

    if (descriptionInput) {
        scene.description =
            descriptionInput.value.trim();
    }

    if (durationInput) {
        scene.duration =
            Math.max(
                1,
                safeNumber(
                    durationInput.value,
                    5
                )
            );
    }

    if (backgroundInput) {
        scene.background =
            backgroundInput.value.trim();
    }

    if (charactersInput) {

        const names =
            charactersInput.value
                .split(",")
                .map(
                    function(name) {
                        return name.trim();
                    }
                )
                .filter(Boolean);

        scene.characters =
            names.map(
                function(name) {

                    const character =
                        project.characters.find(
                            function(char) {
                                return (
                                    String(
                                        char.name || ""
                                    )
                                    .trim()
                                    .toLowerCase() ===
                                    name.toLowerCase()
                                );
                            }
                        );

                    if (character) {
                        return {
                            characterId:
                                character.id,

                            animation:
                                character.animation ||
                                "Idle",

                            startPosition:
                                character.startPosition ||
                                "Left",

                            endPosition:
                                character.endPosition ||
                                "Center",

                            speed:
                                safeNumber(
                                    character.speed,
                                    1
                                )
                        };
                    }

                    return {
                        characterId: null,
                        name: name,
                        animation: "Idle",
                        startPosition: "Left",
                        endPosition: "Center",
                        speed: 1
                    };
                }
            );
    }

    if (dialogueInput) {
        scene.dialogue =
            dialogueInput.value.trim();
    }

    if (cameraInput) {
        scene.camera =
            cameraInput.value;
    }

    if (animationInput) {
        scene.animation =
            animationInput.value;
    }

    project.status =
        "Scene saved";

    renderScenes();
    updateProjectUI();
    saveProject();

    alert(
        "Scene " +
        (index + 1) +
        " saved successfully."
    );
}

/* =========================================================
   RENUMBER SCENES
   ========================================================= */

function renumberScenes() {
    project.scenes.forEach(
        function(scene, index) {
            scene.number =
                index + 1;
        }
    );
}

/* =========================================================
   CHARACTERS
   ========================================================= */

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

    const character =
        createDefaultCharacter(
            name.trim()
        );

    project.characters.push(
        character
    );

    project.status =
        "Character added";

    renderCharacters();
    refreshSceneCharacterSelect();
    refreshAnimationControls();
    updateProjectUI();
    saveProject();
}

/* =========================================================
   RENDER CHARACTERS
   ========================================================= */

function renderCharacters() {
    const list =
        $("characterList");

    if (!list) {
        return;
    }

    if (!Array.isArray(project.characters)) {
        project.characters = [];
    }

    if (
        project.characters.length === 0
    ) {

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
        function(character, index) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "character-card";

            card.innerHTML = `
                <div class="character-avatar">
                    ${escapeHTML(
                        character.emoji ||
                        "👤"
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        character.name ||
                        "Unnamed Character"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        character.description ||
                        "No description yet."
                    )}
                </p>

                <p>
                    🎭 ${escapeHTML(
                        character.type ||
                        "3D Cartoon"
                    )}
                </p>

                <p>
                    ✨ ${escapeHTML(
                        character.animation ||
                        "Idle"
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
    ).forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    editCharacter(
                        Number(
                            button.dataset.editCharacter
                        )
                    );

                }
            );
        }
    );

    list.querySelectorAll(
        "[data-delete-character]"
    ).forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const index =
                        Number(
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
                    refreshSceneCharacterSelect();
                    updateProjectUI();
                    saveProject();

                }
            );
        }
    );
}

/* =========================================================
   EDIT CHARACTER
   ========================================================= */

function editCharacter(index) {
    const character =
        project.characters[index];

    if (!character) {
        return;
    }

    const name =
        prompt(
            "Character name:",
            character.name || ""
        );

    if (name === null) {
        return;
    }

    const description =
        prompt(
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
    refreshSceneCharacterSelect();
    updateProjectUI();
    saveProject();
}

/* =========================================================
   BACKGROUNDS
   ========================================================= */

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

    project.backgrounds.push(
        createDefaultBackground(
            name.trim()
        )
    );

    project.status =
        "Background added";

    renderBackgrounds();
    refreshSceneEditor();
    updateProjectUI();
    saveProject();
}

/* =========================================================
   RENDER BACKGROUNDS
   ========================================================= */

function renderBackgrounds() {
    const list =
        $("backgroundList");

    if (!list) {
        return;
    }

    if (!Array.isArray(project.backgrounds)) {
        project.backgrounds = [];
    }

    if (
        project.backgrounds.length === 0
    ) {

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
        function(background, index) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "character-card";

            card.innerHTML = `
                <div class="character-avatar">
                    ${escapeHTML(
                        background.emoji ||
                        "🌄"
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
    ).forEach(
        function(button) {

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
        }
    );

    list.querySelectorAll(
        "[data-delete-background]"
    ).forEach(
        function(button) {

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
                    refreshSceneEditor();
                    updateProjectUI();
                    saveProject();

                }
            );
        }
    );
}

/* =========================================================
   EDIT BACKGROUND
   ========================================================= */

function editBackground(index) {
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
    refreshSceneEditor();
    updateProjectUI();
    saveProject();
}

/* =========================================================
   SCENE EDITOR
   ========================================================= */

function refreshSceneEditor() {
    const sceneSelect =
        $("editorSceneSelect");

    const backgroundSelect =
        $("editorBackgroundSelect");

    const characterSelect =
        $("editorCharacterSelect");

    if (sceneSelect) {

        sceneSelect.innerHTML = `
            <option value="">
                Select a scene
            </option>
        `;

        project.scenes.forEach(
            function(scene, index) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    index;

                option.textContent =
                    "Scene " +
                    (index + 1) +
                    " - " +
                    (
                        scene.title ||
                        "Untitled"
                    );

                sceneSelect.appendChild(
                    option
                );
            }
        );
    }

    if (backgroundSelect) {

        backgroundSelect.innerHTML = `
            <option value="">
                Select background
            </option>
        `;

        project.backgrounds.forEach(
            function(background, index) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    index;

                option.textContent =
                    background.name ||
                    "Background " +
                    (index + 1);

                backgroundSelect.appendChild(
                    option
                );
            }
        );
    }

    if (characterSelect) {

        characterSelect.innerHTML = `
            <option value="">
                Select character
            </option>
        `;

        project.characters.forEach(
            function(character, index) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    index;

                option.textContent =
                    character.name ||
                    "Character " +
                    (index + 1);

                characterSelect.appendChild(
                    option
                );
            }
        );
    }
}

/* =========================================================
   FIND BACKGROUND
   ========================================================= */

function findBackgroundIndex(name) {
    if (!name) {
        return "";
    }

    const index =
        project.backgrounds.findIndex(
            function(background) {

                return (
                    String(
                        background.name || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    String(name)
                        .trim()
                        .toLowerCase()
                );

            }
        );

    return index >= 0
        ? String(index)
        : "";
}

/* =========================================================
   FIND CHARACTER
   ========================================================= */

function findCharacterIndex(name) {
    if (!name) {
        return "";
    }

    const index =
        project.characters.findIndex(
            function(character) {

                return (
                    String(
                        character.name || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    String(name)
                        .trim()
                        .toLowerCase()
                );

            }
        );

    return index >= 0
        ? String(index)
        : "";
}

/* =========================================================
   LOAD SCENE INTO EDITOR
   ========================================================= */

function loadSceneIntoEditor(index) {
    const scene =
        project.scenes[index];

    if (!scene) {
        return;
    }

    if ($("editorBackgroundSelect")) {
        $("editorBackgroundSelect").value =
            findBackgroundIndex(
                scene.background
            );
    }

    if ($("editorCharacterSelect")) {

        const names =
            getSceneCharacterNames(
                scene
            );

        const firstName =
            names
                .split(",")[0]
                .trim();

        $("editorCharacterSelect").value =
            findCharacterIndex(
                firstName
            );
    }

    if ($("editorCameraSelect")) {
        $("editorCameraSelect").value =
            scene.camera ||
            "Static";
    }

    if ($("editorAnimationSelect")) {
        $("editorAnimationSelect").value =
            scene.animation ||
            "None";
    }

    if ($("editorSceneDescription")) {
        $("editorSceneDescription").value =
            scene.description ||
            "";
    }

    if ($("editorSceneDialogue")) {
        $("editorSceneDialogue").value =
            scene.dialogue ||
            "";
    }

    if ($("editorSceneDuration")) {
        $("editorSceneDuration").value =
            scene.duration ||
            5;
    }

    setSceneEditorStatus(
        "Scene loaded."
    );
}

/* =========================================================
   SAVE SCENE EDITOR
   ========================================================= */

function saveEditorScene() {
    const sceneSelect =
        $("editorSceneSelect");

    if (!sceneSelect) {
        return;
    }

    if (sceneSelect.value === "") {

        setSceneEditorStatus(
            "Please select a scene first."
        );

        return;
    }

    const index =
        Number(
            sceneSelect.value
        );

    const scene =
        project.scenes[index];

    if (!scene) {
        return;
    }

    const backgroundIndex =
        $("editorBackgroundSelect")
            ? $("editorBackgroundSelect").value
            : "";

    if (
        backgroundIndex !== "" &&
        project.backgrounds[
            backgroundIndex
        ]
    ) {

        scene.background =
            project.backgrounds[
                backgroundIndex
            ].name;

    } else {
        scene.background = "";
    }

    const characterIndex =
        $("editorCharacterSelect")
            ? $("editorCharacterSelect").value
            : "";

    if (
        characterIndex !== "" &&
        project.characters[
            characterIndex
        ]
    ) {

        const character =
            project.characters[
                characterIndex
            ];

        scene.characters = [
            {
                characterId:
                    character.id,

                animation:
                    character.animation ||
                    "Idle",

                startPosition:
                    character.startPosition ||
                    "Left",

                endPosition:
                    character.endPosition ||
                    "Center",

                speed:
                    safeNumber(
                        character.speed,
                        1
                    )
            }
        ];

    } else {
        scene.characters = [];
    }

    if ($("editorCameraSelect")) {
        scene.camera =
            $("editorCameraSelect").value;
    }

    if ($("editorAnimationSelect")) {
        scene.animation =
            $("editorAnimationSelect").value;
    }

    if ($("editorSceneDescription")) {
        scene.description =
            $("editorSceneDescription")
                .value
                .trim();
    }

    if ($("editorSceneDialogue")) {
        scene.dialogue =
            $("editorSceneDialogue")
                .value
                .trim();
    }

    if ($("editorSceneDuration")) {
        scene.duration =
            Math.max(
                1,
                safeNumber(
                    $("editorSceneDuration").value,
                    5
                )
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

/* =========================================================
   SCENE EDITOR STATUS
   ========================================================= */

function setSceneEditorStatus(message) {
    const status =
        $("sceneEditorStatus");

    if (status) {
        status.textContent =
            message;
    }
}

/* =========================================================
   INITIALIZE SCENE EDITOR
   ========================================================= */

function initSceneEditor() {
    const sceneSelect =
        $("editorSceneSelect");

    const saveButton =
        $("saveEditorSceneBtn");

    const refreshButton =
        $("refreshEditorBtn");

    if (refreshButton) {
        refreshButton.onclick =
            function() {

                refreshSceneEditor();

                setSceneEditorStatus(
                    "🔄 Editor refreshed."
                );
            };
    }

    if (sceneSelect) {

        sceneSelect.addEventListener(
            "change",
            function() {

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

    if (saveButton) {
        saveButton.onclick =
            saveEditorScene;
    }

    refreshSceneEditor();
}

/* =========================================================
   OPEN SCENE EDITOR
   ========================================================= */

function openSceneEditor() {
    refreshSceneEditor();

    const sceneSelect =
        $("editorSceneSelect");

    if (
        sceneSelect &&
        sceneSelect.value === "" &&
        project.scenes.length > 0
    ) {

        sceneSelect.value = "0";

        loadSceneIntoEditor(0);
    }
}

/* =========================================================
   CAPTIONS
   ========================================================= */

function refreshCaptionScenes() {
    const select =
        $("captionSceneSelect");

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Select a scene
        </option>
    `;

    project.scenes.forEach(
        function(scene, index) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                index;

            option.textContent =
                "Scene " +
                (index + 1) +
                " - " +
                (
                    scene.title ||
                    "Scene"
                );

            select.appendChild(
                option
            );
        }
    );
}

/* =========================================================
   ADD CAPTION
   ========================================================= */

function addCaption() {
    if (!project.name) {
        alert(
            "Please create a project first."
        );

        openNewProject();
        return;
    }

    const sceneSelect =
        $("captionSceneSelect");

    const textInput =
        $("captionText");

    const startInput =
        $("captionStart");

    const endInput =
        $("captionEnd");

    if (
        !sceneSelect ||
        sceneSelect.value === ""
    ) {

        alert(
            "Please select a scene first."
        );

        return;
    }

    if (!textInput) {
        alert(
            "Caption input not found."
        );

        return;
    }

    const text =
        textInput.value.trim();

    if (!text) {
        alert(
            "Please enter caption text."
        );

        return;
    }

    const start =
        safeNumber(
            startInput
                ? startInput.value
                : 0,
            0
        );

    const end =
        safeNumber(
            endInput
                ? endInput.value
                : 0,
            0
        );

    if (end <= start) {
        alert(
            "End time must be greater than start time."
        );

        return;
    }

    const sceneIndex =
        Number(
            sceneSelect.value
        );

    const scene =
        project.scenes[
            sceneIndex
        ];

    if (!scene) {
        alert(
            "Selected scene not found."
        );

        return;
    }

    if (!Array.isArray(project.captions)) {
        project.captions = [];
    }

    project.captions.push({
        id: Date.now(),
        sceneIndex:
            sceneIndex,
        text:
            text,
        start:
            start,
        end:
            end
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

/* =========================================================
   RENDER CAPTIONS
   ========================================================= */

function renderCaptions() {
    const list =
        $("captionList");

    if (!list) {
        return;
    }

    if (!Array.isArray(project.captions)) {
        project.captions = [];
    }

    if (
        project.captions.length === 0
    ) {

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
        function(caption, index) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "character-card";

            const sceneNumber =
                safeNumber(
                    caption.sceneIndex,
                    0
                ) + 1;

            card.innerHTML = `
                <div class="character-avatar">
                    💬
                </div>

                <h3>
                    Caption ${index + 1}
                </h3>

                <p>
                    ${escapeHTML(
                        caption.text || ""
                    )}
                </p>

                <p>
                    Scene ${sceneNumber}
                    |
                    ${safeNumber(
                        caption.start,
                        0
                    )}s -
                    ${safeNumber(
                        caption.end,
                        0
                    )}s
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
    ).forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    editCaption(
                        Number(
                            button.dataset.editCaption
                        )
                    );

                }
            );
        }
    );

    list.querySelectorAll(
        "[data-delete-caption]"
    ).forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const index =
                        Number(
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
                    saveProject();

                }
            );
        }
    );
}

/* =========================================================
   EDIT CAPTION
   ========================================================= */

function editCaption(index) {
    const caption =
        project.captions[index];

    if (!caption) {
        return;
    }

    const text =
        prompt(
            "Caption text:",
            caption.text || ""
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

    const start =
        prompt(
            "Start time:",
            String(
                caption.start || 0
            )
        );

    if (start === null) {
        return;
    }

    const end =
        prompt(
            "End time:",
            String(
                caption.end || 1
            )
        );

    if (end === null) {
        return;
    }

    const startValue =
        safeNumber(
            start,
            0
        );

    const endValue =
        safeNumber(
            end,
            0
        );

    if (endValue <= startValue) {
        alert(
            "End time must be greater than start time."
        );

        return;
    }

    caption.text =
        text.trim();

    caption.start =
        startValue;

    caption.end =
        endValue;

    project.status =
        "Caption updated";

    renderCaptions();
    saveProject();
}

/* =========================================================
   CLEAR CAPTIONS
   ========================================================= */

function clearCaptions() {
    if (
        !project.captions ||
        project.captions.length === 0
    ) {
        return;
    }

    if (
        !confirm(
            "Clear all captions?"
        )
    ) {
        return;
    }

    project.captions = [];

    project.status =
        "Captions cleared";

    renderCaptions();
    saveProject();
}

/* =========================================================
   ANIMATION CONTROLS
   ========================================================= */

function refreshAnimationScenes() {
    const select =
        $("animationSceneSelect");

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Select a scene
        </option>
    `;

    project.scenes.forEach(
        function(scene, index) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                index;

            option.textContent =
                "Scene " +
                (index + 1) +
                " - " +
                (
                    scene.title ||
                    "Scene"
                );

            select.appendChild(
                option
            );
        }
    );
}

/* =========================================================
   SCENE CHARACTER SELECT
   ========================================================= */

function refreshSceneCharacterSelect() {
    const select =
        $("sceneCharacterSelect");

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Select character
        </option>
    `;

    project.characters.forEach(
        function(character) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                character.id;

            option.textContent =
                character.name ||
                "Unnamed Character";

            select.appendChild(
                option
            );
        }
    );
}

/* =========================================================
   LOAD ANIMATION SCENE
   ========================================================= */

function loadAnimationScene(index) {
    if (
        index === "" ||
        index === null ||
        index === undefined
    ) {
        return;
    }

    currentAnimationSceneIndex =
        Number(index);

    const scene =
        project.scenes[
            Number(index)
        ];

    if (!scene) {
        return;
    }

    if ($("characterAnimation")) {
        $("characterAnimation").value =
            scene.animation ||
            "None";
    }

    if ($("cameraAnimation")) {
        $("cameraAnimation").value =
            scene.camera ||
            "Static";
    }

    if ($("animationDuration")) {
        $("animationDuration").value =
            scene.duration ||
            5;
    }

    if ($("sceneTransition")) {
        $("sceneTransition").value =
            scene.transition ||
            "None";
    }

    refreshSceneCharacterControls(
        scene
    );

    const status =
        $("animationStatus");

    if (status) {
        status.textContent =
            "Scene loaded.";
    }
}

/* =========================================================
   REFRESH SCENE CHARACTER CONTROLS
   ========================================================= */

function refreshSceneCharacterControls(scene) {
    const characterSelect =
        $("sceneCharacterSelect");

    const animationSelect =
        $("characterAnimation");

    const startPositionSelect =
        $("characterStartPosition");

    const endPositionSelect =
        $("characterEndPosition");

    const speedInput =
        $("characterSpeed");

    if (!characterSelect) {
        return;
    }

    refreshSceneCharacterSelect();

    if (
        !scene ||
        !Array.isArray(
            scene.characters
        ) ||
        scene.characters.length === 0
    ) {

        characterSelect.value = "";

        if (animationSelect) {
            animationSelect.value =
                scene
                    ? scene.animation || "None"
                    : "None";
        }

        if (startPositionSelect) {
            startPositionSelect.value =
                "Left";
        }

        if (endPositionSelect) {
            endPositionSelect.value =
                "Center";
        }

        if (speedInput) {
            speedInput.value =
                1;
        }

        return;
    }

    const attached =
        scene.characters[0];

    if (
        attached &&
        attached.characterId !==
        undefined &&
        attached.characterId !== null
    ) {

        characterSelect.value =
            String(
                attached.characterId
            );
    }

    if (animationSelect) {
        animationSelect.value =
            attached.animation ||
            scene.animation ||
            "Idle";
    }

    if (startPositionSelect) {
        startPositionSelect.value =
            attached.startPosition ||
            "Left";
    }

    if (endPositionSelect) {
        endPositionSelect.value =
            attached.endPosition ||
            "Center";
    }

    if (speedInput) {
        speedInput.value =
            safeNumber(
                attached.speed,
                1
            );
    }
}

/* =========================================================
   SAVE ANIMATION SETTINGS
   ========================================================= */

function saveAnimationSettings() {
    const select =
        $("animationSceneSelect");

    if (
        !select ||
        select.value === ""
    ) {

        alert(
            "Please select a scene first."
        );

        return;
    }

    const index =
        Number(
            select.value
        );

    const scene =
        project.scenes[index];

    if (!scene) {
        return;
    }

    if ($("characterAnimation")) {
        scene.animation =
            $("characterAnimation").value;
    }

    if ($("cameraAnimation")) {
        scene.camera =
            $("cameraAnimation").value;
    }

    if ($("animationDuration")) {
        scene.duration =
            Math.max(
                1,
                safeNumber(
                    $("animationDuration").value,
                    5
                )
            );
    }

    if ($("sceneTransition")) {
        scene.transition =
            $("sceneTransition").value;
    }

    saveSelectedSceneCharacterSettings(
        scene
    );

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

/* =========================================================
   ADD CHARACTER TO SCENE
   ========================================================= */

function addCharacterToScene() {
    const select =
        $("animationSceneSelect");

    if (
        !select ||
        select.value === ""
    ) {

        alert(
            "Please select a scene first."
        );

        return;
    }

    const sceneIndex =
        Number(
            select.value
        );

    const scene =
        project.scenes[
            sceneIndex
        ];

    if (!scene) {
        return;
    }

    if (
        !Array.isArray(
            project.characters
        ) ||
        project.characters.length === 0
    ) {

        alert(
            "Please create a character first."
        );

        return;
    }

    const characterSelect =
        $("sceneCharacterSelect");

    if (
        !characterSelect ||
        characterSelect.value === ""
    ) {

        alert(
            "Please select a character."
        );

        return;
    }

    const characterId =
        Number(
            characterSelect.value
        );

    const character =
        project.characters.find(
            function(item) {
                return Number(item.id) ===
                    characterId;
            }
        );

    if (!character) {
        alert(
            "Selected character not found."
        );

        return;
    }

    if (!Array.isArray(scene.characters)) {
        scene.characters = [];
    }

    const alreadyAdded =
        scene.characters.some(
            function(item) {

                return (
                    Number(
                        item.characterId
                    ) ===
                    characterId
                );
            }
        );

    if (alreadyAdded) {
        alert(
            "Character already added to this scene."
        );

        return;
    }

    scene.characters.push({
        characterId:
            character.id,

        animation:
            character.animation ||
            "Idle",

        startPosition:
            character.startPosition ||
            "Left",

        endPosition:
            character.endPosition ||
            "Center",

        speed:
            safeNumber(
                character.speed,
                1
            )
    });

    project.status =
        "Character added to scene";

    saveProject();
    updateProjectUI();

    refreshSceneCharacterControls(
        scene
    );

    alert(
        character.name +
        " added to Scene " +
        (sceneIndex + 1)
    );
}

/* =========================================================
   SAVE SELECTED CHARACTER SETTINGS
   ========================================================= */

function saveSelectedSceneCharacterSettings(
    scene
) {

    const characterSelect =
        $("sceneCharacterSelect");

    if (
        !characterSelect ||
        characterSelect.value === ""
    ) {
        return;
    }

    if (
        !scene ||
        !Array.isArray(
            scene.characters
        )
    ) {
        return;
    }

    const characterId =
        Number(
            characterSelect.value
        );

    let sceneCharacter =
        scene.characters.find(
            function(item) {

                return Number(
                    item.characterId
                ) === characterId;

            }
        );

    if (!sceneCharacter) {

        sceneCharacter = {
            characterId:
                characterId,

            animation:
                "Idle",

            startPosition:
                "Left",

            endPosition:
                "Center",

            speed:
                1
        };

        scene.characters.push(
            sceneCharacter
        );
    }

    if ($("characterAnimation")) {
        sceneCharacter.animation =
            $("characterAnimation").value;
    }

    if ($("characterStartPosition")) {
        sceneCharacter.startPosition =
            $("characterStartPosition").value;
    }

    if ($("characterEndPosition")) {
        sceneCharacter.endPosition =
            $("characterEndPosition").value;
    }

    if ($("characterSpeed")) {
        sceneCharacter.speed =
            Math.max(
                0.1,
                safeNumber(
                    $("characterSpeed").value,
                    1
                )
            );
    }
}

/* =========================================================
   REFRESH ANIMATION CONTROLS
   ========================================================= */

function refreshAnimationControls() {
    refreshAnimationScenes();
    refreshSceneCharacterSelect();

    const select =
        $("animationSceneSelect");

    if (
        select &&
        select.value !== ""
    ) {
        loadAnimationScene(
            select.value
        );
    }
}

/* =========================================================
   SETUP ANIMATION CONTROLS
   ========================================================= */

function setupAnimationControls() {
    const sceneSelect =
        $("animationSceneSelect");

    const saveButton =
        $("saveAnimationBtn");

    const refreshButton =
        $("refreshAnimationBtn");

    const addCharacterButton =
        $("addSceneCharacterBtn");

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

    if (addCharacterButton) {

        addCharacterButton.addEventListener(
            "click",
            addCharacterToScene
        );
    }

    refreshAnimationControls();
}

/* =========================================================
   VOICE - GENERATE
   ========================================================= */

function generateVoice() {
    if (!project.name) {
        alert(
            "Please create a project first."
        );

        openNewProject();
        return;
    }

    const input =
        $("voiceText");

    if (!input) {
        alert(
            "Voice text input not found."
        );

        return;
    }

    const text =
        input.value.trim();

    if (!text) {
        alert(
            "Enter narration text first."
        );

        return;
    }

    if (
        !("speechSynthesis" in window)
    ) {

        alert(
            "Your browser does not support voice generation."
        );

        return;
    }

    window.speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(
            text
        );

    speech.rate =
        1;

    speech.pitch =
        1;

    speech.volume =
        1;

    speech.onstart =
        function() {

            project.status =
                "Voice playing";

            updateProjectUI();
        };

    speech.onend =
        function() {

            project.status =
                "Voice completed";

            updateProjectUI();
        };

    speech.onerror =
        function() {

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

/* =========================================================
   VOICE RECORDING
   ========================================================= */

async function recordVoice() {
    if (!project.name) {
        alert(
            "Please create a project first."
        );

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

    if (
        voiceRecorder &&
        voiceRecorder.state ===
        "recording"
    ) {

        voiceRecorder.stop();

        return;
    }

    try {

        const stream =
            await navigator.mediaDevices
                .getUserMedia({
                    audio: true
                });

        voiceChunks = [];

        const options = {};

        if (
            MediaRecorder.isTypeSupported(
                "audio/webm"
            )
        ) {
            options.mimeType =
                "audio/webm";
        }

        voiceRecorder =
            new MediaRecorder(
                stream,
                options
            );

        voiceRecorder.ondataavailable =
            function(event) {

                if (
                    event.data &&
                    event.data.size > 0
                ) {
                    voiceChunks.push(
                        event.data
                    );
                }
            };

        voiceRecorder.onstart =
            function() {

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

        voiceRecorder.onstop =
            function() {

                const mime =
                    voiceRecorder.mimeType ||
                    "audio/webm";

                const blob =
                    new Blob(
                        voiceChunks,
                        {
                            type: mime
                        }
                    );

                if (recordedVoiceUrl) {
                    URL.revokeObjectURL(
                        recordedVoiceUrl
                    );
                }

                recordedVoiceUrl =
                    URL.createObjectURL(
                        blob
                    );

                let audio =
                    $("recordedVoicePreview");

                if (!audio) {

                    audio =
                        document.createElement(
                            "audio"
                        );

                    audio.id =
                        "recordedVoicePreview";

                    audio.controls =
                        true;

                    audio.style.width =
                        "100%";

                    const voiceModule =
                        $("voice");

                    if (voiceModule) {

                        const card =
                            voiceModule.querySelector(
                                ".module-card"
                            );

                        if (card) {
                            card.appendChild(
                                audio
                            );
                        }
                    }
                }

                audio.src =
                    recordedVoiceUrl;

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

                        const card =
                            voiceModule.querySelector(
                                ".module-card"
                            );

                        if (card) {
                            card.appendChild(
                                download
                            );
                        }
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
                        function(track) {
                            track.stop();
                        }
                    );

                const button =
                    $("recordVoiceBtn");

                if (button) {
                    button.textContent =
                        "🎙️ Record Voice";
                }

                alert(
                    "Voice recording completed."
                );
            };

        voiceRecorder.onerror =
            function(error) {

                console.error(
                    "Voice recorder error:",
                    error
                );

                project.status =
                    "Voice recording failed";

                updateProjectUI();

                stream
                    .getTracks()
                    .forEach(
                        function(track) {
                            track.stop();
                        }
                    );

                const button =
                    $("recordVoiceBtn");

                if (button) {
                    button.textContent =
                        "🎙️ Record Voice";
                }

                alert(
                    "Voice recording failed."
                );
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

/* =========================================================
   MUSIC
   ========================================================= */

function loadMusicFile() {
    const input =
        $("musicFile");

    const audio =
        $("musicAudio");

    if (!input || !audio) {
        return;
    }

    const file =
        input.files[0];

    if (!file) {
        setMusicStatus(
            "Please select a music file."
        );

        return;
    }

    if (musicObjectURL) {
        URL.revokeObjectURL(
            musicObjectURL
        );
    }

    musicObjectURL =
        URL.createObjectURL(
            file
        );

    audio.src =
        musicObjectURL;

    audio.load();

    updateMusicVolume();

    project.status =
        "Music loaded";

    updateProjectUI();

    setMusicStatus(
        "🎵 Music loaded: " +
        file.name
    );
}

function playMusic() {
    const audio =
        $("musicAudio");

    if (
        !audio ||
        !audio.src
    ) {

        alert(
            "Please select a music file first."
        );

        return;
    }

    audio.play()
        .then(
            function() {

                project.status =
                    "Music playing";

                updateProjectUI();

                setMusicStatus(
                    "▶️ Music playing."
                );
            }
        )
        .catch(
            function(error) {

                console.error(
                    "Music play error:",
                    error
                );

                setMusicStatus(
                    "Unable to play music."
                );
            }
        );
}

function stopMusic() {
    const audio =
        $("musicAudio");

    if (!audio) {
        return;
    }

    audio.pause();

    audio.currentTime =
        0;

    project.status =
        "Music stopped";

    updateProjectUI();

    setMusicStatus(
        "⏹️ Music stopped."
    );
}

function updateMusicVolume() {
    const volume =
        $("musicVolume");

    const audio =
        $("musicAudio");

    if (!volume) {
        return;
    }

    const value =
        safeNumber(
            volume.value,
            0.5
        );

    if (audio) {
        audio.volume =
            value;
    }

    const display =
        $("musicVolumeValue");

    if (display) {
        display.textContent =
            Math.round(
                value * 100
            ) +
            "%";
    }
}

/* =========================================================
   SFX
   ========================================================= */

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

    if (sfxObjectURL) {
        URL.revokeObjectURL(
            sfxObjectURL
        );
    }

    sfxObjectURL =
        URL.createObjectURL(
            file
        );

    audio.src =
        sfxObjectURL;

    audio.load();

    project.status =
        "Sound effect loaded";

    updateProjectUI();

    setSfxStatus(
        "🔊 SFX loaded: " +
        file.name
    );
}

function playSfx() {
    const audio =
        $("sfxAudio");

    if (
        !audio ||
        !audio.src
    ) {

        alert(
            "Please select a sound effect first."
        );

        return;
    }

    audio.currentTime =
        0;

    audio.play()
        .then(
            function() {

                project.status =
                    "SFX playing";

                updateProjectUI();

                setSfxStatus(
                    "▶️ Sound effect playing."
                );
            }
        )
        .catch(
            function(error) {

                console.error(
                    "SFX play error:",
                    error
                );

                setSfxStatus(
                    "Unable to play SFX."
                );
            }
        );
}

function stopSfx() {
    const audio =
        $("sfxAudio");

    if (!audio) {
        return;
    }

    audio.pause();

    audio.currentTime =
        0;

    project.status =
        "SFX stopped";

    updateProjectUI();

    setSfxStatus(
        "⏹️ Sound effect stopped."
    );
}

function setMusicStatus(message) {
    const status =
        $("musicStatus");

    if (status) {
        status.textContent =
            message;
    }
}

function setSfxStatus(message) {
    const status =
        $("sfxStatus");

    if (status) {
        status.textContent =
            message;
    }
}

/* =========================================================
   MUSIC INITIALIZATION
   ========================================================= */

function initMusicModule() {
    const musicFile =
        $("musicFile");

    const playMusicBtn =
        $("playMusicBtn");

    const stopMusicBtn =
        $("stopMusicBtn");

    const musicVolume =
        $("musicVolume");

    const sfxFile =
        $("sfxFile");

    const playSfxBtn =
        $("playSfxBtn");

    const stopSfxBtn =
        $("stopSfxBtn");

    if (musicFile) {
        musicFile.addEventListener(
            "change",
            loadMusicFile
        );
    }

    if (playMusicBtn) {
        playMusicBtn.addEventListener(
            "click",
            playMusic
        );
    }

    if (stopMusicBtn) {
        stopMusicBtn.addEventListener(
            "click",
            stopMusic
        );
    }

    if (musicVolume) {
        musicVolume.addEventListener(
            "input",
            updateMusicVolume
        );
    }

    if (sfxFile) {
        sfxFile.addEventListener(
            "change",
            loadSfxFile
        );
    }

    if (playSfxBtn) {
        playSfxBtn.addEventListener(
            "click",
            playSfx
        );
    }

    if (stopSfxBtn) {
        stopSfxBtn.addEventListener(
            "click",
            stopSfx
        );
    }

    updateMusicVolume();
}

/* =========================================================
   SETTINGS
   ========================================================= */

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
            $("videoResolution").value;
    }

    project.status =
        "Settings saved";

    updateProjectUI();
    saveProject();

    alert(
        "Settings saved."
    );
}

/* =========================================================
   PREVIEW HELPERS
   ========================================================= */

function getTotalProjectDuration() {
    return project.scenes.reduce(
        function(total, scene) {

            return total +
                Math.max(
                    1,
                    safeNumber(
                        scene.duration,
                        5
                    )
                );

        },
        0
    );
}

function getSceneAtTime(time) {
    let accumulated = 0;

    for (
        let i = 0;
        i < project.scenes.length;
        i++
    ) {

        const scene =
            project.scenes[i];

        const duration =
            Math.max(
                1,
                safeNumber(
                    scene.duration,
                    5
                )
            );

        if (
            time <
            accumulated + duration
        ) {

            return {
                scene:
                    scene,

                index:
                    i,

                sceneTime:
                    time -
                    accumulated
            };
        }

        accumulated +=
            duration;
    }

    if (
        project.scenes.length
    ) {

        const index =
            project.scenes.length - 1;

        const scene =
            project.scenes[index];

        return {
            scene:
                scene,

            index:
                index,

            sceneTime:
                safeNumber(
                    scene.duration,
                    5
                )
        };
    }

    return null;
}

/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawPreviewBackground(
    ctx,
    canvas,
    scene,
    progress
) {

    const backgroundName =
        String(
            scene.background || ""
        ).trim();

    const background =
        project.backgrounds.find(
            function(bg) {

                return String(
                    bg.name || ""
                )
                .trim()
                .toLowerCase() ===
                backgroundName
                    .toLowerCase();

            }
        );

    if (background) {

        ctx.fillStyle =
            "#284d32";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.textAlign =
            "center";

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "90px Arial";

        ctx.fillText(
            background.emoji ||
            "🌄",
            canvas.width / 2,
            230
        );

        ctx.font =
            "bold 36px Arial";

        ctx.fillText(
            background.name ||
            "Background",
            canvas.width / 2,
            300
        );

    } else {

        /*
         * Default background.
         * We intentionally use a simple
         * canvas background instead of
         * external image generation.
         */

        ctx.fillStyle =
            "#111111";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    /*
     * Small camera movement effect.
     */

    if (
        scene.camera ===
        "Pan Left"
    ) {

        ctx.fillStyle =
            "rgba(255,255,255,0.04)";

        ctx.fillRect(
            progress *
            -100,
            0,
            canvas.width + 100,
            canvas.height
        );
    }

    if (
        scene.camera ===
        "Pan Right"
    ) {

        ctx.fillStyle =
            "rgba(255,255,255,0.04)";

        ctx.fillRect(
            progress *
            100,
            0,
            canvas.width + 100,
            canvas.height
        );
    }
}

/* =========================================================
   DRAW CHARACTERS
   ========================================================= */

function drawPreviewCharacters(
    ctx,
    canvas,
    scene,
    time
) {

    if (
        !Array.isArray(
            scene.characters
        )
    ) {
        return;
    }

    scene.characters.forEach(
        function(sceneCharacter, index) {

            let character =
                null;

            if (
                sceneCharacter &&
                sceneCharacter.characterId !==
                undefined
            ) {

                character =
                    project.characters.find(
                        function(item) {

                            return String(
                                item.id
                            ) === String(
                                sceneCharacter.characterId
                            );
                        }
                    );
            }

            if (!character) {

                if (
                    sceneCharacter &&
                    sceneCharacter.name
                ) {

                    character =
                        project.characters.find(
                            function(item) {

                                return (
                                    String(
                                        item.name ||
                                        ""
                                    )
                                    .trim()
                                    .toLowerCase() ===
                                    String(
                                        sceneCharacter.name
                                    )
                                    .trim()
                                    .toLowerCase()
                                );
                            }
                        );
                }
            }

            const name =
                character
                    ? character.name
                    : (
                        sceneCharacter &&
                        sceneCharacter.name
                            ? sceneCharacter.name
                            : "Character"
                    );

            const emoji =
                character &&
                character.emoji
                    ? character.emoji
                    : "👤";

            let x =
                canvas.width / 2;

            let y =
                canvas.height - 250;

            /*
             * Multiple characters:
             * place them side by side.
             */

            if (
                scene.characters.length >
                1
            ) {

                const spacing =
                    Math.min(
                        220,
                        canvas.width /
                        (
                            scene.characters.length +
                            1
                        )
                    );

                x =
                    spacing *
                    (index + 1);
            }

            const startPosition =
                sceneCharacter &&
                sceneCharacter.startPosition
                    ? sceneCharacter.startPosition
                    : (
                        character &&
                        character.startPosition
                            ? character.startPosition
                            : "Left"
                    );

            const endPosition =
                sceneCharacter &&
                sceneCharacter.endPosition
                    ? sceneCharacter.endPosition
                    : (
                        character &&
                        character.endPosition
                            ? character.endPosition
                            : "Center"
                    );

            const speed =
                sceneCharacter &&
                sceneCharacter.speed
                    ? sceneCharacter.speed
                    : 1;

            const progress =
                Math.min(
                    1,
                    Math.max(
                        0,
                        time /
                        Math.max(
                            1,
                            safeNumber(
                                scene.duration,
                                5
                            )
                        )
                    )
                );

            const startX =
                getPositionX(
                    startPosition,
                    canvas.width,
                    x
                );

            const endX =
                getPositionX(
                    endPosition,
                    canvas.width,
                    x
                );

            let animatedX =
                startX +
                (
                    endX -
                    startX
                ) *
                Math.min(
                    1,
                    progress * speed
                );

            let animatedY =
                y;

            const animation =
                sceneCharacter &&
                sceneCharacter.animation
                    ? sceneCharacter.animation
                    : (
                        scene.animation ||
                        "None"
                    );

            if (
                animation ===
                "Idle"
            ) {

                animatedY +=
                    Math.sin(
                        time * 2
                    ) * 8;
            }

            if (
                animation ===
                "Walk"
            ) {

                animatedY +=
                    Math.abs(
                        Math.sin(
                            time * 8
                        )
                    ) * -12;
            }

            if (
                animation ===
                "Run"
            ) {

                animatedY +=
                    Math.abs(
                        Math.sin(
                            time * 12
                        )
                    ) * -18;
            }

            if (
                animation ===
                "Action"
            ) {

                animatedY +=
                    Math.sin(
                        time * 5
                    ) * 25;
            }

            ctx.textAlign =
                "center";

            ctx.font =
                "90px Arial";

            ctx.fillText(
                emoji,
                animatedX,
                animatedY
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 28px Arial";

            ctx.fillText(
                name,
                animatedX,
                animatedY + 55
            );

            /*
             * Reset fill style for next item.
             */

            ctx.fillStyle =
                "#ffffff";
        }
    );
}

/* =========================================================
   POSITION HELPER
   ========================================================= */

function getPositionX(
    position,
    width,
    fallback
) {

    switch (
        String(
            position || ""
        ).toLowerCase()
    ) {

        case "left":
            return width * 0.20;

        case "center":
            return width * 0.50;

        case "right":
            return width * 0.80;

        default:
            return fallback;
    }
}

/* =========================================================
   DRAW CAPTIONS
   ========================================================= */

function drawPreviewCaptions(
    ctx,
    canvas,
    sceneIndex,
    time
) {

    const captions =
        Array.isArray(
            project.captions
        )
            ? project.captions
            : [];

    captions.forEach(
        function(caption) {

            if (
                Number(
                    caption.sceneIndex
                ) !==
                Number(sceneIndex)
            ) {
                return;
            }

            const start =
                safeNumber(
                    caption.start,
                    0
                );

            const end =
                safeNumber(
                    caption.end,
                    0
                );

            if (
                time < start ||
                time > end
            ) {
                return;
            }

            const boxWidth =
                Math.min(
                    canvas.width - 100,
                    1000
                );

            const boxHeight =
                90;

            const boxX =
                (
                    canvas.width -
                    boxWidth
                ) / 2;

            const boxY =
                canvas.height -
                150;

            ctx.fillStyle =
                "rgba(0,0,0,0.75)";

            ctx.fillRect(
                boxX,
                boxY,
                boxWidth,
                boxHeight
            );

            ctx.fillStyle =
                "#ffffff";

            ctx.font =
                "bold 38px Arial";

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
    );
}

/* =========================================================
   DRAW PREVIEW FRAME
   ========================================================= */

function drawPreviewFrame(
    canvas,
    ctx,
    time
) {

    const result =
        getSceneAtTime(
            time
        );

    if (!result) {

        ctx.fillStyle =
            "#111111";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return;
    }

    const scene =
        result.scene;

    const sceneIndex =
        result.index;

    const sceneTime =
        result.sceneTime;

    const duration =
        Math.max(
            1,
            safeNumber(
                scene.duration,
                5
            )
        );

    const progress =
        Math.min(
            1,
            sceneTime /
            duration
        );

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    let zoom =
        1;

    if (
        scene.camera ===
        "Zoom In"
    ) {

        zoom =
            1 +
            progress *
            0.20;

    } else if (
        scene.camera ===
        "Zoom Out"
    ) {

        zoom =
            1.20 -
            progress *
            0.20;
    }

    ctx.save();

    ctx.translate(
        canvas.width / 2,
        canvas.height / 2
    );

    ctx.scale(
        zoom,
        zoom
    );

    ctx.translate(
        -canvas.width / 2,
        -canvas.height / 2
    );

    drawPreviewBackground(
        ctx,
        canvas,
        scene,
        progress
    );

    drawPreviewCharacters(
        ctx,
        canvas,
        scene,
        sceneTime
    );

    ctx.restore();

    /*
     * Scene title.
     */

    ctx.fillStyle =
        "#ffffff";

    ctx.textAlign =
        "center";

    ctx.font =
        "bold 44px Arial";

    ctx.fillText(
        scene.title ||
        "Scene " +
        (sceneIndex + 1),
        canvas.width / 2,
        70
    );

    /*
     * Description.
     */

    if (scene.description) {

        ctx.font =
            "24px Arial";

        ctx.fillStyle =
            "#dddddd";

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
            110
        );
    }

    drawPreviewCaptions(
        ctx,
        canvas,
        sceneIndex,
        sceneTime
    );
}

/* =========================================================
   UPDATE ANIMATION PREVIEW
   ========================================================= */

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

    if (!canvas) {
        return;
    }

    const ctx =
        canvas.getContext(
            "2d"
        );

    if (!ctx) {
        return;
    }

    const totalDuration =
        getTotalProjectDuration();

    if (
        project.scenes.length ===
        0
    ) {

        ctx.fillStyle =
            "#111111";

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.textAlign =
            "center";

        ctx.font =
            "42px Arial";

        ctx.fillText(
            "No Scenes",
            canvas.width / 2,
            canvas.height / 2
        );

        if (durationEl) {
            durationEl.textContent =
                "0.0s";
        }

        if (currentTimeEl) {
            currentTimeEl.textContent =
                "0.0s";
        }

        return;
    }

    if (durationEl) {
        durationEl.textContent =
            totalDuration.toFixed(1) +
            "s";
    }

    if (timeline) {
        timeline.max =
            totalDuration;

        timeline.value =
            Math.min(
                previewPausedTime,
                totalDuration
            );
    }

    drawPreviewFrame(
        canvas,
        ctx,
        previewPausedTime
    );

    if (currentTimeEl) {
        currentTimeEl.textContent =
            previewPausedTime.toFixed(
                1
            ) +
            "s";
    }

    if (playBtn) {

        playBtn.onclick =
            function() {

                if (
                    previewIsPlaying
                ) {
                    return;
                }

                if (
                    previewPausedTime >=
                    totalDuration
                ) {
                    previewPausedTime =
                        0;
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

                    previewPausedTime =
                        (
                            timestamp -
                            previewStartTimestamp
                        ) / 1000;

                    if (
                        previewPausedTime >=
                        totalDuration
                    ) {

                        previewPausedTime =
                            totalDuration;

                        previewIsPlaying =
                            false;

                        drawPreviewFrame(
                            canvas,
                            ctx,
                            previewPausedTime
                        );

                        if (currentTimeEl) {
                            currentTimeEl.textContent =
                                previewPausedTime.toFixed(
                                    1
                                ) +
                                "s";
                        }

                        return;
                    }

                    drawPreviewFrame(
                        canvas,
                        ctx,
                        previewPausedTime
                    );

                    if (currentTimeEl) {
                        currentTimeEl.textContent =
                            previewPausedTime.toFixed(
                                1
                            ) +
                            "s";
                    }

                    if (timeline) {
                        timeline.value =
                            previewPausedTime;
                    }

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

                drawPreviewFrame(
                    canvas,
                    ctx,
                    0
                );

                if (currentTimeEl) {
                    currentTimeEl.textContent =
                        "0.0s";
                }

                if (timeline) {
                    timeline.value =
                        0;
                }
            };
    }

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
                    safeNumber(
                        timeline.value,
                        0
                    );

                drawPreviewFrame(
                    canvas,
                    ctx,
                    previewPausedTime
                );

                if (currentTimeEl) {
                    currentTimeEl.textContent =
                        previewPausedTime.toFixed(
                            1
                        ) +
                        "s";
                }
            };
    }

    if (volume) {

        volume.oninput =
            function() {

                console.log(
                    "Preview volume:",
                    volume.value
                );
            };
    }
}

/* =========================================================
   EXPORT VIDEO
   ========================================================= */

function exportVideo() {
    const status =
        $("exportStatus");

    const scenes =
        Array.isArray(
            project.scenes
        )
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

    if (
        typeof canvas.captureStream !==
        "function"
    ) {

        if (status) {
            status.textContent =
                "❌ Canvas video export is not supported.";
        }

        return;
    }

    if (
        !window.MediaRecorder
    ) {

        if (status) {
            status.textContent =
                "❌ Your browser does not support video export.";
        }

        return;
    }

    const ctx =
        canvas.getContext(
            "2d"
        );

    if (!ctx) {
        return;
    }

    const totalDuration =
        getTotalProjectDuration();

    project.status =
        "Exporting video...";

    updateProjectUI();

    if (status) {
        status.textContent =
            "🎬 Preparing video export...";
    }

    const canvasStream =
        canvas.captureStream(
            30
        );

    let mimeType =
        "";

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
        function(event) {

            if (
                event.data &&
                event.data.size > 0
            ) {

                chunks.push(
                    event.data
                );
            }
        };

    recorder.onerror =
        function(event) {

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

    recorder.onstop =
        function() {

            const blob =
                new Blob(
                    chunks,
                    {
                        type:
                            mimeType
                    }
                );

            const url =
                URL.createObjectURL(
                    blob
                );

            const download =
                document.createElement(
                    "a"
                );

            const safeName =
                (
                    project.name ||
                    "AI-Animated-Project"
                )
                .replace(
                    /[^a-z0-9-_]/gi,
                    "_"
                );

            download.href =
                url;

            download.download =
                safeName +
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

            } else if (
                status &&
                status.parentElement
            ) {

                status.parentElement.appendChild(
                    download
                );
            }

            project.status =
                "Video exported";

            updateProjectUI();

            if (status) {
                status.textContent =
                    "✅ Video exported successfully.";
            }

            download.click();

            canvasStream
                .getTracks()
                .forEach(
                    function(track) {
                        track.stop();
                    }
                );

            setTimeout(
                function() {
                    URL.revokeObjectURL(
                        url
                    );
                },
                60000
            );
        };

    previewIsPlaying =
        false;

    previewPausedTime =
        0;

    recorder.start();

    if (status) {
        status.textContent =
            "🔴 Recording animation...";
    }

    const startTime =
        performance.now();

    function renderExportFrame(
        timestamp
    ) {

        const elapsed =
            (
                timestamp -
                startTime
            ) / 1000;

        const drawTime =
            Math.min(
                elapsed,
                totalDuration
            );

        drawPreviewFrame(
            canvas,
            ctx,
            drawTime
        );

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

/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /* -----------------------------------------
           LOAD PROJECT
        ----------------------------------------- */

        loadProject();

        /* -----------------------------------------
           SIDEBAR NAVIGATION
        ----------------------------------------- */

        document.querySelectorAll(
            ".nav-item"
        ).forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        const page =
                            button.dataset.page;

                        if (page) {
                            showPage(
                                page
                            );
                        }
                    }
                );
            }
        );

        /* -----------------------------------------
           DASHBOARD BUTTONS
        ----------------------------------------- */

        document.querySelectorAll(
            ".dashboard-action"
        ).forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function(event) {

                        event.preventDefault();

                        const page =
                            button.dataset.page;

                        if (page) {
                            showPage(
                                page
                            );
                        }
                    }
                );
            }
        );

        /* -----------------------------------------
           NEW PROJECT
        ----------------------------------------- */

        if ($("newProjectBtn")) {
            $("newProjectBtn").onclick =
                openNewProject;
        }

        if ($("dashboardNewProject")) {
            $("dashboardNewProject").onclick =
                openNewProject;
        }

        /* -----------------------------------------
           CLOSE MODAL
        ----------------------------------------- */

        if ($("closeModalBtn")) {
            $("closeModalBtn").onclick =
                closeNewProject;
        }

        /* -----------------------------------------
           CREATE PROJECT
        ----------------------------------------- */

        if ($("createProjectBtn")) {
            $("createProjectBtn").onclick =
                createProject;
        }

        /* -----------------------------------------
           STORY
        ----------------------------------------- */

        if ($("saveStoryBtn")) {
            $("saveStoryBtn").onclick =
                saveStory;
        }

        if ($("storyToScenesBtn")) {
            $("storyToScenesBtn").onclick =
                createScenes;
        }

        /* -----------------------------------------
           SCENES
        ----------------------------------------- */

        if ($("addSceneBtn")) {
            $("addSceneBtn").onclick =
                addScene;
        }

        /* -----------------------------------------
           CHARACTERS
        ----------------------------------------- */

        if ($("addCharacterBtn")) {
            $("addCharacterBtn").onclick =
                addCharacter;
        }

        /* -----------------------------------------
           BACKGROUNDS
        ----------------------------------------- */

        if ($("addBackgroundBtn")) {
            $("addBackgroundBtn").onclick =
                addBackground;
        }

        /* -----------------------------------------
           CAPTIONS
        ----------------------------------------- */

        if ($("addCaptionBtn")) {
            $("addCaptionBtn").onclick =
                addCaption;
        }

        if ($("clearCaptionsBtn")) {
            $("clearCaptionsBtn").onclick =
                clearCaptions;
        }

        /* -----------------------------------------
           VOICE
        ----------------------------------------- */

        if ($("generateVoiceBtn")) {
            $("generateVoiceBtn").onclick =
                generateVoice;
        }

        if ($("recordVoiceBtn")) {
            $("recordVoiceBtn").onclick =
                recordVoice;
        }

        /* -----------------------------------------
           SETTINGS
        ----------------------------------------- */

        if ($("saveSettingsBtn")) {
            $("saveSettingsBtn").onclick =
                saveSettings;
        }

        /* -----------------------------------------
           EXPORT
        ----------------------------------------- */

        if ($("exportVideoBtn")) {
            $("exportVideoBtn").onclick =
                exportVideo;
        }

        /* -----------------------------------------
           SAVE PROJECT
        ----------------------------------------- */

        if ($("saveProjectBtn")) {
            $("saveProjectBtn").onclick =
                saveProject;
        }

        /* -----------------------------------------
           MODAL BACKGROUND CLICK
        ----------------------------------------- */

        const modal =
            $("newProjectModal");

        if (modal) {

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        closeNewProject();
                    }
                }
            );
        }

        /* -----------------------------------------
           ESCAPE
        ----------------------------------------- */

        document.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeNewProject();
                }
            }
        );

        /* -----------------------------------------
           KEYBOARD SAVE
        ----------------------------------------- */

        document.addEventListener(
            "keydown",
            function(event) {

                if (
                    (
                        event.ctrlKey ||
                        event.metaKey
                    ) &&
                    event.key.toLowerCase() ===
                    "s"
                ) {

                    event.preventDefault();

                    saveProject();
                }
            }
        );

        /* -----------------------------------------
           FINAL REFRESH
        ----------------------------------------- */

        updateProjectUI();
        updateStoryUI();
        renderScenes();
        renderCharacters();
        renderCaptions();
        renderBackgrounds();

        refreshCaptionScenes();
        initSceneEditor();
        setupAnimationControls();
        initMusicModule();

        showPage(
            "dashboard"
        );

        console.log(
            "AI Animated Studio ready."
        );
    }
);
// =====================================================
// AI ANIMATED STUDIO
// BACKGROUNDS MODULE
// =====================================================

(function initBackgroundsModule() {
  "use strict";

  const addBackgroundBtn =
    document.getElementById("addBackgroundBtn");

  if (!addBackgroundBtn) {
    console.warn(
      "Backgrounds module: addBackgroundBtn not found."
    );
    return;
  }

  if (!Array.isArray(project.backgrounds)) {
    project.backgrounds = [];
  }

  function saveBackgroundProject() {
    try {
      localStorage.setItem(
        "aiAnimatedStudioProject",
        JSON.stringify(project)
      );
    } catch (error) {
      console.error("Background save error:", error);
    }
  }

  function renderBackgrounds() {
    const container =
      document.getElementById("backgroundList");

    if (!container) {
      return;
    }

    if (!project.backgrounds.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div>🌄</div>
          <h3>No backgrounds yet</h3>
          <p>Add your first background.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = project.backgrounds
      .map((background, index) => {
        const safeName = escapeHTML(
          background.name || `Background ${index + 1}`
        );

        const imageHTML = background.image
          ? `
            <img
              src="${background.image}"
              alt="${safeName}"
              style="
                width:100%;
                height:180px;
                object-fit:cover;
                border-radius:10px;
                margin-bottom:14px;
                display:block;
              "
            >
          `
          : `
            <div
              style="
                width:100%;
                height:180px;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#17213a;
                border-radius:10px;
                font-size:50px;
                margin-bottom:14px;
              "
            >
              🌄
            </div>
          `;

        return `
          <div class="character-card">
            ${imageHTML}

            <h3>${safeName}</h3>

            <div class="button-row">
              <button
                type="button"
                class="secondary-btn"
                data-background-delete="${index}">
                🗑️ Delete
              </button>
            </div>
          </div>
        `;
      })
      .join("");

    container
      .querySelectorAll("[data-background-delete]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(
            button.getAttribute(
              "data-background-delete"
            )
          );

          deleteBackground(index);
        });
      });
  }

  function addBackground() {
    const name = prompt(
      "Enter background name:",
      `Background ${project.backgrounds.length + 1}`
    );

    if (name === null) {
      return;
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Please enter a background name.");
      return;
    }

    project.backgrounds.push({
      id:
        "background-" +
        Date.now() +
        "-" +
        Math.random().toString(36).slice(2, 8),

      name: trimmedName,

      image: "",

      createdAt: new Date().toISOString()
    });

    saveBackgroundProject();
    renderBackgrounds();
    updateProjectUI();

    showBackgroundStatus(
      `✅ "${trimmedName}" added successfully.`
    );
  }

  function deleteBackground(index) {
    if (
      index < 0 ||
      index >= project.backgrounds.length
    ) {
      return;
    }

    const background =
      project.backgrounds[index];

    const confirmed = confirm(
      `Delete "${background.name}"?`
    );

    if (!confirmed) {
      return;
    }

    project.backgrounds.splice(index, 1);

    saveBackgroundProject();
    renderBackgrounds();
    updateProjectUI();

    showBackgroundStatus(
      "Background deleted."
    );
  }

  function showBackgroundStatus(message) {
    const status =
      document.getElementById("backgroundStatus");

    if (status) {
      status.textContent = message;

      setTimeout(() => {
        if (status) {
          status.textContent = "";
        }
      }, 3000);
    }
  }

  addBackgroundBtn.addEventListener(
    "click",
    addBackground
  );

  renderBackgrounds();

  window.renderBackgrounds =
    renderBackgrounds;

  window.addBackground =
    addBackground;

  window.deleteBackground =
    deleteBackground;

})();

// =====================================================
// AI ANIMATED STUDIO
// SCENE EDITOR INTEGRATION
// =====================================================

(function initSceneEditorModule() {
  "use strict";

  const sceneSelect =
    document.getElementById("editorSceneSelect");

  const backgroundSelect =
    document.getElementById("editorBackgroundSelect");

  const characterSelect =
    document.getElementById("editorCharacterSelect");

  const cameraSelect =
    document.getElementById("editorCameraSelect");

  const animationSelect =
    document.getElementById("editorAnimationSelect");

  const descriptionInput =
    document.getElementById("editorSceneDescription");

  const dialogueInput =
    document.getElementById("editorSceneDialogue");

  const durationInput =
    document.getElementById("editorSceneDuration");

  const saveBtn =
    document.getElementById("saveEditorSceneBtn");

  const refreshBtn =
    document.getElementById("refreshEditorBtn");

  const status =
    document.getElementById("sceneEditorStatus");


  // -----------------------------------------------------
  // CHECK REQUIRED ELEMENTS
  // -----------------------------------------------------

  if (
    !sceneSelect ||
    !backgroundSelect ||
    !characterSelect ||
    !cameraSelect ||
    !animationSelect ||
    !descriptionInput ||
    !dialogueInput ||
    !durationInput ||
    !saveBtn
  ) {
    console.warn(
      "Scene Editor: required elements not found."
    );
    return;
  }


  // -----------------------------------------------------
  // PROJECT DATA
  // -----------------------------------------------------

  if (!Array.isArray(project.scenes)) {
    project.scenes = [];
  }

  if (!Array.isArray(project.backgrounds)) {
    project.backgrounds = [];
  }

  if (!Array.isArray(project.characters)) {
    project.characters = [];
  }


  // -----------------------------------------------------
  // STATUS
  // -----------------------------------------------------

  function showStatus(message, isError = false) {
    if (!status) {
      return;
    }

    status.textContent = message;

    status.style.color = isError
      ? "var(--danger)"
      : "var(--success)";

    setTimeout(() => {
      if (status) {
        status.textContent = "";
      }
    }, 3000);
  }


  // -----------------------------------------------------
  // SAVE PROJECT
  // -----------------------------------------------------

  function saveEditorProject() {
    try {
      localStorage.setItem(
        "aiAnimatedStudioProject",
        JSON.stringify(project)
      );
    } catch (error) {
      console.error(
        "Scene Editor save error:",
        error
      );
    }
  }


  // -----------------------------------------------------
  // LOAD SCENES
  // -----------------------------------------------------

  function loadSceneOptions() {
    sceneSelect.innerHTML = `
      <option value="">
        Select a scene
      </option>
    `;

    project.scenes.forEach((scene, index) => {
      const option =
        document.createElement("option");

      option.value = String(index);

      option.textContent =
        scene.title ||
        `Scene ${index + 1}`;

      sceneSelect.appendChild(option);
    });
  }


  // -----------------------------------------------------
  // LOAD BACKGROUNDS
  // -----------------------------------------------------

  function loadBackgroundOptions() {
    backgroundSelect.innerHTML = `
      <option value="">
        Select background
      </option>
    `;

    project.backgrounds.forEach(
      (background, index) => {
        const option =
          document.createElement("option");

        option.value = String(index);

        option.textContent =
          background.name ||
          `Background ${index + 1}`;

        backgroundSelect.appendChild(
          option
        );
      }
    );
  }


  // -----------------------------------------------------
  // LOAD CHARACTERS
  // -----------------------------------------------------

  function loadCharacterOptions() {
    characterSelect.innerHTML = `
      <option value="">
        Select character
      </option>
    `;

    project.characters.forEach(
      (character, index) => {
        const option =
          document.createElement("option");

        option.value = String(index);

        option.textContent =
          character.name ||
          `Character ${index + 1}`;

        characterSelect.appendChild(
          option
        );
      }
    );
  }


  // -----------------------------------------------------
  // LOAD ALL OPTIONS
  // -----------------------------------------------------

  function refreshEditor() {
    loadSceneOptions();
    loadBackgroundOptions();
    loadCharacterOptions();

    clearEditor();

    showStatus(
      "Editor refreshed."
    );
  }


  // -----------------------------------------------------
  // CLEAR EDITOR
  // -----------------------------------------------------

  function clearEditor() {
    sceneSelect.value = "";

    backgroundSelect.value = "";

    characterSelect.value = "";

    cameraSelect.value = "Static";

    animationSelect.value = "None";

    descriptionInput.value = "";

    dialogueInput.value = "";

    durationInput.value = "5";
  }


  // -----------------------------------------------------
  // LOAD SELECTED SCENE
  // -----------------------------------------------------

  function loadSelectedScene() {
    const index =
      Number(sceneSelect.value);

    if (
      sceneSelect.value === "" ||
      !project.scenes[index]
    ) {
      clearEditor();
      return;
    }

    const scene =
      project.scenes[index];


    // Background
    if (
      scene.backgroundIndex !== undefined
    ) {
      backgroundSelect.value =
        String(scene.backgroundIndex);
    } else {
      backgroundSelect.value = "";
    }


    // Character
    if (
      scene.characterIndex !== undefined
    ) {
      characterSelect.value =
        String(scene.characterIndex);
    } else {
      characterSelect.value = "";
    }


    // Camera
    cameraSelect.value =
      scene.camera || "Static";


    // Animation
    animationSelect.value =
      scene.animation || "None";


    // Description
    descriptionInput.value =
      scene.description || "";


    // Dialogue
    dialogueInput.value =
      scene.dialogue || "";


    // Duration
    durationInput.value =
      scene.duration || 5;
  }


  // -----------------------------------------------------
  // SAVE EDITOR SCENE
  // -----------------------------------------------------

  function saveEditorScene() {
    if (sceneSelect.value === "") {
      showStatus(
        "Please select a scene first.",
        true
      );
      return;
    }

    const index =
      Number(sceneSelect.value);

    const scene =
      project.scenes[index];

    if (!scene) {
      showStatus(
        "Selected scene not found.",
        true
      );
      return;
    }


    scene.backgroundIndex =
      backgroundSelect.value === ""
        ? null
        : Number(backgroundSelect.value);


    scene.characterIndex =
      characterSelect.value === ""
        ? null
        : Number(characterSelect.value);


    scene.camera =
      cameraSelect.value;


    scene.animation =
      animationSelect.value;


    scene.description =
      descriptionInput.value.trim();


    scene.dialogue =
      dialogueInput.value.trim();


    const duration =
      Number(durationInput.value);

    scene.duration =
      Number.isFinite(duration) &&
      duration > 0
        ? duration
        : 5;


    saveEditorProject();


    // Update other UI
    if (
      typeof renderScenes === "function"
    ) {
      renderScenes();
    }

    if (
      typeof updateProjectUI === "function"
    ) {
      updateProjectUI();
    }


    showStatus(
      "✅ Scene saved successfully."
    );
  }


  // -----------------------------------------------------
  // EVENTS
  // -----------------------------------------------------

  sceneSelect.addEventListener(
    "change",
    loadSelectedScene
  );

  saveBtn.addEventListener(
    "click",
    saveEditorScene
  );

  if (refreshBtn) {
    refreshBtn.addEventListener(
      "click",
      refreshEditor
    );
  }


  // -----------------------------------------------------
  // INITIALIZE
  // -----------------------------------------------------

  loadSceneOptions();
  loadBackgroundOptions();
  loadCharacterOptions();


  // -----------------------------------------------------
  // GLOBAL ACCESS
  // -----------------------------------------------------

  window.refreshSceneEditor =
    refreshEditor;

  window.loadSelectedEditorScene =
    loadSelectedScene;

  window.saveEditorScene =
    saveEditorScene;

})();
