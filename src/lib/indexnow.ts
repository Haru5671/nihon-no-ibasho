// IndexNow: Bing / Yandex などに新規・更新URLを即時通知する（AIO/SEO）。
// キーファイルは public/4e9b1c7a3f2d8056b9e4a1c6d3f70b85.txt で配信。

const KEY = "4e9b1c7a3f2d8056b9e4a1c6d3f70b85";
const HOST = "ibasho.co.jp";

/** fire-and-forget。本番のみ送信し、失敗しても本処理に影響させない。 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  if (process.env.NODE_ENV !== "production" || urls.length === 0) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch {
    /* 通知失敗は無視 */
  }
}
