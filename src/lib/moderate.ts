// Normalize text: convert full-width to half-width, lowercase
function normalize(text: string): string {
  return text
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/　/g, ' ')
    .toLowerCase()
    .replace(/[・\-_ー〜~＝=|｜ ]/g, '');
}

// NG word patterns (normalized form)
const NG_WORDS: RegExp[] = [
  // Threats / death wishes
  /死ね/, /しね/, /氏ね/, /死んで/, /殺す/, /ころす/, /殺せ/, /殺してやる/,
  /消えろ/, /消えて/, /消えな/, /失せろ/, /失せて/,
  /ぶっ殺/, /ぶっころ/,

  // Direct insults
  /バカ/, /ばか/, /馬鹿/, /阿呆/, /アホ/, /あほ/,
  /クズ/, /くず/, /屑/,
  /ゴミ/, /ごみ/,
  /カス/, /かす/,
  /死にぞこない/, /役立たず/, /やくたたず/,
  /うせろ/, /うせてしまえ/,
  /気持ち悪い/, /きもい/, /キモい/, /キモイ/,
  /最低/, /最悪/,
  /頭おかしい/, /頭おかしな/, /頭がおかしい/,
  /どうせ.*ダメ/, /どうせ.*だめ/,
  /帰れ/, /来るな/,

  // Discrimination / slurs
  /チョン/, /チャンコロ/, /土人/, /ニガー/, /支那/,
  /在日.*うざ/, /外国人.*帰れ/,

  // Sexual harassment
  /ヤリマン/, /ビッチ/, /淫乱/, /売春/,

  // Harassment patterns
  /通報した/, /個人情報/, /晒す/, /特定した/, /特定してやる/,
  /訴える/, /訴えてやる/,
];

// Additional substring checks (normalized)
const NG_SUBSTRINGS: string[] = [
  'しね', 'しんで', 'ころす', 'ころせ', 'きえろ', 'うせろ',
  'くず', 'ごみ', 'かす', 'きもい', 'うざい', 'うざ',
  'ばかやろう', 'たこ', 'まぬけ', 'ぼけ', 'ぼけなす',
  'むかつく', 'きらい', 'だいきらい', 'にくい', 'ざいにち',
  'てめえ', 'おまえら', 'おまえなんか',
  'dieろ', 'die', 'kill',
];

export interface ModerationResult {
  ok: boolean;
  reason?: string;
}

export function checkModeration(text: string): ModerationResult {
  const normalized = normalize(text);

  for (const pattern of NG_WORDS) {
    if (pattern.test(text) || pattern.test(normalized)) {
      return { ok: false, reason: '悪口・誹謗中傷と判断されたため投稿できません。' };
    }
  }

  for (const sub of NG_SUBSTRINGS) {
    if (normalized.includes(sub)) {
      return { ok: false, reason: '悪口・誹謗中傷と判断されたため投稿できません。' };
    }
  }

  return { ok: true };
}
