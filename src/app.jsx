import React, { useState } from 'react';
import './index.css';

const App = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [voice, setVoice] = useState('en-US-Neural2-D');
  const [audioSrc, setAudioSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'da-DK', name: 'Danish (Denmark)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
  ];

  const voices = [
    { code: 'en-US-Neural2-D', name: 'English (US) - Neural2-D' },
    { code: 'da-DK-Neural2-C', name: 'Danish (DK) - Neural2-C' },
    { code: 'es-ES-Neural2-B', name: 'Spanish (ES) - Neural2-B' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAudioSrc(null);

    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const requestBody = {
      input: { text },
      voice: { languageCode: language, name: voice },
      audioConfig: { audioEncoding: 'MP3' },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const data = await response.json();
      const audioContent = `data:audio/mp3;base64,${data.audioContent}`;
      setAudioSrc(audioContent);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Text-to-Speech Converter</h1>
        <div className="space-y-4">
          <textarea
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter text to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  const compatibleVoice = voices.find((v) => v.code.startsWith(e.target.value));
                  if (compatibleVoice) setVoice(compatibleVoice.code);
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Voice</label>
              <select
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              >
                {voices
                  .filter((v) => v.code.startsWith(language))
                  .map((v) => (
                    <option key={v.code} value={v.code}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <button
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={handleSubmit}
            disabled={isLoading || !text}
          >
            {isLoading ? 'Generating...' : 'Generate Speech'}
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {audioSrc && (
            <div className="mt-4">
              <audio controls className="w-full">
                <source src={audioSrc} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
              <a
                href={audioSrc}
                download="speech.mp3"
                className="block text-center mt-2 text-blue-600 hover:underline"
              >
                Download Audio
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
