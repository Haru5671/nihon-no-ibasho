export type Topic =
  | "仕事・AI"
  | "孤独・さみしさ"
  | "眠れない・不安"
  | "家族・人間関係"
  | "恋愛・パートナー"
  | "体・こころ"
  | "なんでも";

export const TOPICS: { id: Topic; emoji: string; color: string }[] = [
  { id: "なんでも",        emoji: "☁️", color: "bg-gray-50 text-gray-600 border-gray-200" },
  { id: "仕事・AI",        emoji: "💼", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { id: "孤独・さみしさ",  emoji: "🫂", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { id: "眠れない・不安",  emoji: "🌙", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  { id: "家族・人間関係",  emoji: "🏠", color: "bg-orange-50 text-orange-600 border-orange-200" },
  { id: "恋愛・パートナー",emoji: "💬", color: "bg-pink-50 text-pink-600 border-pink-200" },
  { id: "体・こころ",      emoji: "🌿", color: "bg-green-50 text-green-600 border-green-200" },
];

export interface Reply {
  id: number;
  name: string;
  body: string;
  time: string;
}

export interface Post {
  id: number;
  name: string;
  body: string;
  time: string;
  likes: number;
  liked: boolean;
  topic: Topic;
  replies?: Reply[];
}

export const initialPosts: Post[] = [
  {
    id: 1,
    topic: "仕事・AI",
    name: "にんげんさん",
    body: "今日チームMTGで「この業務来月からAIに置き換えます」って言われた。いや俺がやってた仕事なんだけど。。しかも俺の目の前で言う？？",
    time: "2分前",
    likes: 18,
    liked: false,
    replies: [
      { id: 101, name: "元経理のひと", body: "うちもそれ去年やられた。経理の仕訳入力、全部自動化されて「あなたはチェック係ね」って。チェックすらそのうちなくなるんだろうな", time: "1分前" },
    ],
  },
  {
    id: 2,
    topic: "仕事・AI",
    name: "デザイナー崩れ",
    body: "クライアントから「AIで作った案の方がいいね」ってフィードバックきた。3日かけて作ったのに。まじで何のために徹夜したんだろ",
    time: "8分前",
    likes: 24,
    liked: false,
    replies: [
      { id: 201, name: "にんげんさん", body: "それキツいな…。自分もライターだけど最近「ChatGPTで書いた方が早くない？」って言われて凹んだ", time: "6分前" },
      { id: 202, name: "もとSEのおじさん", body: "デザインもか。プログラマーはもう結構やられてる。コード書くだけなら正直AIの方が速いし正確だもんな", time: "4分前" },
    ],
  },
  {
    id: 3,
    topic: "仕事・AI",
    name: "もとSEのおじさん",
    body: "20年SEやってきて、先月リストラされた。理由はAIで開発コスト半減できるから人員整理だって。技術力には自信あったんだけどな。再就職先探してるけど、どこもAI使える若手を求めてて俺みたいなおっさんは…",
    time: "25分前",
    likes: 42,
    liked: false,
    replies: [
      { id: 301, name: "にんげんさん", body: "20年の経験がなくなるわけじゃないと思うけど…でもしんどいよな。お疲れ様です", time: "20分前" },
      { id: 302, name: "コールセンター難民", body: "自分もです。コルセンごと閉鎖されて。AIチャットボットに置き換わりましたって。笑えない", time: "15分前" },
    ],
  },
  {
    id: 4,
    topic: "孤独・さみしさ",
    name: "元経理のひと",
    body: "ふと思ったんだけど、人間にしかできない仕事って何だろ。「コミュ力」とか「ホスピタリティ」とか言われるけど、接客もAIになってきてるし。自分の存在意義ってなんなん",
    time: "1時間前",
    likes: 31,
    liked: false,
    replies: [
      { id: 401, name: "デザイナー崩れ", body: "それずっと考えてる。答え出ないけど。少なくともここで愚痴言い合えるのは人間同士だからかなw", time: "50分前" },
    ],
  },
  {
    id: 5,
    topic: "仕事・AI",
    name: "コールセンター難民",
    body: "面接で「AIツール使えますか」って聞かれて正直に「あんまり…」って言ったら空気変わった。AIに仕事奪われた側がAI使えないと再就職もできないの、なんかもうコントだよね",
    time: "2時間前",
    likes: 56,
    liked: false,
    replies: [
      { id: 501, name: "もとSEのおじさん", body: "わかる。敵の武器を使いこなせって言われてる感じ", time: "1時間前" },
      { id: 502, name: "にんげんさん", body: "でも使えるようになった方がいいのは事実なんだよな…悔しいけど", time: "1時間前" },
    ],
  },
  {
    id: 6,
    topic: "家族・人間関係",
    name: "にんげんさん",
    body: "嫁に「仕事なくなるかも」って言ったら「え、じゃあ転職すれば？」って軽く返された。いやそういう話じゃないんだわ。業界ごとなくなりそうなんだわ。この不安、同じ立場じゃないと伝わらんのかな",
    time: "3時間前",
    likes: 38,
    liked: false,
    replies: [
      { id: 601, name: "元経理のひと", body: "家族に話しても伝わらないのほんとそれ。「なんとかなるよ」で済まされるのが一番しんどい", time: "2時間前" },
    ],
  },
  {
    id: 7,
    topic: "眠れない・不安",
    name: "夜のひと",
    body: "夜中の3時。誰も起きてないし、布団の中でスマホ見てる。何も悪いことしてないはずなのに、なんか罪悪感みたいなのがある。なんで眠れないんだろ",
    time: "4時間前",
    likes: 29,
    liked: false,
    replies: [
      { id: 701, name: "不眠歴7年", body: "わかる。その罪悪感が余計眠れなくさせるんだよな。深呼吸だけでも効くよ、少しだけど", time: "3時間前" },
    ],
  },
  {
    id: 8,
    topic: "孤独・さみしさ",
    name: "在宅3年目",
    body: "テレワークになって3年。会社の人と話すのSlackだけになって、気づいたら友達ともほとんど連絡とってない。別に嫌いになったわけじゃないんだけど、どう連絡していいかわからなくなってきた",
    time: "5時間前",
    likes: 47,
    liked: false,
    replies: [
      { id: 801, name: "にんげんさん", body: "それすごくわかる。久しぶりに連絡するのって、なんか申し訳ない気がして結局しないまま…", time: "4時間前" },
    ],
  },
  {
    id: 9,
    topic: "体・こころ",
    name: "休職中のひと",
    body: "先月から休職してる。最初は「やっと休める」と思ったけど、ぼーっとしてると焦ってくる。早く治さなきゃとか、社会に置いてかれるとか。休む罪悪感ってどうしたらなくなるんだろ",
    time: "6時間前",
    likes: 53,
    liked: false,
    replies: [
      { id: 901, name: "休職経験者", body: "その焦り、すごくよくわかる。休む練習が必要なんだよって言われたとき最初は意味わからなかったけど、だんだんわかってきた", time: "5時間前" },
    ],
  },
  {
    id: 10,
    topic: "なんでも",
    name: "ちょっとだけ話したい",
    body: "特に深刻なことじゃないんだけど、なんか今日もやもやする。何が嫌なのかも特定できない感じ。こういうのって誰かに話せる場所ってなかなかないよね",
    time: "7時間前",
    likes: 61,
    liked: false,
    replies: [
      { id: 1001, name: "よくわかる", body: "言語化できないやつが一番しんどいんだよ実は。ここでそのまま書いてってくれて大丈夫だよ", time: "6時間前" },
    ],
  },
];
