/**
 * Salafiyah AI Recitation Intelligence Engine™
 * Professional Audio Enhancement & Preprocessing Engine
 */

class RecitationIntelligenceEngine {
    constructor() {
        this.audioContext = null;
        this.stream = null;
        this.source = null;
        this.highPassFilter = null;
        this.lowPassFilter = null;
        this.compressor = null;
        this.analyser = null;
        this.scriptProcessor = null;

        this.isRecording = false;
        this.isPaused = false;
        
        this.pcmData = [];
        this.sampleRate = 16000;
        
        // VAD (Voice Activity Detection) Parameters
        this.silenceThreshold = 0.02; // Threshold for silence (amplitude)
        this.silenceFrames = 0;
        this.speechFrames = 0;
        this.isSpeaking = false;
        
        // Quality Metrics
        this.clippingEvents = 0;
        this.framesProcessed = 0;
        this.silenceFramesTotal = 0;
        
        // Callbacks
        this.onWaveformData = null;
        this.onVADStateChange = null;
        this.onClippingWarning = null;
    }

    async init() {
        try {
            // 1. Request Microphone with Hardware Enhancement
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000, // Request 16kHz
                    channelCount: 1, // Mono
                }
            });

            // 2. Initialize AudioContext at 16kHz
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext({ sampleRate: 16000 });
            this.sampleRate = this.audioContext.sampleRate; // Confirm actual sample rate

            // 3. Build DSP Graph
            this.source = this.audioContext.createMediaStreamSource(this.stream);

            // High-pass filter (remove low frequency rumble, wind, fan noise < 80Hz)
            this.highPassFilter = this.audioContext.createBiquadFilter();
            this.highPassFilter.type = 'highpass';
            this.highPassFilter.frequency.value = 80;

            // Low-pass filter (remove high frequency hiss > 8000Hz)
            this.lowPassFilter = this.audioContext.createBiquadFilter();
            this.lowPassFilter.type = 'lowpass';
            this.lowPassFilter.frequency.value = 8000;

            // Compressor for Auto Gain / Volume Normalization
            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -30;
            this.compressor.knee.value = 30;
            this.compressor.ratio.value = 12;
            this.compressor.attack.value = 0.005;
            this.compressor.release.value = 0.25;

            // Analyser for UI Waveform
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;

            // ScriptProcessor for live PCM extraction and VAD
            // Using 4096 buffer size for balance between latency and performance
            this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
            
            this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                if (!this.isRecording || this.isPaused) return;

                const inputBuffer = audioProcessingEvent.inputBuffer;
                const channelData = inputBuffer.getChannelData(0);
                
                // Process frame for VAD, Trimming, and Quality
                this.processAudioFrame(channelData);
            };

            // Connect graph
            this.source.connect(this.highPassFilter);
            this.highPassFilter.connect(this.lowPassFilter);
            this.lowPassFilter.connect(this.compressor);
            this.compressor.connect(this.analyser);
            this.analyser.connect(this.scriptProcessor);
            // ScriptProcessor needs to be connected to destination to fire onaudioprocess
            this.scriptProcessor.connect(this.audioContext.destination);

            return true;
        } catch (err) {
            console.error("AudioEngine Init Error:", err);
            throw err;
        }
    }

    processAudioFrame(channelData) {
        this.framesProcessed++;
        
        let maxAmplitude = 0;
        let rms = 0;

        // Copy data and find metrics
        const frameData = new Float32Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
            const val = channelData[i];
            frameData[i] = val;
            
            const absVal = Math.abs(val);
            if (absVal > maxAmplitude) maxAmplitude = absVal;
            rms += val * val;

            // Detect clipping
            if (absVal >= 0.99) {
                this.clippingEvents++;
                if (this.onClippingWarning) this.onClippingWarning();
            }
        }
        
        rms = Math.sqrt(rms / channelData.length);

        // VAD Logic
        if (maxAmplitude < this.silenceThreshold) {
            this.silenceFrames++;
            this.silenceFramesTotal++;
            this.speechFrames = 0;
            
            if (this.isSpeaking && this.silenceFrames > (this.sampleRate / 4096) * 1.5) { // 1.5 seconds silence
                this.isSpeaking = false;
                if (this.onVADStateChange) this.onVADStateChange(false);
            }
        } else {
            this.speechFrames++;
            this.silenceFrames = 0;
            
            if (!this.isSpeaking && this.speechFrames > 2) {
                this.isSpeaking = true;
                if (this.onVADStateChange) this.onVADStateChange(true);
            }
        }

        // Store PCM data
        // Trim leading silence (only start storing if speaking or already stored data)
        if (this.isSpeaking || this.pcmData.length > 0) {
            this.pcmData.push(frameData);
        }

        // Send waveform data to UI
        if (this.onWaveformData) {
            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteTimeDomainData(dataArray);
            this.onWaveformData(dataArray, maxAmplitude);
        }
    }

    start() {
        this.pcmData = [];
        this.clippingEvents = 0;
        this.framesProcessed = 0;
        this.silenceFramesTotal = 0;
        this.isRecording = true;
        this.isPaused = false;
        this.isSpeaking = false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    async stop() {
        this.isRecording = false;
        
        // Disconnect and cleanup
        if (this.scriptProcessor) this.scriptProcessor.disconnect();
        if (this.analyser) this.analyser.disconnect();
        if (this.compressor) this.compressor.disconnect();
        if (this.lowPassFilter) this.lowPassFilter.disconnect();
        if (this.highPassFilter) this.highPassFilter.disconnect();
        if (this.source) this.source.disconnect();
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext && this.audioContext.state !== 'closed') {
            await this.audioContext.close();
        }

        return this.processFinalAudio();
    }

    processFinalAudio() {
        if (this.pcmData.length === 0) {
            return { error: "Empty recording" };
        }

        // 1. Flatten PCM data
        const totalLength = this.pcmData.reduce((acc, val) => acc + val.length, 0);
        let flatData = new Float32Array(totalLength);
        let offset = 0;
        for (let i = 0; i < this.pcmData.length; i++) {
            flatData.set(this.pcmData[i], offset);
            offset += this.pcmData[i].length;
        }

        // 2. Trim trailing silence
        let endIndex = flatData.length - 1;
        while (endIndex >= 0 && Math.abs(flatData[endIndex]) < this.silenceThreshold) {
            endIndex--;
        }
        
        // Keep a 0.5s padding at the end if possible
        const padding = Math.floor(this.sampleRate * 0.5);
        endIndex = Math.min(flatData.length, endIndex + padding);
        
        const finalData = flatData.subarray(0, endIndex);

        if (finalData.length === 0) {
            return { error: "Only silence recorded" };
        }

        // 3. Generate WAV Blob
        const wavBlob = this.encodeWAV(finalData, this.sampleRate);

        // 4. Quality Analysis
        const durationSecs = finalData.length / this.sampleRate;
        const silenceRatio = this.silenceFramesTotal / this.framesProcessed;
        
        let grade = "Excellent";
        if (this.clippingEvents > 10) grade = "Poor";
        else if (silenceRatio > 0.8) grade = "Poor";
        else if (durationSecs < 2) grade = "Poor";
        else if (this.clippingEvents > 2) grade = "Good";
        else if (silenceRatio > 0.5) grade = "Fair";

        const qualityReport = {
            duration: durationSecs.toFixed(2),
            clippingEvents: this.clippingEvents,
            silenceRatio: silenceRatio.toFixed(2),
            grade: grade
        };

        return {
            blob: wavBlob,
            quality: qualityReport
        };
    }

    encodeWAV(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        const writeString = (view, offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        // RIFF identifier
        writeString(view, 0, 'RIFF');
        // file length
        view.setUint32(4, 36 + samples.length * 2, true);
        // RIFF type
        writeString(view, 8, 'WAVE');
        // format chunk identifier
        writeString(view, 12, 'fmt ');
        // format chunk length
        view.setUint32(16, 16, true);
        // sample format (raw)
        view.setUint16(20, 1, true);
        // channel count
        view.setUint16(22, 1, true);
        // sample rate
        view.setUint32(24, sampleRate, true);
        // byte rate (sample rate * block align)
        view.setUint32(28, sampleRate * 2, true);
        // block align (channel count * bytes per sample)
        view.setUint16(32, 2, true);
        // bits per sample
        view.setUint16(34, 16, true);
        // data chunk identifier
        writeString(view, 36, 'data');
        // data chunk length
        view.setUint32(40, samples.length * 2, true);

        // write the PCM samples
        let offset = 44;
        for (let i = 0; i < samples.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return new Blob([view], { type: 'audio/wav' });
    }
}
window.RecitationIntelligenceEngine = RecitationIntelligenceEngine;
