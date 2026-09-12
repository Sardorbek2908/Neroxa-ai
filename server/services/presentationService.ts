import { db } from '../database/db';
import { Presentation, PresentationSlide, StudentInfo } from '../database/types';
import { geminiProvider } from '../providers/geminiProvider';
import crypto from 'crypto';

export interface GeneratePresentationOptions {
  userId: string;
  topic: string;
  slideCount?: number;
  language?: string;
  audience?: string;
  educationLevel?: string;
  style?: string;
  tone?: string;
  theme?: string;
  aspectRatio?: '16:9' | '4:3';
  includeImages?: boolean;
  includeCharts?: boolean;
  includeSpeakerNotes?: boolean;
  sourceContent?: string;
  templateId?: string;
  studentInfo?: StudentInfo;
}

export const THEME_PALETTES: Record<string, { bg: string; text: string; accent: string; cardBg: string }> = {
  'Dark Modern': { bg: '#0b0f19', text: '#f8fafc', accent: '#6366f1', cardBg: '#1e293b' },
  'Midnight Cyber': { bg: '#05070f', text: '#e2e8f0', accent: '#38bdf8', cardBg: '#0f172a' },
  'Emerald Clean': { bg: '#064e3b', text: '#f0fdf4', accent: '#34d399', cardBg: '#065f46' },
  'Obsidian Gold': { bg: '#18181b', text: '#fafafa', accent: '#eab308', cardBg: '#27272a' },
  'Azure Tech': { bg: '#0c1d37', text: '#f1f5f9', accent: '#60a5fa', cardBg: '#1e3a5f' },
  'Minimal Slate': { bg: '#0f172a', text: '#f8fafc', accent: '#94a3b8', cardBg: '#1e293b' },
  'Crimson Edge': { bg: '#1c0a0d', text: '#fef2f2', accent: '#f43f5e', cardBg: '#331016' },
  'Light Corporate': { bg: '#f8fafc', text: '#0f172a', accent: '#2563eb', cardBg: '#ffffff' }
};

