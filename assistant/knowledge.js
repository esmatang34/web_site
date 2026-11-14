// Asistanın cevap verirken dayandığı bilgi.
//
// Asistan YALNIZCA buradaki metinlere dayanarak cevap verir. Sitede bir şey değiştiğinde
// (yeni proje, yeni araç, iletişim bilgisi) buradaki ilgili belgeyi de güncelleyin.
// Bir belgeyi geçici olarak devre dışı bırakmak için active: false yapın.
//
// Not: Bu belgeler daha önce bilgisayardaki PocketBase veritabanındaydı; asistanın
// bilgisayar kapalıyken de çalışması için siteyle birlikte yayına alınan bu dosyaya taşındı.

export const documents = [
  {
    title: 'Hakkında',
    active: true,
    content:
      "Esma Tang, Kayseri'de yaşayan, bilgisayar mühendisliği eğitimi alan ve birden fazla alanda çalışan bir üreticidir. " +
      'Farklı disiplinleri bir araya getirerek fikirleri somut ürünlere dönüştürür. ' +
      'Kendini tek bir tanımla sınırlamak yerine birden fazla alanda derinleşmeyi tercih eder. ' +
      'Meraklıdır, öğrenmeye açıktır ve ürettiği işin arkasında durur. ' +
      'Şu anda yeni beceriler edinip bunları gerçek projelere dönüştürmeye odaklanmaktadır. Yeni fırsatlara açıktır.'
  },
  {
    title: 'Yetenekler ve Araçlar',
    active: true,
    content:
      "Esma Tang'ın yetenekleri şunlardır. Geliştirme: Git, GitHub, Python, C. " +
      'Araçlar: Cloudflare, Docker, n8n, PocketBase, Metabase, PostgreSQL, MSSQL. ' +
      'Diğer: Proje yönetimi, içerik üretimi.'
  },
  {
    title: 'Projeler',
    active: true,
    content:
      "Esma Tang'ın öne çıkan üç projesi vardır. " +
      'Birincisi Docker üzerinden WordPress yedekleme projesidir: Docker ortamında çalışan WordPress sitelerinin veritabanı ve dosyalarını otomatik olarak yedekleyip depolayan bir sistemdir. ' +
      'İkincisi vinç firması web siteleridir: yapay zekâ desteğiyle tasarlanmış, vinç ve kaldırma hizmetleri sunan üç kurumsal sitedir (sivasvinc.net, yozgatvinc.net ve kayserivinc.tr). ' +
      'Üçüncüsü yönetim panelidir: PostgreSQL ve MSSQL ile çalışan, analiz ve raporlama için Metabase kullanan, arka planda n8n ile süreçleri otomatikleştiren bir paneldir. ' +
      "Kaynak kodu GitHub'da esmatang34/yonetim_paneli adresindedir."
  },
  {
    title: 'Proje Talebi ve Bütçe',
    active: true,
    content:
      "Esma Tang'a iletişim formundan başvururken proje türü bir listeden seçilmez; başvuran kişi projesini kendi cümleleriyle kısaca yazar. " +
      'Formda ayrıca başvuran kişinin kendi ayırdığı bütçeyi belirtmesi için şu seçenekler bulunur: 10.000–25.000 TL, 25.000–50.000 TL, 50.000–100.000 TL, 100.000 TL üzeri ve belirsiz. ' +
      'Bu aralıklar bir fiyat listesi veya hizmet ücreti değildir; yalnızca müşterinin kendi bütçesini bildirmesi içindir. ' +
      'Yayımlanmış bir fiyat listesi yoktur; fiyat, projenin kapsamına göre görüşmeyle belirlenir. Fiyat almak için iletişim formu doldurulabilir.'
  },
  {
    title: 'İletişim',
    active: true,
    content:
      "Esma Tang'a ulaşmak için e-posta: esmatang34@gmail.com, telefon: 0505 370 86 38. " +
      'GitHub: github.com/esmatang34, LinkedIn: linkedin.com/in/esma-tang-9438a3395. ' +
      'Sitedeki iletişim formuna ad soyad, telefon, projenin kısa açıklaması ve bütçe bilgisi girilir. ' +
      'Form gönderildikten sonra en kısa sürede dönüş yapılır.'
  },
  {
    title: 'Sık Sorulan Sorular',
    active: true,
    content:
      "Esma Tang kimdir? Kayseri'de yaşayan, bilgisayar mühendisliği eğitimi alan ve birden fazla alanda çalışan bir üreticidir. " +
      'Hangi araçlarla çalışıyor? Git, GitHub, Python, C, Cloudflare, Docker, n8n, PocketBase, Metabase, PostgreSQL ve MSSQL. ' +
      'Yeni bir iş için nasıl iletişime geçebilirim? Sitedeki iletişim formunu doldurabilir, e-posta veya telefonla ulaşabilirsiniz. ' +
      'Hangi tür projeler için başvurulabilir? Belirli bir liste yoktur; iletişim formuna projenizi kısaca yazarak başvurabilirsiniz. ' +
      'Yeni projelere açık mı? Evet, yeni fırsatlara açıktır.'
  }
];
