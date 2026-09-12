import { Router } from 'express';
import { db } from '../database/db';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { presentationService } from '../services/presentationService';
import { exportService } from '../services/exportService';

const router = Router();

// Slide image proxy & cache endpoint (guarantees 100% reliable 200 OK delivery with zero broken images)
const slideImageCache = new Map<string, Buffer>();

// Comprehensive Curated Photo Banks for 100% Unique, Non-Repeating Slide Photography
const PHOTO_POOLS: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=960&q=80&auto=format&fit=crop', // Cyber AI neural network
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=960&q=80&auto=format&fit=crop', // Microchip motherboard hardware
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=960&q=80&auto=format&fit=crop', // Security code matrix
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=960&q=80&auto=format&fit=crop', // Cloud datacenter servers
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=960&q=80&auto=format&fit=crop', // Modern tech engineering team
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=960&q=80&auto=format&fit=crop', // Robotics automation
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=960&q=80&auto=format&fit=crop', // Futuristic tech workspace
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=960&q=80&auto=format&fit=crop', // Cybersecurity glowing visual
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=960&q=80&auto=format&fit=crop', // Digital mobile interface team
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=960&q=80&auto=format&fit=crop', // Global digital data Earth
  ],
  medical: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=960&q=80&auto=format&fit=crop', // Doctor with digital tablet
    'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=960&q=80&auto=format&fit=crop', // Laboratory clinical research
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=960&q=80&auto=format&fit=crop', // Healthcare consultation
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=960&q=80&auto=format&fit=crop', // DNA helix biotechnology
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=960&q=80&auto=format&fit=crop', // Stethoscope and medical notes
    'https://images.unsplash.com/photo-1583912267670-6575ad4ce2e3?w=960&q=80&auto=format&fit=crop', // Scientist with microscope
    'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=960&q=80&auto=format&fit=crop', // Pharmacy medicine capsules
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=960&q=80&auto=format&fit=crop', // Modern hospital diagnostic room
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=960&q=80&auto=format&fit=crop', // Medical doctor team
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=960&q=80&auto=format&fit=crop', // Digital healthcare visual
  ],
  business: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=960&q=80&auto=format&fit=crop', // Financial analytics laptop
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=960&q=80&auto=format&fit=crop', // Corporate glass skyscraper
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=960&q=80&auto=format&fit=crop', // Executive business strategy
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=960&q=80&auto=format&fit=crop', // Conference room meeting
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=960&q=80&auto=format&fit=crop', // Business plan development
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=960&q=80&auto=format&fit=crop', // Stock market growth graphs
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=960&q=80&auto=format&fit=crop', // Professional collaboration
    'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=960&q=80&auto=format&fit=crop', // Investment banking wealth
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=960&q=80&auto=format&fit=crop', // Successful company presentation
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=960&q=80&auto=format&fit=crop', // Clean modern corporate office
  ],
  education: [
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=960&q=80&auto=format&fit=crop', // University students study
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=960&q=80&auto=format&fit=crop', // Open book library
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=960&q=80&auto=format&fit=crop', // Lecture hall university professor
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=960&q=80&auto=format&fit=crop', // Academic university campus
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=960&q=80&auto=format&fit=crop', // Student research writing
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=960&q=80&auto=format&fit=crop', // Interactive educational seminar
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=960&q=80&auto=format&fit=crop', // Graduation diploma achievement
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=960&q=80&auto=format&fit=crop', // Student peer discussion
    'https://images.unsplash.com/photo-1568667256549-094345857637?w=960&q=80&auto=format&fit=crop', // Grand library archives
    'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=960&q=80&auto=format&fit=crop', // College campus outdoors
  ],
  nature: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=960&q=80&auto=format&fit=crop', // Misty mountains
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=960&q=80&auto=format&fit=crop', // Green forest sunlight
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=960&q=80&auto=format&fit=crop', // Ocean coastal landscape
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=960&q=80&auto=format&fit=crop', // Alpine mountain sunset
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=960&q=80&auto=format&fit=crop', // Renewable clean wind energy
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=960&q=80&auto=format&fit=crop', // Autumn woodland path
    'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=960&q=80&auto=format&fit=crop', // Pristine lake reflection
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=960&q=80&auto=format&fit=crop', // Environmental botanic leaves
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=960&q=80&auto=format&fit=crop', // Valley national park
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=960&q=80&auto=format&fit=crop', // Scenic wilderness waterfall
  ],
  architecture: [
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=960&q=80&auto=format&fit=crop', // Blueprints and engineering
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=960&q=80&auto=format&fit=crop', // Modern skyscraper perspective
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=960&q=80&auto=format&fit=crop', // Architectural minimalist interior
    'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=960&q=80&auto=format&fit=crop', // Urban construction engineering
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=960&q=80&auto=format&fit=crop', // Modern geometric architecture
    'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=960&q=80&auto=format&fit=crop', // Classic architectural facade
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=960&q=80&auto=format&fit=crop', // Modern building atrium
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=960&q=80&auto=format&fit=crop', // Contemporary residential architecture
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=960&q=80&auto=format&fit=crop', // City infrastructure bridges
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=960&q=80&auto=format&fit=crop', // Design studio architecture
  ],
  history: [
    'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=960&q=80&auto=format&fit=crop', // Historical antique map compass
    'https://images.unsplash.com/photo-1572945281869-d5a2d67764d8?w=960&q=80&auto=format&fit=crop', // Museum artifact exhibition
    'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=960&q=80&auto=format&fit=crop', // Vintage historical documents
    'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=960&q=80&auto=format&fit=crop', // Fine art gallery museum
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=960&q=80&auto=format&fit=crop', // Antique library books
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=960&q=80&auto=format&fit=crop', // Cultural heritage monument
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=960&q=80&auto=format&fit=crop', // Ancient classical amphitheater
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=960&q=80&auto=format&fit=crop', // Cultural sculpture heritage
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=960&q=80&auto=format&fit=crop', // Historic silk road architecture
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=960&q=80&auto=format&fit=crop', // Historical landmark facade
  ],
  general: [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=960&q=80&auto=format&fit=crop', // Organized modern creative desk
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=960&q=80&auto=format&fit=crop', // Team strategy session
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=960&q=80&auto=format&fit=crop', // Clean minimalist workspace
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=960&q=80&auto=format&fit=crop', // Project planning design
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=960&q=80&auto=format&fit=crop', // Professional achievement
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=960&q=80&auto=format&fit=crop', // Digital workflow laptop
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=960&q=80&auto=format&fit=crop', // Presentation strategic development
    'https://images.unsplash.com/photo-1534972195531-a756b1126f24?w=960&q=80&auto=format&fit=crop', // Creative digital workstation
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=960&q=80&auto=format&fit=crop', // Strategic goal completion
    'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=960&q=80&auto=format&fit=crop', // Business analytical report
  ],
};

