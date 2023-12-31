let handle = null;
let latest_contest_id = 0;

let is_logged_in = false;
let is_music_on = true;

const musicButton = document.getElementById("music-button");
const loginButton = document.getElementById("login-button");
const mainElement = document.getElementById("main");
const lightBar = document.getElementById("light-bar");
const light = document.getElementById("light");

function resetMain() {
    mainElement.innerHTML = "";
    const pre1 = document.createElement("pre");
    pre1.textContent = '+═════════+════════════════════════════════════════+═══════+═══════════+═════════════+══════════+';
    mainElement.appendChild(pre1);
    const pre2 = document.createElement("pre");
    pre2.textContent = '║ VERDICT ║ PROBLEM NAME                           ║ TESTS ║ TIME (ms) ║ MEMORY (KB) ║ LANGUAGE ║';
    mainElement.appendChild(pre2);
    const pre3 = document.createElement("pre");
    pre3.textContent = '+═════════+════════════════════════════════════════+═══════+═══════════+═════════════+══════════+';
    mainElement.appendChild(pre3);
}

function reset() {
    handle = null;
    latest_contest_id = 0;
    is_logged_in = false;
    is_music_on = true;

    loginButton.innerHTML = "Login";
    loginButton.style.backgroundColor = "#0f0";

    resetMain();
}

function getHandle() {
    if (is_logged_in) {
        reset();
    } else {
        handle = prompt("Enter your Codeforces Handle", "barvay");
        if (handle.length > 0) {
            is_logged_in = true;
            loginButton.innerHTML = "Logout";
            loginButton.style.backgroundColor = "#f00";
        } else {
            reset();
        }
    }
}

function toggleMusic() {
    if (is_music_on) {
        musicButton.style.backgroundColor = "lightcoral";
        is_music_on = false;
    } else {
        musicButton.style.backgroundColor = "lightgreen";
        is_music_on = true;
    }
}

function formatString(inputString, width) {
    const padding = Math.max(0, width - inputString.length);
    const paddingLeft = Math.floor(padding / 2);
    const paddingRight = padding - paddingLeft;

    const formattedString = inputString
        .padStart(inputString.length + paddingLeft, ' ')
        .padEnd(width, ' ');

    return formattedString;
}

function verdictToTag(verdict) {
    switch (verdict) {
        case "OK":
            return `[ACC]`;
        case "WRONG_ANSWER":
            return `[WA_]`;
        case "TIME_LIMIT_EXCEEDED":
            return `[TLE]`;
        case "MEMORY_LIMIT_EXCEEDED":
            return `[MLE]`;
        case "RUNTIME_ERROR":
            return `[RTE]`;
        case "COMPILATION_ERROR":
            return `[CE_]`;
        case "IDLENESS_LIMIT_EXCEEDED":
            return `[ILE]`;
        case "TESTING":
            return `[TST]`;
        default:
            return `[???]`;
    }
}

function scrollToBottom() {
    mainElement.scrollTop = mainElement.scrollHeight;
}

function displaySubmission(submission) {
    document.title = `CFSN says: ${verdictToTag(submission.verdict)}`;
    const pre = document.createElement("pre");

    pre.textContent = '|' + formatString(verdictToTag(submission.verdict), 9) 
                    + '|' + ` ${submission.problem.index} - ${submission.problem.name} `.padEnd(40, ' ')
                    + '|' + formatString(submission.passedTestCount.toString(), 7)
                    + '|' + formatString(submission.timeConsumedMillis.toString(), 11)
                    + '|' + formatString(submission.memoryConsumedBytes.toString(), 13)
                    + '|' + formatString(submission.programmingLanguage, 10)
                    + '|';
    pre.style.color = submission.verdict === "OK" ? "lightgreen" : "lightcoral";
    mainElement.appendChild(pre);

    const divider = document.createElement("pre");
    divider.textContent = '+─────────+────────────────────────────────────────+───────+───────────+─────────────+──────────+';
    mainElement.appendChild(divider);
    scrollToBottom();
}

function playMusic(verdict) {
    if (verdict === "OK") {
        const audio = new Audio('assets/sounds/ac.mp3');
        audio.volume = 0.5;
        audio.play();
    } else {
        const audio = new Audio('assets/sounds/fail.mp3');
        audio.volume = 0.5;
        audio.play();
    }
}

function vfx(bpm, duration, color) {
    const originalColor = light.style.color
  
    let flashingInterval = setInterval(() => {
        lightBar.style.boxShadow = `0 0 20px 10px ${color}`;
        light.style.color = color
        setTimeout(() => {
            lightBar.style.boxShadow = "none";
            light.style.color = originalColor
        }, bpm / 2);
    }, bpm);
  
    setTimeout(() => {
        clearInterval(flashingInterval);
        lightBar.style.boxShadow = "none";
        light.style.color = originalColor
    }, duration);
}

async function getSunmission() {
    if (!is_logged_in) {
        return;
    }

    /**
     * @see https://codeforces.com/apiHelp/methods#user.status
     */
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1`);
    const data = await response.json();

    if (data.status !== "OK") {
        return;
    }

    const submission = data.result[0];
    if (submission.id <= latest_contest_id) {
        return;
    }

    if (submission.verdict === "TESTING" || submission.verdict === "" || submission.verdict === null) {
        return;
    }

    latest_contest_id = submission.id;
    displaySubmission(submission);
    if (submission.verdict == "OK") {
        vfx(405, 8200, "#0f0");
    } else {
        vfx(405, 12000, "#f00");
    }
    playMusic(submission.verdict); 
}

/**
 * Control from here...
 */
reset();
setInterval(getSunmission, 5000);