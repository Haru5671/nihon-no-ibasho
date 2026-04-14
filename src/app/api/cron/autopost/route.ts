import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const POSTS: { body: string; topic: string }[] = [
  // 仕事・AI
  { topic: "仕事・AI", body: "最近AIがどんどん賢くなってて、自分の仕事が本当に必要なのかって考えてしまう。誰かも同じこと感じてる？" },
  { topic: "仕事・AI", body: "部署の半分がリモートになって、なんとなくチームって感じがしなくなってきた。画面越しだと雑談もしづらいし" },
  { topic: "仕事・AI", body: "上司がChatGPTで書いた文章をそのまま使いはじめた。もう自分の出番ないのかなって思ってしまった" },
  { topic: "仕事・AI", body: "会社でAI研修が始まったけど、あのスピードについていけない自信がない。若い子たちはすごいな" },
  { topic: "仕事・AI", body: "転職考えてるんだけど、どこ行ってもAIとの競争になるなら意味ないよなって思って踏み出せない" },

  // 孤独・さみしさ
  { topic: "孤独・さみしさ", body: "仕事帰りに誰かとご飯行けたらなって思いながら、結局一人でコンビニ弁当。別に嫌じゃないけどね" },
  { topic: "孤独・さみしさ", body: "友達いないわけじゃないんだけど、なんか深い話ができる人が周りにいないなってずっと思ってる" },
  { topic: "孤独・さみしさ", body: "休日ひとりで映画観てたら急にさみしくなった。誰かにこの感想話したいだけなんだけどな" },
  { topic: "孤独・さみしさ", body: "SNSで繋がってる人はたくさんいるのに、なんでこんなに孤独な感じがするんだろう" },
  { topic: "孤独・さみしさ", body: "引越して半年、新しい土地にまだ慣れない。誰も知り合いいなくてちょっとしんどい" },

  // 眠れない・不安
  { topic: "眠れない・不安", body: "また3時過ぎてる。別に辛いことあるわけじゃないのに眠れない夜ってなんなんだろう" },
  { topic: "眠れない・不安", body: "将来のこと考えだすと止まらなくなって朝になってたりする。考えても仕方ないってわかってるんだけど" },
  { topic: "眠れない・不安", body: "最近なんか常に漠然と不安な感じがある。何が怖いかすら言葉にできないんだよね" },
  { topic: "眠れない・不安", body: "夜中に目が覚めて、そのまま明け方まで起きてることが増えた。生活リズム崩れてる気がする" },

  // 家族・人間関係
  { topic: "家族・人間関係", body: "親が老いてきたなってのを感じる瞬間が増えた。何もできてないし何もしてあげられてない気がする" },
  { topic: "家族・人間関係", body: "職場の人間関係でずっと消耗してる。別に仲悪いわけじゃないんだけど、なんか気を遣いすぎて疲れてしまう" },
  { topic: "家族・人間関係", body: "兄弟と価値観が合わなくなってきた。昔は仲良かったのにな。大人になると難しいね" },
  { topic: "家族・人間関係", body: "友達の結婚・出産ラッシュがあって、なんとなく距離ができてきた気がする。おめでとうって思うけど複雑" },

  // 恋愛・パートナー
  { topic: "恋愛・パートナー", body: "好きな人ができたけど、傷つくのが怖くて動けない。いつになったらこの臆病さなくなるんだろ" },
  { topic: "恋愛・パートナー", body: "長年付き合ってた人と別れた。後悔はないけど、ぽっかり穴が開いた感じはずっとある" },
  { topic: "恋愛・パートナー", body: "恋愛に求めるものが昔と変わってきた気がする。ときめきより安心感を求めてる自分がいる" },

  // 体・こころ
  { topic: "体・こころ", body: "最近ちょっとしたことで涙が出るようになった。心が疲れてるのかな。休み方がわからない" },
  { topic: "体・こころ", body: "健康診断でひっかかった。大したことないと思うけど、なんとなく気になって眠れない" },
  { topic: "体・こころ", body: "HSPって最近よく聞くけど自分もそうかもしれない。人の感情をもらいすぎてしまう" },

  // 仕事・AI（失業・再就職キーワード強化）
  { topic: "仕事・AI", body: "AIのせいで仕事がなくなった。クビを告げられた日のことが頭から離れない。自分が悪いわけじゃないってわかってるのに、なんでこんなに落ち込むんだろう" },
  { topic: "仕事・AI", body: "失業手当の申請、どうすればいいのか全然わからなくて困ってる。ハローワーク行ったことないし、何から始めればいいのか" },
  { topic: "仕事・AI", body: "有休消化中なんだけど、毎日が怖い。再就職できるかどうか、AIに仕事奪われた自分に市場価値があるのかずっと考えてしまう" },
  { topic: "仕事・AI", body: "AI嫌いって言うと時代遅れみたいに言われるけど、実際に自分の仕事がなくなったんだからそりゃ嫌いになるよね。誰にも相談できなくてしんどい" },
  { topic: "仕事・AI", body: "再就職活動、もう3ヶ月目。AIに関係ない仕事を探してるけどどんどん減ってる気がする。どうすれば次の仕事見つかるのか正直わからない" },
  { topic: "仕事・AI", body: "クビになって有休消化してる間、家族には転職活動中って言ってる。本当のことを話せなくて、誰にも相談できないまま毎日すごしてる" },
  { topic: "仕事・AI", body: "AIに仕事を奪われたって感覚、誰かに話したくてもみんな「スキルアップすればいい」って言う。そうじゃなくて、ただ話を聞いてほしいんだよな" },
  { topic: "仕事・AI", body: "失業してから半年。失業手当も終わって、再就職もまだで、本当に先が見えない。こんな状況の人って他にもいるのかな" },
  { topic: "仕事・AI", body: "会社のAI導入で自分のポジションがなくなった。クビではなく「部署異動」という名の追い出しで、有休消化して辞めることになった" },
  { topic: "仕事・AI", body: "AIのせいで失業した話、リアルではなかなか言えない。「AI失業」なんて言葉が出てくる時代になるとは思ってなかった" },

  // なんでも
  { topic: "なんでも", body: "特に何があったわけでもないのに、今日はなんか気持ちが重い。こういう日ってありますよね" },
  { topic: "なんでも", body: "30代になってから時間の流れが早すぎて怖い。何か積み上げてるのかわからなくなってきた" },
  { topic: "なんでも", body: "昔は夢があったのに、いつの間にかそれを追うこともやめてた。あの頃の自分に恥ずかしい気もする" },
  { topic: "なんでも", body: "なんでもない平日の夜、誰かに話しかけたくなってここに来た。みんなも似たような夜あるのかな" },
  { topic: "なんでも", body: "最近「これでよかったのかな」って考える機会が増えた。後悔じゃないけど、確認したくなる感じ" },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all bodies already posted to avoid duplicates
  const { data: existing } = await db
    .from('posts')
    .select('body');
  const postedBodies = new Set((existing ?? []).map((r: { body: string }) => r.body));

  const candidates = POSTS.filter(p => !postedBodies.has(p.body));
  if (candidates.length === 0) {
    return NextResponse.json({ ok: false, message: 'All posts already used' });
  }

  const post = pick(candidates);

  const { error } = await db
    .from('posts')
    .insert({ name: 'にんげんさん', body: post.body, topic: post.topic, likes: 0 });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, topic: post.topic });
}
