import React, { useState } from 'react';
import TopicInput from './components/TopicInput';
import StanceSelection from './components/StanceSelection';
import DebateScreen from './components/DebateScreen';
import ResultScreen from './components/ResultScreen';
import { GameStage, Opinion, Message, EvaluationResult } from './types';
import { generateOpinions, sendMessageStream, resetConversation, evaluateDebate } from './utils/api';
import { speakText } from './utils/speechSynthesis';

const App: React.FC = () => {
  const [gameStage, setGameStage] = useState<GameStage>('topic-input');
  const [topic, setTopic] = useState('');
  const [userStance, setUserStance] = useState('');
  const [opinion1, setOpinion1] = useState<Opinion | null>(null);
  const [opinion2, setOpinion2] = useState<Opinion | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingOpinions, setIsLoadingOpinions] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const handleStartGame = async () => {
    if (!topic.trim()) {
      alert('お題を入力してください');
      return;
    }

    setIsLoadingOpinions(true);
    try {
      const data = await generateOpinions(topic);
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

    await resetConversation();

    setIsProcessing(true);
    try {
      const startMessage = `論題:「${topic}」\n私の立場: ${opinionTitle}\n\nあなたは反対の立場から、最初の主張を述べてください。`;

      let aiText = '';
      setConversationHistory([{ role: 'ai', content: '' }]);

      await sendMessageStream(startMessage, (content) => {
        aiText += content;
        setConversationHistory([{ role: 'ai', content: aiText }]);
      });

      speakText(aiText);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    setIsProcessing(true);
    try {
      setConversationHistory(prev => [...prev, { role: 'user', content: message }]);

      let aiText = '';
      const aiMessageIndex = conversationHistory.length + 1;
      setConversationHistory(prev => [...prev, { role: 'ai', content: '' }]);

      await sendMessageStream(message, (content) => {
        aiText += content;
        setConversationHistory(prev => {
          const newHistory = [...prev];
          newHistory[aiMessageIndex] = { role: 'ai', content: aiText };
          return newHistory;
        });
      });

      speakText(aiText);
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndDebate = async () => {
    setIsProcessing(true);
    try {
      const result = await evaluateDebate();
      setEvaluation(result);
      setGameStage('result');
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewGame = () => {
    setGameStage('topic-input');
    setTopic('');
    setUserStance('');
    setOpinion1(null);
    setOpinion2(null);
    setConversationHistory([]);
    setEvaluation(null);
  };

  if (gameStage === 'topic-input') {
    return (
      <TopicInput
        topic={topic}
        setTopic={setTopic}
        onStart={handleStartGame}
        isLoading={isLoadingOpinions}
      />
    );
  }

  if (gameStage === 'stance-selection') {
    return (
      <StanceSelection
        topic={topic}
        opinion1={opinion1}
        opinion2={opinion2}
        onSelectStance={handleStanceSelection}
      />
    );
  }

  if (gameStage === 'debate') {
    return (
      <DebateScreen
        topic={topic}
        userStance={userStance}
        conversationHistory={conversationHistory}
        setConversationHistory={setConversationHistory}
        isProcessing={isProcessing}
        onSendMessage={handleSendMessage}
        onEndDebate={handleEndDebate}
        onNewGame={handleNewGame}
      />
    );
  }

  if (gameStage === 'result' && evaluation) {
    return (
      <ResultScreen
        evaluation={evaluation}
        onNewGame={handleNewGame}
      />
    );
  }

  return null;
};

export default App;
