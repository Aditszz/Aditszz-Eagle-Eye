(async function() {
  console.log("%cAditszz Eagle Eye EXECUTED!!!", "color: red; font-weight: bold; font-size: 16px;");

  const video = document.querySelector('video');
  if (!video) return console.log("Video tidak ditemukan!");

  video.currentTime = 0;
  await video.play();

  // Ambil stream langsung dari video player (Zero Canvas Overhead)
  const stream = video.captureStream ? video.captureStream(30) : video.mozCaptureStream(30);

  // Kunci Codec ke MP4 (H.264) kalau didukung browser
  let mimeType = 'video/mp4;codecs=avc1.640033';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') 
      ? 'video/mp4;codecs=avc1' 
      : 'video/webm;codecs=vp9';
  }

  const options = {
    mimeType: mimeType,
    videoBitsPerSecond: 25000000, // 25 Mbps bitrates tajam tanpa bikin lag
    audioBitsPerSecond: 192000
  };

  const recorder = new MediaRecorder(stream, options);
  const chunks = [];

  recorder.ondataavailable = e => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const isMp4 = mimeType.includes('mp4');
    const blob = new Blob(chunks, { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `story_native_max_fps_${Date.now()}.${isMp4 ? 'mp4' : 'webm'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    console.log("%c[BERHASIL] Tersimpan dengan FPS Native Maksimal!", "color: #00ff00; font-weight: bold;");
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