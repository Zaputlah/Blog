import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'id' | 'en' | 'ar' | 'zh';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  shortLabel: string;
}

const rows: [string, string, string, string][] = [
  ['Beranda', 'Home', 'الرئيسية', '首页'],
  ['Artikel', 'Articles', 'المقالات', '文章'],
  ['Kajian', 'Lectures', 'الدروس', '讲座'],
  ['Poster', 'Posters', 'الملصقات', '海报'],
  ['Doa', 'Prayers', 'الأدعية', '祈祷'],
  ['Al-Quran', 'Quran', 'القرآن', '古兰经'],
  ['Jadwal Sholat', 'Prayer Times', 'مواقيت الصلاة', '礼拜时间'],
  ['Game', 'Games', 'الألعاب', '游戏'],
  ['Quotes', 'Quotes', 'الاقتباسات', '语录'],
  ['Hadis', 'Hadith', 'الحديث', '圣训'],
  ['Lainnya', 'More', 'المزيد', '更多'],
  ['Semua', 'All', 'الكل', '全部'],
  ['Sebelumnya', 'Previous', 'السابق', '上一页'],
  ['Berikutnya', 'Next', 'التالي', '下一页'],
  ['Coba Lagi', 'Try Again', 'حاول مرة أخرى', '重试'],
  ['Tutup', 'Close', 'إغلاق', '关闭'],
  ['Kembali', 'Back', 'رجوع', '返回'],
  ['Lihat Semua', 'View All', 'عرض الكل', '查看全部'],
  ['Baca Selengkapnya', 'Read More', 'اقرأ المزيد', '阅读更多'],
  ['Baca Artikel', 'Read Article', 'اقرأ المقال', '阅读文章'],
  ['Memuat Doa', 'Loading prayers', 'جارٍ تحميل الأدعية', '正在加载祈祷'],
  ['Doa dan Dzikir Harian', 'Daily Prayers and Remembrance', 'الأدعية والأذكار اليومية', '每日祈祷与记念'],
  ['Doa tidak ditemukan', 'No prayers found', 'لم يتم العثور على أدعية', '未找到祈祷'],
  ['Grup Doa', 'Prayer Groups', 'مجموعات الأدعية', '祈祷分组'],
  ['Keterangan', 'Details', 'التفاصيل', '说明'],
  ['Reset Filter', 'Reset Filters', 'إعادة ضبط الفلاتر', '重置筛选'],
  ['Tag', 'Tags', 'الوسوم', '标签'],
  ['Artikel Pilihan', 'Featured Articles', 'مقالات مختارة', '精选文章'],
  ['Artikel tidak ditemukan', 'No articles found', 'لم يتم العثور على مقالات', '未找到文章'],
  ['Baca Artikel', 'Read Article', 'اقرأ المقال', '阅读文章'],
  ['Rujukan Dalil dan Ulama', 'Evidence and Scholar References', 'مراجع الأدلة والعلماء', '经文与学者参考'],
  ['Poster Dakwah', 'Dawah Posters', 'ملصقات دعوية', '宣教海报'],
  ['Poster Kajian', 'Lecture Posters', 'ملصقات الدروس', '讲座海报'],
  ['Bab / Judul Kajian', 'Chapter / Lecture Title', 'الباب / عنوان الدرس', '章节 / 讲座标题'],
  ['Jenis Pelaksanaan Kajian', 'Lecture Format', 'نوع إقامة الدرس', '讲座形式'],
  ['Semua Judul', 'All Titles', 'كل العناوين', '全部标题'],
  ['Online', 'Online', 'عبر الإنترنت', '线上'],
  ['Offline', 'Offline', 'حضوري', '线下'],
  ['Baca poster', 'Read poster', 'اقرأ الملصق', '阅读海报'],
  ['Muat Lebih Banyak Poster', 'Load More Posters', 'تحميل المزيد من الملصقات', '加载更多海报'],
  ['Tidak ada poster ditemukan', 'No posters found', 'لم يتم العثور على ملصقات', '未找到海报'],
  ['Panduan Ringkas', 'Quick Guide', 'دليل مختصر', '简要指南'],
  ['Menggunakan Poster dengan Tepat', 'Using Posters Responsibly', 'استخدام الملصقات بشكل صحيح', '正确使用海报'],
  ['Media Sosial', 'Social Media', 'وسائل التواصل', '社交媒体'],
  ['Cetak', 'Print', 'طباعة', '打印'],
  ['Materi Kajian', 'Lecture Material', 'مادة الدرس', '讲座资料'],
  ['Kajian Video Terbaru', 'Latest Video Lectures', 'أحدث الدروس المرئية', '最新视频讲座'],
  ['Rangkuman Kajian', 'Lecture Summaries', 'ملخصات الدروس', '讲座摘要'],
  ['Info Kajian Mendatang', 'Upcoming Lectures', 'الدروس القادمة', '即将举行的讲座'],
  ['Poin Penting', 'Key Points', 'نقاط مهمة', '要点'],
  ['Buka di YouTube', 'Open on YouTube', 'افتح في يوتيوب', '在 YouTube 打开'],
  ['Lihat Channel', 'View Channel', 'عرض القناة', '查看频道'],
  ['Lihat Pengumuman', 'View Announcement', 'عرض الإعلان', '查看公告'],
  ['Semua kota', 'All cities', 'كل المدن', '所有城市'],
  ['Semua Ustaz', 'All Speakers', 'كل المشايخ', '所有讲师'],
  ['Kota', 'City', 'المدينة', '城市'],
  ['Lokasi', 'Location', 'الموقع', '地点'],
  ['Waktu', 'Time', 'الوقت', '时间'],
  ['Tempat', 'Venue', 'المكان', '场地'],
  ['Al-Quran', 'Quran', 'القرآن', '古兰经'],
  ['Daftar Surah Al-Quran', 'List of Quran Chapters', 'قائمة سور القرآن', '古兰经章节列表'],
  ['Deskripsi Surah', 'Chapter Description', 'وصف السورة', '章节说明'],
  ['Kembali ke Daftar', 'Back to List', 'العودة إلى القائمة', '返回列表'],
  ['Kembali ke Daftar Surah', 'Back to Chapter List', 'العودة إلى قائمة السور', '返回章节列表'],
  ['Tempat Turun', 'Place of Revelation', 'مكان النزول', '启示地点'],
  ['Panjang Ayat', 'Chapter Length', 'طول السورة', '章节长度'],
  ['Makkiyah', 'Meccan', 'مكية', '麦加篇'],
  ['Madaniyah', 'Medinan', 'مدنية', '麦地那篇'],
  ['Tidak ada hasil', 'No results', 'لا توجد نتائج', '没有结果'],
  ['Terjadi Kesalahan', 'An Error Occurred', 'حدث خطأ', '发生错误'],
  ['Jadwal Bulanan', 'Monthly Schedule', 'الجدول الشهري', '月度时间表'],
  ['Provinsi', 'Province', 'المحافظة', '省份'],
  ['Kabupaten / Kota', 'Regency / City', 'المنطقة / المدينة', '县 / 市'],
  ['Hari ini', 'Today', 'اليوم', '今天'],
  ['Tanggal', 'Date', 'التاريخ', '日期'],
  ['Waktu setempat', 'Local time', 'الوقت المحلي', '当地时间'],
  ['Pilih Permainan', 'Choose a Game', 'اختر لعبة', '选择游戏'],
  ['Belajar Sambil Bermain', 'Learn While Playing', 'تعلم أثناء اللعب', '边玩边学'],
  ['Kuis Selesai', 'Quiz Complete', 'اكتمل الاختبار', '测验完成'],
  ['Skor terbaik', 'Best score', 'أفضل نتيجة', '最高分'],
  ['Jawaban yang tepat:', 'Correct answer:', 'الإجابة الصحيحة:', '正确答案：'],
  ['Hadis Pilihan', 'Selected Hadith', 'أحاديث مختارة', '精选圣训'],
  ['Koleksi Harian', 'Daily Collection', 'المجموعة اليومية', '每日合集'],
  ['Pencarian Hadis', 'Hadith Search', 'البحث في الحديث', '圣训搜索'],
  ['Hasil Pencarian', 'Search Results', 'نتائج البحث', '搜索结果'],
  ['Kata kunci', 'Keyword', 'كلمة البحث', '关键词'],
  ['Hadis Berikutnya', 'Next Hadith', 'الحديث التالي', '下一条圣训'],
  ['Terjemahan Indonesia', 'Indonesian Translation', 'الترجمة الإندونيسية', '印度尼西亚语翻译'],
  ['Quotes Islami', 'Islamic Quotes', 'اقتباسات إسلامية', '伊斯兰语录'],
  ['Kutipan Pilihan', 'Featured Quote', 'اقتباس مختار', '精选语录'],
  ['Jelajahi Quotes', 'Explore Quotes', 'تصفح الاقتباسات', '浏览语录'],
  ['Memuat quotes', 'Loading quotes', 'جارٍ تحميل الاقتباسات', '正在加载语录'],
  ['Tanya Zaputlah', 'Ask Zaputlah', 'اسأل زابوتلاه', '询问 Zaputlah'],
  ['Contoh pertanyaan', 'Example questions', 'أسئلة مقترحة', '示例问题'],
  ['Sumber yang digunakan', 'Sources used', 'المصادر المستخدمة', '使用的来源'],
  ['Tanya topik lain', 'Ask another topic', 'اسأل عن موضوع آخر', '询问其他主题'],
  ['Menu', 'Menu', 'القائمة', '菜单'],
  ['Tentang Kami', 'About Us', 'من نحن', '关于我们'],
  ['Terhubung', 'Connect', 'تواصل معنا', '联系我们'],
  ['Kebijakan Privasi', 'Privacy Policy', 'سياسة الخصوصية', '隐私政策'],
  ['Syarat & Ketentuan', 'Terms & Conditions', 'الشروط والأحكام', '条款与条件'],
  ['Mode Terang', 'Light Mode', 'الوضع الفاتح', '浅色模式'],
  ['Mode Gelap', 'Dark Mode', 'الوضع الداكن', '深色模式'],
  ['Buka menu', 'Open menu', 'فتح القائمة', '打开菜单'],
  ['Aktifkan mode terang', 'Enable light mode', 'تفعيل الوضع الفاتح', '启用浅色模式'],
  ['Aktifkan mode gelap', 'Enable dark mode', 'تفعيل الوضع الداكن', '启用深色模式'],
  ['Kumpulan materi visual dakwah yang bisa digunakan untuk media sosial, bahan kajian, atau publikasi komunitas dengan tampilan yang lebih rapi.', 'A collection of visual dawah materials for social media, lectures, and community publications.', 'مجموعة من المواد الدعوية المرئية لوسائل التواصل والدروس ومنشورات المجتمع.', '适用于社交媒体、讲座和社区宣传的宣教视觉资料。'],
  ['Pilih judul untuk menampilkan satu rangkaian poster dari bagian 1 sampai 5.', 'Choose a title to view its five-part poster series.', 'اختر عنوانًا لعرض سلسلة الملصقات من الجزء الأول إلى الخامس.', '选择标题以查看由第 1 至第 5 部分组成的海报系列。'],
  ['Pisahkan poster berdasarkan kajian offline atau online.', 'Filter posters by online or in-person lectures.', 'صفِّ الملصقات حسب الدروس الحضورية أو عبر الإنترنت.', '按线上或线下讲座筛选海报。'],
  ['Baca berurutan dari bagian 1 hingga 5.', 'Read in order from part 1 to 5.', 'اقرأ بالترتيب من الجزء الأول إلى الخامس.', '请按第 1 至第 5 部分顺序阅读。'],
  ['Kumpulan 114 surah dengan terjemahan dan informasi ringkas, disajikan sederhana agar nyaman untuk dibaca.', 'All 114 Quran chapters with translations and concise information in a comfortable reading layout.', 'سور القرآن الـ114 مع الترجمة ومعلومات موجزة بتصميم مريح للقراءة.', '收录古兰经全部114章、翻译和简要信息，版面简洁易读。'],
  ['Temukan waktu sholat harian dan jadwal lengkap satu bulan untuk kabupaten atau kota Anda.', 'Find daily prayer times and a complete monthly schedule for your city.', 'اعثر على مواقيت الصلاة اليومية والجدول الشهري الكامل لمدينتك.', '查询所在城市的每日礼拜时间及完整月度时间表。'],
  ['Uji pengetahuanmu tentang surah Al-Quran lewat beragam jenis pertanyaan.', 'Test your knowledge of Quran chapters through different question types.', 'اختبر معرفتك بسور القرآن من خلال أسئلة متنوعة.', '通过不同题型测试你对古兰经章节的了解。'],
  ['Baca teks Arab dan terjemahan hadis dari berbagai kitab. Sepuluh hadis disiapkan setiap hari agar dapat dibaca tanpa membebani layanan sumber.', 'Read Arabic hadith texts and translations from various collections. Ten hadith are prepared each day.', 'اقرأ نصوص الأحاديث العربية وترجماتها من كتب متعددة. تُعرض عشرة أحاديث يوميًا.', '阅读不同圣训集中的阿拉伯原文与翻译，每日提供十条圣训。'],
  ['Kumpulan nasihat dari para nabi, ulama, dan orang-orang saleh untuk menemani refleksi harian.', 'A collection of wisdom from prophets, scholars, and righteous people for daily reflection.', 'مجموعة من حكم الأنبياء والعلماء والصالحين للتأمل اليومي.', '汇集先知、学者和善人的智慧，陪伴每日反思。'],
  ['Pusat informasi kajian terbaru, rangkuman materi, rekaman ceramah lengkap, dan video singkat yang disusun rapi agar mudah dijelajahi.', 'A hub for upcoming lectures, summaries, full recordings, and short videos.', 'مركز للدروس القادمة والملخصات والتسجيلات الكاملة والمقاطع القصيرة.', '集中展示最新讲座、内容摘要、完整录音和短视频。'],
  ['Kumpulan doa dan dzikir dari EQuran.id, dilengkapi teks Arab, latin, terjemahan, tag, dan keterangan sumber.', 'Prayers and remembrance from EQuran.id with Arabic, transliteration, translation, tags, and sources.', 'أدعية وأذكار من EQuran.id مع النص العربي واللفظ والترجمة والوسوم والمصادر.', '来自 EQuran.id 的祈祷与记念，包含阿拉伯文、音译、翻译、标签和来源。'],
  ['Coba kata kunci lain atau pilih kategori berbeda.', 'Try another keyword or choose a different category.', 'جرّب كلمة بحث أخرى أو اختر تصنيفًا مختلفًا.', '请尝试其他关键词或选择不同分类。'],
  ['Tidak ada jadwal, rangkuman, atau video yang sesuai dengan filter yang dipilih.', 'No schedules, summaries, or videos match the selected filters.', 'لا توجد مواعيد أو ملخصات أو مقاطع تطابق الفلاتر المحددة.', '没有符合所选筛选条件的日程、摘要或视频。'],
  ['Media Dakwah Digital', 'Digital Dawah Media', 'إعلام دعوي رقمي', '数字宣教媒体'],
  ['Ruang belajar Islam yang dibuat lebih tenang, rapi, dan mudah dibaca. Fokusnya pada ilmu, nasihat, dan konten yang mengajak tanpa berlebihan.', 'A calm and readable Islamic learning space focused on knowledge, advice, and balanced reminders.', 'مساحة هادئة ومنظمة للتعلم الإسلامي تركز على العلم والنصيحة والدعوة باعتدال.', '一个安静、整洁、易读的伊斯兰学习空间，专注于知识、劝诫与适度引导。'],
  ['Arah Konten', 'Content Direction', 'مسار المحتوى', '内容方向'],
  ['Ilmu yang jelas, bahasa yang lembut, tampilan yang tidak mengganggu.', 'Clear knowledge, gentle language, and an uncluttered experience.', 'علم واضح ولغة لطيفة وتصميم مريح.', '清晰的知识、温和的语言与舒适的界面。'],
  ['Setiap bagian dibuat untuk membantu pengunjung langsung menemukan artikel, kajian, dan poster dakwah tanpa distraksi visual yang berlebihan.', 'Every section helps visitors quickly find articles, lectures, and dawah posters without visual distractions.', 'صُمم كل قسم للوصول سريعًا إلى المقالات والدروس والملصقات الدعوية دون تشتيت.', '每个区域都帮助访客快速找到文章、讲座与宣教海报，避免视觉干扰。'],
  ['Sepuluh Hari Pertama Zulhijah', 'First Ten Days of Dhul Hijjah', 'العشر الأوائل من ذي الحجة', '宰牲月前十日'],
  ['Musim amal untuk memperbanyak dzikir, sedekah, puasa, dan ketaatan kepada Allah.', 'A season to increase remembrance, charity, fasting, and obedience to Allah.', 'موسم للإكثار من الذكر والصدقة والصيام وطاعة الله.', '增加记念、施舍、斋戒与顺从真主的功修时节。'],
  ['Puasa Arafah: Menata Hati Sebelum Idul Adha', 'Arafah Fast: Preparing the Heart Before Eid al-Adha', 'صيام عرفة: تهيئة القلب قبل عيد الأضحى', '阿拉法日斋戒：古尔邦节前净化心灵'],
  ['Momen memperbanyak doa, muhasabah, dan harapan ampunan sebelum Hari Raya.', 'A time for prayer, self-reflection, and seeking forgiveness before Eid.', 'وقت للإكثار من الدعاء والمحاسبة ورجاء المغفرة قبل العيد.', '节日前增加祈祷、自省与求饶的时刻。'],
  ['Idul Adha dan Makna Kurban', 'Eid al-Adha and the Meaning of Sacrifice', 'عيد الأضحى ومعنى الأضحية', '古尔邦节与献牲的意义'],
  ['Kurban mengajarkan ketaatan, pengorbanan, dan kepedulian sosial.', 'Sacrifice teaches obedience, devotion, and social care.', 'تعلمنا الأضحية الطاعة والتضحية والتكافل.', '献牲教导顺从、奉献与社会关怀。'],
  ['Hari Tasyrik: Dzikir dan Syukur', 'Days of Tashriq: Remembrance and Gratitude', 'أيام التشريق: ذكر وشكر', '晒肉日：记念与感恩'],
  ['Hari untuk memperbanyak takbir, syukur, dan menjaga adab menikmati nikmat Allah.', 'Days to increase takbir, gratitude, and good manners while enjoying Allah’s blessings.', 'أيام للإكثار من التكبير والشكر وحسن الأدب مع نعم الله.', '增加大赞词、感恩并以良好礼仪享受真主恩典的日子。'],
  ['Rekaman Kajian Terbaru', 'Latest Lecture Recordings', 'أحدث تسجيلات الدروس', '最新讲座录音'],
  ['Visual Dakwah', 'Visual Dawah', 'الدعوة المرئية', '视觉宣教'],
  ['Tulisan', 'Writings', 'المقالات', '文章'],
  ['Ibadah', 'Worship', 'العبادة', '功修'],
  ['Puasa', 'Fasting', 'الصيام', '斋戒'],
  ['Kurban', 'Sacrifice', 'الأضحية', '献牲'],
  ['Dzikir', 'Remembrance', 'الذكر', '记念'],
  ['Lihat Kajian', 'View Lectures', 'عرض الدروس', '查看讲座'],
  ['Buka Galeri', 'Open Gallery', 'فتح المعرض', '打开图库'],
  ['Artikel Zulhijah', 'Dhul Hijjah Articles', 'مقالات ذي الحجة', '宰牲月文章'],
  ['Zulhijah 1447 H', 'Dhul Hijjah 1447 AH', 'ذو الحجة 1447 هـ', '伊历1447年宰牲月'],
  ['Koleksi', 'Collection', 'المجموعة', '合集'],
  ['Sumber:', 'Source:', 'المصدر:', '来源：'],
  ['Sumber data:', 'Data source:', 'مصدر البيانات:', '数据来源：'],
  ['Poster Dakwah', 'Dawah Posters', 'ملصقات دعوية', '宣教海报'],
  ['Konten Instagram', 'Instagram Content', 'محتوى إنستغرام', 'Instagram 内容'],
  ['Info Kajian', 'Lecture Information', 'معلومات الدرس', '讲座信息'],
  ['Semua Topik', 'All Topics', 'كل الموضوعات', '全部主题'],
  ['Seri 5 Bagian', 'Five-Part Series', 'سلسلة من خمسة أجزاء', '五部分系列'],
  ['Poster kajian segera hadir', 'Lecture posters coming soon', 'ملصقات الدروس قريبًا', '讲座海报即将上线'],
  ['Poster akan ditampilkan di sini setelah materinya ditambahkan.', 'Posters will appear here after the material is added.', 'ستظهر الملصقات هنا بعد إضافة المادة.', '添加资料后，海报将在此显示。'],
  ['Bagian ini sudah disiapkan untuk informasi jadwal dan publikasi kajian yang akan diunggah.', 'This section is ready for upcoming lecture schedules and publications.', 'هذا القسم مخصص لمواعيد الدروس والمنشورات القادمة.', '此区域用于展示即将发布的讲座日程与资料。'],
  ['Gunakan caption yang jelas dan sertakan sumber materi saat membagikan poster.', 'Use a clear caption and include the material source when sharing posters.', 'استخدم وصفًا واضحًا واذكر مصدر المادة عند مشاركة الملصق.', '分享海报时请使用清晰说明并注明资料来源。'],
  ['Cetak dalam ukuran yang nyaman dibaca untuk masjid, rumah, atau ruang belajar.', 'Print at a readable size for mosques, homes, or study rooms.', 'اطبع بحجم مريح للقراءة في المسجد أو المنزل أو مكان الدراسة.', '请以适合清真寺、家庭或学习空间阅读的尺寸打印。'],
  ['Jadikan poster sebagai pengantar diskusi, bukan pengganti penjelasan yang utuh.', 'Use posters to start discussion, not as a replacement for complete explanation.', 'اجعل الملصق مدخلًا للنقاش لا بديلًا عن الشرح الكامل.', '将海报作为讨论引导，而非完整讲解的替代。'],
  ['Ceramah Full Length', 'Full-Length Lectures', 'محاضرات كاملة', '完整讲座'],
  ['Ceramah Singkat', 'Short Lectures', 'محاضرات قصيرة', '短讲座'],
  ['Durasi Panjang', 'Long Duration', 'مدة طويلة', '长视频'],
  ['Durasi Singkat', 'Short Duration', 'مدة قصيرة', '短视频'],
  ['Hanya jadwal mendatang', 'Upcoming only', 'المواعيد القادمة فقط', '仅显示即将举行'],
  ['Tampilkan Semua', 'Show All', 'عرض الكل', '显示全部'],
  ['Tampilkan Semua Materi', 'Show All Materials', 'عرض كل المواد', '显示全部资料'],
  ['Hapus pencarian', 'Clear search', 'مسح البحث', '清除搜索'],
  ['Rangkuman tidak ditemukan', 'No summaries found', 'لم يتم العثور على ملخصات', '未找到摘要'],
  ['Video tidak ditemukan', 'No videos found', 'لم يتم العثور على مقاطع', '未找到视频'],
  ['Tidak ada jadwal ditemukan', 'No schedules found', 'لم يتم العثور على مواعيد', '未找到日程'],
  ['Tidak ada materi', 'No materials found', 'لا توجد مواد', '没有资料'],
  ['Catatan', 'Notes', 'ملاحظات', '备注'],
  ['Jenis kajian:', 'Lecture type:', 'نوع الدرس:', '讲座类型：'],
  ['Memuat video terbaru', 'Loading latest videos', 'جارٍ تحميل أحدث المقاطع', '正在加载最新视频'],
  ['Memuat info kajian', 'Loading lecture information', 'جارٍ تحميل معلومات الدروس', '正在加载讲座信息'],
  ['Memuat Surah', 'Loading chapters', 'جارٍ تحميل السور', '正在加载章节'],
  ['Mohon tunggu sebentar...', 'Please wait...', 'يرجى الانتظار...', '请稍候……'],
  ['Surah belum bisa dibuka', 'Chapter cannot be opened', 'تعذر فتح السورة', '暂时无法打开章节'],
  ['Surah Sebelumnya', 'Previous Chapter', 'السورة السابقة', '上一章'],
  ['Surah Selanjutnya', 'Next Chapter', 'السورة التالية', '下一章'],
  ['Pendek', 'Short', 'قصيرة', '短'],
  ['Sedang', 'Medium', 'متوسطة', '中等'],
  ['Panjang', 'Long', 'طويلة', '长'],
  ['Waktu Ibadah', 'Worship Times', 'أوقات العبادة', '功修时间'],
  ['Jadwal belum bisa dimuat', 'Schedule could not be loaded', 'تعذر تحميل الجدول', '无法加载日程'],
  ['Menyiapkan jadwal', 'Preparing schedule', 'جارٍ إعداد الجدول', '正在准备日程'],
  ['Memuat provinsi...', 'Loading provinces...', 'جارٍ تحميل المحافظات...', '正在加载省份……'],
  ['Bulan', 'Month', 'الشهر', '月份'],
  ['Tahun', 'Year', 'السنة', '年份'],
  ['Kamu mau bermain yang mana?', 'Which game would you like to play?', 'أي لعبة تريد أن تلعب؟', '你想玩哪个游戏？'],
  ['Mode dipilih', 'Selected mode', 'الوضع المختار', '已选模式'],
  ['Pilih satu mode permainan, lalu jawab 10 soal yang disiapkan.', 'Choose a game mode, then answer ten questions.', 'اختر نمطًا للعبة ثم أجب عن عشرة أسئلة.', '选择一种游戏模式，然后回答十道题。'],
  ['Soal', 'Question', 'السؤال', '题目'],
  ['Skor terbaikmu:', 'Your best score:', 'أفضل نتيجتك:', '你的最高分：'],
  ['Hadis belum tersedia', 'Hadith is unavailable', 'الحديث غير متاح', '圣训暂不可用'],
  ['Pilih hadis untuk dibaca', 'Choose a hadith to read', 'اختر حديثًا للقراءة', '选择一条圣训阅读'],
  ['Cari berdasarkan kata kunci', 'Search by keyword', 'ابحث بكلمة', '按关键词搜索'],
  ['Quotes belum tersedia', 'Quotes are unavailable', 'الاقتباسات غير متاحة', '语录暂不可用'],
  ['Mengambil kutipan dari Islamic Network...', 'Fetching quotes from Islamic Network...', 'جارٍ جلب الاقتباسات من Islamic Network...', '正在从 Islamic Network 获取语录……'],
  ['Pencarian referensi Islam', 'Islamic reference search', 'البحث في المراجع الإسلامية', '伊斯兰参考资料搜索'],
  ['Pertanyaan untuk Tanya Zaputlah', 'Question for Ask Zaputlah', 'سؤال لزابوتلاه', '向 Zaputlah 提问'],
  ['Mencari sumber...', 'Searching sources...', 'جارٍ البحث عن المصادر...', '正在搜索来源……'],
  ['Jawaban belum tersedia', 'Answer is unavailable', 'الإجابة غير متاحة', '答案暂不可用'],
  ["Assalamu'alaikum", 'Peace be upon you', 'السلام عليكم', '愿平安降临于你'],
  ['Email:', 'Email:', 'البريد الإلكتروني:', '电子邮箱：'],
  ['Lokasi:', 'Location:', 'الموقع:', '地点：'],
  ['Selanjutnya', 'Next', 'التالي', '下一页'],
  ['Coba kata kunci atau kategori lain.', 'Try another keyword or category.', 'جرّب كلمة أو تصنيفًا آخر.', '请尝试其他关键词或分类。'],
  ['Coba kata kunci, grup, atau tag lain.', 'Try another keyword, group, or tag.', 'جرّب كلمة أو مجموعة أو وسمًا آخر.', '请尝试其他关键词、分组或标签。'],
  ['Doa belum bisa dimuat', 'Prayers could not be loaded', 'تعذر تحميل الأدعية', '无法加载祈祷'],
  ['Mengambil data dari EQuran.id...', 'Fetching data from EQuran.id...', 'جارٍ جلب البيانات من EQuran.id...', '正在从 EQuran.id 获取数据……'],
  ['Kumpulan tulisan seputar sepuluh hari pertama Zulhijah, Puasa Arafah, Idul Adha, kurban, Hari Tasyrik, dan dzikir. Tanggal mengikuti Zulhijah 1447 H/2026 M.', 'Articles about the first ten days of Dhul Hijjah, Arafah fasting, Eid al-Adha, sacrifice, the Days of Tashriq, and remembrance.', 'مقالات عن العشر الأوائل من ذي الحجة وصيام عرفة وعيد الأضحى والأضحية وأيام التشريق والذكر.', '关于宰牲月前十日、阿拉法日斋戒、古尔邦节、献牲、晒肉日与记念的文章。'],
  ['Catatan: penanggalan Hijriah dapat mengikuti ketetapan resmi pemerintah atau lembaga setempat.', 'Note: Hijri dates may follow official government or local authority decisions.', 'ملاحظة: قد تتبع التواريخ الهجرية قرارات الجهات الرسمية أو المحلية.', '注意：伊斯兰历日期可能依据政府或当地机构的正式决定。'],
  ['Rujukan diarahkan ke tafsir dan fatwa ulama, terutama sumber Saudi seperti Tafsir KSU, Syaikh Bin Baz, dan Syaikh Ibnu Utsaimin.', 'References point to Quran commentary and scholarly rulings, especially recognized Saudi sources.', 'تُحال المراجع إلى كتب التفسير وفتاوى العلماء، ولا سيما المصادر السعودية المعروفة.', '参考资料指向古兰经注释与学者教法意见，尤其是公认的沙特来源。'],
  ['Media dakwah digital yang mengutamakan tulisan, kajian, dan materi visual yang mudah dibaca, tenang dilihat, dan bermanfaat untuk diamalkan.', 'Digital dawah media focused on readable articles, lectures, and calm visual materials that support practice.', 'إعلام دعوي رقمي يهتم بالمقالات والدروس والمواد المرئية الواضحة والنافعة للعمل.', '专注于易读文章、讲座与舒适视觉资料的数字宣教媒体，帮助实践所学。'],
  ["Saling menasihati dalam kebenaran dan saling menasihati dalam kesabaran. QS. Al-'Asr: 3", 'Encourage one another to truth and patience. Quran 103:3', 'وتواصوا بالحق وتواصوا بالصبر. سورة العصر: 3', '以真理互相劝勉，以坚忍互相劝勉。《时光章》103:3'],
  ['Game Al-Quran', 'Quran Game', 'لعبة القرآن', '古兰经游戏'],
  ['dari 100', 'out of 100', 'من 100', '满分100'],
  ['Jejak Sunnah', 'Path of the Sunnah', 'نهج السنة', '圣行之路'],
  ['Hadis yang ditemukan', 'Hadith Found', 'الأحاديث الموجودة', '找到的圣训'],
  ['Memuat hadis pilihan', 'Loading selected hadith', 'جارٍ تحميل الأحاديث المختارة', '正在加载精选圣训'],
  ['Menyiapkan koleksi yang tersimpan untuk hari ini...', 'Preparing today’s saved collection...', 'جارٍ إعداد مجموعة اليوم المحفوظة...', '正在准备今日保存的合集……'],
  ['Maksimal 2 pencarian baru per hari. Hasil yang sudah tersimpan selama 30 hari dapat dibuka kembali tanpa mengurangi jatah.', 'Up to two new searches per day. Results saved for 30 days can be reopened without using the allowance.', 'بحثان جديدان كحد أقصى يوميًا، ويمكن فتح النتائج المحفوظة لمدة 30 يومًا دون خصم الحصة.', '每天最多两次新搜索；30天内保存的结果可再次打开且不占额度。'],
  ['Subuh', 'Fajr', 'الفجر', '晨礼'],
  ['Terbit', 'Sunrise', 'الشروق', '日出'],
  ['Dhuha', 'Duha', 'الضحى', '晌礼'],
  ['Dzuhur', 'Dhuhr', 'الظهر', '晌礼'],
  ['Ashar', 'Asr', 'العصر', '晡礼'],
  ['Maghrib', 'Maghrib', 'المغرب', '昏礼'],
  ['Isya', 'Isha', 'العشاء', '宵礼'],
  ['Imsak', 'Imsak', 'الإمساك', '封斋时间'],
  ['Sumber data: Bimas Islam Kementerian Agama RI melalui EQuran.id.', 'Data source: Indonesian Ministry of Religious Affairs via EQuran.id.', 'مصدر البيانات: وزارة الشؤون الدينية الإندونيسية عبر EQuran.id.', '数据来源：印度尼西亚宗教事务部，通过 EQuran.id。'],
  ['Hikmah dan Renungan', 'Wisdom and Reflection', 'حِكم وتأملات', '智慧与反思'],
  ['Coba ubah filter pencarian Anda.', 'Try changing your search filters.', 'جرّب تغيير فلاتر البحث.', '请尝试更改搜索筛选条件。'],
  ['Buka sumber →', 'Open source →', 'فتح المصدر ←', '打开来源 →'],
  ['Bukan layanan fatwa, kesehatan, atau darurat. Periksa kembali sumber sebelum mengambil keputusan penting.', 'Not a fatwa, health, or emergency service. Verify sources before making important decisions.', 'ليست خدمة فتوى أو صحة أو طوارئ. تحقق من المصادر قبل اتخاذ قرارات مهمة.', '本服务不提供教法裁决、医疗或紧急服务。作出重要决定前请核实来源。'],
  ['Ceritakan topik yang ingin Anda cari. Saya akan membantu menemukan ayat, hadis, atau doa dari sumber yang terhubung.', 'Describe your topic and I will help find verses, hadith, or prayers from connected sources.', 'اذكر الموضوع وسأساعدك في العثور على آيات أو أحاديث أو أدعية من المصادر المتصلة.', '请描述想查询的主题，我会从已连接来源中帮助查找经文、圣训或祈祷。'],
  ['Inti Kajian', 'Lecture Highlights', 'خلاصة الدرس', '讲座要点'],
  ['Kanal Resmi YouTube', 'Official YouTube Channels', 'قنوات يوتيوب الرسمية', 'YouTube 官方频道'],
  ['Terbaru dari EQuran.id', 'Latest from EQuran.id', 'الأحدث من EQuran.id', 'EQuran.id 最新内容'],
  ['Info kajian belum tersedia', 'Lecture information is unavailable', 'معلومات الدروس غير متاحة', '讲座信息暂不可用'],
  ['Video YouTube belum tersedia', 'YouTube videos are unavailable', 'مقاطع يوتيوب غير متاحة', 'YouTube 视频暂不可用'],
  ['Coba gunakan kata kunci atau pilihan kota yang berbeda.', 'Try another keyword or city.', 'جرّب كلمة بحث أو مدينة أخرى.', '请尝试其他关键词或城市。'],
  ['Coba pilih pemateri lain atau hapus kata kunci pencarian.', 'Choose another speaker or clear the search keyword.', 'اختر محاضرًا آخر أو امسح كلمة البحث.', '请选择其他讲师或清除搜索关键词。'],
  ['Data disediakan oleh EQuran.id dan dikumpulkan dari kanal kajian publik.', 'Data is provided by EQuran.id and collected from public lecture channels.', 'البيانات مقدمة من EQuran.id ومجمعة من قنوات الدروس العامة.', '数据由 EQuran.id 提供，并汇集自公开讲座频道。'],
  ['Jadwal kajian dari berbagai masjid dan majelis ilmu di Indonesia. Selalu periksa sumber pengumuman sebelum berangkat karena jadwal dapat berubah.', 'Lecture schedules from mosques and study circles across Indonesia. Always verify the announcement before leaving.', 'مواعيد الدروس من المساجد ومجالس العلم في إندونيسيا. تحقق دائمًا من الإعلان قبل الذهاب.', '来自印度尼西亚各清真寺和学习班的讲座日程；出发前请核实公告。'],
  ['Mengambil jadwal terbaru dari EQuran.id...', 'Fetching the latest schedule from EQuran.id...', 'جارٍ جلب أحدث المواعيد من EQuran.id...', '正在从 EQuran.id 获取最新日程……'],
  ['Mengambil kajian dari kanal resmi YouTube...', 'Fetching lectures from official YouTube channels...', 'جارٍ جلب الدروس من قنوات يوتيوب الرسمية...', '正在从 YouTube 官方频道获取讲座……'],
];

