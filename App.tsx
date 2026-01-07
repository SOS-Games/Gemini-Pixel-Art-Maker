
import React, { useState, useCallback, useRef } from 'react';
import { generatePixelImage } from './services/geminiService';
import { processImageToSprite, downloadDataUrl } from './utils/imageProcessing';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [spriteUrl, setSpriteUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [makeTransparent, setMakeTransparent] = useState(true);
  
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSpriteUrl(null);
    
    try {
      const highRes = await generatePixelImage(prompt);
      setHighResUrl(highRes);
      
      const sprite = await processImageToSprite(highRes, {
        removeBackground: makeTransparent,
        targetSize: 64
      });
      setSpriteUrl(sprite);
    } catch (err: any) {
      setError(err.message || "Failed to generate sprite. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (spriteUrl) {
      const safeName = prompt.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'sprite';
      downloadDataUrl(spriteUrl, `${safeName}_64x64.png`);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-6xl mx-auto">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-pixel text-blue-400 mb-4 tracking-tighter">
          PIXEL SPRITE <span className="text-pink-500">PRO</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          AI-powered retro game asset generator. Create sharp, pixel-perfect 64x64 sprites ready for your next project.
        </p>
      </header>

      <main className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleGenerate} className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  What should we create?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A small red dragon with wings, side profile..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-slate-600 min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-xl border border-slate-700">
                <input
                  type="checkbox"
                  id="transparency"
                  checked={makeTransparent}
                  onChange={(e) => setMakeTransparent(e.target.checked)}
                  className="w-5 h-5 rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="transparency" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                  Make Background Transparent
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-white transition-all transform active:scale-95 ${
                  isLoading 
                    ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Pixels...
                  </span>
                ) : 'Generate Sprite'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm">
              <p className="font-bold mb-1">Error Encountered</p>
              {error}
            </div>
          )}
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2 space-y-8">
          {(!highResUrl && !isLoading) ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-3xl p-12 text-slate-500 bg-slate-800/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="font-medium">Enter a prompt to start generating sprites.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
              {/* High-res Preview */}
              <div className="space-y-4">
                <h3 className="text-xs font-pixel text-slate-400 text-center uppercase tracking-widest">AI Master Generation</h3>
                <div className="aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center relative shadow-2xl group">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-slate-500 animate-pulse font-pixel text-[10px]">Dreaming...</p>
                    </div>
                  ) : highResUrl && (
                    <img src={highResUrl} alt="AI Generation" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 text-center uppercase">1024x1024 Master Source</p>
              </div>

              {/* Final Sprite Preview */}
              <div className="space-y-4">
                <h3 className="text-xs font-pixel text-pink-500 text-center uppercase tracking-widest">Downscaled Sprite</h3>
                <div className="aspect-square checkerboard rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center relative shadow-2xl">
                  {isLoading ? (
                     <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 animate-pulse font-pixel text-[10px]">Filtering...</p>
                     </div>
                  ) : spriteUrl && (
                    <div className="relative group">
                      <img 
                        src={spriteUrl} 
                        alt="Final Sprite" 
                        className="pixelated w-64 h-64 object-contain transition-all duration-300 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      />
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <p className="text-[10px] text-slate-500 uppercase">Exact 64x64 Pixel Scale</p>
                  
                  {spriteUrl && (
                    <button
                      onClick={handleDownload}
                      className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-emerald-600 font-pixel text-[10px] rounded hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      Download PNG
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto pt-12 pb-8 text-slate-600 text-[10px] font-pixel text-center">
        Powered by Imagen 3 & Gemini &bull; Nearest Neighbor Scaling Engine
      </footer>
    </div>
  );
};

export default App;
