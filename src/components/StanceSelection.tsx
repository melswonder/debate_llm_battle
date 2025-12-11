import React from 'react';

interface Opinion {
  title: string;
  description: string;
}

interface StanceSelectionProps {
  topic: string;
  opinion1: Opinion | null;
  opinion2: Opinion | null;
  onSelectStance: (title: string) => void;
}

const StanceSelection: React.FC<StanceSelectionProps> = ({ topic, opinion1, opinion2, onSelectStance }) => {
  if (!opinion1 || !opinion2) return null;

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
            onClick={() => onSelectStance(opinion1.title)}
            className="p-8 bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-blue-400 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-2xl font-bold text-blue-800 mb-3">{opinion1.title}</h3>
            <p className="text-blue-700">{opinion1.description}</p>
          </button>

          <button
            onClick={() => onSelectStance(opinion2.title)}
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
};

export default StanceSelection;
