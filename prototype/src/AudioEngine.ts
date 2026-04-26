export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: any = null;
  private stream: MediaStream | null = null;

  public isInitialized = false;

  async init() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isInitialized = true;
      console.log('Audio Engine Initialized');
    } catch (err) {
      console.error('Error initializing audio engine:', err);
    }
  }

  getAudioData() {
    if (!this.analyser || !this.dataArray) return { bass: 0, mids: 0, treble: 0 };

    this.analyser.getByteFrequencyData(this.dataArray);

    let bass = 0;
    let mids = 0;
    let treble = 0;

    const len = this.dataArray.length;
    for (let i = 0; i < len; i++) {
      if (i < len * 0.2) bass += this.dataArray[i];
      else if (i < len * 0.7) mids += this.dataArray[i];
      else treble += this.dataArray[i];
    }

    return {
      bass: Math.pow(bass / (len * 0.2 * 255), 2.0) * 1.0,
      mids: Math.pow(mids / (len * 0.5 * 255), 2.0) * 1.0,
      treble: Math.pow(treble / (len * 0.3 * 255), 2.0) * 1.2,
    };
  }
}