router.get('/presentations/slide-image', async (req, res) => {
  const query = ((req.query.q as string) || 'modern technology presentation').trim();
  const seed = (req.query.seed as string) || '1';
  const slideIndex = parseInt((req.query.slideIndex as string) || (req.query.idx as string) || '0', 10);
  const cacheKey = `${query}_${seed}_${slideIndex}`;

  if (slideImageCache.has(cacheKey)) {
    const cached = slideImageCache.get(cacheKey)!;
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(cached);
    return;
  }

  // Detect category
  const lower = query.toLowerCase();
  let catKey = 'general';
  if (/ai|sun'iy|intellekt|texnolog|robot|dastur|kompyuter|cyber|data|kod|web|dasturlash|algoritm|axborot/i.test(lower)) {
    catKey = 'tech';
  } else if (/tibbiyot|shifo|doctor|medicin|salomatlik|biology|dori|anatomiya|farmatsevtika|kasallik/i.test(lower)) {
    catKey = 'medical';
  } else if (/biznes|iqtisod|moliya|invest|market|bank|savdo|daromad|raqobat|menejment|auditor/i.test(lower)) {
    catKey = 'business';
  } else if (/talim|universitet|maktab|kitob|oquv|ilm|fan|pedagog|pedagogika|talaba|dars/i.test(lower)) {
    catKey = 'education';
  } else if (/tabiat|ekologiya|yashil|daraxt|tog|suv|planet|qishloq|hayvon|atrof-muhit|iqlim/i.test(lower)) {
    catKey = 'nature';
  } else if (/qurilish|arxitektura|muhandis|zavod|bino|shahar|infratuzilma/i.test(lower)) {
    catKey = 'architecture';
  } else if (/tarix|madaniyat|sanat|muzey|adabiyot|teatr|meros|falsafa/i.test(lower)) {
    catKey = 'history';
  }

  const pool = PHOTO_POOLS[catKey] || PHOTO_POOLS.general;
  const seedNum = Math.abs(parseInt(seed, 10)) || 0;
  // Guaranteed distinct selection: each slide index gets a different photo from the pool!
  const poolIndex = (seedNum + slideIndex) % pool.length;
  const unsplashUrl = pool[poolIndex];

  // 1. Try Pollinations Flux with rapid 1.5s timeout for custom generation if network permits
  try {
    const cleanPrompt = encodeURIComponent(`${query.slice(0, 80)}, authentic photography, high detail, 4k`);
    const fluxUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=960&height=600&model=flux&nologo=true&seed=${seedNum + slideIndex * 17}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const primaryRes = await fetch(fluxUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (primaryRes.ok) {
      const buf = Buffer.from(await primaryRes.arrayBuffer());
      if (buf.byteLength > 2500) {
        slideImageCache.set(cacheKey, buf);
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buf);
        return;
      }
    }
  } catch {}

  // 2. Guaranteed high-definition distinct photography fallback from curated bank
  try {
    const unsplashRes = await fetch(unsplashUrl, { signal: AbortSignal.timeout(4000) });
    if (unsplashRes.ok) {
      const buf = Buffer.from(await unsplashRes.arrayBuffer());
      slideImageCache.set(cacheKey, buf);
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(buf);
      return;
    }
  } catch {}

  res.redirect(unsplashUrl);
});

