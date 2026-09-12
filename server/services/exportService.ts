import pptxgen from 'pptxgenjs';
import { Presentation } from '../database/types';
import { THEME_PALETTES } from './presentationService';

export class ExportService {
  async exportToPptx(presentation: Presentation, isPro = false): Promise<Buffer> {
    const pptx = new pptxgen();
    pptx.title = presentation.title;
    pptx.subject = presentation.topic;
    pptx.author = isPro ? (presentation.studentInfo?.studentName || presentation.title) : 'NEXORA AI Studio';

    if (presentation.aspectRatio === '4:3') {
      pptx.layout = 'LAYOUT_4x3';
    } else {
      pptx.layout = 'LAYOUT_16x9';
    }

    const theme = THEME_PALETTES[presentation.theme] || THEME_PALETTES['Dark Modern'];
    const cleanBgColor = theme.bg.replace('#', '');
    const cleanTextColor = theme.text.replace('#', '');
    const cleanAccentColor = theme.accent.replace('#', '');

    for (const s of presentation.slides) {
      const slide = pptx.addSlide();
      slide.background = { color: cleanBgColor };

      const isTitleSlide = s.layout === 'title' || s.order === 1;
      const hasTable = Boolean(s.table && s.table.headers && s.table.headers.length > 0);
      const isTableSlide = s.layout === 'table' || hasTable;
      const hasChart = Boolean(s.chart && s.chart.data && s.chart.data.length > 0);
      const isChartSlide = s.layout === 'chart' || hasChart;

      // Header Tag - only for non-PRO users (Ad/Watermark)
      if (!isPro) {
        slide.addText(`NEXORA AI • ${presentation.topic.slice(0, 45)}`, {
          x: 0.8,
          y: 0.35,
          w: '88%',
          h: 0.25,
          fontSize: 9,
          bold: true,
          color: cleanAccentColor,
        });
      }

      // Title
      slide.addText(s.title, {
        x: 0.8,
        y: isPro ? 0.45 : 0.65,
        w: '88%',
        h: isTitleSlide ? 0.9 : 0.65,
        fontSize: isTitleSlide ? 28 : 20,
        bold: true,
        color: cleanTextColor,
      });

      // Subtitle if present
      let startY = isTitleSlide ? 1.5 : 1.4;
      if (s.subtitle) {
        slide.addText(s.subtitle, {
          x: 0.8,
          y: isTitleSlide ? 1.4 : 1.3,
          w: '88%',
          h: 0.35,
          fontSize: isTitleSlide ? 13 : 11.5,
          italic: true,
          color: '94A3B8',
        });
        startY = isTitleSlide ? 1.85 : 1.75;
      }

      // 1. TITLE SLIDE WITH ACADEMIC STUDENT INFO
      if (isTitleSlide && presentation.studentInfo) {
        const si = presentation.studentInfo;
        const studentLines: string[] = [];
        if (si.workType) studentLines.push(`Ish turi: ${si.workType}`);
        if (si.institution) studentLines.push(`OTM / Muassasa: ${si.institution}`);
        if (si.fieldOfStudy) studentLines.push(`Yo'nalish: ${si.fieldOfStudy}`);
        if (si.group) studentLines.push(`Guruh: ${si.group}`);
        if (si.studentName) studentLines.push(`Bajardi (Talaba): ${si.studentName}`);
        if (si.advisor) studentLines.push(`Qabul qildi (O'qituvchi): ${si.advisor}`);
        studentLines.push(si.cityAndYear || 'Toshkent - 2026');

        if (studentLines.length > 0) {
          slide.addShape(pptx.ShapeType.rect, {
            x: 0.8,
            y: startY + 0.15,
            w: 8.4,
            h: 2.7,
            fill: { color: cleanBgColor === 'FFFFFF' ? 'F1F5F9' : '1E293B' },
            line: { color: cleanAccentColor, width: 1.5 },
            rectRadius: 0.15,
          });

          slide.addText(studentLines.join('\n'), {
            x: 1.1,
            y: startY + 0.3,
            w: 7.8,
            h: 2.4,
            fontSize: 12,
            color: cleanTextColor,
            lineSpacing: 22,
          });
        }
      } 
      // 2. TABLE SLIDE: The table is the sole focused data exhibit (NO overlapping bullets, NO competing image)
      else if (isTableSlide && s.table && s.table.headers && s.table.headers.length > 0) {
        let tableY = startY;

        if (s.bodyText) {
          const leadText = s.bodyText.length > 180 ? s.bodyText.slice(0, 175) + '...' : s.bodyText;
          slide.addText(leadText, {
            x: 0.8,
            y: startY,
            w: 8.4,
            h: 0.45,
            fontSize: 11,
            color: 'CBD5E1',
            italic: true,
            lineSpacing: 14,
          });
          tableY = startY + 0.55;
        }

        const colCount = Math.max(1, s.table.headers.length);
        const colW: number[] = [];
        if (colCount === 3) {
          colW.push(2.5, 3.3, 2.6);
        } else {
          const uniformW = Number((8.4 / colCount).toFixed(2));
          for (let i = 0; i < colCount; i++) colW.push(uniformW);
        }

        const tableData = [
          s.table.headers.map(h => ({
            text: h,
            options: {
              bold: true,
              fill: cleanAccentColor,
              color: 'FFFFFF',
              fontSize: 11,
              align: 'center',
              valign: 'middle',
              margin: [5, 8, 5, 8],
            },
          })),
          ...s.table.rows.map(row =>
            row.map(cell => ({
              text: cell,
              options: {
                color: cleanTextColor,
                fontSize: 10,
                align: 'left',
                valign: 'middle',
                margin: [4, 8, 4, 8],
              },
            }))
          ),
        ];

        slide.addTable(tableData as any, {
          x: 0.8,
          y: tableY,
          w: 8.4,
          colW,
          border: { pt: 1, color: '475569' },
          fill: { color: cleanBgColor === 'FFFFFF' ? 'F8FAFC' : '0F172A' },
        });
      }
      // 3. CHART SLIDE: Left summary takeaway, Right native chart
      else if (isChartSlide && s.chart && s.chart.data && s.chart.data.length > 0) {
        let currentY = startY;
        if (s.bodyText) {
          const leadText = s.bodyText.length > 150 ? s.bodyText.slice(0, 145) + '...' : s.bodyText;
          slide.addText(leadText, {
            x: 0.8,
            y: currentY,
            w: 4.4,
            h: 0.65,
            fontSize: 10.5,
            color: 'CBD5E1',
            italic: true,
            lineSpacing: 14,
          });
          currentY += 0.75;
        }

        if (s.bulletPoints && s.bulletPoints.length > 0) {
          const safeBullets = s.bulletPoints.slice(0, 3);
          const textItems = safeBullets.map(bp => ({
            text: bp,
            options: {
              bullet: true,
              fontSize: 10.5,
              color: cleanTextColor,
              breakLine: true,
            },
          }));

          slide.addText(textItems as any, {
            x: 0.8,
            y: currentY,
            w: 4.4,
            h: Math.max(1.5, 4.95 - currentY),
            lineSpacing: 16,
          });
        }

        try {
          const chartType = s.chart.type === 'pie' ? pptx.ChartType.pie : s.chart.type === 'line' ? pptx.ChartType.line : pptx.ChartType.bar;
          const chartData = [
            {
              name: s.chart.title || 'Ko‘rsatkichlar',
              labels: s.chart.labels,
              values: s.chart.data,
            },
          ];
          slide.addChart(chartType, chartData, {
            x: 5.5,
            y: startY,
            w: 3.9,
            h: 3.1,
            chartColors: [cleanAccentColor, '10B981', 'F59E0B', 'EC4899'],
            showLegend: true,
            legendPos: 'b',
            legendColor: cleanTextColor,
            showTitle: Boolean(s.chart.title),
            title: s.chart.title || 'Ko‘rsatkichlar',
            titleColor: cleanTextColor,
            titleFontSize: 11,
          });
        } catch (chartErr) {
          console.warn('PPTX chart render fallback:', chartErr);
        }
      }
      // 4. STANDARD SLIDE WITH PHOTO VISUAL: Left column text, Right column photo (Zero overlap)
      else if (s.imageUrl && !isTitleSlide) {
        let currentY = startY;

        if (s.bodyText) {
          const leadText = s.bodyText.length > 150 ? s.bodyText.slice(0, 145) + '...' : s.bodyText;
          slide.addText(leadText, {
            x: 0.8,
            y: currentY,
            w: 4.4,
            h: 0.7,
            fontSize: 10,
            color: 'CBD5E1',
            italic: true,
            lineSpacing: 14,
          });
          currentY += 0.8;
        }

        if (s.bulletPoints && s.bulletPoints.length > 0) {
          const safeBullets = s.bulletPoints.slice(0, 4);
          const textItems = safeBullets.map(bp => ({
            text: bp,
            options: {
              bullet: true,
              fontSize: 10.5,
              color: cleanTextColor,
              breakLine: true,
            },
          }));

          slide.addText(textItems as any, {
            x: 0.8,
            y: currentY,
            w: 4.4,
            h: Math.max(1.5, 4.95 - currentY),
            lineSpacing: 16,
          });
        }

        try {
          let base64Data: string | null = null;
          if (s.imageUrl.startsWith('data:image/jpeg') || s.imageUrl.startsWith('data:image/png')) {
            base64Data = s.imageUrl;
          } else if (s.imageUrl.startsWith('http://') || s.imageUrl.startsWith('https://') || s.imageUrl.startsWith('/api/')) {
            const fetchUrl = s.imageUrl.startsWith('http')
              ? s.imageUrl
              : `http://localhost:3000${s.imageUrl}`;
            const imgRes = await fetch(fetchUrl, {
              headers: { 'User-Agent': 'curl/7.88.1' },
              signal: AbortSignal.timeout(4000),
            });
            if (imgRes.ok) {
              const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
              if (!contentType.includes('svg')) {
                const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
                if (imgBuffer.byteLength > 1000) {
                  base64Data = `image/jpeg;base64,${imgBuffer.toString('base64')}`;
                }
              }
            }
          }

          if (base64Data) {
            slide.addImage({
              data: base64Data,
              x: 5.5,
              y: startY,
              w: 3.9,
              h: 3.1,
              sizing: { type: 'contain', w: 3.9, h: 3.1 },
            });
          }
        } catch (imgErr) {
          console.warn('PPTX slide image embed skipped:', imgErr);
        }
      }
      // 5. FULL-WIDTH TEXT SLIDE (No image, no table, no chart)
      else if (!isTitleSlide) {
        let currentY = startY;

        if (s.bodyText) {
          slide.addText(s.bodyText, {
            x: 0.8,
            y: currentY,
            w: 8.4,
            h: 0.75,
            fontSize: 11,
            color: 'CBD5E1',
            italic: true,
            lineSpacing: 16,
          });
          currentY += 0.85;
        }

        if (s.bulletPoints && s.bulletPoints.length > 0) {
          const safeBullets = s.bulletPoints.slice(0, 5);
          const textItems = safeBullets.map(bp => ({
            text: bp,
            options: {
              bullet: true,
              fontSize: 11.5,
              color: cleanTextColor,
              breakLine: true,
            },
          }));

          slide.addText(textItems as any, {
            x: 0.8,
            y: currentY,
            w: 8.4,
            h: Math.max(1.8, 4.95 - currentY),
            lineSpacing: 19,
          });
        }
      }

      // Speaker Notes
      if (s.speakerNotes) {
        slide.addNotes(s.speakerNotes);
      }

      // Footer
      slide.addText(`${presentation.title.slice(0, 50)}`, {
        x: 0.8,
        y: 5.15,
        w: 6.0,
        h: 0.3,
        fontSize: 9,
        color: '64748B',
      });

      slide.addText(`Slide ${s.order} / ${presentation.slides.length}`, {
        x: 7.2,
        y: 5.15,
        w: 2.0,
        h: 0.3,
        fontSize: 9,
        align: 'right',
        color: '64748B',
      });
    }

    const buffer = (await pptx.write({ outputType: 'nodebuffer' })) as Buffer;
    return buffer;
  }

