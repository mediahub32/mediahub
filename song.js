const songs = [
    {
        title: "Dreams",
        artist: "My Artist",
        file: "songs/song1.mp3"
    },

    {
        title: "Night Drive",
        artist: "My Artist",
        file: "songs/song2.mp3"
    },

    {
        title: "Summer",
        artist: "My Artist",
        file: "songs/song3.mp3"
    }
];

let currentSong = 0;

const audio = document.getElementById("audio");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const playlist = document.getElementById("playlist");
const cover = document.querySelector(".cover");


function loadSong(index) {

    currentSong = index;

    const song = songs[currentSong];

    title.innerText = song.title;
    artist.innerText = song.artist;

    audio.src = song.file;

    createPlaylist();
}


function playPause() {

    if (audio.paused) {

        audio.play();

        playBtn.innerText = "⏸";
        cover.classList.add("playing");

    } else {

        audio.pause();

        playBtn.innerText = "▶";
        cover.classList.remove("playing");

    }
}


function nextSong() {

    currentSong++;

    if (currentSong >= songs.length) {
        currentSong = 0;
    }

    loadSong(currentSong);

    audio.play();

    playBtn.innerText = "⏸";
    cover.classList.add("playing");
}


function previousSong() {

    currentSong--;

    if (currentSong < 0) {
        currentSong = songs.length - 1;
    }

    loadSong(currentSong);

    audio.play();

    playBtn.innerText = "⏸";
    cover.classList.add("playing");
}


audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    const percent =
        (audio.currentTime / audio.duration) * 100;

    progress.value = percent;

    current.innerText =
        formatTime(audio.currentTime);

});


audio.addEventListener("loadedmetadata", () => {

    duration.innerText =
        formatTime(audio.duration);

});


progress.addEventListener("input", () => {

    audio.currentTime =
        (progress.value / 100) * audio.duration;

});


volume.addEventListener("input", () => {

    audio.volume = volume.value;

});


audio.addEventListener("ended", () => {

    nextSong();

});


function formatTime(seconds) {

    let minutes =
        Math.floor(seconds / 60);

    let secs =
        Math.floor(seconds % 60);

    if (secs < 10) {
        secs = "0" + secs;
    }

    return minutes + ":" + secs;
}


function createPlaylist() {

    playlist.innerHTML = "";

    songs.forEach((song, index) => {

        const div =
            document.createElement("div");

        div.className = "song";

        if (index === currentSong) {
            div.classList.add("active");
        }

        div.innerHTML = `
            <span>
                🎵 ${song.title}
            </span>

            <small>
                ${song.artist}
            </small>
        `;

        div.onclick = () => {

            loadSong(index);

            audio.play();

            playBtn.innerText = "⏸";
            cover.classList.add("playing");

        };

        playlist.appendChild(div);

    });

}


loadSong(0);