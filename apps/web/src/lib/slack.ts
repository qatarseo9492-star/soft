// apps/web/src/lib/slack.ts
export async function postToSlack(text: string) {
  const url = (process.env.SLACK_WEBHOOK_URL || "").trim();
  if (!url) return false;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return true;
  } catch {
    return false;
  }
}
