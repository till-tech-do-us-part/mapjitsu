'use client';

import { useState } from 'react';
import { useVibeCheck } from '@/hooks/useVibeCheck';

export function JitsuChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { result, loading, error, checkVibe } = useVibeCheck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await checkVibe(input || undefined);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        data-testid="jitsu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-neon-pink
                   flex items-center justify-center shadow-lg shadow-neon-pink/30
                   hover:scale-110 transition-transform z-50"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          data-testid="jitsu-panel"
          className="fixed bottom-24 right-6 w-80 bg-cyber-building/95
                     rounded-2xl border border-neon-blue/30 shadow-xl
                     backdrop-blur-md z-50"
        >
          <div className="p-4 border-b border-neon-blue/20">
            <h3 className="text-cyber-text font-semibold">Jitsu AI</h3>
            <p className="text-cyber-text/60 text-sm">Your navigation co-pilot</p>
          </div>

          <div className="p-4 max-h-64 overflow-y-auto">
            {loading && (
              <div className="text-neon-blue animate-pulse">Scanning the vibe...</div>
            )}
            {error && (
              <div className="text-neon-red">{error}</div>
            )}
            {result && (
              <div className="space-y-2">
                <div className="text-cyber-text/60 text-xs">
                  {result.context.neighborhood && `${result.context.neighborhood}, `}
                  {result.context.city || 'Unknown location'}
                </div>
                <div className="text-cyber-text whitespace-pre-wrap">
                  {result.response}
                </div>
              </div>
            )}
            {!result && !loading && !error && (
              <div className="text-cyber-text/60">
                Ask me about the vibe of any area!
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-neon-blue/20">
            <div className="flex gap-2">
              <input
                data-testid="jitsu-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Vibe check this area..."
                className="flex-1 bg-cyber-bg/50 text-cyber-text px-3 py-2
                           rounded-lg border border-neon-blue/20
                           focus:border-neon-blue focus:outline-none
                           placeholder:text-cyber-text/40"
              />
              <button
                data-testid="jitsu-submit"
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-neon-blue text-white rounded-lg
                           hover:bg-neon-blue/80 disabled:opacity-50
                           transition-colors"
              >
                Ask
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