export class PresentationService {
  async generatePresentation(options: GeneratePresentationOptions): Promise<Presentation> {
    const slideCount = options.slideCount || 10;
    const isUzbek =
      /uz|o['`’]zbek|ozbek|ўзбек/i.test(options.language || '') ||
      /\b(va|bilan|haqida|uchun|tizim|texnologiy|fan|talaba|dars|tarix|rivoj)\b/i.test(options.topic);
    const lang = isUzbek ? "O'zbek tili" : (options.language || 'English');
    const audience = options.audience || (isUzbek ? 'Universitet talabalari va mutaxassislar' : 'University & Professionals');
    const style = options.style || 'Modern';
    const themeName = options.theme || 'Dark Modern';
    const selectedTheme = THEME_PALETTES[themeName] || THEME_PALETTES['Dark Modern'];

    const prompt = `You are a world-class academic and corporate presentation designer and subject-matter expert.
Generate a comprehensive, highly informative, and academically thorough ${slideCount}-slide presentation about: "${options.topic}".

CRITICAL INFORMATION DENSITY REQUIREMENT (MA'LUMOTLAR O'TA KO'P, TO'LIQ VA ILMIY-AMALIY JIHATDAN CHUQUR BO'LSIN):
- Each slide MUST provide rich, detailed, comprehensive information. Never write short, vague, or superficial bullet points!
- "bulletPoints": Generate 4 to 6 detailed, deeply informative points for each slide. Each bullet point MUST be a complete, well-reasoned statement (15 to 30 words) containing specific facts, practical mechanisms, statistical indicators, definitions, real-world examples, or causal analyses.
- "bodyText": Provide a substantial explanatory narrative paragraph (3 to 5 well-developed sentences, ~60 to 100 words) that thoroughly analyzes the conceptual background, core principles, historical context, and practical significance of this slide's subject.
- "subtitle": An informative, context-setting subheading describing the core focus or key question.
- "speakerNotes": An extensive speech script for the presenter (60 to 100 words) with key speaking points, real-world analogies, and audience engagement questions.
- Slide 2 MUST be the official academic "REJA" (Table of Contents) with 5 to 6 comprehensive, logically ordered study sections.

CRITICAL LANGUAGE REQUIREMENT:
${isUzbek 
  ? "All titles, subtitles, bullet points, bodyText, and speaker notes MUST be strictly written 100% in natural, professional Uzbek (O'zbek tili, lotin yozuvida). Do NOT use English for any slide text except the 'imagePrompt'!"
  : `MUST be written fluently and thoroughly in ${lang}.`
}
Target Audience: ${audience}
Education level: ${options.educationLevel || (isUzbek ? 'Oliy ta’lim / Universitet' : 'University / Higher Education')}
Style: ${style}
Include speaker notes: ${options.includeSpeakerNotes !== false ? 'Yes' : 'No'}
Include charts/data: ${options.includeCharts !== false ? 'Yes' : 'No'}
${options.studentInfo ? `
STUDENT & ACADEMIC CONTEXT:
- Student Name (Bajardi): "${options.studentInfo.studentName || ''}"
- Institution / University / School (OTM): "${options.studentInfo.institution || ''}"
- Group (Guruh): "${options.studentInfo.group || ''}"
- Field of Study / Specialization (Yo'nalish): "${options.studentInfo.fieldOfStudy || ''}"
- Teacher / Academic Supervisor (Qabul qildi): "${options.studentInfo.advisor || ''}"
- Work Type (Ish turi): "${options.studentInfo.workType || 'Mustaqil ish'}"
- City and Year (Shahar va yil): "${options.studentInfo.cityAndYear || 'Toshkent - 2026'}"
(Slide 1 MUST prominently integrate this student information in its subtitle and presenter details. Slide 2 MUST be the official academic "REJA" / Table of Contents.)
` : ''}
${options.sourceContent ? `Base content strictly on this document excerpt:\n"""${options.sourceContent.slice(0, 3000)}"""` : ''}

Respond ONLY with a valid JSON array of slide objects.
Each slide object must follow this exact structure:
{
  "title": "${isUzbek ? "Slaydning to'liq sarlavhasi (O'zbek tilida)" : `Slide Title in ${lang}`}",
  "subtitle": "${isUzbek ? "Mavzuni ochib beruvchi aniq izohli kichik sarlavha (O'zbek tilida)" : `Contextual subtitle in ${lang}`}",
  "layout": "title" | "content" | "split" | "stats" | "chart" | "table" | "conclusion",
  "bulletPoints": [
    "${isUzbek ? "1-batafsil va chuqur asoslangan ilmiy-amaliy tushuncha yoki fakt (kamida 15-25 so'z)" : `Detailed comprehensive point 1 in ${lang}`}",
    "${isUzbek ? "2-batafsil va chuqur asoslangan ilmiy-amaliy tushuncha yoki fakt (kamida 15-25 so'z)" : `Detailed comprehensive point 2 in ${lang}`}",
    "${isUzbek ? "3-batafsil va chuqur asoslangan ilmiy-amaliy tushuncha yoki fakt (kamida 15-25 so'z)" : `Detailed comprehensive point 3 in ${lang}`}",
    "${isUzbek ? "4-batafsil va chuqur asoslangan ilmiy-amaliy tushuncha yoki fakt (kamida 15-25 so'z)" : `Detailed comprehensive point 4 in ${lang}`}",
    "${isUzbek ? "5-batafsil va chuqur asoslangan ilmiy-amaliy tushuncha yoki fakt (kamida 15-25 so'z)" : `Detailed comprehensive point 5 in ${lang}`}"
  ],
  "bodyText": "${isUzbek ? "Slayd bo'yicha batafsil 3-5 gapdan iborat ilmiy, tahliliy va amaliy tushuntirish matni (60-90 so'z)" : 'Detailed 3-5 sentence explanatory paragraph for the slide (60-90 words)'}",
  "speakerNotes": "${isUzbek ? "Taqdimotchi uchun 60-100 so'zdan iborat batafsil nutq matni va tushuntirishlar" : `Guidance notes for the presenter in ${lang}`}",
  "imagePrompt": "English descriptive prompt describing an authentic photographic image matching this slide's exact topic",
  "chart": {
    "type": "bar" | "line" | "pie",
    "title": "${isUzbek ? "Diagramma nomi (O'zbek tilida)" : 'Chart Title'}",
    "labels": ["${isUzbek ? 'A band' : 'Item A'}", "${isUzbek ? 'B band' : 'Item B'}", "${isUzbek ? 'C band' : 'Item C'}"],
    "data": [45, 78, 92]
  },
  "table": {
    "headers": ["${isUzbek ? 'Ko‘rsatkich' : 'Col 1'}", "${isUzbek ? 'Tavsif' : 'Col 2'}", "${isUzbek ? 'Natija' : 'Col 3'}"],
    "rows": [["1", "...", "..."], ["2", "...", "..."]]
  }
}
Note: "chart" and "table" should only be present when layout is "chart" or "table". When layout is "table", "bulletPoints" MUST be [] (empty array) because the table is the primary visual content. When layout is "title", "bulletPoints" MUST be [].
Output ONLY the raw JSON array. No markdown fences or conversational text.`;

    let generatedSlidesData: any[] = [];
    try {
      const response = await geminiProvider.generateText(prompt, {
        model: 'gemini-3.8-flash',
        temperature: 0.3,
        systemInstruction: `You are an expert academic and corporate presentation designer. You always respond in raw valid JSON format matching the schema requested. When language is Uzbek or topic is in Uzbek, ALL slide text (titles, subtitles, bullets, bodyText, notes) MUST be strictly written in authentic, professional Uzbek (O'zbek tili). If student academic info is provided, embed it into the title slide.`,
      });

      // Parse JSON safely
      const cleanJson = response.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      generatedSlidesData = JSON.parse(cleanJson);
    } catch (err) {
      console.warn('AI structured generation fallback due to:', err);
      generatedSlidesData = this.buildFallbackSlides(options.topic, slideCount, lang);
    }

    if (!Array.isArray(generatedSlidesData) || generatedSlidesData.length === 0) {
      generatedSlidesData = this.buildFallbackSlides(options.topic, slideCount, lang);
    }

    // Process slides into standard PresentationSlide format with content-matching images
    const slides: PresentationSlide[] = generatedSlidesData.map((s, idx) => {
      const isTitleSlide = idx === 0 || s.layout === 'title';
      const hasTable = Boolean(s.table && s.table.headers && s.table.headers.length > 0);
      const isTableSlide = s.layout === 'table' || hasTable;

      // Content-matching photorealistic image prompt for this specific slide
      const slideSpecificPrompt = s.imagePrompt || `${options.topic} ${s.title} authentic photography high detail 4k cinematic`;
      const cleanSlidePrompt = encodeURIComponent(
        slideSpecificPrompt
          .replace(/[^\w\s\u0400-\u04FF\u0100-\u017F]/gi, ' ')
          .trim()
          .slice(0, 110)
      );

      // Real, topic-relevant image URL matching the exact slide's content via reliable same-origin proxy
      const imageUrl = `/api/presentations/slide-image?q=${cleanSlidePrompt}&seed=${idx * 137 + 19}`;

      let subtitle = s.subtitle || '';
      let bodyText = s.bodyText || '';

      // If student info provided and this is Slide 1 (Title slide), cleanly set subtitle and leave body clean
      if (idx === 0 && options.studentInfo) {
        const si = options.studentInfo;
        const workTypeLabel = si.workType || 'Mustaqil ish';
        subtitle = `${workTypeLabel} • ${si.institution || "Oliy Ta'lim Muassasasi"}`;
        bodyText = ''; // Keep clean, academic metadata is rendered in dedicated student card
      }

      // On Slide 1 with studentInfo or on table slides, keep layout clean without colliding side images
      const shouldIncludeImage = options.includeImages !== false && !isTitleSlide && !isTableSlide;

      // Ensure table slides don't have overlapping bullet points
      const finalBulletPoints = isTableSlide
        ? []
        : isTitleSlide && options.studentInfo
        ? []
        : Array.isArray(s.bulletPoints)
        ? s.bulletPoints.slice(0, 4)
        : [];

      return {
        id: `sld_${crypto.randomUUID()}`,
        order: idx + 1,
        title: s.title || `Slide ${idx + 1}`,
        subtitle,
        layout: s.layout || (idx === 0 ? 'title' : idx === generatedSlidesData.length - 1 ? 'conclusion' : isTableSlide ? 'table' : 'content'),
        bulletPoints: finalBulletPoints,
        bodyText,
        speakerNotes: s.speakerNotes || '',
        imagePrompt: s.imagePrompt || `${options.topic} ${s.title}`,
        imageUrl: shouldIncludeImage ? imageUrl : undefined,
        chart: s.chart,
        table: s.table,
        themeCustomization: {
          backgroundColor: selectedTheme.bg,
          textColor: selectedTheme.text,
          accentColor: selectedTheme.accent,
        },
      };
    });

    const presentation = db.createPresentation({
      userId: options.userId,
      title: options.topic.slice(0, 80),
      description: `Presentation on ${options.topic} (${slideCount} slides, ${style} style)`,
      topic: options.topic,
      language: lang,
      audience,
      educationLevel: options.educationLevel || 'University',
      style,
      tone: options.tone || 'Professional',
      theme: themeName,
      aspectRatio: options.aspectRatio || '16:9',
      slides,
      studentInfo: options.studentInfo,
    });

    // Also record in Creations
    db.addGeneration({
      userId: options.userId,
      type: 'presentation',
      title: options.topic.slice(0, 60),
      prompt: options.topic,
      model: 'gemini-3.8-flash',
      aspectRatio: options.aspectRatio || '16:9',
      outputUrl: `/presentations/${presentation.id}`,
      metadata: {
        presentationId: presentation.id,
        slideCount: slides.length,
        language: lang,
        theme: themeName,
      },
    });

    db.incrementUsage(options.userId, 'presentationsCount', 1);

    return presentation;
  }

  async regenerateSlide(
    presentationId: string,
    slideId: string,
    userId: string,
    action: 'improve' | 'rewrite' | 'simpler' | 'professional' | 'more_details' | 'better_visuals' | 'custom',
    customInstruction?: string
  ): Promise<PresentationSlide> {
    const presentation = db.getPresentation(presentationId, userId);
    if (!presentation) {
      throw new Error('Presentation not found or access denied');
    }

    const slideIndex = presentation.slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) {
      throw new Error('Slide not found in presentation');
    }

    const targetSlide = presentation.slides[slideIndex];

    const actionPrompts = {
      improve: 'Improve this slide by making the phrasing more compelling, clear, and impactful.',
      rewrite: 'Rewrite this slide with a fresh perspective while keeping the core knowledge intact.',
      simpler: 'Simplify this slide: make bullet points concise, sharp, and easy to grasp in seconds.',
      professional: 'Refine this slide into an executive, high-level corporate/academic tone.',
      more_details: 'Expand this slide with deeper technical details, examples, and comprehensive points.',
      better_visuals: 'Redesign the visual prompt and graphic description to be modern, cinematic, and clear.',
      custom: customInstruction || 'Improve this slide according to user request.',
    };

    const instruction = actionPrompts[action] || actionPrompts.improve;

    const prompt = `You are an expert presentation editor.
Topic of presentation: "${presentation.topic}"
Language: ${presentation.language}
Current slide content:
${JSON.stringify({
  title: targetSlide.title,
  subtitle: targetSlide.subtitle,
  bulletPoints: targetSlide.bulletPoints,
  bodyText: targetSlide.bodyText,
  speakerNotes: targetSlide.speakerNotes,
  layout: targetSlide.layout
}, null, 2)}

User Instruction: "${instruction}"

Return ONLY a valid JSON object matching the slide structure:
{
  "title": "...",
  "subtitle": "...",
  "layout": "title" | "content" | "split" | "stats" | "chart" | "table" | "conclusion",
  "bulletPoints": ["...", "..."],
  "bodyText": "...",
  "speakerNotes": "...",
  "imagePrompt": "..."
}`;

    try {
      const response = await geminiProvider.generateText(prompt, {
        model: 'gemini-3.8-flash',
        temperature: 0.4,
      });

      const cleanJson = response.replace(/^```(json)?\n?/i, '').replace(/\n?```$/i, '').trim();
      const updatedData = JSON.parse(cleanJson);

      targetSlide.title = updatedData.title || targetSlide.title;
      targetSlide.subtitle = updatedData.subtitle !== undefined ? updatedData.subtitle : targetSlide.subtitle;
      targetSlide.bulletPoints = Array.isArray(updatedData.bulletPoints) ? updatedData.bulletPoints : targetSlide.bulletPoints;
      targetSlide.bodyText = updatedData.bodyText || targetSlide.bodyText;
      targetSlide.speakerNotes = updatedData.speakerNotes || targetSlide.speakerNotes;
      if (updatedData.layout) targetSlide.layout = updatedData.layout;
      if (updatedData.imagePrompt) {
        targetSlide.imagePrompt = updatedData.imagePrompt;
        const theme = THEME_PALETTES[presentation.theme] || THEME_PALETTES['Dark Modern'];
        const svg = this.generateSlideVisualSvg(targetSlide.title, updatedData.imagePrompt, theme.accent);
        targetSlide.imageUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
      }

      db.updatePresentation(presentationId, userId, { slides: presentation.slides });
      return targetSlide;
    } catch (e: any) {
      console.error('Slide regeneration error:', e);
      throw new Error(`Failed to regenerate slide: ${e.message}`);
    }
  }

  private generateSlideVisualSvg(title: string, prompt: string, accentColor = '#6366f1'): string {
    const cleanTitle = title.replace(/[<>&"]/g, '').slice(0, 40);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="600" height="360">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0b1120" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
        <linearGradient id="accGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${accentColor}" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="16" fill="url(#bgGrad)" />
      <circle cx="300" cy="160" r="100" fill="${accentColor}" opacity="0.15" />
      <g stroke="${accentColor}" stroke-width="2" fill="none" opacity="0.6">
        <rect x="230" y="90" width="140" height="140" rx="12" />
        <circle cx="300" cy="160" r="45" />
        <line x1="230" y1="160" x2="370" y2="160" />
        <line x1="300" y1="90" x2="300" y2="230" />
      </g>
      <text x="300" y="280" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="16" font-weight="600" text-anchor="middle">
        ${cleanTitle}
      </text>
      <text x="300" y="305" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">
        NEXORA Visual Engine
      </text>
    </svg>`;
  }

  private buildFallbackSlides(topic: string, count: number, lang: string): any[] {
    const isUz =
      /uz|o['`’]zbek|ozbek|ўзбек/i.test(lang || '') ||
      /\b(va|bilan|haqida|uchun|tizim|texnologiy|fan|talaba|dars|tarix|rivoj)\b/i.test(topic);
    const isRu = /ru/i.test(lang || '');

    const slides = [];
    for (let i = 1; i <= count; i++) {
      if (i === 1) {
        slides.push({
          title: topic,
          subtitle: isUz
            ? 'NEXORA AI tomonidan tayyorlangan professional taqdimot'
            : isRu
            ? 'Профессиональная презентация от NEXORA AI'
            : 'Professional Presentation by NEXORA AI',
          layout: 'title',
          bulletPoints: [
            isUz ? 'Mavzuning dolzarbligi: zamonaviy ilm-fan va amaliyotdagi o‘rni hamda konseptual asoslari' : isRu ? 'Актуальность темы и современные концептуальные основы в науке и практике' : 'Core academic significance, conceptual foundations, and contemporary relevance',
            isUz ? 'Asosiy maqsad va vazifalar: tahlil qilinayotgan jarayonlarning tizimli va qiyosiy tadqiqi' : isRu ? 'Основные цели и задачи: системное и сравнительное исследование процессов' : 'Primary research objectives and systematic methodological investigation',
            isUz ? 'Kutilayotgan ilmiy va amaliy natijalar hamda sohadagi istiqbolli rivojlanish tendensiyalari' : isRu ? 'Ожидаемые научные и практические результаты и перспективные тренды развития' : 'Anticipated academic findings and strategic industry application roadmap',
            isUz ? 'Taqdimot mundarijasi va ko‘rib chiqiladigan asosiy ilmiy-nazariy yo‘nalishlar tavsifi' : isRu ? 'Структура презентации и описание ключевых научно-теоретических направлений' : 'Presentation structure and comprehensive outline of foundational modules'
          ],
          bodyText: isUz
            ? 'Ushbu taqdimot mavzusi bo‘yicha chuqur ilmiy-nazariy va amaliy tahlillar umumlashtirilgan bo‘lib, sohaning bugungi holati, asosiy muammolari va zamonaviy yechimlari tizimli ravishda yoritib beriladi.'
            : isRu
            ? 'Данная презентация представляет собой глубокий научно-теоретический и практический анализ актуального состояния, ключевых вызовов и современных решений в исследуемой области.'
            : 'This presentation delivers a comprehensive theoretical and applied analysis of current industry dynamics, foundational frameworks, and future implementation pathways.',
          speakerNotes: isUz
            ? 'Kirish qismida mavzuning nima sababdan bugungi kunda dolzarb ekanligini ta’kidlab, umumiy reja va maqsadlarni qisqacha bayon eting.'
            : 'Introduce the strategic relevance of the topic, key objectives, and structured presentation roadmap.',
          imagePrompt: `${topic} overview conceptual visual`
        });
      } else if (i === count) {
        slides.push({
          title: isUz ? 'Xulosa va kelgusi tavsiyalar' : isRu ? 'Заключение и выводы' : 'Conclusion & Strategic Takeaways',
          subtitle: isUz ? 'Natijalar sarhisobi va amaliy takliflar' : 'Key Takeaways & Next Steps',
          layout: 'conclusion',
          bulletPoints: [
            isUz ? 'Mavzu doirasida o‘rganilgan barcha nazariy va amaliy jihatlar chuqur umumlashtirildi' : 'Comprehensive synthesis of all analyzed theoretical and practical paradigms',
            isUz ? 'Aniqlangan muammolar va ularni bartaraf etish bo‘yicha ilmiy asoslangan takliflar ishlab chiqildi' : 'Evidence-based recommendations formulated to resolve core domain bottlenecks',
            isUz ? 'Sohaning kelgusi 3-5 yillik istiqboldagi rivojlanish yo‘nalishlari va strategik maqsadlari belgilandi' : 'Strategic development milestones projected for upcoming 3-5 year cycle',
            isUz ? 'Amaliyotga tatbiq etish mexanizmlari va iqtisodiy/ijtimoiy samaradorlik ko‘rsatkichlari baholandi' : 'Implementation frameworks and anticipated efficiency ROI rigorously validated',
            isUz ? 'Savollar, fikr-mulohazalar va takliflar uchun barchaga samimiy minnatdorchilik bildiramiz' : 'Open for interactive academic discussion, queries, and peer collaboration'
          ],
          bodyText: isUz
            ? 'Tadqiqot natijalari shuni ko‘rsatadiki, taklif etilgan yondashuv va metodologiyalar amaliyotda yuqori samaradorlik beradi hamda sohani yangi bosqichga olib chiqish imkoniyatini yaratadi.'
            : 'The analytical findings confirm that the proposed methodologies demonstrate measurable efficacy and offer robust pathways for strategic advancement.',
          speakerNotes: isUz
            ? 'Xulosalarni aniq va ishonchli taqdim etib, amaliy ahamiyatini eslatib o‘ting va auditoriyani savollar berishga taklif qiling.'
            : 'Summarize core insights with conviction, emphasize practical value, and invite attendee discussion.',
          imagePrompt: `${topic} success conclusion finish visual`
        });
      } else if (i === 3) {
        slides.push({
          title: isUz ? 'Ko‘rsatkichlar va qiyosiy tahlil' : isRu ? 'Аналитические метрики и данные' : 'Comparative Metrics & Performance',
          subtitle: isUz ? 'Dinamik o‘sish va statistik tahlil' : 'Core parameters and trajectory',
          layout: 'chart',
          bulletPoints: [
            isUz ? 'O‘rganilgan ko‘rsatkichlar dinamikasida barqaror va ijobiy o‘sish tendensiyasi qayd etildi' : 'Consistently positive growth trajectories established across evaluated metrics',
            isUz ? 'Samaradorlik va aniqlik darajasi avvalgi davrlarga nisbatan 35-40% ga yuqori darajada mustahkamlandi' : 'Productivity and precision benchmarks uplifted by 35-40% compared to baseline',
            isUz ? 'Resurslar sarfini optimallashtirish va xarajatlarni 25% gacha tejash imkoniyati ilmiy isbotlandi' : 'Resource optimization modeling verified up to 25% operational cost reduction',
            isUz ? 'Xalqaro standartlar va ilg‘or tajribalar asosida tahlil qilingan ma’lumotlarning ishonchliligi ta’minlandi' : 'Data accuracy and benchmark integrity verified against global industry standards'
          ],
          bodyText: isUz
            ? 'Ushbu statistik va qiyosiy tahlil tadqiq qilinayotgan sohadagi muhim parametrlarning dinamikasini ko‘rsatadi hamda strategik qarorlar qabul qilish uchun ishonchli zamin yaratadi.'
            : 'This comparative statistical breakdown demonstrates measurable trajectory metrics that substantiate informed strategic decision-making.',
          chart: {
            type: 'bar',
            title: isUz ? 'Asosiy ko‘rsatkichlar dinamikasi (%)' : 'Annual Growth Rate',
            labels: isUz ? ['1-bosqich', '2-bosqich', '3-bosqich', '4-bosqich'] : ['Q1', 'Q2', 'Q3', 'Q4'],
            data: [42, 65, 84, 98]
          },
          speakerNotes: isUz
            ? 'Grafik orqali o‘sish sur’ati va erishilgan amaliy samaradorlik ko‘rsatib beriladi.'
            : 'Highlight the empirical data demonstrated in the chart.'
        });
      } else {
        slides.push({
          title: isUz ? `${i}-Bo‘lim: ${topic} asosiy tamoyillari` : isRu ? `Раздел ${i}: Аспекты ${topic}` : `Section ${i}: ${topic} Dimensions`,
          subtitle: isUz ? 'Batafsil ilmiy tahlil va zamonaviy yondashuvlar' : 'In-depth analysis and principles',
          layout: i % 2 === 0 ? 'split' : 'content',
          bulletPoints: [
            isUz ? 'Nazariy asoslar va xalqaro ilg‘or tajribalar tahlili hamda ilmiy konseptsiya mohiyati' : 'Rigorous theoretical framework and systematic synthesis of best international practices',
            isUz ? 'Zamonaviy metodologiya, raqamli vositalar va optimallashtirish uslublarining integratsiyasi' : 'Seamless integration of modern quantitative methodology and automated digital workflows',
            isUz ? 'Amaliyotda tasdiqlangan, sinovdan o‘tgan hamda samaradorligi isbotlangan amaliy natijalar' : 'Empirically validated models demonstrating sustainable real-world execution efficacy',
            isUz ? 'Mavjud to‘siqlar, ularni bartaraf etish mexanizmlari va kelajakdagi rivojlanish imkoniyatlari' : 'Risk mitigation architectures, obstacle resolution mechanisms, and scalability pathways'
          ],
          bodyText: isUz
            ? 'Ushbu bo‘limda ko‘rib chiqilayotgan sohaning eng muhim tarkibiy qismlari, texnologik va metodologik jihatlari atroflicha bayon etiladi. Har bir element amaliy tajribalar bilan mustahkamlanadi.'
            : 'Detailed examination of structural components and domain-specific nuances, supported by empirical case validation.',
          speakerNotes: isUz
            ? 'Ushbu slaydning har bir asosiy qismiga alohida to‘xtalib tushuntiriladi.'
            : 'Walk the audience through the key pillars outlined.',
          imagePrompt: `${topic} section ${i} illustration diagram`
        });
      }
    }
    return slides;
  }
}

export const presentationService = new PresentationService();
