const BAD_WORDS = [
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'piss', 'cock',
    'dick', 'pussy', 'bastard', 'asshole', 'motherfucker', 'bullshit',
    'cunt', 'whore', 'slut', 'nigger', 'faggot', 'retard',
  ];
  
  const PATTERN = new RegExp(BAD_WORDS.map((w) => `\\b${w}\\b`).join('|'), 'gi');
  
  export const containsBadWords = (text) => PATTERN.test(text);
  
  // Replace bad words with asterisks matching the word length
  export const filterBadWords = (text) =>
    text.replace(PATTERN, (match) => '*'.repeat(match.length));