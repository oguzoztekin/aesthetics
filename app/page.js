'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [userRequest, setUserRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setOriginalImage(ev.target.result);
      // base64 data only (strip header)
      const base64 = ev.target.result.split(',')[1];
      setOriginalImageData({ base64, type: file.type });
    };
    reader.readAsDataURL(file);
    setResultImage(null);
    setError(null);
    setPrompt(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } };
      handleImageUpload(fakeEvent);
    }
  };

  const handleGenerate = async () => {
    if (!originalImageData || !userRequest.trim()) return;

    setLoading(true);
    setError(null);
    setResultImage(null);
    setPrompt(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: originalImageData.base64,
          imageType: originalImageData.type,
          userRequest: userRequest.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu');
      } else {
        setResultImage(data.resultUrl);
        setPrompt(data.prompt);
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'Burnum daha küçük ve düzgün olsun',
    'Çenem Brad Pitt gibi güçlü olsun',
    'Elmacık kemiklerim daha belirgin olsun',
    'Dudaklarım daha dolgun olsun',
    'Yüzüm daha ince ve oval görünsün',
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center text-sm font-bold">
            AI
          </div>
          <span className="text-lg font-semibold tracking-tight">Aesthetic AI</span>
          <span className="ml-auto text-xs text-neutral-500">Powered by Flux Kontext + Gemini</span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-rose-300 to-purple-400 bg-clip-text text-transparent">
            Estetik Görselleştirici
          </h1>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            Fotoğrafını yükle, ne istediğini yaz. Yapay zeka istediğin estetiği görselleştirir.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol: Input */}
          <div className="flex flex-col gap-5">
            {/* Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all overflow-hidden
                ${originalImage ? 'border-transparent h-72' : 'border-neutral-700 hover:border-neutral-500 h-72'}
              `}
            >
              {originalImage ? (
                <img
                  src={originalImage}
                  alt="Orijinal"
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center p-6">
                  <div className="text-4xl mb-3">📷</div>
                  <p className="text-neutral-400 text-sm">Fotoğraf yükle veya sürükle</p>
                  <p className="text-neutral-600 text-xs mt-1">JPG, PNG, WEBP</p>
                </div>
              )}
              {originalImage && (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center rounded-2xl">
                  <span className="text-sm text-white">Değiştir</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>

            {/* Request input */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                Ne istiyorsun?
              </label>
              <textarea
                value={userRequest}
                onChange={(e) => setUserRequest(e.target.value)}
                placeholder="Örn: Çenem Brad Pitt gibi güçlü olsun, burnum biraz küçülsün..."
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 resize-none h-24 focus:outline-none focus:border-neutral-600 transition"
              />
            </div>

            {/* Examples */}
            <div className="flex flex-col gap-2">
              <span className="text-xs text-neutral-600 uppercase tracking-wider">Örnek istekler</span>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setUserRequest(ex)}
                    className="text-xs bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 rounded-lg px-3 py-1.5 transition"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!originalImage || !userRequest.trim() || loading}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all
                ${!originalImage || !userRequest.trim() || loading
                  ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white shadow-lg shadow-purple-900/30'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Oluşturuluyor... (30-60 sn)
                </span>
              ) : (
                'Görselleştir →'
              )}
            </button>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Sağ: Output */}
          <div className="flex flex-col gap-4">
            <label className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
              Sonuç
            </label>

            <div className="border border-neutral-800 rounded-2xl overflow-hidden h-72 flex items-center justify-center bg-neutral-900">
              {loading ? (
                <div className="text-center">
                  <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">AI çalışıyor...</p>
                  <p className="text-neutral-700 text-xs mt-1">Flux Kontext işlemi ~30-60 saniye sürer</p>
                </div>
              ) : resultImage ? (
                <img
                  src={resultImage}
                  alt="Sonuç"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-neutral-700 p-6">
                  <div className="text-4xl mb-3">✨</div>
                  <p className="text-sm">Sonuç burada görünecek</p>
                </div>
              )}
            </div>

            {/* Before/After labels */}
            {resultImage && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl overflow-hidden h-36 border border-neutral-800">
                  <div className="bg-neutral-800 text-xs text-neutral-400 px-3 py-1.5">Önce</div>
                  <img src={originalImage} alt="Önce" className="w-full h-28 object-cover" />
                </div>
                <div className="rounded-xl overflow-hidden h-36 border border-purple-900/50">
                  <div className="bg-purple-900/30 text-xs text-purple-400 px-3 py-1.5">Sonra</div>
                  <img src={resultImage} alt="Sonra" className="w-full h-28 object-cover" />
                </div>
              </div>
            )}

            {/* Prompt toggle */}
            {prompt && (
              <div>
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="text-xs text-neutral-600 hover:text-neutral-400 transition"
                >
                  {showPrompt ? '▲ Prompt gizle' : '▼ AI prompt\'u gör'}
                </button>
                {showPrompt && (
                  <div className="mt-2 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-neutral-500 leading-relaxed">
                    {prompt}
                  </div>
                )}
              </div>
            )}

            {resultImage && (
              <a
                href={resultImage}
                download="aesthetic-result.jpg"
                target="_blank"
                rel="noreferrer"
                className="text-center text-xs text-neutral-500 hover:text-white border border-neutral-800 hover:border-neutral-600 rounded-xl py-2.5 transition"
              >
                İndir ↓
              </a>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
