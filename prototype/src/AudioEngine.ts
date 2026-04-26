export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;

  public async init() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = this.audioContext.createMediaStreamSource(this.stream);
    source.connect(this.analyser);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  public getAudioData() {
    if (!this.analyser || !this.dataArray) return { bass: 0, mids: 0, treble: 0 };
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    const len = this.dataArray.length;
    let bass = 0, mids = 0, treble = 0;
    
    for (let i = 0; i < len * 0.2; i++) bass += this.dataArray[i];
    for (let i = Math.floor(len * 0.2); i < len * 0.7; i++) mids += this.dataArray[i];
    for (let i = Math.floor(len * 0.7); i < len; i++) treble += this.dataArray[i];
    
    return {
      bass: Math.pow(bass / (len * 0.2 * 255), 2.0) * 1.0,
      mids: Math.pow(mids / (len * 0.5 * 255), 2.0) * 1.0,
      treble: Math.pow(treble / (len * 0.3 * 255), 2.0) * 1.2,
    };
  }
}