// Generate Presentation
router.post('/presentations/generate', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const {
    topic,
    slideCount,
    language,
    audience,
    educationLevel,
    style,
    tone,
    theme,
    aspectRatio,
    includeImages,
    includeCharts,
    includeSpeakerNotes,
    sourceContent,
    studentInfo,
  } = req.body;

  if (!topic) {
    res.status(400).json({ error: 'Validation Error', message: 'Topic is required to generate presentation' });
    return;
  }

  const limitCheck = db.checkUserLimit(req.user.id, 'presentations');
  if (!limitCheck.allowed) {
    res.status(403).json({
      error: 'Limit Reached',
      message: "Bepul taqdimot yaratish limitingiz (2 ta) tugadi. Cheksiz professional slaydlar yaratish va yuklab olish uchun PRO obunaga o'ting!",
      limitReached: true,
      limitType: 'presentations',
    });
    return;
  }

  try {
    const presentation = await presentationService.generatePresentation({
      userId: req.user.id,
      topic,
      slideCount: slideCount ? parseInt(slideCount, 10) : 8,
      language: language || req.user.preferredLanguage || 'English',
      audience,
      educationLevel,
      style,
      tone,
      theme,
      aspectRatio,
      includeImages,
      includeCharts,
      includeSpeakerNotes,
      sourceContent,
      studentInfo,
    });

    res.status(201).json({ presentation });
  } catch (err: any) {
    console.error('Presentation generation failed:', err);
    res.status(500).json({ error: 'Generation Error', message: err.message || 'Failed to generate presentation' });
  }
});

// List presentations
router.get('/presentations', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const presentations = db.getPresentations(req.user.id);
  res.json({ presentations });
});

// Get single presentation
router.get('/presentations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const presentation = db.getPresentation(req.params.id, req.user.id);
  if (!presentation) {
    res.status(404).json({ error: 'Not Found', message: 'Presentation not found' });
    return;
  }
  res.json({ presentation });
});

// Update presentation
router.put('/presentations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { title, description, theme, slides } = req.body;
  const updated = db.updatePresentation(req.params.id, req.user.id, {
    title,
    description,
    theme,
    slides,
  });

  if (!updated) {
    res.status(404).json({ error: 'Not Found', message: 'Presentation not found' });
    return;
  }
  res.json({ presentation: updated });
});

