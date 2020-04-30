const WHITE_KEYS = [
  "q",
  "w",
  "e",
  "r",
  "t",
  "y",
  "u",
  "z",
  "x",
  "c",
  "v",
  "b",
  "n",
  "m",
  ",",
];
const BLACK_KEYS = ["2", "3", "5", "6", "7", "s", "d", "g", "h", "j"];

const recordButton = document.querySelector(".record-button");
const playButton = document.querySelector(".play-button");
const saveButton = document.querySelector(".save-button");
const songLink = document.querySelector(".song-link");

const keys = document.querySelectorAll(".key");
const whiteKeys = document.querySelectorAll(".key.white");
const blackKeys = document.querySelectorAll(".key.black");

const keyMap = [...keys].reduce((map, key) => {
  map[key.dataset.note] = key;
  return map;
}, {});

let recordingStartTime;
let noteStartTime;
let noteEndTime;
let songNotes = currentSong && currentSong.notes;

const synth = new Tone.Synth();
synth.oscillator.type = "triangle";

synth.toMaster();

keys.forEach((key) => {
  key.addEventListener("mousedown", () => pressNote(key));
  key.addEventListener("mouseup", () => releaseNote(key));
});

if (recordButton) {
  recordButton.addEventListener("click", toggleRecording);
}

if (saveButton) {
  saveButton.addEventListener("click", saveSong);
}

playButton.addEventListener("click", playSong);

function toggleRecording() {
  recordButton.classList.toggle("active");
  if (isRecording()) {
    startRecording();
  } else {
    stopRecording();
  }
}

function isRecording() {
  return recordButton != null && recordButton.classList.contains("active");
}

function startRecording() {
  recordingStartTime = Date.now();
  songNotes = [];
  playButton.classList.remove("show");
  saveButton.classList.remove("show");
}

function stopRecording() {
  playSong();
  playButton.classList.add("show");
  saveButton.classList.add("show");
}

function playSong() {
  if (songNotes.length === 0) return;

  songNotes.forEach((note) => {
    setTimeout(() => {
      pressNote(keyMap[note.key]);
    }, note.startTime);
    setTimeout(() => {
      releaseNote(keyMap[note.key]);
    }, note.endTime);
  });
}

let keysPressed = [];

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;

  const key = e.key;
  keysPressed.push(key);

  console.log(keysPressed);

  const whiteKeyIndex = WHITE_KEYS.indexOf(key);
  const blackKeyIndex = BLACK_KEYS.indexOf(key);

  if (whiteKeyIndex > -1) pressNote(whiteKeys[whiteKeyIndex]);
  if (blackKeyIndex > -1) pressNote(blackKeys[blackKeyIndex]);
});

document.addEventListener("keyup", (e) => {
  const key = e.key;

  const index = keysPressed.indexOf(key);
  if (index > -1) {
    keysPressed.splice(index, 1);
  }

  const whiteKeyIndex = WHITE_KEYS.indexOf(key);
  const blackKeyIndex = BLACK_KEYS.indexOf(key);

  if (whiteKeyIndex > -1) releaseNote(whiteKeys[whiteKeyIndex]);
  if (blackKeyIndex > -1) releaseNote(blackKeys[blackKeyIndex]);
});

function pressNote(key) {
  noteStartTime = Date.now();
  key.classList.add("active");
  synth.triggerAttack(key.dataset.note);
}

function releaseNote(key) {
  noteEndTime = Date.now();
  if (isRecording()) recordNote(key.dataset.note);

  key.classList.remove("active");
  synth.triggerRelease();
}

function recordNote(note) {
  songNotes.push({
    key: note,
    startTime: noteStartTime - recordingStartTime,
    endTime: noteEndTime - recordingStartTime,
  });
}

function saveSong() {
  axios.post("/songs", { songNotes: songNotes }).then((res) => {
    songLink.classList.add("show");
    songLink.href = `/songs/${res.data._id}`;
  });
}