  generateHtmlForPdf(presentation: Presentation, isPro = false): string {
    const theme = THEME_PALETTES[presentation.theme] || THEME_PALETTES['Dark Modern'];

    const slidesHtml = presentation.slides.map((s, idx) => `
      <div class="slide" style="background: ${theme.bg}; color: ${theme.text}; page-break-after: always; width: 100vw; height: 100vh; padding: 60px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div>
          ${!isPro ? `<div style="font-size: 13px; font-weight: 700; color: ${theme.accent}; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">NEXORA AI • ${presentation.topic}</div>` : `<div style="font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 8px;">${presentation.topic}</div>`}
          <h1 style="font-size: 34px; font-weight: 800; margin: 0 0 10px 0; color: ${theme.text};">${s.title}</h1>
          ${s.subtitle ? `<h2 style="font-size: 18px; font-weight: 400; color: #94a3b8; margin: 0 0 24px 0;">${s.subtitle}</h2>` : ''}
          ${idx === 0 && presentation.studentInfo ? `
            <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 18px 24px; margin-bottom: 24px; max-width: 540px;">
              <div style="font-size: 11px; text-transform: uppercase; color: ${theme.accent}; font-weight: 700; margin-bottom: 8px;">Talaba va Muassasa Ma'lumotlari</div>
              ${presentation.studentInfo.institution ? `<div style="font-size: 14px; margin-bottom: 4px;"><strong>Muassasa:</strong> ${presentation.studentInfo.institution}</div>` : ''}
              ${presentation.studentInfo.fieldOfStudy ? `<div style="font-size: 14px; margin-bottom: 4px;"><strong>Yo'nalish:</strong> ${presentation.studentInfo.fieldOfStudy}</div>` : ''}
              ${presentation.studentInfo.group ? `<div style="font-size: 14px; margin-bottom: 4px;"><strong>Guruh:</strong> ${presentation.studentInfo.group}</div>` : ''}
              ${presentation.studentInfo.studentName ? `<div style="font-size: 14px; margin-bottom: 4px;"><strong>Bajardi:</strong> ${presentation.studentInfo.studentName}</div>` : ''}
              ${presentation.studentInfo.advisor ? `<div style="font-size: 14px;"><strong>Ilmiy rahbar:</strong> ${presentation.studentInfo.advisor}</div>` : ''}
            </div>
          ` : ''}
          
          ${s.table && s.table.headers ? `
            <div style="margin-top: 24px;">
              ${s.bodyText ? `<p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; margin-bottom: 16px;">${s.bodyText}</p>` : ''}
              <table style="width: 100%; border-collapse: collapse; margin-top: 12px; border-radius: 8px; overflow: hidden; border: 1px solid #334155;">
                <thead>
                  <tr style="background: ${theme.accent}; color: #ffffff;">
                    ${s.table.headers.map(h => `<th style="padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 700;">${h}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${s.table.rows.map((row, rIdx) => `
                    <tr style="background: ${rIdx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)'}; border-bottom: 1px solid #334155;">
                      ${row.map(cell => `<td style="padding: 12px 16px; font-size: 13px; color: ${theme.text};">${cell}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div style="display: flex; gap: 40px; margin-top: 30px;">
              <div style="flex: 1;">
                ${s.bodyText ? `<p style="font-size: 15px; line-height: 1.6; color: #cbd5e1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 14px 18px; border-radius: 10px; margin-bottom: 18px;">${s.bodyText}</p>` : ''}
                ${s.bulletPoints && s.bulletPoints.length > 0 ? `
                  <ul style="padding-left: 20px; font-size: 16px; line-height: 1.7; color: ${theme.text};">
                    ${s.bulletPoints.slice(0, 5).map(p => `<li style="margin-bottom: 10px;">${p}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
              ${s.imageUrl ? `
                <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
                  <img src="${s.imageUrl}" style="max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);" />
                </div>
              ` : ''}
            </div>
          `}
        </div>
        
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b;">
          <span>${presentation.title}</span>
          <span>Slide ${s.order} / ${presentation.slides.length}</span>
        </div>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${presentation.title}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; background: ${theme.bg}; }
      .slide { page-break-after: always; width: 100%; height: 100%; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background: ${theme.bg};">
  ${slidesHtml}
</body>
</html>`;
  }
}

export const exportService = new ExportService();
