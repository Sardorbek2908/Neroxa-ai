export type SupportedLanguage = 'uz' | 'en' | 'ru' | 'tr' | 'kk' | 'ar';

export interface TranslationSchema {
  brandName: string;
  tagline: string;
  nav: {
    dashboard: string;
    newChat: string;
    aiChat: string;
    createImage: string;
    createVideo: string;
    createPresentation: string;
    myCreations: string;
    models: string;
    settings: string;
    adminPanel: string;
    logout: string;
  };
  dashboard: {
    welcome: string;
    subtitle: string;
    quickActions: string;
    recentChats: string;
    recentCreations: string;
    usageStats: string;
    chatWithAi: string;
    generateImage: string;
    generateVideo: string;
    createPresentation: string;
    analyzeFile: string;
    messagesUsed: string;
    imagesCreated: string;
    videosGenerated: string;
    presentationsMade: string;
  };
  chat: {
    placeholder: string;
    send: string;
    newChat: string;
    noChats: string;
    searchChats: string;
    modelSelect: string;
    agentBadge: string;
    attachFile: string;
    clearChat: string;
    copy: string;
    copied: string;
    regenerate: string;
    stop: string;
  };
  image: {
    title: string;
    promptPlaceholder: string;
    generate: string;
    generating: string;
    aspectRatio: string;
    resolution: string;
    style: string;
    recentImages: string;
    download: string;
    edit: string;
    save: string;
    delete: string;
  };
  video: {
    title: string;
    promptPlaceholder: string;
    generate: string;
    generating: string;
    aspectRatio: string;
    duration: string;
    resolution: string;
    jobStatus: string;
    queued: string;
    processing: string;
    completed: string;
    failed: string;
  };
  presentation: {
    title: string;
    subtitle: string;
    topicPlaceholder: string;
    slideCount: string;
    language: string;
    audience: string;
    style: string;
    theme: string;
    generateBtn: string;
    generatingBtn: string;
    exportPptx: string;
    exportPdf: string;
    slideEditor: string;
    addSlide: string;
    deleteSlide: string;
    duplicateSlide: string;
    improveSlide: string;
    rewriteSlide: string;
    simplerSlide: string;
    professionalSlide: string;
    moreDetails: string;
    betterVisuals: string;
    speakerNotes: string;
    presentFullscreen: string;
  };
  creations: {
    title: string;
    all: string;
    images: string;
    videos: string;
    presentations: string;
    edited: string;
    empty: string;
  };
  settings: {
    title: string;
    account: string;
    appearance: string;
    language: string;
    privacy: string;
    security: string;
    sessions: string;
    changePassword: string;
    activeSessions: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  uz: {
    brandName: 'NEXORA AI',
    tagline: 'Yarating. Tasavvur qiling. Boshqaring.',
    nav: {
      dashboard: 'Bosh sahifa',
      newChat: 'Yangi suhbat',
      aiChat: 'AI Suhbat',
      createImage: 'Rasm yaratish',
      createVideo: 'Video yaratish',
      createPresentation: 'Prezentatsiya yaratish',
      myCreations: 'Mening ijodlarim',
      models: 'AI Modellar',
      settings: 'Sozlamalar',
      adminPanel: 'Boshqaruv paneli',
      logout: 'Chiqish',
    },
    dashboard: {
      welcome: 'Xush kelibsiz,',
      subtitle: 'NEXORA AI — Intellektual ko‘p modelli agent va ijodiy studiyangiz.',
      quickActions: 'Tezkor amallar',
      recentChats: 'So‘nggi suhbatlar',
      recentCreations: 'So‘nggi ijodlar',
      usageStats: 'Foydalanish statistikasi',
      chatWithAi: 'AI bilan suhbat',
      generateImage: 'Rasm yaratish',
      generateVideo: 'Video yaratish',
      createPresentation: 'Prezentatsiya yaratish',
      analyzeFile: 'Faylni tahlil qilish',
      messagesUsed: 'Xabarlar',
      imagesCreated: 'Rasmlar',
      videosGenerated: 'Videolar',
      presentationsMade: 'Prezentatsiyalar',
    },
    chat: {
      placeholder: 'NEXORA Agentga istalgan tilda savol bering yoki topshiriq yozing...',
      send: 'Yuborish',
      newChat: 'Yangi suhbat',
      noChats: 'Hozircha suhbatlar yo‘q',
      searchChats: 'Suhbatlarni qidirish...',
      modelSelect: 'AI Model',
      agentBadge: 'NEXORA Agent faol',
      attachFile: 'Fayl biriktirish',
      clearChat: 'Tozalash',
      copy: 'Nusxa olish',
      copied: 'Nusxa olindi',
      regenerate: 'Qayta yaratish',
      stop: 'To‘xtatish',
    },
    image: {
      title: 'AI Rasm yaratish studiyasi',
      promptPlaceholder: 'Masalan: Cyberpunk uslubida neon yoritilgan qadimiy Buxoro minorasi...',
      generate: 'Rasm yaratish',
      generating: 'Generatsiya qilinmoqda...',
      aspectRatio: 'Tomonlar nisbati',
      resolution: 'Aniqlik',
      style: 'Vizual uslub',
      recentImages: 'Yaratilgan rasmlar',
      download: 'Yuklab olish',
      edit: 'Tahrirlash',
      save: 'Saqlash',
      delete: 'O‘chirish',
    },
    video: {
      title: 'AI Video generatsiya studiyasi',
      promptPlaceholder: 'Masalan: Kosmos bo‘ylab parvoz qilayotgan yorug‘lik kemasi, kinematik harakat...',
      generate: 'Video yaratish',
      generating: 'Video render qilinmoqda...',
      aspectRatio: 'Format',
      duration: 'Davomiyligi',
      resolution: 'Sifat',
      jobStatus: 'Vazifa holati',
      queued: 'Navbatda',
      processing: 'Ishlanmoqda',
      completed: 'Tayyor',
      failed: 'Xatolik',
    },
    presentation: {
      title: 'AI Prezentatsiya generatori',
      subtitle: 'Professional 10 bosqichli taqdimot tayyorlash va PPTX/PDF eksport qilish',
      topicPlaceholder: 'Masalan: Universitet uchun ekologiya va qayta tiklanuvchi energiya...',
      slideCount: 'Slaydlar soni',
      language: 'Taqdimot tili',
      audience: 'Auditoriya',
      style: 'Uslub',
      theme: 'Mavzu dizayni',
      generateBtn: 'Prezentatsiya yaratish',
      generatingBtn: 'Slaydlar shakllantirilmoqda...',
      exportPptx: 'PPTX yuklab olish',
      exportPdf: 'PDF yuklab olish',
      slideEditor: 'Slayd tahrirlagich',
      addSlide: 'Slayd qo‘shish',
      deleteSlide: 'O‘chirish',
      duplicateSlide: 'Nusxalash',
      improveSlide: 'Slaydni yaxshilash',
      rewriteSlide: 'Qayta yozish',
      simplerSlide: 'Soddalashtirish',
      professionalSlide: 'Professional qilish',
      moreDetails: 'Tafsilot qo‘shish',
      betterVisuals: 'Yaxshiroq vizual',
      speakerNotes: 'Spiker eslatmalari',
      presentFullscreen: 'Taqdimot rejimi',
    },
    creations: {
      title: 'Mening ijodlarim',
      all: 'Barchasi',
      images: 'Rasmlar',
      videos: 'Videolar',
      presentations: 'Prezentatsiyalar',
      edited: 'Tahrirlangan',
      empty: 'Hozircha ijodiy ishlar mavjud emas.',
    },
    settings: {
      title: 'Tizim sozlamalari',
      account: 'Hisob ma’lumotlari',
      appearance: 'Ko‘rinish',
      language: 'Interfeys tili',
      privacy: 'Maxfiylik',
      security: 'Xavfsizlik',
      sessions: 'Faol seanslar',
      changePassword: 'Parolni o‘zgartirish',
      activeSessions: 'Seanslarni boshqarish',
    },
  },
  en: {
    brandName: 'NEXORA AI',
    tagline: 'Create. Imagine. Generate.',
    nav: {
      dashboard: 'Dashboard',
      newChat: 'New Chat',
      aiChat: 'AI Chat',
      createImage: 'Create Image',
      createVideo: 'Create Video',
      createPresentation: 'Create Presentation',
      myCreations: 'My Creations',
      models: 'AI Models',
      settings: 'Settings',
      adminPanel: 'Admin Panel',
      logout: 'Sign Out',
    },
    dashboard: {
      welcome: 'Welcome back,',
      subtitle: 'NEXORA AI — Your unified multi-model intelligence agent and creative studio.',
      quickActions: 'Quick Actions',
      recentChats: 'Recent Conversations',
      recentCreations: 'Recent Creations',
      usageStats: 'Usage Overview',
      chatWithAi: 'Chat with AI',
      generateImage: 'Generate Image',
      generateVideo: 'Generate Video',
      createPresentation: 'Create Presentation',
      analyzeFile: 'Analyze File',
      messagesUsed: 'Messages',
      imagesCreated: 'Images',
      videosGenerated: 'Videos',
      presentationsMade: 'Presentations',
    },
    chat: {
      placeholder: 'Ask NEXORA Agent anything or describe your task in any language...',
      send: 'Send',
      newChat: 'New Chat',
      noChats: 'No conversations yet',
      searchChats: 'Search chats...',
      modelSelect: 'Model',
      agentBadge: 'NEXORA Agent Active',
      attachFile: 'Attach File',
      clearChat: 'Clear',
      copy: 'Copy',
      copied: 'Copied',
      regenerate: 'Regenerate',
      stop: 'Stop',
    },
    image: {
      title: 'AI Image Studio',
      promptPlaceholder: 'Describe your vision: e.g. Futuristic architectural villa surrounded by lush bio-dome...',
      generate: 'Generate Image',
      generating: 'Synthesizing visual...',
      aspectRatio: 'Aspect Ratio',
      resolution: 'Resolution',
      style: 'Aesthetic Style',
      recentImages: 'Recent Images',
      download: 'Download',
      edit: 'Edit in Studio',
      save: 'Save to Creations',
      delete: 'Delete',
    },
    video: {
      title: 'AI Video Studio',
      promptPlaceholder: 'Describe motion: e.g. Drone flyover above neon illuminated cyberpunk skyline at sunset...',
      generate: 'Generate Video',
      generating: 'Rendering video job...',
      aspectRatio: 'Aspect Ratio',
      duration: 'Duration',
      resolution: 'Resolution',
      jobStatus: 'Job Status',
      queued: 'Queued',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
    },
    presentation: {
      title: 'AI Presentation Generator',
      subtitle: 'Full 10-stage AI presentation engine with editable PPTX & PDF exports',
      topicPlaceholder: 'e.g. 10-slide presentation on Photosynthesis for a university biology lecture...',
      slideCount: 'Slide Count',
      language: 'Language',
      audience: 'Target Audience',
      style: 'Style',
      theme: 'Theme Palette',
      generateBtn: 'Generate Presentation',
      generatingBtn: 'Synthesizing Slides...',
      exportPptx: 'Download PPTX',
      exportPdf: 'Download PDF',
      slideEditor: 'Slide Canvas & Editor',
      addSlide: 'Add Slide',
      deleteSlide: 'Delete',
      duplicateSlide: 'Duplicate',
      improveSlide: 'Improve Slide',
      rewriteSlide: 'Rewrite',
      simplerSlide: 'Make Simpler',
      professionalSlide: 'More Professional',
      moreDetails: 'Add Details',
      betterVisuals: 'Better Visuals',
      speakerNotes: 'Speaker Notes',
      presentFullscreen: 'Present Slideshow',
    },
    creations: {
      title: 'My Creations',
      all: 'All',
      images: 'Images',
      videos: 'Videos',
      presentations: 'Presentations',
      edited: 'Edited',
      empty: 'No creations saved yet. Start creating now!',
    },
    settings: {
      title: 'Settings',
      account: 'Account',
      appearance: 'Appearance',
      language: 'UI Language',
      privacy: 'Privacy',
      security: 'Security',
      sessions: 'Active Sessions',
      changePassword: 'Change Password',
      activeSessions: 'Session Management',
    },
  },
  ru: {
    brandName: 'NEXORA AI',
    tagline: 'Создавай. Воображай. Генерируй.',
    nav: {
      dashboard: 'Главная',
      newChat: 'Новый чат',
      aiChat: 'AI Чат',
      createImage: 'Создать изображение',
      createVideo: 'Создать видео',
      createPresentation: 'Создать презентацию',
      myCreations: 'Мои работы',
      models: 'AI Модели',
      settings: 'Настройки',
      adminPanel: 'Панель админа',
      logout: 'Выйти',
    },
    dashboard: {
      welcome: 'Добро пожаловать,',
      subtitle: 'NEXORA AI — Интеллектуальный агент и творческая студия.',
      quickActions: 'Быстрые действия',
      recentChats: 'Недавние диалоги',
      recentCreations: 'Недавние работы',
      usageStats: 'Статистика использования',
      chatWithAi: 'Чат с AI',
      generateImage: 'Создать изображение',
      generateVideo: 'Создать видео',
      createPresentation: 'Создать презентацию',
      analyzeFile: 'Анализ документа',
      messagesUsed: 'Сообщений',
      imagesCreated: 'Изображений',
      videosGenerated: 'Видео',
      presentationsMade: 'Презентаций',
    },
    chat: {
      placeholder: 'Задайте вопрос NEXORA Agent на любом языке...',
      send: 'Отправить',
      newChat: 'Новый диалог',
      noChats: 'Диалогов пока нет',
      searchChats: 'Поиск диалогов...',
      modelSelect: 'Модель',
      agentBadge: 'NEXORA Agent активен',
      attachFile: 'Прикрепить файл',
      clearChat: 'Очистить',
      copy: 'Скопировать',
      copied: 'Скопировано',
      regenerate: 'Перегенерировать',
      stop: 'Остановить',
    },
    image: {
      title: 'Студия генерации изображений',
      promptPlaceholder: 'Например: Киберпанк Lamborghini на ночной улице под неоновым дождем...',
      generate: 'Сгенерировать',
      generating: 'Генерация...',
      aspectRatio: 'Соотношение сторон',
      resolution: 'Разрешение',
      style: 'Стиль',
      recentImages: 'Созданные изображения',
      download: 'Скачать',
      edit: 'Редактировать',
      save: 'Сохранить',
      delete: 'Удалить',
    },
    video: {
      title: 'Студия видеогенерации',
      promptPlaceholder: 'Например: Плавный пролет камеры над футуристическим мегаполисом...',
      generate: 'Создать видео',
      generating: 'Рендеринг видео...',
      aspectRatio: 'Формат',
      duration: 'Длительность',
      resolution: 'Качество',
      jobStatus: 'Статус задачи',
      queued: 'В очереди',
      processing: 'Обработка',
      completed: 'Завершено',
      failed: 'Ошибка',
    },
    presentation: {
      title: 'Генератор AI презентаций',
      subtitle: 'Полный 10-этапный конвейер со слайд-редактором и экспортом в PPTX/PDF',
      topicPlaceholder: 'Например: Презентация на тему Фотосинтез для студентов биологического факультета...',
      slideCount: 'Количество слайдов',
      language: 'Язык',
      audience: 'Целевая аудитория',
      style: 'Стиль',
      theme: 'Тема оформления',
      generateBtn: 'Создать презентацию',
      generatingBtn: 'Формирование слайдов...',
      exportPptx: 'Скачать PPTX',
      exportPdf: 'Скачать PDF',
      slideEditor: 'Редактор слайдов',
      addSlide: 'Добавить слайд',
      deleteSlide: 'Удалить',
      duplicateSlide: 'Дублировать',
      improveSlide: 'Улучшить слайд',
      rewriteSlide: 'Переписать',
      simplerSlide: 'Упростить',
      professionalSlide: 'Более профессионально',
      moreDetails: 'Добавить детали',
      betterVisuals: 'Улучшить визуал',
      speakerNotes: 'Заметки спикера',
      presentFullscreen: 'Показ слайдов',
    },
    creations: {
      title: 'Мои работы',
      all: 'Все',
      images: 'Изображения',
      videos: 'Видео',
      presentations: 'Презентации',
      edited: 'Отредактированные',
      empty: 'Работ пока нет.',
    },
    settings: {
      title: 'Настройки',
      account: 'Аккаунт',
      appearance: 'Оформление',
      language: 'Язык интерфейса',
      privacy: 'Приватность',
      security: 'Безопасность',
      sessions: 'Активные сессии',
      changePassword: 'Сменить пароль',
      activeSessions: 'Управление сессиями',
    },
  },
  tr: {
    brandName: 'NEXORA AI',
    tagline: 'Oluştur. Hayal Et. Üret.',
    nav: {
      dashboard: 'Panel',
      newChat: 'Yeni Sohbet',
      aiChat: 'AI Sohbet',
      createImage: 'Resim Oluştur',
      createVideo: 'Video Oluştur',
      createPresentation: 'Sunum Oluştur',
      myCreations: 'Üretimlerim',
      models: 'AI Modeller',
      settings: 'Ayarlar',
      adminPanel: 'Yönetim Paneli',
      logout: 'Çıkış Yap',
    },
    dashboard: {
      welcome: 'Hoş geldiniz,',
      subtitle: 'NEXORA AI — Akıllı çok modelli yapay zeka ajanı ve yaratıcı stüdyonuz.',
      quickActions: 'Hızlı Eylemler',
      recentChats: 'Son Sohbetler',
      recentCreations: 'Son Üretimler',
      usageStats: 'Kullanım İstatistikleri',
      chatWithAi: 'AI ile Sohbet',
      generateImage: 'Resim Oluştur',
      generateVideo: 'Video Oluştur',
      createPresentation: 'Sunum Oluştur',
      analyzeFile: 'Dosya Analizi',
      messagesUsed: 'Mesajlar',
      imagesCreated: 'Resimler',
      videosGenerated: 'Videolar',
      presentationsMade: 'Sunumlar',
    },
    chat: {
      placeholder: 'NEXORA Agent\'a herhangi bir dilde soru sorun veya talimat verin...',
      send: 'Gönder',
      newChat: 'Yeni Sohbet',
      noChats: 'Henüz sohbet yok',
      searchChats: 'Sohbet ara...',
      modelSelect: 'Model',
      agentBadge: 'NEXORA Agent Aktif',
      attachFile: 'Dosya Ekle',
      clearChat: 'Temizle',
      copy: 'Kopyala',
      copied: 'Kopyalandı',
      regenerate: 'Yeniden Üret',
      stop: 'Durdur',
    },
    image: {
      title: 'AI Resim Stüdyosu',
      promptPlaceholder: 'Görseli tarif edin: örn. Fütüristik neon ışıklı İstanbul manzarası...',
      generate: 'Resim Oluştur',
      generating: 'Üretiliyor...',
      aspectRatio: 'En Boy Oranı',
      resolution: 'Çözünürlük',
      style: 'Görsel Tarz',
      recentImages: 'Son Resimler',
      download: 'İndir',
      edit: 'Düzenle',
      save: 'Kaydet',
      delete: 'Sil',
    },
    video: {
      title: 'AI Video Stüdyosu',
      promptPlaceholder: 'Hareketi tarif edin: örn. Sinematik drone çekimiyle geleceğin şehri...',
      generate: 'Video Oluştur',
      generating: 'Video işleniyor...',
      aspectRatio: 'Format',
      duration: 'Süre',
      resolution: 'Kalite',
      jobStatus: 'İş Durumu',
      queued: 'Kuyrukta',
      processing: 'İşleniyor',
      completed: 'Tamamlandı',
      failed: 'Başarısız',
    },
    presentation: {
      title: 'AI Sunum Oluşturucu',
      subtitle: '10 aşamalı profesyonel sunum motoru ve düzenlenebilir PPTX/PDF çıktısı',
      topicPlaceholder: 'örn. Yenilenebilir enerji kaynakları üzerine 10 slaytlık üniversite sunumu...',
      slideCount: 'Slayt Sayısı',
      language: 'Sunum Dili',
      audience: 'Hedef Kitle',
      style: 'Tarz',
      theme: 'Tema Tasarımı',
      generateBtn: 'Sunumu Oluştur',
      generatingBtn: 'Slaytlar Hazırlanıyor...',
      exportPptx: 'PPTX İndir',
      exportPdf: 'PDF İndir',
      slideEditor: 'Slayt Düzenleyici',
      addSlide: 'Slayt Ekle',
      deleteSlide: 'Sil',
      duplicateSlide: 'Çoğalt',
      improveSlide: 'Slaydı Geliştir',
      rewriteSlide: 'Yeniden Yaz',
      simplerSlide: 'Sadeleştir',
      professionalSlide: 'Profesyonelleştir',
      moreDetails: 'Detay Ekle',
      betterVisuals: 'Daha İyi Görsel',
      speakerNotes: 'Konuşmacı Notları',
      presentFullscreen: 'Tam Ekran Sun',
    },
    creations: {
      title: 'Üretimlerim',
      all: 'Tümü',
      images: 'Resimler',
      videos: 'Videolar',
      presentations: 'Sunumlar',
      edited: 'Düzenlenenler',
      empty: 'Henüz kayıtlı üretiminiz yok.',
    },
    settings: {
      title: 'Ayarlar',
      account: 'Hesap',
      appearance: 'Görünüm',
      language: 'Arayüz Dili',
      privacy: 'Gizlilik',
      security: 'Güvenlik',
      sessions: 'Aktif Oturumlar',
      changePassword: 'Şifre Değiştir',
      activeSessions: 'Oturum Yönetimi',
    },
  },
  kk: {
    brandName: 'NEXORA AI',
    tagline: 'Жаса. Элестет. Генерацияла.',
    nav: {
      dashboard: 'Басты бет',
      newChat: 'Жаңа чат',
      aiChat: 'AI Чат',
      createImage: 'Сурет жасау',
      createVideo: 'Видео жасау',
      createPresentation: 'Презентация жасау',
      myCreations: 'Менің жұмыстарым',
      models: 'AI Модельдер',
      settings: 'Баптаулар',
      adminPanel: 'Әкімші панелі',
      logout: 'Шығу',
    },
    dashboard: {
      welcome: 'Қош келдіңіз,',
      subtitle: 'NEXORA AI — Интеллектуалды көп модельді AI агенті.',
      quickActions: 'Жылдам әрекеттер',
      recentChats: 'Соңғы чаттар',
      recentCreations: 'Соңғы туындылар',
      usageStats: 'Қолдану статистикасы',
      chatWithAi: 'AI чат',
      generateImage: 'Сурет жасау',
      generateVideo: 'Видео жасау',
      createPresentation: 'Презентация жасау',
      analyzeFile: 'Файлды талдау',
      messagesUsed: 'Хабарламалар',
      imagesCreated: 'Суреттер',
      videosGenerated: 'Видеолар',
      presentationsMade: 'Презентациялар',
    },
    chat: {
      placeholder: 'NEXORA Agent-ке кез келген тілде сұрақ қойыңыз...',
      send: 'Жіберу',
      newChat: 'Жаңа чат',
      noChats: 'Әзірше чаттар жоқ',
      searchChats: 'Чаттарды іздеу...',
      modelSelect: 'Модель',
      agentBadge: 'NEXORA Agent Белсенді',
      attachFile: 'Файл тіркеу',
      clearChat: 'Тазалау',
      copy: 'Көшіру',
      copied: 'Көшірілді',
      regenerate: 'Қайта жасау',
      stop: 'Тоқтату',
    },
    image: {
      title: 'AI Сурет студиясы',
      promptPlaceholder: 'Сипаттама жазыңыз: мысалы, Киберпанк стиліндегі Астана көрінісі...',
      generate: 'Сурет жасау',
      generating: 'Генерациялануда...',
      aspectRatio: 'Қатынас',
      resolution: 'Анықтық',
      style: 'Стиль',
      recentImages: 'Жасалған суреттер',
      download: 'Жүктеп алу',
      edit: 'Өңдеу',
      save: 'Сақтау',
      delete: 'Жою',
    },
    video: {
      title: 'AI Видео студиясы',
      promptPlaceholder: 'Қозғалысты сипаттаңыз: мысалы, Ғарыштағы кеме, кинематографиялық қозғалыс...',
      generate: 'Видео жасау',
      generating: 'Рендеринг...',
      aspectRatio: 'Формат',
      duration: 'Ұзақтығы',
      resolution: 'Сапасы',
      jobStatus: 'Күйі',
      queued: 'Кезекте',
      processing: 'Өңделуде',
      completed: 'Дайын',
      failed: 'Қате',
    },
    presentation: {
      title: 'AI Презентация генераторы',
      subtitle: '10 сатылы кәсіби презентация және PPTX/PDF экспорт',
      topicPlaceholder: 'Мысалы: Университет үшін Биология және Экология тақырыбында...',
      slideCount: 'Слайд саны',
      language: 'Тіл',
      audience: 'Аудитория',
      style: 'Стиль',
      theme: 'Тақырып дизайны',
      generateBtn: 'Презентация жасау',
      generatingBtn: 'Слайдтар жинақталуда...',
      exportPptx: 'PPTX жүктеп алу',
      exportPdf: 'PDF жүктеп алу',
      slideEditor: 'Слайд редакторы',
      addSlide: 'Слайд қосу',
      deleteSlide: 'Жою',
      duplicateSlide: 'Көшірме жасау',
      improveSlide: 'Жақсарту',
      rewriteSlide: 'Қайта жазу',
      simplerSlide: 'Қарапайымдау ету',
      professionalSlide: 'Кәсіби ету',
      moreDetails: 'Толықтыру',
      betterVisuals: 'Жақсырақ визуал',
      speakerNotes: 'Спикер жазбалары',
      presentFullscreen: 'Слайдшоу',
    },
    creations: {
      title: 'Менің жұмыстарым',
      all: 'Барлығы',
      images: 'Суреттер',
      videos: 'Видеолар',
      presentations: 'Презентациялар',
      edited: 'Өңделген',
      empty: 'Әзірше жұмыстар жоқ.',
    },
    settings: {
      title: 'Баптаулар',
      account: 'Тіркелгі',
      appearance: 'Көрініс',
      language: 'Тіл',
      privacy: 'Құпиялылық',
      security: 'Қауіпсіздік',
      sessions: 'Сессиялар',
      changePassword: 'Құпиясөзді өзгерту',
      activeSessions: 'Сессияларды басқару',
    },
  },
  ar: {
    brandName: 'NEXORA AI',
    tagline: 'ابتكر. تخيل. ولّد.',
    nav: {
      dashboard: 'لوحة التحكم',
      newChat: 'محادثة جديدة',
      aiChat: 'محادثة الذكاء الاصطناعي',
      createImage: 'توليد الصور',
      createVideo: 'توليد الفيديو',
      createPresentation: 'إنشاء عرض تقديمي',
      myCreations: 'إبداعاتي',
      models: 'نماذج الذكاء الاصطناعي',
      settings: 'الإعدادات',
      adminPanel: 'لوحة الإدارة',
      logout: 'تسجيل الخروج',
    },
    dashboard: {
      welcome: 'مرحباً بك،',
      subtitle: 'NEXORA AI — وكيلك الذكي متعدد النماذج واستوديو الإبداع.',
      quickActions: 'إجراءات سريعة',
      recentChats: 'المحادثات الأخيرة',
      recentCreations: 'الإبداعات الأخيرة',
      usageStats: 'نظرة عامة على الاستخدام',
      chatWithAi: 'محادثة مع AI',
      generateImage: 'توليد صورة',
      generateVideo: 'توليد فيديو',
      createPresentation: 'إنشاء عرض تقديمي',
      analyzeFile: 'تحليل ملف',
      messagesUsed: 'الرسائل',
      imagesCreated: 'الصور',
      videosGenerated: 'الفيديوهات',
      presentationsMade: 'العروض',
    },
    chat: {
      placeholder: 'اسأل NEXORA Agent أي شيء بأي لغة...',
      send: 'إرسال',
      newChat: 'محادثة جديدة',
      noChats: 'لا توجد محادثات بعد',
      searchChats: 'البحث في المحادثات...',
      modelSelect: 'النموذج',
      agentBadge: 'وكيل NEXORA نشط',
      attachFile: 'إرفاق ملف',
      clearChat: 'مسح',
      copy: 'نسخ',
      copied: 'تم النسخ',
      regenerate: 'إعادة المحاولة',
      stop: 'إيقاف',
    },
    image: {
      title: 'استوديو توليد الصور',
      promptPlaceholder: 'صف الصورة: مثلاً مدينة مستقبلية بأضواء النيون مع تفاصيل سينمائية...',
      generate: 'توليد الصورة',
      generating: 'جاري التوليد...',
      aspectRatio: 'نسبة الأبعاد',
      resolution: 'الدقة',
      style: 'النمط الفني',
      recentImages: 'الصور الأخيرة',
      download: 'تحميل',
      edit: 'تعديل',
      save: 'حفظ',
      delete: 'حذف',
    },
    video: {
      title: 'استوديو توليد الفيديو',
      promptPlaceholder: 'صف الحركة: مثلاً طائرة درون تحلق فوق ناطحات سحاب في الغروب...',
      generate: 'توليد الفيديو',
      generating: 'جاري المعالجة...',
      aspectRatio: 'الأبعاد',
      duration: 'المدة',
      resolution: 'الجودة',
      jobStatus: 'حالة المهمة',
      queued: 'في الانتظار',
      processing: 'قيد المعالجة',
      completed: 'مكتمل',
      failed: 'فشل',
    },
    presentation: {
      title: 'مولد العروض التقديمية بالذكاء الاصطناعي',
      subtitle: 'محرك عروض احترافي من 10 مراحل وتصدير PPTX و PDF',
      topicPlaceholder: 'مثلاً: عرض تقديمي من 10 شرائح حول الذكاء الاصطناعي في الطب...',
      slideCount: 'عدد الشرائح',
      language: 'اللغة',
      audience: 'الجمهور المستهدف',
      style: 'الأسلوب',
      theme: 'التصميم',
      generateBtn: 'إنشاء العرض التقديمي',
      generatingBtn: 'جاري إعداد الشرائح...',
      exportPptx: 'تحميل PPTX',
      exportPdf: 'تحميل PDF',
      slideEditor: 'محرر الشرائح',
      addSlide: 'إضافة شريحة',
      deleteSlide: 'حذف',
      duplicateSlide: 'تكرار',
      improveSlide: 'تحسين الشريحة',
      rewriteSlide: 'إعادة الصياغة',
      simplerSlide: 'تبسيط',
      professionalSlide: 'أكثر احترافية',
      moreDetails: 'إضافة تفاصيل',
      betterVisuals: 'تحسين المظهر',
      speakerNotes: 'ملاحظات المتحدث',
      presentFullscreen: 'عرض بملء الشاشة',
    },
    creations: {
      title: 'إبداعاتي',
      all: 'الكل',
      images: 'الصور',
      videos: 'الفيديو',
      presentations: 'العروض',
      edited: 'المعدلة',
      empty: 'لا توجد أعمال محفوظة بعد.',
    },
    settings: {
      title: 'الإعدادات',
      account: 'الحساب',
      appearance: 'المظهر',
      language: 'لغة الواجهة',
      privacy: 'الخصوصية',
      security: 'الأمان',
      sessions: 'الجلسات النشطة',
      changePassword: 'تغيير كلمة المرور',
      activeSessions: 'إدارة الجلسات',
    },
  },
};
