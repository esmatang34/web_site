/*
 * Sohbet kutusu — tek dosya, bağımlılığı yok.
 *
 * Kullanım (sayfanın </body> etiketinden hemen önce):
 *   <script src="chat-widget.js" data-api="https://ADRES/api/chat" defer></script>
 *
 * - Renkleri ve yazı tiplerini sitenin CSS değişkenlerinden (--bg, --ink, --accent ...) alır;
 *   bu yüzden açık/koyu tema kendiliğinden uyar.
 * - Açılışta data-api adresinin sonuna /health ekleyip asistanın ayakta olduğuna bakar;
 *   cevap gelmezse düğmeyi hiç göstermez.
 * - Arayüz dili body üzerindeki "lang-en" sınıfına göre TR/EN değişir. Asistan yalnızca Türkçe cevap verir.
 */
(function () {
  'use strict';
  if (window.__ecwLoaded) return;
  window.__ecwLoaded = true;

  var script = document.currentScript;
  var API = (script && script.getAttribute('data-api')) || '/api/chat';
  var MAX_CHARS = 500;
  var TIMEOUT_MS = 40000;

  var TEXT = {
    tr: {
      launcher: 'Soru sor',
      title: 'Asistan',
      subtitle: 'Hizmetler ve projeler hakkında',
      close: 'Sohbeti kapat',
      welcome: 'Merhaba! Esma Tang’ın projeleri, kullandığı araçlar ve iletişim yolları hakkında sorularınızı yanıtlayabilirim.',
      placeholder: 'Sorunuzu yazın…',
      send: 'Gönder',
      typing: 'Yazıyor',
      sources: 'Kaynak',
      note: 'Yapay zekâ asistanıdır; cevaplar hatalı olabilir.',
      errNetwork: 'Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.',
      errTimeout: 'Cevap çok uzun sürdü. Lütfen tekrar deneyin.',
      errGeneric: 'Şu an cevap veremiyorum, lütfen biraz sonra tekrar deneyin.',
      retry: 'Tekrar dene'
    },
    en: {
      launcher: 'Ask a question',
      title: 'Assistant',
      subtitle: 'About services and projects',
      close: 'Close chat',
      welcome: 'Hello! I can answer questions about Esma Tang’s projects, tools and contact options. Please note that I reply in Turkish.',
      placeholder: 'Type your question…',
      send: 'Send',
      typing: 'Typing',
      sources: 'Source',
      note: 'This is an AI assistant; answers may contain mistakes.',
      errNetwork: 'Could not connect. Check your internet connection and try again.',
      errTimeout: 'The answer took too long. Please try again.',
      errGeneric: 'I cannot answer right now, please try again shortly.',
      retry: 'Try again'
    }
  };

  var SUGGESTIONS = [
    'Hangi projeleri yaptı?',
    'Hangi araçlarla çalışıyor?',
    'Nasıl iletişime geçebilirim?'
  ];

  function lang() {
    return document.body.classList.contains('lang-en') ? 'en' : 'tr';
  }
  function t(key) {
    return TEXT[lang()][key];
  }

  // ---------- Stil ----------
  var css = [
    '.ecw{--ecw-bg:var(--bg,#FAFAF9);--ecw-panel:var(--bg-panel,#F1F1EE);--ecw-ink:var(--ink,#14181F);',
    '--ecw-soft:var(--ink-soft,#4B5259);--ecw-line:var(--line,#DEDEDA);--ecw-accent:var(--accent,#2B3A67);',
    '--ecw-warn:var(--accent-bright,#7A1C2E);',
    'font-family:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;font-size:14.5px;line-height:1.5;color:var(--ecw-ink)}',
    '.ecw *,.ecw *::before,.ecw *::after{box-sizing:border-box;margin:0;padding:0}',
    '.ecw-mono{font-family:"JetBrains Mono",ui-monospace,Consolas,monospace}',

    /* Sitedeki butonlarla aynı klavye tuşu görünümü */
    '.ecw-key{--ecw-depth:6px;border:1px solid var(--ecw-accent);background-color:var(--ecw-ink);color:var(--ecw-bg);',
    'background-image:linear-gradient(180deg,rgba(255,255,255,.14),rgba(0,0,0,.12));',
    'box-shadow:inset 0 1px 0 rgba(255,255,255,.35),inset 0 -3px 0 rgba(0,0,0,.22),0 var(--ecw-depth) 0 var(--ecw-accent),',
    '0 calc(var(--ecw-depth) + 1px) 0 1px rgba(0,0,0,.45),0 calc(var(--ecw-depth) + 8px) 14px rgba(0,0,0,.3);',
    'transition:transform .08s ease,box-shadow .08s ease}',
    '.ecw-key:hover:not(:disabled){--ecw-depth:7px;transform:translateY(-1px)}',
    '.ecw-key:active:not(:disabled){--ecw-depth:2px;transform:translateY(4px)}',

    '.ecw-launcher{position:fixed;right:20px;bottom:26px;z-index:900;display:inline-flex;align-items:center;gap:10px;',
    'padding:13px 18px;border-radius:8px;cursor:pointer;font-size:13.5px}',
    '.ecw-launcher svg{width:18px;height:18px;flex-shrink:0}',
    '.ecw-open .ecw-launcher{display:none}',

    '.ecw-panel{position:fixed;right:20px;bottom:20px;z-index:900;width:380px;max-width:calc(100vw - 40px);',
    'height:560px;max-height:calc(100vh - 40px);max-height:calc(100dvh - 40px);display:none;flex-direction:column;',
    'background:var(--ecw-bg);border:1px solid var(--ecw-line);border-radius:10px;overflow:hidden;',
    'box-shadow:0 20px 48px rgba(0,0,0,.28)}',
    '.ecw-open .ecw-panel{display:flex;animation:ecw-in .22s ease}',
    '@keyframes ecw-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',

    '.ecw-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;',
    'border-bottom:1px solid var(--ecw-line);background:var(--ecw-panel);box-shadow:inset 0 1px 0 rgba(255,255,255,.3)}',
    '.ecw-headl{display:flex;align-items:center;gap:14px;min-width:0}',
    '.ecw-dotsbar{display:flex;gap:7px;flex-shrink:0}',
    '.ecw-dotsbar i{width:11px;height:11px;border-radius:50%;background:var(--ecw-line);border:1px solid var(--ecw-soft)}',
    '.ecw-dotsbar i:first-child{background:var(--ecw-warn);border-color:var(--ecw-warn)}',
    '.ecw-title{font-family:"Fraunces",Georgia,serif;font-size:19px;font-weight:500;line-height:1.2}',
    '.ecw-sub{font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--ecw-soft);margin-top:3px}',
    '.ecw-close{width:34px;height:34px;display:flex;align-items:center;justify-content:center;flex-shrink:0;',
    'background:transparent;border:1px solid var(--ecw-line);border-radius:6px;color:var(--ecw-ink);cursor:pointer}',
    '.ecw-close:hover{border-color:var(--ecw-ink);background:var(--ecw-panel)}',
    '.ecw-close svg{width:16px;height:16px}',

    '.ecw-log{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;',
    'overscroll-behavior:contain;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:var(--ecw-soft) transparent}',
    '.ecw-msg{max-width:88%;padding:10px 14px;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere}',
    '.ecw-bot{align-self:flex-start;background:var(--ecw-panel);border:1px solid var(--ecw-line)}',
    '.ecw-user{align-self:flex-end;background:var(--ecw-accent);color:var(--ecw-bg)}',
    '.ecw-err{align-self:flex-start;border:1px solid var(--ecw-warn);border-left-width:3px;background:transparent}',
    '.ecw-msg a{color:var(--ecw-accent);text-decoration:underline}',
    '.ecw-src{display:block;margin-top:8px;padding-top:8px;border-top:1px solid var(--ecw-line);',
    'font-size:11px;color:var(--ecw-soft);white-space:normal}',
    '.ecw-retry{display:block;margin-top:8px;background:none;border:none;color:inherit;cursor:pointer;',
    'font-size:12px;text-decoration:underline;padding:0}',

    '.ecw-typing{display:inline-flex;align-items:center;gap:8px;color:var(--ecw-soft);font-size:12px}',
    '.ecw-dots{display:inline-flex;gap:4px}',
    '.ecw-dots i{width:5px;height:5px;border-radius:50%;background:var(--ecw-soft);animation:ecw-blink 1.2s infinite ease-in-out}',
    '.ecw-dots i:nth-child(2){animation-delay:.2s}.ecw-dots i:nth-child(3){animation-delay:.4s}',
    '@keyframes ecw-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}',

    '.ecw-chips{display:flex;flex-wrap:wrap;gap:8px}',
    '.ecw-chip{background:var(--ecw-bg);border:1px solid var(--ecw-line);border-radius:6px;color:var(--ecw-ink);',
    'padding:6px 10px;font-size:12px;cursor:pointer;text-align:left;box-shadow:0 2px 0 var(--ecw-line);',
    'transition:transform .08s ease,box-shadow .08s ease}',
    '.ecw-chip:active{transform:translateY(2px);box-shadow:none}',
    '.ecw-chip:hover{border-color:var(--ecw-accent);color:var(--ecw-accent)}',

    '.ecw-foot{border-top:1px solid var(--ecw-line);padding:12px 14px 10px;background:var(--ecw-bg)}',
    '.ecw-form{display:flex;align-items:flex-end;gap:8px}',
    /* 16px: iOS Safari daha küçük yazıda odaklanınca sayfayı yakınlaştırır */
    '.ecw-input{flex:1;min-height:46px;max-height:110px;resize:none;padding:11px 12px;font:inherit;font-size:16px;',
    'line-height:1.35;color:var(--ecw-ink);background:var(--ecw-panel);border:1px solid var(--ecw-line);border-radius:6px}',
    '.ecw-input::placeholder{color:var(--ecw-soft);opacity:.8}',
    '.ecw-input:focus{outline:none;border-color:var(--ecw-accent);background:var(--ecw-bg)}',
    '.ecw-send{--ecw-depth:4px;width:46px;height:42px;margin-bottom:4px;flex-shrink:0;display:flex;align-items:center;',
    'justify-content:center;border-radius:6px;cursor:pointer}',
    '.ecw-send:disabled{opacity:.35;cursor:not-allowed}',
    '.ecw-send svg{width:18px;height:18px}',
    '.ecw-meta{display:flex;justify-content:space-between;gap:12px;margin-top:8px;font-size:11px;color:var(--ecw-soft)}',
    '.ecw-count{flex-shrink:0;visibility:hidden}',
    '.ecw-count.ecw-show{visibility:visible}',
    '.ecw-count.ecw-over{color:var(--ecw-warn)}',

    '.ecw button:focus-visible,.ecw a:focus-visible{outline:2px solid var(--ecw-warn);outline-offset:2px}',

    '@media (max-width:520px){',
    '.ecw-panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:none;border:none;border-radius:0}',
    '.ecw-launcher{right:14px;bottom:20px}}',
    '@media (prefers-reduced-motion:reduce){.ecw-key,.ecw-chip{transition:none}.ecw-open .ecw-panel{animation:none}.ecw-dots i{animation:none;opacity:.6}',
    '.ecw-log{scroll-behavior:auto}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ---------- Yardımcılar ----------
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function icon(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
      'stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Model cevabındaki basit işaretlemeyi (kalın, italik, bağlantı) güvenli biçimde HTML'e çevirir.
  function formatAnswer(text) {
    var s = escapeHtml(text);
    s = s.replace(/https?:\/\/[^\s<)\]]+[^\s<)\].,;:!?]/g, function (url) {
      return '<a href="' + url + '" target="_blank" rel="noopener noreferrer nofollow">' + url + '</a>';
    });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(])\*([^*\s][^*\n]*)\*(?=[\s).,;:!?]|$)/gm, '$1<em>$2</em>');
    return s;
  }

  // ---------- Arayüz ----------
  var root = el('div', 'ecw');

  var launcher = el('button', 'ecw-launcher ecw-key ecw-mono');
  launcher.type = 'button';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = icon('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>') + '<span data-ecw="launcher"></span>';

  var panel = el('div', 'ecw-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'ecw-title');

  var head = el('div', 'ecw-head');
  var headLeft = el('div', 'ecw-headl');
  var dotsBar = el('span', 'ecw-dotsbar');
  dotsBar.setAttribute('aria-hidden', 'true');
  dotsBar.innerHTML = '<i></i><i></i><i></i>';
  var headText = el('div');
  var title = el('div', 'ecw-title');
  title.id = 'ecw-title';
  title.setAttribute('data-ecw', 'title');
  var sub = el('div', 'ecw-sub ecw-mono');
  sub.setAttribute('data-ecw', 'subtitle');
  headText.appendChild(title);
  headText.appendChild(sub);
  var closeBtn = el('button', 'ecw-close');
  closeBtn.type = 'button';
  closeBtn.innerHTML = icon('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>');
  headLeft.appendChild(dotsBar);
  headLeft.appendChild(headText);
  head.appendChild(headLeft);
  head.appendChild(closeBtn);

  var log = el('div', 'ecw-log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');

  var welcome = el('div', 'ecw-msg ecw-bot');
  welcome.setAttribute('data-ecw', 'welcome');
  log.appendChild(welcome);

  var chips = el('div', 'ecw-chips');
  SUGGESTIONS.forEach(function (q) {
    var chip = el('button', 'ecw-chip ecw-mono', q);
    chip.type = 'button';
    chip.addEventListener('click', function () { ask(q); });
    chips.appendChild(chip);
  });
  log.appendChild(chips);

  var foot = el('div', 'ecw-foot');
  var form = el('form', 'ecw-form');
  form.noValidate = true;
  var input = el('textarea', 'ecw-input');
  input.rows = 1;
  input.maxLength = MAX_CHARS;
  input.setAttribute('enterkeyhint', 'send');
  var sendBtn = el('button', 'ecw-send ecw-key');
  sendBtn.type = 'submit';
  sendBtn.disabled = true;
  sendBtn.innerHTML = icon('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>');
  form.appendChild(input);
  form.appendChild(sendBtn);
  var meta = el('div', 'ecw-meta');
  var note = el('span');
  note.setAttribute('data-ecw', 'note');
  var count = el('span', 'ecw-count ecw-mono');
  meta.appendChild(note);
  meta.appendChild(count);
  foot.appendChild(form);
  foot.appendChild(meta);

  panel.appendChild(head);
  panel.appendChild(log);
  panel.appendChild(foot);
  root.appendChild(launcher);
  root.appendChild(panel);

  function applyLang() {
    root.querySelectorAll('[data-ecw]').forEach(function (node) {
      node.textContent = t(node.getAttribute('data-ecw'));
    });
    input.placeholder = t('placeholder');
    input.setAttribute('aria-label', t('placeholder'));
    sendBtn.setAttribute('aria-label', t('send'));
    closeBtn.setAttribute('aria-label', t('close'));
  }

  // ---------- Davranış ----------
  var pending = false;

  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  function refreshInput() {
    var length = input.value.length;
    sendBtn.disabled = pending || input.value.trim().length === 0;
    count.textContent = length + '/' + MAX_CHARS;
    count.classList.toggle('ecw-show', length >= MAX_CHARS - 100);
    count.classList.toggle('ecw-over', length >= MAX_CHARS);
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight + 2, 110) + 'px';
  }

  function openPanel() {
    root.classList.add('ecw-open');
    launcher.setAttribute('aria-expanded', 'true');
    refreshInput(); // kutu görünür olunca yüksekliği yeniden hesapla
    scrollDown();
    input.focus();
  }

  function closePanel() {
    root.classList.remove('ecw-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  }

  function addMessage(cls, text) {
    var node = el('div', 'ecw-msg ' + cls, text);
    log.appendChild(node);
    scrollDown();
    return node;
  }

  function addBotAnswer(data) {
    var node = el('div', 'ecw-msg ecw-bot');
    node.innerHTML = formatAnswer(String(data.answer || ''));
    var sources = Array.isArray(data.sources) ? data.sources : [];
    if (data.answered && sources.length) {
      node.appendChild(el('span', 'ecw-src ecw-mono', t('sources') + ': ' + sources.join(', ')));
    }
    log.appendChild(node);
    scrollDown();
  }

  function addError(message, question) {
    var node = addMessage('ecw-err', message);
    var retry = el('button', 'ecw-retry ecw-mono', t('retry'));
    retry.type = 'button';
    retry.addEventListener('click', function () {
      node.remove();
      ask(question, true);
    });
    node.appendChild(retry);
    scrollDown();
  }

  function ask(question, isRetry) {
    question = String(question || '').trim();
    if (!question || pending) return;
    if (question.length > MAX_CHARS) question = question.slice(0, MAX_CHARS);

    chips.remove();
    if (!isRetry) addMessage('ecw-user', question);

    pending = true;
    refreshInput();

    var typing = el('div', 'ecw-msg ecw-bot');
    var typingInner = el('span', 'ecw-typing ecw-mono', t('typing'));
    var dots = el('span', 'ecw-dots');
    dots.innerHTML = '<i></i><i></i><i></i>';
    typingInner.appendChild(dots);
    typing.appendChild(typingInner);
    log.appendChild(typing);
    scrollDown();

    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: question }),
      signal: controller.signal
    })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (!res.ok || !data || typeof data.answer !== 'string') {
            // Sunucunun kendi hata metni Türkçedir; yalnızca TR arayüzde gösterilir.
            var serverMsg = data && typeof data.error === 'string' && lang() === 'tr' ? data.error : '';
            throw { shown: serverMsg || t('errGeneric') };
          }
          return data;
        });
      })
      .then(function (data) {
        typing.remove();
        addBotAnswer(data);
      })
      .catch(function (err) {
        typing.remove();
        var message = err && err.shown;
        if (!message) message = err && err.name === 'AbortError' ? t('errTimeout') : t('errNetwork');
        addError(message, question);
      })
      .then(function () {
        clearTimeout(timer);
        pending = false;
        refreshInput();
        if (root.classList.contains('ecw-open')) input.focus();
      });
  }

  launcher.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var question = input.value.trim();
    if (!question || pending) return;
    input.value = '';
    refreshInput();
    ask(question);
  });

  input.addEventListener('input', refreshInput);
  input.addEventListener('keydown', function (e) {
    // Enter gönderir, Shift+Enter satır atlar. Türkçe/Asya klavyelerinde bileşim sürerken gönderme.
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      form.requestSubmit ? form.requestSubmit() : sendBtn.click();
    }
  });

  panel.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closePanel();
    }
  });

  function mount() {
    document.body.appendChild(root);
    applyLang();
    refreshInput();
    // Site dili değişince (body sınıfı) arayüz metinlerini güncelle.
    new MutationObserver(applyLang).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  // Asistan ayakta değilse (ör. sunucu kapalıysa) düğme hiç gösterilmez;
  // ziyaretçi çalışmayan bir sohbet kutusuyla karşılaşmaz.
  function start() {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 6000);
    fetch(API.replace(/\/+$/, '') + '/health', { signal: controller.signal, cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) { if (data && data.ok) mount(); })
      .catch(function () { /* asistan kapalı: sessizce vazgeç */ })
      .then(function () { clearTimeout(timer); });
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
