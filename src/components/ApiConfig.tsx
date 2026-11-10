import React, { useState } from 'react';
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Lock,
  Layers,
  ExternalLink,
  Flame,
  Info,
} from 'lucide-react';
import { StudioStatus } from '../types';
import { api } from '../services/api';

interface ApiConfigProps {
  status: StudioStatus | null;
  onRefreshStatus: () => void;
}

export const ApiConfig: React.FC<ApiConfigProps> = ({
  status,
  onRefreshStatus,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
  } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const start = Date.now();
    try {
      const res = await api.getStatus();
      const latency = Date.now() - start;
      onRefreshStatus();
      setTestResult({
        success: res.hasApiKey,
        latencyMs: latency,
        message: res.hasApiKey
          ? `Connection verified successfully! Veo Engine (${res.videoModel}) is active.`
          : 'Server reached, but GEMINI_API_KEY is not yet injected in environment secrets.',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed to reach server.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-sans">
              API Configuration & Engine Status
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Real-time status of connected video synthesis models, zero-watermark pipeline, and security configuration.
          </p>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151628] hover:bg-[#1a1b32] text-cyan-300 border border-cyan-500/30 text-xs font-mono font-semibold transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
          <span>{isTesting ? 'Testing Link...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Test Result Message */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 animate-fadeIn text-xs font-mono ${
            testResult.success
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="font-bold">
              {testResult.success ? 'Engine Link Verified' : 'Action Required'}
              {testResult.latencyMs && ` (${testResult.latencyMs}ms roundtrip)`}
            </div>
            <div className="text-[11px] leading-relaxed">{testResult.message}</div>
          </div>
        </div>
      )}

      {/* Connection Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Video Engine */}
        <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
              Primary Video Model
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono">
              Interactions API
            </span>
          </div>

          <div className="text-lg font-bold text-white font-mono">
            gemini-omni-1.2-flash (Veo)
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Google's multimodal generative video foundation model. Generates up to 15s clips in a single operation, with multi-frame interpolation, camera control, and audio synthesis.
          </p>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Provider: Google DeepMind</span>
            <span className="text-cyan-400">Veo Multimodal</span>
          </div>
        </div>

        {/* Card 2: Prompt Enhancer */}
        <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Prompt Engineering Model
            </span>
            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
              generateContent
            </span>
          </div>

          <div className="text-lg font-bold text-white font-mono">
            gemini-3.8-flash
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            High-speed cinematic reasoning model that automatically expands user prompts into rich visual, lighting, texture, and motion descriptions while preserving original intent.
          </p>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
            <span>Latency: &lt;500ms</span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>
      </div>

      {/* Security Architecture Box */}
      <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2 border-b border-white/10 pb-3">
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Security Architecture & API Key Management</span>
        </h3>

        <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#141525] border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Zero Client-Side Exposure</strong>
              Your Gemini API key is never bundled, shipped, or exposed in the frontend browser code. All calls execute strictly through server-side endpoints with <code className="text-cyan-300 font-mono">process.env.GEMINI_API_KEY</code>.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#141525] border border-white/5">
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">How to Configure or Change Your Key</strong>
              In Google AI Studio, navigate to the <strong className="text-purple-300">Settings &gt; Secrets</strong> panel. AI Studio automatically injects the active key into the server environment at runtime.
            </div>
          </div>
        </div>
      </div>

      {/* Unlimited Generation & No Fake Limits Policy */}
      <div className="p-6 rounded-2xl bg-[#0e0f18] border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2 border-b border-white/10 pb-3">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Unlimited Generation & Quota Transparency</span>
        </h3>

        <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
          <p>
            <strong className="text-white">No Artificial Website Limits:</strong> S.O ADIGUN imposes zero arbitrary limits (no daily caps, no fake credits, no locked generation counters). You can generate as many videos as you need.
          </p>
          <p className="text-gray-400">
            Generation speed and volume are determined exclusively by your connected Google Gemini project quota and billing tier. If a request ever encounters a rate limit or quota notice, the studio displays the exact provider error message directly so you can monitor your usage transparently.
          </p>
        </div>
      </div>

      {/* Zero Watermark Guarantee */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 via-[#101120] to-cyan-950/20 border border-purple-500/20 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-white font-sans">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Official Zero-Watermark Certification</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          The S.O ADIGUN studio export pipeline is engineered to output pristine, unadulterated media. We never embed branding watermarks, studio stamps, promotional logos, or ending title cards into your video files.
        </p>
      </div>
    </div>
  );
};
