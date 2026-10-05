(async function() {
  console.log("%cAditszz Eagle Eye EXECUTED!!!", "color: red; font-weight: bold; font-size: 16px;");

  const video = document.querySelector('video');
  if (!video) return console.log("Video tidak ditemukan!");

  video.playbackRate = 1.0;
  video.currentTime = 0;
  await video.play();

  // 1. Setup Canvas 4K Ultra HD (2160 x 3840)
  const canvas = document.createElement('canvas');
  canvas.width = 2160;
  canvas.height = 3840;

  // Mode desynchronized + matikan smoothing biar ramah GPU
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  ctx.imageSmoothingEnabled = false;

  // 2. Render Loop Sync
  let renderLoop = true;
  function drawFrame() {
    if (renderLoop) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      if ('requestVideoFrameCallback' in video) {
        video.requestVideoFrameCallback(drawFrame);
      } else {
        requestAnimationFrame(drawFrame);
      }
    }
  }
  drawFrame();

  // 3. Kunci Stream di 30 FPS
  const canvasStream = canvas.captureStream(30);
  const videoStream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
  const audioTracks = videoStream.getAudioTracks();
  if (audioTracks.length > 0) canvasStream.addTrack(audioTracks[0]);

  // 4. Codec H.264 dengan Bitrate 25 Mbps
  let mimeType = 'video/mp4;codecs=avc1.640033';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') 
      ? 'video/mp4;codecs=avc1' 
      : 'video/webm;codecs=vp9';
  }

  const recorder = new MediaRecorder(canvasStream, {
    mimeType: mimeType,
    videoBitsPerSecond: 25000000, // Bitrate dinaikkan ke 25 Mbps
    audioBitsPerSecond: 192000
  });

  const chunks = [];
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

  recorder.onstop = () => {
    renderLoop = false;
    const isMp4 = mimeType.includes('mp4');
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story_4k_30fps_25mbps_${Date.now()}.${isMp4 ? 'mp4' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    console.log("%c[BERHASIL] Tersimpan 4K @ 25 Mbps!", "color: #00ff00; font-weight: bold;");
  };

  recorder.start(100);

  const stopRecording = () => {
    if (recorder.state === 'recording') recorder.stop();
  };

  video.addEventListener('ended', stopRecording, { once: true });
  const checkEnded = setInterval(() => {
    if (video.ended || (video.duration && video.currentTime >= video.duration - 0.3)) {
      clearInterval(checkEnded);
      stopRecording();
    }
  }, 200);
})();