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

    // Email Integration (optional, runs if Resend or SMTP2GO variables are set)
    const resendApiKey = env.RESEND_API_KEY;
    const resendSender = env.RESEND_SENDER;
    const resendRecipient = env.RESEND_RECIPIENT;

    const smtpApiKey = env.SMTP2GO_API_KEY;
    const smtpSender = env.SMTP2GO_SENDER;
    const smtpRecipient = env.SMTP2GO_RECIPIENT;

    if ((resendApiKey && resendSender && resendRecipient) || (smtpApiKey && smtpSender && smtpRecipient)) {
      const fullName = data.fullName || "Belirtilmedi";
      const phone = data.phone || "Belirtilmedi";
      const projectType = data.projectType || "Belirtilmedi";
      const budget = data.budget || "Belirtilmedi";

      const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAFAF9; color: #14181F; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #DEDEDA; border-radius: 4px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
  .header { border-bottom: 1px solid #DEDEDA; padding-bottom: 20px; margin-bottom: 30px; }
  .logo { font-size: 20px; font-weight: bold; color: #2B3A67; text-decoration: none; }
  .title { font-size: 24px; font-weight: 500; margin-bottom: 20px; color: #14181F; }
  .field { margin-bottom: 20px; }
  .label { font-size: 12px; text-transform: uppercase; color: #4B5259; letter-spacing: 0.5px; margin-bottom: 5px; font-weight: bold; }
  .value { font-size: 16px; color: #14181F; }
  .footer { border-top: 1px solid #DEDEDA; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #4B5259; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="logo">Esma Tang</span>
    </div>
    <h2 class="title">Yeni İletişim Talebi</h2>
    
    <div class="field">
      <div class="label">Ad Soyad</div>
      <div class="value">${fullName}</div>
    </div>
    <div class="field">
      <div class="label">Telefon</div>
      <div class="value">${phone}</div>
    </div>
    <div class="field">
      <div class="label">Proje Türü</div>
      <div class="value">${projectType}</div>
    </div>
    <div class="field">
      <div class="label">Bütçe</div>
      <div class="value">${budget}</div>
    </div>
    
    <div class="footer">
      Bu e-posta esmatang.com.tr üzerinden gönderilmiştir.
    </div>
  </div>
</body>
</html>`;

      if (resendApiKey && resendSender && resendRecipient) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: resendSender,
              to: [resendRecipient],
              subject: `Yeni İletişim Talebi - ${fullName}`,
              html: emailHtml
            })
          });
        } catch (resendErr) {
          console.error("Resend send failed:", resendErr);
        }
      } else if (smtpApiKey && smtpSender && smtpRecipient) {
        try {
          await fetch("https://api.smtp2go.com/v3/email/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              api_key: smtpApiKey,
              to: [smtpRecipient],
              sender: smtpSender,
              subject: `Yeni İletişim Talebi - ${fullName}`,
              html_body: emailHtml,
              text_body: `Yeni İletişim Talebi\nAd Soyad: ${fullName}\nTelefon: ${phone}\nProje Türü: ${projectType}\nBütçe: ${budget}`
            })
          });
        } catch (smtpErr) {
          console.error("SMTP2GO send failed:", smtpErr);
        }
      }
    }
    
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
