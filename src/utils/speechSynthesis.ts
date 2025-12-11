export const speakText = (text: string): void => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
};
