// 视频控制函数
function playVideo() {
    const video = document.getElementById('introVideo');
    video.play();
}

function pauseVideo() {
    const video = document.getElementById('introVideo');
    video.pause();
}

function restartVideo() {
    const video = document.getElementById('introVideo');
    video.currentTime = 0;
    video.play();
}