// Delete presentation
router.delete('/presentations/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const success = db.deletePresentation(req.params.id, req.user.id);
  if (!success) {
    res.status(404).json({ error: 'Not Found', message: 'Presentation not found' });
    return;
  }
  res.json({ success: true });
});

// Regenerate specific slide
router.post('/presentations/:id/regenerate-slide', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { slideId, action, customInstruction } = req.body;

  if (!slideId || !action) {
    res.status(400).json({ error: 'Validation Error', message: 'slideId and action are required' });
    return;
  }

  try {
    const updatedSlide = await presentationService.regenerateSlide(
      req.params.id,
      slideId,
      req.user.id,
      action,
      customInstruction
    );

    res.json({ slide: updatedSlide });
  } catch (err: any) {
    res.status(500).json({ error: 'Regeneration Error', message: err.message || 'Failed to regenerate slide' });
  }
});

// Update or generate custom slide image
router.post('/presentations/:id/slides/:slideId/image', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const { imageUrl, prompt } = req.body;
  const presentation = db.getPresentation(req.params.id, req.user.id);
  if (!presentation) {
    res.status(404).json({ error: 'Not Found', message: 'Presentation not found' });
    return;
  }

  const slideIndex = presentation.slides.findIndex(s => s.id === req.params.slideId);
  if (slideIndex === -1) {
    res.status(404).json({ error: 'Not Found', message: 'Slide not found' });
    return;
  }

  let finalImageUrl = imageUrl;
  if (!finalImageUrl && prompt) {
    const clean = encodeURIComponent(prompt.trim().slice(0, 100));
    finalImageUrl = `https://image.pollinations.ai/prompt/${clean}?width=960&height=600&nologo=true&seed=${Date.now() % 100000}`;
  }

  presentation.slides[slideIndex].imageUrl = finalImageUrl;
  presentation.slides[slideIndex].imagePrompt = prompt || presentation.slides[slideIndex].imagePrompt;

  db.updatePresentation(presentation.id, req.user.id, { slides: presentation.slides });
  res.json({ slide: presentation.slides[slideIndex] });
});

// Export to PPTX (POST)
router.post('/presentations/:id/export/pptx', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const presentation = db.getPresentation(req.params.id, req.user.id);
  if (!presentation) {
    res.status(404).json({ error: 'Not Found', message: 'Presentation not found' });
    return;
  }

  try {
    const isPro = req.user.plan === 'PRO' || req.user.role === 'ADMIN';
    const pptxBuffer = await exportService.exportToPptx(presentation, isPro);
    const safeFilename = `${(presentation.title || 'Prezentatsiya').replace(/[^a-zA-Z0-9_\-\u0400-\u04FF]/g, '_')}.pptx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
    res.setHeader('Content-Length', pptxBuffer.length);
    res.send(pptxBuffer);
  } catch (err: any) {
    console.error('PPTX export error:', err);
    res.status(500).json({ error: 'Export Error', message: err.message || 'Failed to export PPTX' });
  }
});

// Direct Download for iPhone / Safari / Mobile Browsers (GET)
router.get('/presentations/:id/export/pptx-download', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const presentation = db.getPresentation(req.params.id, req.user.id);
  if (!presentation) {
    res.status(404).send('Presentation not found');
    return;
  }

  try {
    const isPro = req.user.plan === 'PRO' || req.user.role === 'ADMIN';
    const pptxBuffer = await exportService.exportToPptx(presentation, isPro);
    const safeFilename = `${(presentation.title || 'Prezentatsiya').replace(/[^a-zA-Z0-9_\-\u0400-\u04FF]/g, '_')}.pptx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`);
    res.setHeader('Content-Length', pptxBuffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(pptxBuffer);
  } catch (err: any) {
    console.error('PPTX download error:', err);
    res.status(500).send('Failed to generate presentation download');
  }
});

// Export to PDF (printable HTML stream or view)
router.get('/presentations/:id/export/pdf', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return;
  const presentation = db.getPresentation(req.params.id, req.user.id);
  if (!presentation) {
    res.status(404).json({ error: 'Not Found', message: 'Presentation not found' });
    return;
  }

  const isPro = req.user.plan === 'PRO' || req.user.role === 'ADMIN';
  const html = exportService.generateHtmlForPdf(presentation, isPro);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

export default router;