const translations = new Map(rows.map(([id, en, ar, zh]) => [id, { id, en, ar, zh }]));

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly languages: LanguageOption[] = [
    { code: 'id', label: 'Bahasa Indonesia', shortLabel: 'ID' },
    { code: 'en', label: 'English', shortLabel: 'EN' },
    { code: 'ar', label: 'العربية', shortLabel: 'AR' },
    { code: 'zh', label: '中文', shortLabel: '中文' },
  ];
  readonly currentLanguage = signal<AppLanguage>('id');
  private readonly dynamicTranslations = new Map<AppLanguage, Map<string, string>>();
  private readonly cachePrefix = 'zaputlah.translation.v1.';

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('zaputlah.language') as AppLanguage | null;
      if (this.languages.some((language) => language.code === saved)) {
        this.currentLanguage.set(saved!);
      }
      (['en', 'ar', 'zh'] as AppLanguage[]).forEach((language) => {
        try {
          const cached = JSON.parse(localStorage.getItem(this.cachePrefix + language) || '{}') as Record<string, string>;
          this.dynamicTranslations.set(language, new Map(Object.entries(cached)));
        } catch {
          this.dynamicTranslations.set(language, new Map());
        }
      });
    }
    this.applyDocumentLanguage();
  }

  setLanguage(language: AppLanguage): void {
    this.currentLanguage.set(language);
    if (typeof localStorage !== 'undefined') localStorage.setItem('zaputlah.language', language);
    this.applyDocumentLanguage();
  }

  translate(source: string): string {
    const normalized = source.replace(/\s+/g, ' ').trim();
    const language = this.currentLanguage();
    const exact = translations.get(normalized)?.[language];
    if (exact) return exact;
    const dynamic = this.dynamicTranslations.get(language)?.get(normalized);
    if (dynamic) return dynamic;

    const patterns: [RegExp, Record<AppLanguage, (...values: string[]) => string>][] = [
      [/^Halaman (\d+) dari (\d+)$/, {
        id: (a, b) => `Halaman ${a} dari ${b}`, en: (a, b) => `Page ${a} of ${b}`,
        ar: (a, b) => `الصفحة ${a} من ${b}`, zh: (a, b) => `第 ${a} 页，共 ${b} 页`,
      }],
      [/^Bagian (\d+) dari (\d+)$/, {
        id: (a, b) => `Bagian ${a} dari ${b}`, en: (a, b) => `Part ${a} of ${b}`,
        ar: (a, b) => `الجزء ${a} من ${b}`, zh: (a, b) => `第 ${a} 部分，共 ${b} 部分`,
      }],
      [/^Bagian (\d+)$/, {
        id: (a) => `Bagian ${a}`, en: (a) => `Part ${a}`,
        ar: (a) => `الجزء ${a}`, zh: (a) => `第 ${a} 部分`,
      }],
      [/^Seri (\d+) dari (\d+)$/, {
        id: (a, b) => `Seri ${a} dari ${b}`, en: (a, b) => `Series ${a} of ${b}`,
        ar: (a, b) => `السلسلة ${a} من ${b}`, zh: (a, b) => `第 ${a} 组，共 ${b} 组`,
      }],
      [/^Menampilkan (\d+) dari (\d+) (.+)$/, {
        id: (a, b, item) => `Menampilkan ${a} dari ${b} ${item}`, en: (a, b, item) => `Showing ${a} of ${b} ${item}`,
        ar: (a, b, item) => `عرض ${a} من ${b} ${item}`, zh: (a, b, item) => `显示 ${a}/${b} ${item}`,
      }],
      [/^Surah ke-(\d+)$/, {
        id: (a) => `Surah ke-${a}`, en: (a) => `Chapter ${a}`,
        ar: (a) => `السورة ${a}`, zh: (a) => `第 ${a} 章`,
      }],
      [/^Ayat (\d+)$/, {
        id: (a) => `Ayat ${a}`, en: (a) => `Verse ${a}`,
        ar: (a) => `الآية ${a}`, zh: (a) => `第 ${a} 节`,
      }],
      [/^Skor (\d+)$/, {
        id: (a) => `Skor ${a}`, en: (a) => `Score ${a}`,
        ar: (a) => `النتيجة ${a}`, zh: (a) => `得分 ${a}`,
      }],
      [/^Hadis (\d+) dari (\d+)$/, {
        id: (a, b) => `Hadis ${a} dari ${b}`, en: (a, b) => `Hadith ${a} of ${b}`,
        ar: (a, b) => `الحديث ${a} من ${b}`, zh: (a, b) => `第 ${a} 条圣训，共 ${b} 条`,
      }],
    ];

    for (const [pattern, formatters] of patterns) {
      const match = normalized.match(pattern);
      if (match) return formatters[language](...match.slice(1));
    }
    return source;
  }

  hasTranslation(source: string): boolean {
    const normalized = source.replace(/\s+/g, ' ').trim();
    const language = this.currentLanguage();
    return (
      language === 'id' ||
      translations.has(normalized) ||
      this.dynamicTranslations.get(language)?.has(normalized) === true ||
      this.translate(source) !== source
    );
  }

  async translateBatch(sources: string[]): Promise<void> {
    const language = this.currentLanguage();
    if (language === 'id' || typeof fetch === 'undefined') return;
    const texts = [...new Set(
      sources
        .map((source) => source.replace(/\s+/g, ' ').trim())
        .filter((source) => source && !this.hasTranslation(source)),
    )].slice(0, 30);
    if (!texts.length) return;

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, language }),
    });
    if (!response.ok) throw new Error(`TRANSLATION_HTTP_${response.status}`);
    const result = (await response.json()) as {
      translations?: Array<{ source?: unknown; translated?: unknown }>;
    };
    if (this.currentLanguage() !== language) return;
    const cache = this.dynamicTranslations.get(language) || new Map<string, string>();
    for (const item of result.translations || []) {
      if (typeof item.source !== 'string' || typeof item.translated !== 'string') continue;
      const source = item.source.replace(/\s+/g, ' ').trim();
      const translated = item.translated.trim();
      if (source && translated) cache.set(source, translated);
    }
    this.dynamicTranslations.set(language, cache);
    this.saveDynamicCache(language, cache);
  }

  private saveDynamicCache(language: AppLanguage, cache: Map<string, string>): void {
    if (typeof localStorage === 'undefined') return;
    const recentEntries = [...cache.entries()].slice(-800);
    try {
      localStorage.setItem(this.cachePrefix + language, JSON.stringify(Object.fromEntries(recentEntries)));
    } catch {
      // Terjemahan tetap tersedia di memori ketika penyimpanan browser penuh/dinonaktifkan.
    }
  }

  private applyDocumentLanguage(): void {
    if (typeof document === 'undefined') return;
    const language = this.currentLanguage();
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-language', language);
  }
}
