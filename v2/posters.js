const paper = '#f4efe4';
const app = document.querySelector('#app');
const params = new URLSearchParams(location.search);
const context = document.createElement('canvas').getContext('2d');
const weekday = new Intl.DateTimeFormat('en-GB', {weekday:'short', timeZone:'UTC'});
const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'})[char]);

function titleRows(event, story) {
  const three = event.title.length === 3;
  const lineHeight = story ? (three ? 112 : 137) : (three ? 82 : 113);
  const titleBoundary = (story ? 540 : 1080) * .84;
  const size = story ? (three ? 115 : 150) : (three ? 107 : 133);
  const left = story ? 39 : 45;
  const maxWidth = titleBoundary - left - 2;
  const firstLine = story ? (three ? 323 : 359) : (three ? 222 : 263);
  context.font = `800 ${size}px Syne`;
  context.letterSpacing = story ? '-3px' : '-4px';
  const rows = event.title.map((line, index) => {
    const text = line.toUpperCase();
    const bounds = context.measureText(text);
    const width = Math.min(bounds.width, maxWidth);
    const baseline = firstLine + index * lineHeight;
    return {
      inkRight: left + width * bounds.actualBoundingBoxRight / bounds.width,
      inkTop: baseline - bounds.actualBoundingBoxAscent,
      markup: `<text x="${left}" y="${baseline}" font-size="${size}" letter-spacing="${context.letterSpacing}" textLength="${width.toFixed(2)}" lengthAdjust="spacingAndGlyphs">${escapeXml(text)}</text>`
    };
  });
  return {markup: rows.map(row => row.markup).join(''), firstRight: rows[0].inkRight, firstTop: rows[0].inkTop};
}

function artworkGroup(event, story, clean) {
  if (clean) return '';
  let {drawing} = originalArt[event.id];
  if (event.id === 'kickoff-madux') {
    drawing = drawing.replaceAll('fill="#fff2d5" stroke="none"', 'fill="#fff2d5" stroke="#242982" stroke-width="2"')
      .replaceAll('fill="#ffaf6e" stroke="none"', 'fill="#ffaf6e" stroke="#242982" stroke-width="2"');
  }
  const origin = story ? '410 650' : '925 449';
  const size = story ? .47 : .49;
  return `<g data-layer="Illustration" transform="translate(${origin}) scale(${size}) translate(-819 -233)">${drawing}</g>`;
}

function dayGlyphs(day) {
  return [...day].map((digit, index) =>
    `<g transform="translate(${index * 371} 0)">${dateGlyphs[digit]}</g>`
  ).join('');
}

function dateLayers(day, accent, story) {
  const x = story ? 62 : 316;
  const y = story ? 263 : -31;
  const scaleX = story ? .70 : 1.105;
  const scaleY = story ? .64 : 1.01;
  const transform = `translate(${x} ${y}) scale(${scaleX} ${scaleY})`;
  return {
    glyphs: dayGlyphs(day),
    transform,
    accent,
    monthX: x + (day[0] === '1' ? 250 : 178) * scaleX,
    monthY: y + 540 * scaleY
  };
}

function madridStars(x, y, story) {
  const gap = story ? 9.5 : 13;
  const radius = story ? 3.4 : 4.5;
  return Array.from({length: 7}, (_, index) => {
    const centre = x + (index - 3) * gap;
    const points = Array.from({length: 10}, (_, vertex) => {
      const angle = vertex * Math.PI / 5 - Math.PI / 2;
      const r = vertex % 2 ? radius * .42 : radius;
      return `${(centre + Math.cos(angle) * r).toFixed(2)},${(y + Math.sin(angle) * r).toFixed(2)}`;
    }).join(' ');
    return `<polygon points="${points}"/>`;
  }).join('');
}

function logisticsLine(event, dayOfWeek, x, y, story) {
  const {day, month, year, time} = event.logistics;
  const colour = event.id === 'lightning-madux' ? '#203eb5' : event.mark;
  const monthX = x + (story ? 82 : 88);
  const timeX = monthX + (story ? 65 : 72);
  const smallDayHeight = story ? 42 : 46;
  return `<g data-layer="Date and time" font-family="Space Mono" font-weight="700">
    <g data-layer="Small day" aria-label="${day}" transform="translate(${x} ${y - smallDayHeight}) scale(${story ? .10 : .105} ${smallDayHeight / 600})" fill="${colour}">${dayGlyphs(day)}</g>
    <text x="${monthX}" y="${y - 23}" font-size="17">${month.toUpperCase()}</text>
    <text x="${monthX}" y="${y - 3}" font-size="16">${year}</text>
    <text x="${timeX}" y="${y - 25}" font-size="12" letter-spacing=".7">${dayOfWeek.toUpperCase()}</text>
    <text x="${timeX}" y="${y - 3}" font-size="23">${time}</text>
  </g>`;
}

