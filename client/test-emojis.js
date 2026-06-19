const https = require('https');

const emojis = ['⚠', '📋', '👥', '📊', '📭', '📄', '📕', '👑', '🏖', '🌿', '⚡', '📅', '🛡️', '⚙️', '📱', '🤖', '📜', '☰', '🔔', '🔍', '📈', '🏥', '🌴', '👶', '💔', '👁', '✨'];

function getEmojiHex(emoji) {
  let hex = Array.from(emoji).map(char => char.codePointAt(0).toString(16));
  if (hex.length > 1 && hex.includes('fe0f')) {
      hex = hex.filter(h => h !== 'fe0f');
  }
  return hex.join('-');
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => resolve(500));
  });
}

async function test() {
  for (const char of emojis) {
    const hex = getEmojiHex(char);
    const url = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${hex}.png`;
    const status = await checkUrl(url);
    console.log(`${char} -> ${hex} -> ${status}`);
  }
}

test();
