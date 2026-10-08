import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  Radio,
  MapPin,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNearbyStores?: () => void;
}

interface VoiceTranscriptItem {
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onOpenNearbyStores
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting to gemini-3.8-live...');
  const [transcripts, setTranscripts] = useState<VoiceTranscriptItem[]>([
    {
      sender: 'ai',
      text: 'Hello! I am connected via gemini-3.8-live. Speak naturally to ask about specs, 90-day prices in ₹, or finding authorized stores on Google Maps.',
      time: 'Live'
    }
  ]);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // PCM Conversion Helpers
  const pcm16ToBase64 = (samples: Float32Array): string => {
    const buffer = new ArrayBuffer(samples.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const base64ToFloat32 = (base64: string): Float32Array => {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }
    return float32;
  };

  const stopActiveAudioSources = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsSpeaking(false);
  };

  const playIncomingAudioChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) {
      outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
    }
    const ctx = outputAudioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const float32 = base64ToFloat32(base64Audio);
      if (float32.length === 0) return;

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextStartTimeRef.current < now) {
        nextStartTimeRef.current = now + 0.05;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;

      activeSourcesRef.current.push(source);
      setIsSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
        if (activeSourcesRef.current.length === 0) {
          setIsSpeaking(false);
        }
      };
    } catch (e) {
      console.error('Audio chunk playback error:', e);
    }
  };

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Connect to Live API WebSocket
  const startLiveSession = async () => {
    setStatusMessage('Connecting to Live WebSocket...');
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        setIsConnected(true);
        setStatusMessage('Live API Ready · Listening...');

        // Initialize Audio contexts
        outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
        inputAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });

        // Access Microphone
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              sampleRate: 16000,
              echoCancellation: true,
              noiseSuppression: true
            }
          });
          mediaStreamRef.current = stream;

          const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
          const processor = inputAudioCtxRef.current.createScriptProcessor(2048, 1, 1);
          processorRef.current = processor;

          processor.onaudioprocess = (e) => {
            if (isMuted) return;
            const inputData = e.inputBuffer.getChannelData(0);

            // Compute audio level for visualization
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            setAudioLevel(Math.min(1, rms * 5));

            if (ws.readyState === WebSocket.OPEN) {
              const base64 = pcm16ToBase64(inputData);
              ws.send(JSON.stringify({ audio: base64 }));
            }
          };

          source.connect(processor);
          processor.connect(inputAudioCtxRef.current.destination);
        } catch (micErr: any) {
          console.warn('Microphone permission issue:', micErr);
          setStatusMessage('Microphone access needed. Click mute/unmute to retry.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.audio) {
            playIncomingAudioChunk(data.audio);
          }

          if (data.interrupted) {
            stopActiveAudioSources();
          }

          if (data.text) {
            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'ai' && last.time === 'Live') {
                return [...prev.slice(0, -1), { ...last, text: last.text + ' ' + data.text }];
              }
              return [
                ...prev,
                {
                  sender: 'ai',
                  text: data.text,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ];
            });
          }

          if (data.error) {
            setStatusMessage(`Notice: ${data.error}`);
          }
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatusMessage('Session ended. Click Restart to connect again.');
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setIsConnected(false);
        setStatusMessage('Connection failed. Retrying...');
      };
    } catch (e: any) {
      console.error('Live setup failure:', e);
      setStatusMessage('Unable to establish Live API connection.');
    }
  };

  const stopLiveSession = () => {
    stopActiveAudioSources();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (isOpen) {
      startLiveSession();
    } else {
      stopLiveSession();
    }
    return () => {
      stopLiveSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] max-h-[90vh] flex flex-col rounded-[20px] bg-white border border-[#6366F1]/30 elevation-3-ai overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div
          className="p-5 border-b border-[#E2E8F0] flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xs"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)'
              }}
            >
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[16px] font-bold text-[#0F172A]">
                  ShopMate Live Voice
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#10B981]/30 text-[#059669] font-display text-[10px] font-semibold">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[12px] text-[#64748B]">
                Real-time duplex voice conversation with 24kHz audio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopLiveSession();
                startLiveSession();
              }}
              title="Restart voice session"
              className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-white/60 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close voice modal"
              className="w-8 h-8 rounded-full bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#334155]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Audio Waveform Visualizer */}
        <div className="p-6 bg-gradient-to-b from-[#F8FAFC] to-white border-b border-[#F1F5F9] flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-1.5 h-14">
            {[40, 75, 55, 95, 60, 85, 45, 65, 90, 50].map((h, i) => {
              const activeScale = isSpeaking
                ? 0.5 + Math.random() * 0.7
                : isMuted
                ? 0.2
                : 0.3 + audioLevel * 1.5;
              const heightPx = Math.max(8, Math.min(52, h * activeScale));

              return (
                <div
                  key={i}
                  className="w-1.5 rounded-full transition-all duration-75"
                  style={{
                    height: `${heightPx}px`,
                    background: isSpeaking
                      ? 'linear-gradient(180deg, #6366F1 0%, #7C3AED 100%)'
                      : audioLevel > 0.05
                      ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)'
                      : '#CBD5E1'
                  }}
                />
              );
            })}
          </div>

          <div className="text-center">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold font-display ${
                isSpeaking
                  ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#6366F1]/30'
                  : audioLevel > 0.05
                  ? 'bg-[#ECFDF5] text-[#059669] border border-[#10B981]/30'
                  : 'bg-[#F1F5F9] text-[#64748B]'
              }`}
            >
              {isSpeaking ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                  <span>ShopMate Speaking...</span>
                </>
              ) : isMuted ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Microphone Muted</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Listening... Speak freely</span>
                </>
              )}
            </span>
            <p className="text-[11px] text-[#64748B] mt-1.5">{statusMessage}</p>
          </div>
        </div>

        {/* Live Conversation Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[240px] bg-[#F8FAFC]">
          {transcripts.map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                item.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-[14px] p-3 text-[13px] leading-[19px] ${
                  item.sender === 'user'
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-white border border-[#E2E8F0] text-[#0F172A] shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-0.5 font-display">
                  <span>{item.sender === 'user' ? 'You' : 'ShopMate AI'}</span>
                  <span>{item.time}</span>
                </div>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>

        {/* Quick Voice Topics & Control Dock */}
        <div className="p-4 bg-white border-t border-[#E2E8F0] space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-[#64748B] font-display font-medium shrink-0">Try saying:</span>
            {[
              'Compare Soundcore vs Sony ULT Wear',
              'Find Croma stores in Indiranagar on Google Maps',
              'Best mechanical keyboard under ₹5,000'
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ text: prompt }));
                    setTranscripts((prev) => [
                      ...prev,
                      {
                        sender: 'user',
                        text: prompt,
                        time: new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }
                    ]);
                  }
                }}
                className="h-[26px] px-2.5 rounded-full bg-[#6366F1]/[0.06] hover:bg-[#6366F1]/[0.12] text-[#4F46E5] font-display font-semibold whitespace-nowrap shrink-0 border border-[#6366F1]/20 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`h-[40px] px-4 rounded-full font-display text-[12px] font-semibold flex items-center gap-2 border transition-colors ${
                  isMuted
                    ? 'bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:bg-white'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#10B981]" />}
                <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
              </button>

              {onOpenNearbyStores && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNearbyStores();
                  }}
                  className="h-[40px] px-3.5 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#10B981]/30 text-[#059669] font-display text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Google Maps Stores</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="h-[40px] px-5 rounded-full bg-[#0F172A] hover:bg-[#1E293B] text-white font-display text-[12px] font-semibold transition-colors"
            >
              End Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