function poster(event, story, clean) {
  const {date, day, month, year, time, venue, address} = event.logistics;
  const dayOfWeek = weekday.format(new Date(date + 'T12:00:00Z'));
  const x = story ? 38 : 45;
  const w = story ? 540 : 1080;
  const h = story ? 960 : 540;
  const monthText = (month + ' ' + year).toUpperCase();
  const dateText = `${dayOfWeek} ${Number(day)} ${month} ${year} · ${time}`.toUpperCase();
  const venueText = venue + (address ? `, ${address}` : '');
  const hero = dateLayers(day, event.accent, story);
  const formatX = story ? 502 : 1030;
  const formatY = story ? 166 : 64;
  const floor = story ? 756 : 461;
  const title = titleRows(event, story);
  const smallType = `font-family="Space Mono" font-weight="700" font-size="${story ? 9.5 : 10.5}" letter-spacing=".16"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(event.name)} · ${escapeXml(dateText)} · ${escapeXml(venue)}" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">
    <title>${escapeXml(event.name)} · MadUX</title>
    <rect data-layer="Paper" width="${w}" height="${h}" fill="${paper}"/>
    <g data-layer="Day" fill="${hero.accent}" transform="${hero.transform}">${hero.glyphs}</g>
    <g data-layer="Title" fill="${event.ink}" font-family="Syne" font-weight="800">${title.markup}</g>
    <g data-layer="Date overprint" fill="${hero.accent}" transform="${hero.transform}" opacity=".28">${hero.glyphs}</g>
    <g data-layer="Madrid stars" fill="${event.ink}">${madridStars(hero.monthX, hero.monthY - (story ? 17 : 23), story)}</g>
    <g data-layer="Month and year">
      <text x="${hero.monthX}" y="${hero.monthY}" text-anchor="middle" fill="${event.ink}" font-family="Space Mono" font-weight="700" font-size="${story ? 13 : 17}" letter-spacing=".75">${monthText}</text>
    </g>
    ${artworkGroup(event, story, clean)}
    <text data-layer="Event intro" x="${title.firstRight}" y="${title.firstTop - 10}" text-anchor="end" fill="${event.ink}" ${smallType}>${escapeXml(event.intro.toUpperCase())}</text>
    <g data-layer="MadUX lockup" transform="translate(${x} ${story ? 130 : 39}) scale(${(story ? 88 : 124) / 837})">${logoPaths.replaceAll('currentColor', event.mark)}</g>
    <text data-layer="Event format" x="${formatX}" y="${formatY}" text-anchor="end" fill="${event.ink}" font-family="Space Mono" font-size="${story ? 10 : 12}" font-weight="700" letter-spacing=".65">${escapeXml(event.format.toUpperCase())}</text>
    <g data-layer="Event details" fill="${event.ink}">
      ${logisticsLine(event, dayOfWeek, x, floor, story)}
      <text x="${x}" y="${floor + 24}" ${smallType}>${escapeXml(venueText.toUpperCase())}</text>
      <text x="${x}" y="${floor + 48}" ${smallType}>ENGLISH-SPEAKING DESIGN COMMUNITY IN MADRID</text>
    </g>
    <image data-layer="Paper grain" x="0" y="0" width="${w}" height="${h}" href="${paperGrain[story ? 1 : 0]}" opacity=".84"/>
  </svg>`;
}

async function boot() {
  await Promise.all(['800 100px Syne','700 16px "Space Mono"'].map(face => document.fonts.load(face)));
  const selected = events.find(event => event.id === params.get('event'));
  if (selected) {
    app.classList.add('single');
    app.innerHTML = poster(selected, params.has('story'), params.has('clean'));
    return;
  }

  let story = false;
  let clean = false;
  app.innerHTML = `<header><div><h1>MadUX posters · V2</h1><p>Vera’s date-first direction with the original bear, paper grain and V1 illustrations. Past event examples. · <a href="https://felipecaroe.github.io/madux-poster-system/">V1 posters</a></p></div></header>
    <div class="controls">
      <button type="button" data-format="cover" aria-pressed="true">Eventbrite</button>
      <button type="button" data-format="story" aria-pressed="false">Instagram Stories</button>
      <button type="button" data-motif="true" aria-pressed="true">With V1 illustrations</button>
      <button type="button" data-motif="false" aria-pressed="false">Date only</button>
      <span></span>
    </div><div class="grid"></div>`;

  const grid = app.querySelector('.grid');
  function refresh() {
    for (const button of app.querySelectorAll('[data-format]')) button.setAttribute('aria-pressed', String((button.dataset.format === 'story') === story));
    for (const button of app.querySelectorAll('[data-motif]')) button.setAttribute('aria-pressed', String((button.dataset.motif === 'false') === clean));
    grid.classList.toggle('stories', story);
    app.querySelector('.controls > span').textContent = story ? '1080 × 1920' : '2160 × 1080';
    grid.innerHTML = events.map(event => {
      const variant = event.id + (story ? '-story' : '') + (clean ? '-date-only' : '');
      return `<figure>${poster(event, story, clean)}<figcaption><span>${escapeXml(event.name)}</span><a href="${new URL(`exports/${variant}.svg`, document.baseURI).href}">Figma SVG</a></figcaption></figure>`;
    }).join('');
  }
  app.querySelector('.controls').addEventListener('click', event => {
    const {format, motif} = event.target.dataset;
    if (format) story = format === 'story';
    if (motif) clean = motif === 'false';
    if (format || motif) refresh();
  });
  refresh();
}

boot();
