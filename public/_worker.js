export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Route to our API endpoint
    if (url.pathname === "/api/send-message" && request.method === "POST") {
      try {
        const botToken = env.TELEGRAM_BOT_TOKEN;
        const chatId = env.TELEGRAM_CHAT_ID;
        
        if (!botToken || !chatId) {
          return new Response(JSON.stringify({ ok: false, description: "Server configuration error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const data = await request.json();
        
        // Validate honeypot
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

        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        const response = await fetch(telegramUrl, {
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

    // Default: Fallback to serving the static assets
    return env.ASSETS.fetch(request);
  }
};
