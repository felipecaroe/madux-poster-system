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

const illustrationBottoms = {
  'lightning-madux': 337,
  'disasters-movida': 321,
  'systems-madux': 332,
  'portfolio-madux': 345,
  'walk-madux': 338,
  'kickoff-madux': 331
};

function artworkGroup(event, story, bottom) {
  let {drawing} = originalArt[event.id];
  if (event.id === 'kickoff-madux') {
    drawing = drawing.replaceAll('fill="#fff2d5" stroke="none"', 'fill="#fff2d5" stroke="#242982" stroke-width="2"')
      .replaceAll('fill="#ffaf6e" stroke="none"', 'fill="#ffaf6e" stroke="#242982" stroke-width="2"');
  }
  const x = story ? 410 : 925;
  const size = story ? .47 : .49;
  return `<g data-layer="Illustration" transform="translate(${x} ${bottom}) scale(${size}) translate(-819 -${illustrationBottoms[event.id]})">${drawing}</g>`;
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
    monthX: x + (day[0] === '1' ? 250 : 178) * scaleX
  };
}

function madridStars(x, y, width, story) {
  const radius = story ? 3.4 : 4.5;
  const gap = (width - 2 * radius * Math.cos(Math.PI / 10)) / 6;
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

function eventDetails(event, dayOfWeek, x, floor, bottom, smallType, story) {
  const {time, venue, address} = event.logistics;
  const when = `${dayOfWeek.toUpperCase()} · ${time}`;
  const line = (text, y) => `<text x="${x}" y="${y}" ${smallType}>${escapeXml(text.toUpperCase())}</text>`;
  const timeLine = (y, size) => `<text x="${x}" y="${y}" font-family="Space Mono" font-weight="700" font-size="${size}">${when}</text>`;
  if (story) {
    return `${timeLine(bottom - (address ? 63 : 52), 15)}
      ${line(venue, bottom - (address ? 45 : 34))}
      ${address ? line(address, bottom - 33) : ''}
      ${line('English-speaking design', bottom - 12)}
      ${line('community in Madrid', bottom)}`;
  }
  const venueText = venue + (address ? `, ${address}` : '');
  return `${timeLine(floor, 17)}
    ${line(venueText, floor + 20)}
    ${line('English-speaking design community in Madrid', bottom)}`;
}

function poster(event, story) {
  const {date, day, month, year, time, venue} = event.logistics;
  const dayOfWeek = weekday.format(new Date(date + 'T12:00:00Z'));
  const x = story ? 38 : 45;
  const w = story ? 540 : 1080;
  const h = story ? 960 : 540;
  const middleDate = `${day} ${month} ${year}`.toUpperCase();
  const dateText = `${dayOfWeek} ${Number(day)} ${month} ${year} · ${time}`.toUpperCase();
  const hero = dateLayers(day, event.accent, story);
  const floor = story ? 756 : 457;
  const bottom = floor + 38;
  const middleX = story ? 260 : hero.monthX;
  const title = titleRows(event, story);
  const dateSize = story ? 13 : 17;
  context.font = `700 ${dateSize}px "Space Mono"`;
  context.letterSpacing = '.75px';
  const dateBounds = context.measureText(middleDate);
  const dateWidth = dateBounds.actualBoundingBoxLeft + dateBounds.actualBoundingBoxRight;
  const smallType = `font-family="Space Mono" font-weight="700" font-size="${story ? 9.5 : 10.5}" letter-spacing=".16"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(event.name)} · ${escapeXml(dateText)} · ${escapeXml(venue)}" width="${w * 2}" height="${h * 2}" viewBox="0 0 ${w} ${h}">
    <title>${escapeXml(event.name)} · MadUX</title>
    <rect data-layer="Paper" width="${w}" height="${h}" fill="${paper}"/>
    <g data-layer="Day" fill="${hero.accent}" transform="${hero.transform}" opacity=".92">${hero.glyphs}</g>
    <g data-layer="Title" fill="${event.ink}" font-family="Syne" font-weight="800">${title.markup}</g>
    <g data-layer="Date overprint" fill="${hero.accent}" transform="${hero.transform}" opacity=".17">${hero.glyphs}</g>
    ${artworkGroup(event, story, bottom)}
    <g data-layer="Madrid stars" fill="${event.ink}">${madridStars(middleX, bottom - (story ? 17 : 23), dateWidth, story)}</g>
    <g data-layer="Full date">
      <text x="${middleX}" y="${bottom}" text-anchor="middle" fill="${event.ink}" font-family="Space Mono" font-weight="700" font-size="${dateSize}" letter-spacing=".75">${middleDate}</text>
    </g>
    <text data-layer="Event intro" x="${title.firstRight}" y="${title.firstTop - 10}" text-anchor="end" fill="${event.ink}" ${smallType}>${escapeXml(event.intro.toUpperCase())}</text>
    <g data-layer="MadUX lockup" transform="translate(${x} ${story ? 130 : 39}) scale(${(story ? 77 : 105) / 837})">${logoPaths.replaceAll('currentColor', event.ink)}</g>
    <g data-layer="Event details" fill="${event.ink}">${eventDetails(event, dayOfWeek, x, floor, bottom, smallType, story)}</g>
    <image data-layer="Paper grain" x="0" y="0" width="${w}" height="${h}" href="${paperGrain[story ? 1 : 0]}" opacity=".84"/>
  </svg>`;
}

async function boot() {
  await Promise.all(['800 100px Syne','700 16px "Space Mono"'].map(face => document.fonts.load(face)));
  const selected = events.find(event => event.id === params.get('event'));
  if (selected) {
    app.classList.add('single');
    app.innerHTML = poster(selected, params.has('story'));
    return;
  }

  let story = false;
  app.innerHTML = `<header><div><h1>MadUX posters · V3</h1><p>Date-led covers · Past event examples · <a href="https://felipecaroe.github.io/madux-poster-system/">V1 posters</a></p></div></header>
    <div class="controls">
      <button type="button" data-format="cover" aria-pressed="true">Eventbrite</button>
      <button type="button" data-format="story" aria-pressed="false">Instagram Stories</button>
      <span></span>
    </div><div class="grid"></div>`;

  const grid = app.querySelector('.grid');
  function refresh() {
    for (const button of app.querySelectorAll('[data-format]')) button.setAttribute('aria-pressed', String((button.dataset.format === 'story') === story));
    grid.classList.toggle('stories', story);
    app.querySelector('.controls > span').textContent = story ? '1080 × 1920' : '2160 × 1080';
    grid.innerHTML = events.map(event => {
      const variant = event.id + (story ? '-story' : '');
      return `<figure>${poster(event, story)}<figcaption><span>${escapeXml(event.name)}</span><a href="${new URL(`exports/${variant}.svg`, document.baseURI).href}">Figma SVG</a></figcaption></figure>`;
    }).join('');
  }
  app.querySelector('.controls').addEventListener('click', event => {
    const {format} = event.target.dataset;
    if (format) {
      story = format === 'story';
      refresh();
    }
  });
  refresh();
}

boot();
