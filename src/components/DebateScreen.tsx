import React, { useState, useRef } from 'react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface DebateScreenProps {
  topic: string;
  userStance: string;
  conversationHistory: Message[];
  setConversationHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  isProcessing: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onEndDebate: () => void;
  onNewGame: () => void;
}

const DebateScreen: React.FC<DebateScreenProps> = ({
  topic,
  userStance,
  conversationHistory,
  isProcessing,
  onSendMessage,
  onEndDebate,
  onNewGame
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const recognitionRef = useRef<any>(null);

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('このブラウザは音声認識に対応していません（Chromeを使ってください）');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
        await onSendMessage(transcript);
        setVoiceText('');
      };

      recognition.onerror = (event: any) => {
        alert(`音声認識エラー: ${event.error}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }

    setIsListening((prev) => !prev);
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    await onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-indigo-600 mb-2">
              🎤 ディベートバトル
            </h2>
            <p className="text-gray-600">
              お題: <span className="font-semibold">「{topic}」</span>
            </p>
            <p className="text-sm text-indigo-700 font-semibold mt-1">
              あなたの立場: {userStance}
            </p>
          </div>

          {/* 音声入力エリア */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">音声入力:</label>
            <input
              type="text"
              value={voiceText}
              placeholder="マイクボタンを押して話してください"
              readOnly
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <button
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`w-full py-4 px-6 text-xl font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isListening ? '🎙️ 話してください...' : '🎤 マイクをON'}
          </button>

          {/* テキスト入力エリア */}
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">テキスト入力:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSendText()}
                placeholder="主張を入力してください"
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                disabled={isProcessing}
              />
              <button
                onClick={handleSendText}
                disabled={isProcessing || !inputText.trim()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                送信
              </button>
            </div>
          </div>

          {isProcessing && (
            <p className="text-center mt-4 text-gray-600 animate-pulse">
              ⏳ AI処理中...
            </p>
          )}

          {/* 会話履歴表示 */}
          {conversationHistory.length > 0 && (
            <div className="mt-6 max-h-96 overflow-y-auto space-y-4">
              {conversationHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-50 border-2 border-blue-200 ml-8'
                      : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 mr-8'
                  }`}
                >
                  <label className="font-semibold text-sm block mb-2">
                    {msg.role === 'user' ? '👤 あなた' : '🤖 AI'}
                  </label>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={onEndDebate}
              className="flex-1 py-3 px-6 text-lg font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200"
            >
              ディベート終了・採点
            </button>
            <button
              onClick={onNewGame}
              className="flex-1 py-3 px-6 text-lg font-semibold rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200"
            >
              新しいゲームを開始
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebateScreen;
