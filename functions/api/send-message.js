export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Get environment variables from Cloudflare Pages settings
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      return new Response(JSON.stringify({ ok: false, description: "Server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await request.json();
    
    // Validate honeypot and data
    if (data.website) {
      return new Response(JSON.stringify({ ok: true, description: "Spam blocked" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const text =
      "🆕 *Yeni İletişim Talebi*\n" +
      "👤 *Ad Soyad:* " + (data.fullName || "Belirtilmedi") + "\n" +
      "📞 *Telefon:* " + (data.phone || "Belirtilmedi") + "\n" +
      "📁 *Proje:* " + (data.projectType || "Belirtilmedi") + "\n" +
      "💰 *Bütçe:* " + (data.budget || "Belirtilmedi");

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown"
      })
    });

    const result = await response.json();
    
    return new Response(JSON.stringify(result), {
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, description: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
