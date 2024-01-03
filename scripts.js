var handle = null;
var loggedIn = false;
var lastSubmission = 0;

const lightbarElement = document.getElementById('lightbar');
function inflateLightBar() {
    const windowWidth = window.innerWidth;
    const currentWidth = lightbarElement.getBoundingClientRect().width;

    if (currentWidth < windowWidth) {
        lightbarElement.innerHTML += "_";
        inflateLightBar();
    }
}

const loginButton = document.getElementById('login-button');
function getHandle() {
    if (loggedIn) {
        handle = null;
        mainElement.innerHTML = "";
        lastSubmission = 0;
        loggedIn = false;
        loginButton.textContent = "Login ";
    } else { 
        let val = prompt("Enter your handle", "barvay");
        if (val == null || val == "") {
            alert("Enter a valid handle")
            return;
        }
        handle = val;
        loggedIn = true;
        getSubmission();
        loginButton.textContent = "Logout";
    }
}

function abbreviateVerdict(verdict) {
    switch (verdict) {
        case "FAILED": return "FAILED";
        case "OK": return "AC";
        case "PARTIAL": return "PARTIAL";
        case "COMPILATION_ERROR": return "CE";
        case "RUNTIME_ERROR": return "RE";
        case "WRONG_ANSWER": return "WA";
        case "PRESENTATION_ERROR": return "PE";
        case "TIME_LIMIT_EXCEEDED": return "TLE";
        case "MEMORY_LIMIT_EXCEEDED": return "MLE";
        case "IDLENESS_LIMIT_EXCEEDED": return "ILE";
        case "SECURITY_VIOLATED": return "SV";
        case "CRASHED": return "CRASHED";
        case "INPUT_PREPARATION_CRASHED": return "IPC";
        case "CHALLENGED": return "CH";
        case "SKIPPED": return "SKIPPED";
        case "TESTING": return "TESTING";
        case "REJECTED": return "REJ";
        default: return verdict;
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

const mainElement = document.getElementById('main');
function scrollToBottom() {
    mainElement.scrollTop = mainElement.scrollHeight;
}

function displaySubmission(submission) {
    const pre = document.createElement('pre');

    const verdict = formatString(abbreviateVerdict(submission.verdict), 9);
    const problemName = ` ${submission.problem.index} - ${submission.problem.name}`.padEnd(35, ' ');
    const tests = formatString(submission.passedTestCount.toString(), 7);
    const time = formatString(submission.timeConsumedMillis.toString(), 11);
    const memory = formatString(submission.memoryConsumedBytes.toString(), 13);
    const language = formatString(submission.programmingLanguage, 10);

    pre.style.color = submission.verdict === "OK" ? "lightgreen" : "lightcoral";

    pre.textContent = `  |${verdict}|${problemName}|${tests}|${time}|${memory}|${language}|`;
    mainElement.appendChild(pre);

    const sep = document.createElement('pre');
    sep.textContent = "  +---------+-----------------------------------+-------+-----------+-------------+----------+";
    mainElement.appendChild(sep);
    scrollToBottom();

    document.title = `${abbreviateVerdict(submission.verdict)}: ${submission.problem.index}`;
}

const acAudio = document.getElementById('ac-audio');
const failAudio = document.getElementById('fail-audio');
async function playMusic(verdict) {
    const audio = verdict === "OK" ? acAudio : failAudio;
    audio.volume = 0.1;
    await audio.play();
}

const copyElement = document.getElementById('copy');
async function vfx(verdict, duration) {
    const waittime = 290;
    const timeout = duration * 1000 / (waittime*2);
    const originalColor = lightbarElement.style.color;
    const color = verdict === "OK" ? "#0f0" : "#f00";

    for (let i = 0; i < timeout; i++) {
        copyElement.style.color = color;
        lightbarElement.style.color = color;
        lightbarElement.style.textShadow = `0 0 1px ${color}, 0 0 3px ${color}, 0 0 5px ${color}, 0 0 7px ${color}, 0 0 10px ${color}, 0 0 15px ${color}, 0 0 20px ${color}, 0 0 30px ${color}, 0 0 40px ${color}, 0 0 50px ${color}, 0 0 75px ${color}`;
        
        await new Promise(resolve => setTimeout(resolve, waittime));

        copyElement.style.color = "#111";
        lightbarElement.style.color = originalColor;
        lightbarElement.style.textShadow = "none";

        await new Promise(resolve => setTimeout(resolve, waittime));
    }
}

async function getSubmission() {
    if (!loggedIn) return;

    /**
     * @see https://codeforces.com/apiHelp/methods#user.status
     */
    const response = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=1`);
    const data = await response.json();

    if (data.status != "OK") return;

    const submission = data.result[0];

    if (submission.id <= lastSubmission) return;
    if (submission.verdict === "TESTING" || submission.verdict === "" || submission.verdict === null) return;

    lastSubmission = submission.id;
    displaySubmission(submission);
    playMusic(submission.verdict);
    vfx(submission.verdict, submission.verdict === "OK" ? 12 : 9);
}

/**
 * Control from here...
 */

inflateLightBar();
window.addEventListener('resize', inflateLightBar);
setInterval(getSubmission, 3000);