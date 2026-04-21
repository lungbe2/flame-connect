export const MOOD_OPTIONS = [
  { value: 'horny', label: 'Horny', emoji: '🔥' },
  { value: 'serious relationship', label: 'Serious relationship', emoji: '💍' },
  { value: 'hook up', label: 'Hook up', emoji: '😈' },
  { value: 'love', label: 'Love', emoji: '❤️' },
  { value: 'marriage', label: 'Marriage', emoji: '👰' }
];

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export const formatMoodWithEmoji = (rawMood?: string) => {
  if (!rawMood) {
    return '💫 Open to connection';
  }
  const mood = rawMood.trim().toLowerCase();
  const option = MOOD_OPTIONS.find((entry) => entry.value === mood);
  if (option) {
    return `${option.emoji} ${option.label}`;
  }
  return `💫 ${toTitleCase(mood)}`;
};

