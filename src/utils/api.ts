import { Opinion, EvaluationResult } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const generateOpinions = async (topic: string): Promise<{ opinion1: Opinion; opinion2: Opinion }> => {
  const response = await fetch(`${API_BASE_URL}/generate-opinions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    throw new Error('意見の生成に失敗しました');
  }

  return await response.json();
};

export const sendMessageStream = async (
  message: string,
  onChunk: (content: string) => void
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: message }),
  });

  if (!response.ok) {
    throw new Error('バックエンドへの接続に失敗しました');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (reader) {
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // 最後の不完全な行はバッファに残す
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.done) {
              return;
            }

            if (data.content) {
              onChunk(data.content);
            }
          } catch (e) {
            // JSONパースエラーは無視（不完全なデータの場合）
            console.warn('JSON parse error:', e);
          }
        }
      }
    }

    // 残りのバッファを処理
    if (buffer.startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.slice(6));
        if (data.content) {
          onChunk(data.content);
        }
      } catch (e) {
        // 無視
      }
    }
  }
};

export const resetConversation = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}/reset/`, { method: 'POST' });
};

export const evaluateDebate = async (): Promise<EvaluationResult> => {
  const response = await fetch(`${API_BASE_URL}/evaluate/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('評価の取得に失敗しました');
  }

  return await response.json();
};
