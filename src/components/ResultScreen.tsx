import React from 'react';

interface ScoreCategory {
  logic: number;
  evidence: number;
  rebuttal: number;
  persuasiveness: number;
  structure: number;
  total: number;
  comments: {
    logic: string;
    evidence: string;
    rebuttal: string;
    persuasiveness: string;
    structure: string;
  };
}

interface EvaluationResult {
  user_scores: ScoreCategory;
  ai_scores: ScoreCategory;
  winner: 'user' | 'ai';
  overall_comment: string;
}

interface ResultScreenProps {
  evaluation: EvaluationResult;
  onNewGame: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ evaluation, onNewGame }) => {
  const categories = [
    { key: 'logic', label: '論理性', max: 20 },
    { key: 'evidence', label: '根拠の質', max: 20 },
    { key: 'rebuttal', label: '反論への対応', max: 20 },
    { key: 'persuasiveness', label: '説得力', max: 20 },
    { key: 'structure', label: '構成力', max: 20 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-indigo-600">
            🏆 ディベート結果
          </h1>

          {/* 勝者発表 */}
          <div className={`text-center mb-8 p-6 rounded-xl ${
            evaluation.winner === 'user'
              ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-4 border-yellow-400'
              : 'bg-gradient-to-r from-gray-100 to-gray-200 border-4 border-gray-400'
          }`}>
            <h2 className="text-3xl font-bold mb-2">
              {evaluation.winner === 'user' ? '🎉 あなたの勝利！' : '🤖 AIの勝利'}
            </h2>
            <p className="text-xl">
              {evaluation.user_scores.total}点 vs {evaluation.ai_scores.total}点
            </p>
          </div>

          {/* スコア比較 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* ユーザーのスコア */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-300">
              <h3 className="text-2xl font-bold mb-4 text-blue-800">👤 あなた</h3>
              <div className="text-4xl font-bold mb-4 text-blue-600">
                {evaluation.user_scores.total}点
              </div>
              {categories.map(({ key, label, max }) => {
                const score = evaluation.user_scores[key as keyof Omit<ScoreCategory, 'total' | 'comments'>];
                const comment = evaluation.user_scores.comments[key as keyof ScoreCategory['comments']];
                return (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{label}</span>
                      <span className="font-bold">{score}/{max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${(score / max) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment}</p>
                  </div>
                );
              })}
            </div>

            {/* AIのスコア */}
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-300">
              <h3 className="text-2xl font-bold mb-4 text-purple-800">🤖 AI</h3>
              <div className="text-4xl font-bold mb-4 text-purple-600">
                {evaluation.ai_scores.total}点
              </div>
              {categories.map(({ key, label, max }) => {
                const score = evaluation.ai_scores[key as keyof Omit<ScoreCategory, 'total' | 'comments'>];
                const comment = evaluation.ai_scores.comments[key as keyof ScoreCategory['comments']];
                return (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{label}</span>
                      <span className="font-bold">{score}/{max}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-600 h-3 rounded-full"
                        style={{ width: `${(score / max) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 総評 */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 mb-8">
            <h3 className="text-xl font-bold mb-3 text-indigo-700">📝 総評</h3>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {evaluation.overall_comment}
            </p>
          </div>

          {/* アクションボタン */}
          <button
            onClick={onNewGame}
            className="w-full py-4 px-6 text-xl font-bold rounded-lg shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 transform hover:scale-105"
          >
            新しいゲームを開始 🎮
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
