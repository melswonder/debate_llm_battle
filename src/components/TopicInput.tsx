import React from 'react';

interface TopicInputProps {
  topic: string;
  setTopic: (topic: string) => void;
  onStart: () => void;
  isLoading: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ topic, setTopic, onStart, isLoading }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-4 text-indigo-600">
          AIディベートゲーム
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
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && onStart()}
          />
        </div>

        <button
          onClick={onStart}
          disabled={isLoading}
          className="w-full py-4 px-6 text-xl font-bold rounded-lg shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? ' 意見を生成中...' : 'スタート '}
        </button>
      </div>
    </div>
  );
};

export default TopicInput;
