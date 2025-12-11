import React, { useState, useRef } from 'react';

type GameStage = 'topic-input' | 'stance-selection' | 'debate';

interface Opinion {
  title: string;
  description: string;
}

const VoiceInput = () => {
  const [gameStage, setGameStage] = useState<GameStage>('topic-input');
  const [topic, setTopic] = useState('');
  const [userStance, setUserStance] = useState('');
  const [opinion1, setOpinion1] = useState<Opinion | null>(null);
  const [opinion2, setOpinion2] = useState<Opinion | null>(null);
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingOpinions, setIsLoadingOpinions] = useState(false);
  const recognitionRef = useRef(null);

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('このブラウザは音声認識に対応していません（Chromeを使ってください）');
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);

        // Pythonバックエンドに送信
        await sendToBackend(transcript);
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

  const sendToBackend = async (message: string) => {
    setIsProcessing(true);
    try {
      // ユーザーの主張をそのまま送信（論題と立場は既にAIに伝わっている）
      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      });

      if (!response.ok) {
        throw new Error('バックエンドへの接続に失敗しました');
      }

      const data = await response.json();
      const aiText = data.response;
      setAiResponse(aiText);

      // 音声で読み上げ
      speakText(aiText);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartGame = async () => {
    if (!topic.trim()) {
      alert('お題を入力してください');
      return;
    }

    // AIに論題から2つの意見を生成してもらう
    setIsLoadingOpinions(true);
    try {
      const response = await fetch('http://localhost:8000/generate-opinions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: topic }),
      });

      if (!response.ok) {
        throw new Error('意見の生成に失敗しました');
      }

      const data = await response.json();
      setOpinion1(data.opinion1);
      setOpinion2(data.opinion2);
      setGameStage('stance-selection');
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setIsLoadingOpinions(false);
    }
  };

  const handleStanceSelection = async (opinionTitle: string) => {
    setUserStance(opinionTitle);
    setGameStage('debate');

    // 会話履歴をリセット
    await fetch('http://localhost:8000/reset/', { method: 'POST' });

    // AIに最初の主張を開始させる
    setIsProcessing(true);
    try {
      const startMessage = `論題:「${topic}」\n私の立場: ${opinionTitle}\n\nあなたは反対の立場から、最初の主張を述べてください。`;

      const response = await fetch('http://localhost:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: startMessage }),
      });

      if (!response.ok) {
        throw new Error('AIの応答取得に失敗しました');
      }

      const data = await response.json();
      const aiText = data.response;
      setAiResponse(aiText);

      // 音声で読み上げ
      speakText(aiText);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // お題入力画面
  if (gameStage === 'topic-input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center mb-4 text-indigo-600">
            🎯 AIディベートゲーム
          </h1>
          <p className="text-center text-gray-600 mb-8">
            ディベートのお題を入力してください
          </p>

          <div className="mb-8">
            <label className="block mb-3 font-semibold text-gray-700 text-lg">
              お題:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例: リモートワークは出社勤務より優れている"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
            />
          </div>

          <button
            onClick={handleStartGame}
            disabled={isLoadingOpinions}
            className="w-full py-4 px-6 text-xl font-bold rounded-lg shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoadingOpinions ? '⏳ 意見を生成中...' : 'スタート 🚀'}
          </button>
        </div>
      </div>
    );
  }

  // 立場選択画面
  if (gameStage === 'stance-selection' && opinion1 && opinion2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-center mb-4 text-indigo-600">
            どちらの視点で勝負しますか？
          </h2>
          <p className="text-center text-gray-600 mb-8 text-lg">
            お題: <span className="font-semibold text-indigo-700">「{topic}」</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleStanceSelection(opinion1.title)}
              className="p-8 bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-blue-400 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-blue-800 mb-3">{opinion1.title}</h3>
              <p className="text-blue-700">{opinion1.description}</p>
            </button>

            <button
              onClick={() => handleStanceSelection(opinion2.title)}
              className="p-8 bg-gradient-to-br from-purple-100 to-purple-200 border-4 border-purple-400 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="text-6xl mb-4">🔮</div>
              <h3 className="text-2xl font-bold text-purple-800 mb-3">{opinion2.title}</h3>
              <p className="text-purple-700">{opinion2.description}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ディベート画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
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

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">あなた:</label>
            <input
              type="text"
              value={text}
              placeholder="ここに音声が表示されます"
              readOnly
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-gray-50"
            />
          </div>

          <button
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`w-full py-4 px-6 text-xl font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isListening ? '🎙️ 話してください...' : '🎤 マイクをON'}
          </button>

          {isProcessing && (
            <p className="text-center mt-4 text-gray-600 animate-pulse">
              ⏳ AI処理中...
            </p>
          )}

          {aiResponse && (
            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
              <label className="font-semibold text-lg text-indigo-700 block mb-3">
                AI:
              </label>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {aiResponse}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              setGameStage('topic-input');
              setTopic('');
              setUserStance('');
              setText('');
              setAiResponse('');
            }}
            className="w-full mt-6 py-3 px-6 text-lg font-semibold rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-all duration-200"
          >
            新しいゲームを開始
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInput;
