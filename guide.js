function renderGuide(container, events) {
  container.innerHTML = `<header class="gallery-header">
    <img src="https://felipecaroe.github.io/madux-poster-system/assets/logo.svg" alt="MadUX">
    <div><h1>Poster wireframe</h1><p><a href="https://felipecaroe.github.io/madux-poster-system/">Event gallery</a> · <a href="https://felipecaroe.github.io/madux-poster-system/rules.html">Design rules</a></p></div>
    <span>2160 × 1080 px</span>
  </header>
  <div class="guide-controls">
    <label for="guide-event">Event</label>
    <select id="guide-event">${events.map(event => `<option value="${event.cover[0]}">${event.name}</option>`).join('')}</select>
    <label class="guide-toggle"><input type="checkbox" id="guide-grid"> Show grid on cover</label>
  </div>
  <div class="guide-layout">
    <section>
      <h2>Shared layout</h2>
      <div class="guide-frame" aria-label="Wireframe showing the fixed left title block, the gutter, and the four right-hand rows">
        <div class="guide-title-box"><strong>Event title</strong><small>Syne ExtraBold · flush to three edges</small></div>
        <div class="guide-column">
          <div class="guide-header-row"><strong>Full MadUX logo</strong></div>
          <div class="guide-copy-box">Event hook</div>
          <div class="guide-art-box">
            <span><strong>Date + time</strong><small>Venue below</small></span>
            <span><strong>Illustration</strong><small>One motif per event</small></span>
          </div>
          <div class="guide-footer-row">Community footer <span>★★★★★★★</span></div>
        </div>
      </div>
      <div class="guide-key">
        <p><strong>Fixed</strong> Layout, full logo, type roles, community footer and seven stars.</p>
        <p><strong>Changes</strong> Event title, logistics, copy, palette and illustration.</p>
      </div>
    </section>
    <section class="guide-variant system-cover">
      <h2 id="guide-preview-heading">Event cover</h2>
      <div class="guide-preview" aria-labelledby="guide-preview-heading">
        <img alt="">
        <div class="guide-overlay" hidden aria-hidden="true">
          <div></div><div></div><div></div><div></div><div></div><div></div>
        </div>
      </div>
      <div class="guide-palette" aria-label="Event colours"></div>
      <p class="guide-motif" aria-live="polite"></p>
    </section>
  </div>`;

  const select = container.querySelector('#guide-event');
  const gridToggle = container.querySelector('#guide-grid');
  const variant = container.querySelector('.guide-variant');
  const preview = variant.querySelector('.guide-preview img');

  function showEvent() {
    const event = events.find(item => item.cover[0] === select.value);
    variant.className = `guide-variant system-cover ${event.cover[0]}`;
    preview.src = `https://felipecaroe.github.io/madux-poster-system/exports/${event.cover[0]}.jpg`;
    preview.alt = `${event.name} Eventbrite cover`;
    const theme = getComputedStyle(variant);
    variant.querySelector('.guide-palette').innerHTML = [
      ['Ground', '--paper'], ['Ink', '--ink'], ['Accent', '--highlight']
    ].map(([label, token]) => {
      const colour = theme.getPropertyValue(token).trim();
      return `<span><i style="background:${colour}" aria-hidden="true"></i>${label} ${colour}</span>`;
    }).join('');
    variant.querySelector('.guide-motif').textContent = event.motif;
  }

  select.addEventListener('change', showEvent);
  gridToggle.addEventListener('change', () => {
    variant.querySelector('.guide-overlay').hidden = !gridToggle.checked;
  });
  showEvent();
}

renderGuide(document.querySelector('#gallery'), series);
