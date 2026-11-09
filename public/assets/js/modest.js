/* ══════════════════════════════════════════════════════════════════
   UTIL & STATE
════════════════════════════════════════════════════════════════════ */
const U = {'':'index.html', home:'index.html', fashion:'fashion.html', lifestyle:'lifestyle.html', art:'art-culture.html', iqra:'iqra.html', catalog:'catalog.html', designers:'designers.html', about:'about.html'};
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const catOf = k => CATS.find(c => c.key === k);
const byId = id => A.find(a => a.id === id);
const inCat = k => A.filter(a => a.cat === k);
let saved = []; try{ saved = JSON.parse(localStorage.getItem('modest_saved') || '[]'); }catch(e){}
const persist = () => { try{ localStorage.setItem('modest_saved', JSON.stringify(saved)); }catch(e){} };
const state = {filter:{}, shown:{}, dQuery:'', dCat:'Semua', dCity:'Semua', dLetter:''};

// placeholder bernuansa editorial untuk gambar yang belum tersedia
function ph(src, ratio, alt = '', style = ''){
  const initial = esc((alt || 'm').replace(/^\W+/, '').charAt(0).toUpperCase());
  const tone = 't' + ([...alt].reduce((n, c) => n + c.charCodeAt(0), 0) % 4 + 1);
  const fb = `<div class=&quot;fallback&quot;>${initial}<small>modest.id</small></div>`;
  if(!src) return `<div class="ph ${ratio} ${tone}">${fb.replace(/&quot;/g, '"')}</div>`;
  return `<div class="ph ${ratio} ${tone}"><img loading="lazy" src="${IMG + src}" alt="${esc(alt)}"${style ? ` style="${style}"` : ''} onerror="this.outerHTML='${fb}'"></div>`;
}
const saveBtn = id => `<button class="save-btn ${saved.includes(id) ? 'on' : ''}" onclick="event.stopPropagation(); toggleSave('${id}', this)" aria-label="Simpan"><i class="bi bi-bookmark${saved.includes(id) ? '-fill' : ''}"></i></button>`;
const go = id => `onclick="location.href='article.html?id=${id}'"`;

function card(a, {size = 'h5', ratio = 'r-43', ex = false} = {}){
  return `<div class="card-a" ${go(a.id)}>
    <div class="position-relative">${ph(a.img, ratio, a.title)}${saveBtn(a.id)}</div>
    <div class="pt-3"><span class="tag-pill">${esc(catOf(a.cat).label)} · ${esc(a.sub)}</span>
    <${size}>${esc(a.title)}</${size}>
    ${ex ? `<p class="mb-2">${esc(a.ex)}</p>` : ''}
    <div class="meta">${a.date} · ${a.read} menit baca</div></div></div>`;
}
function listRow(a, i, thumb = false){
  return `<div class="list-row" ${go(a.id)}>
    ${thumb ? ph(a.img, '', a.title) : `<div class="num">${String(i + 1).padStart(2, '0')}</div>`}
    <div class="min-w-0"><span class="tag-pill">${esc(catOf(a.cat).label)}</span><h6>${esc(a.title)}</h6><div class="meta">${a.date}</div></div></div>`;
}
function secHead(eyebrow, title, link){
  return `<div class="sec-head"><div><div class="eyebrow">${eyebrow}</div><h2>${title}</h2></div>${link ? `<a class="link-more" href="${link}">Lihat Semua</a>` : ''}</div>`;
}
const POPULAR = ['modinity','vivi-zubedi','beauty-rewired','syahidan','uob-2024','smaranaa'].map(byId);

/* ══════════════════════════════════════════════════════════════════
   VIEWS
════════════════════════════════════════════════════════════════════ */
let heroIdx = 0, heroTimer;
const HERO = A.filter(a => a.feat);

function viewHome(){
  const latest = [...A].filter(a => a.cat !== 'iqra').slice(0, 8);
  const iq = inCat('iqra');
  return `
  <div class="ticker"><div class="container-x"><span class="lbl">Terkini</span>
    <div class="ticker-track"><div class="ticker-inner">${[...latest, ...latest].map(a => `<a href="article.html?id=${a.id}">${esc(a.title)}</a>`).join('')}</div></div></div></div>

  <section class="pt-4 pb-5"><div class="container-x"><div class="row g-4">
    <div class="col-lg-8"><div class="hero-main" id="hero"></div></div>
    <div class="col-lg-4">
      <div class="eyebrow mb-1">Pilihan Redaksi</div>
      ${['reborn29','kahf-decode','artjog-2022','iwan-tirta'].map(byId).map((a, i) => listRow(a, i, true)).join('')}
    </div>
  </div></div></section>

  <section class="blk pt-4"><div class="container-x">
    ${secHead('Recent News', 'Kabar Terbaru')}
    <div class="row g-4 gy-5">${latest.map(a => `<div class="col-6 col-lg-3">${card(a)}</div>`).join('')}</div>
  </div></section>

  <section class="blk pt-0"><div class="container-x">
    ${secHead('Fashion', 'Dari Runway ke Keseharian', 'fashion.html')}
    <div class="row g-4 g-lg-5">
      <div class="col-lg-7">${card(byId('imfw'), {size:'h3', ratio:'r-43', ex:true})}</div>
      <div class="col-lg-5"><div class="row g-4">
        ${['modinity','smaranaa','reborn29','tex-saverio'].map(byId).map(a => `<div class="col-6">${card(a, {ratio:'r-45'})}</div>`).join('')}
      </div></div>
    </div>
  </div></section>

  <section class="blk pt-0"><div class="container-x">
    ${secHead('Events', 'Agenda Mendatang', 'events.html')}
    ${evHomeBlock()}
  </div></section>

  <section class="blk pt-0"><div class="container-x">
    ${secHead('Shop the Edit', 'Katalog Pilihan Pekan Ini', 'catalog.html')}
    <div class="row g-4 gy-5">${['gamis-anashera','outer-whisper','scarf-ts','kaftan-sekar'].map(pById).map(p => `<div class="col-6 col-lg-3">${pCard(p)}</div>`).join('')}</div>
  </div></section>

  <section class="blk iqra-band"><div class="container-x position-relative">
    <div class="eyebrow">Iqra</div>
    <p class="iqra-quote mt-3">“Dan janganlah kamu berjalan di muka bumi ini dengan sombong… sederhanakanlah langkahmu.”</p>
    <div class="meta mb-5" style="color:#9C9286">QS. Luqman: 18–19</div>
    <div class="row g-4">${iq.slice(0, 3).map(a => `<div class="col-md-4"><div class="iqra-card" ${go(a.id)}><span class="tag-pill">${a.sub}</span><h5>${esc(a.title)}</h5><p>${esc(a.ex)}</p></div></div>`).join('')}</div>
    <div class="mt-4"><a class="link-more" style="border-color:#EFE8DD" href="iqra.html">Semua Renungan</a></div>
  </div></section>

  <section class="blk"><div class="container-x"><div class="row g-4 g-lg-5">
    <div class="col-lg-8">
      ${secHead('Lifestyle', 'Gaya Hidup', 'lifestyle.html')}
      <div class="row g-4 gy-5">${inCat('lifestyle').slice(0, 4).map(a => `<div class="col-sm-6">${card(a, {ex:true})}</div>`).join('')}</div>
    </div>
    <div class="col-lg-4">
      <div class="sec-head"><div><div class="eyebrow">Most Read</div><h2>Terpopuler</h2></div></div>
      ${POPULAR.slice(0, 5).map((a, i) => listRow(a, i)).join('')}
    </div>
  </div></div></section>

  <section class="blk pt-0"><div class="container-x">
    ${secHead('Art & Culture', 'Seni & Budaya', 'art-culture.html')}
    <div class="row g-4 gy-5">
      <div class="col-lg-6">${card(byId('uob-2024'), {size:'h3', ratio:'r-43', ex:true})}</div>
      <div class="col-lg-6"><div class="row g-4 gy-5">
        ${['artjog-2022','manifesto','art-jakarta','mystery-borneo'].map(byId).map(a => `<div class="col-6">${card(a)}</div>`).join('')}
      </div></div>
    </div>
  </div></section>

  <section class="blk" style="background:var(--paper); border-top:1px solid var(--line)"><div class="container-x">
    ${secHead('Designer Directory', 'Kenali Para Perancang', 'designers.html')}
    <div class="row g-4">${DESIGNERS.slice(0, 6).map(d => `<div class="col-6 col-md-4 col-lg-2"><div class="d-card" onclick="openDesigner('${d.id}')">${ph(d.img, '', d.name)}<h5>${esc(d.name)}</h5><div class="meta">${d.cat} · ${d.city}</div></div></div>`).join('')}</div>
  </div></section>`;
}

function renderHero(){
  const el = $('#hero'); if(!el) return clearInterval(heroTimer);
  const a = HERO[heroIdx];
  el.setAttribute('onclick', `location.href='article.html?id=${a.id}'`);
  el.innerHTML = `${ph(a.img, '', a.title)}
    <div class="hero-dots">${HERO.map((_, i) => `<button class="${i === heroIdx ? 'on' : ''}" onclick="event.stopPropagation(); heroGo(${i})"></button>`).join('')}</div>
    <div class="cap"><span class="eyebrow">${esc(catOf(a.cat).label)} · ${esc(a.sub)}</span><h2>${esc(a.title)}</h2>
    <div class="meta" style="color:#D9CFC2">${a.author} · ${a.date} · ${a.read} menit baca</div></div>`;
}
function heroGo(i){ heroIdx = (i + HERO.length) % HERO.length; renderHero(); }

function viewCategory(key){
  const c = catOf(key);
  const f = state.filter[key] || 'Semua';
  const list = inCat(key).filter(a => f === 'Semua' || a.sub === f);
  const n = state.shown[key] || 7;
  const [lead, ...rest] = list;
  const others = A.filter(a => a.cat !== key).slice(0, 4);
  const isIqra = key === 'iqra';
  return `
  <div class="page-hd"><div class="container-x">
    <div class="eyebrow">Kanal</div><h1>${c.label}</h1><p>${c.desc}</p>
  </div></div>
  <div class="container-x">
    <div class="filters">${c.subs.map(s => `<button class="${s === f ? 'on' : ''}" onclick="setFilter('${key}','${s}')">${s}</button>`).join('')}</div>
    ${!lead ? `<div class="empty"><i class="bi bi-journal"></i>Belum ada artikel di subkanal ini.</div>` : `
    <div class="row g-4 g-lg-5 pb-5">
      <div class="col-lg-8">
        <div class="mb-5">${card(lead, {size:'h3', ratio:'r-169', ex:true})}</div>
        <div class="row g-4 gy-5">${rest.slice(0, n - 1).map(a => `<div class="col-sm-6">${isIqra && !a.img ? iqraTextCard(a) : card(a, {ex:true})}</div>`).join('')}</div>
        ${rest.length > n - 1 ? `<div class="text-center mt-5"><button class="btn btn-line" onclick="loadMore('${key}')">Muat Lebih Banyak</button></div>` : ''}
      </div>
      <aside class="col-lg-4">
        <div style="position:sticky; top:84px">
          <div class="sec-head mb-2"><div><div class="eyebrow">Most Read</div><h2 style="font-size:30px">Terpopuler</h2></div></div>
          ${POPULAR.slice(0, 5).map((a, i) => listRow(a, i)).join('')}
          <div class="mt-4 p-4" style="background:var(--gold-50); border:1px solid var(--line)">
            <div class="eyebrow">Jelajahi</div>
            <h5 class="serif fw-semibold mt-2" style="font-size:24px">Designer Directory</h5>
            <p class="small text-muted mb-3">Temukan ${DESIGNERS.length}+ perancang modest dari seluruh Indonesia.</p>
            <a class="link-more" href="designers.html">Lihat Direktori</a>
          </div>
        </div>
      </aside>
    </div>`}
  </div>
  <section class="blk" style="background:var(--paper); border-top:1px solid var(--line)"><div class="container-x">
    ${secHead('Baca Juga', 'Dari Kanal Lain')}
    <div class="row g-4">${others.map(a => `<div class="col-6 col-lg-3">${card(a)}</div>`).join('')}</div>
  </div></section>`;
}
function iqraTextCard(a){
  return `<div class="card-a h-100" ${go(a.id)}><div class="p-4 h-100 d-flex flex-column" style="background:var(--ink); color:#EFE8DD; min-height:260px">
    <i class="bi bi-quote text-gold" style="font-size:36px"></i>
    <span class="tag-pill mt-2">${a.sub}</span><h4 style="color:#fff">${esc(a.title)}</h4>
    <p style="color:#BDB4A7" class="mb-3">${esc(a.ex)}</p><div class="meta mt-auto">${a.date} · ${a.read} menit baca</div></div></div>`;
}
function setFilter(k, s){ state.filter[k] = s; state.shown[k] = 7; render(false); }
function loadMore(k){ state.shown[k] = (state.shown[k] || 7) + 4; render(false); }

function viewArticle(id){
  const a = byId(id);
  if(!a) return `<div class="container-x empty"><i class="bi bi-search"></i>Artikel tidak ditemukan. <a class="link-more ms-2" href="index.html">Kembali</a></div>`;
  const c = catOf(a.cat);
  const related = inCat(a.cat).filter(x => x.id !== a.id).slice(0, 3);
  const on = saved.includes(a.id);
  return `
  <div class="container-x">
    <nav class="pt-4 meta"><a href="index.html">Home</a> <i class="bi bi-chevron-right mx-1" style="font-size:10px"></i> <a href="${U[a.cat]}">${c.label}</a></nav>
    <div class="art-hd">
      <a class="eyebrow" href="${U[a.cat]}">${c.label} · ${a.sub}</a>
      <h1>${esc(a.title)}</h1>
      <p class="lede">${esc(a.ex)}</p>
      <div class="meta mt-4">Oleh <b style="color:var(--ink)">${a.author}</b> · ${a.date} · ${a.read} menit baca</div>
    </div>
    ${a.img ? `<div style="max-width:1040px; margin:0 auto">${ph(a.img, 'r-169', a.title)}<div class="meta mt-2 text-center">Foto: dok. ${esc(a.author)}</div></div>` : ''}
    <div class="art-body py-5">
      <p>${esc(a.ex)} Di tengah perkembangan industri yang kian dinamis, cerita ini menjadi pengingat bahwa gaya dan nilai dapat berjalan beriringan — tanpa harus saling meniadakan.</p>
      <p>Redaksi modest.id berbincang dengan sejumlah pihak yang terlibat untuk memahami lebih dalam proses di balik layar: mulai dari riset, pemilihan material, hingga bagaimana pesan yang ingin disampaikan diterjemahkan ke dalam karya yang bisa dinikmati publik.</p>
      <blockquote>“Kesederhanaan bukan berarti kurang. Justru di situlah keanggunan menemukan ruangnya.”</blockquote>
      <h3>Lebih dari Sekadar Tren</h3>
      <p>Pendekatan yang diambil menekankan keberlanjutan dan keterhubungan dengan komunitas. Para pelaku industri melihat bahwa konsumen modest hari ini semakin kritis: mereka mencari kualitas, cerita, dan makna di balik setiap produk yang mereka pilih.</p>
      <p>Ke depan, kolaborasi lintas disiplin — antara perancang, seniman, perajin, dan teknologi — diyakini akan menjadi kunci untuk membawa ekosistem modest Indonesia semakin diperhitungkan di panggung global.</p>
      <div class="d-flex flex-wrap gap-2 mt-4">${[c.label, a.sub, 'Modest Indonesia'].map(t => `<span class="chip">#${esc(t)}</span>`).join('')}</div>
    </div>
    <div class="d-flex justify-content-center align-items-center gap-3 pb-5 flex-wrap">
      <div class="share">
        <button class="icon-btn" onclick="toast('Dibagikan ke WhatsApp')"><i class="bi bi-whatsapp"></i></button>
        <button class="icon-btn" onclick="toast('Dibagikan ke X')"><i class="bi bi-twitter-x"></i></button>
        <button class="icon-btn" onclick="toast('Dibagikan ke Facebook')"><i class="bi bi-facebook"></i></button>
        <button class="icon-btn" onclick="copyLink()"><i class="bi bi-link-45deg"></i></button>
      </div>
      <button class="btn ${on ? 'btn-ink' : 'btn-line'}" onclick="toggleSave('${a.id}'); render(false)"><i class="bi bi-bookmark${on ? '-fill' : ''} me-2"></i>${on ? 'Tersimpan' : 'Simpan Artikel'}</button>
    </div>
  </div>
  ${related.length ? `<section class="blk" style="background:var(--paper); border-top:1px solid var(--line)"><div class="container-x">
    ${secHead('Selanjutnya', `Lainnya di ${c.label}`, U[a.cat])}
    <div class="row g-4">${related.map(r => `<div class="col-md-4">${r.img ? card(r, {ex:true}) : iqraTextCard(r)}</div>`).join('')}</div>
  </div></section>` : ''}`;
}

function viewDesigners(){
  return `
  <div class="page-hd"><div class="container-x">
    <div class="eyebrow">Direktori</div><h1>Designer Directory</h1>
    <p>Kenali perancang, label, dan rumah wastra yang membentuk lanskap mode modest Indonesia.</p>
  </div></div>
  <div class="container-x py-4">
    <div class="row g-3 align-items-center">
      <div class="col-lg-5"><div class="position-relative"><i class="bi bi-search position-absolute text-muted" style="left:14px; top:12px"></i>
        <input class="form-control ps-5" id="dq" placeholder="Cari nama desainer atau gaya…" value="${esc(state.dQuery)}" oninput="state.dQuery=this.value; drawDesigners()"></div></div>
      <div class="col-6 col-lg-2"><select class="form-select" onchange="state.dCat=this.value; drawDesigners()">${['Semua', ...new Set(DESIGNERS.map(d => d.cat))].map(x => `<option ${x === state.dCat ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="col-6 col-lg-2"><select class="form-select" onchange="state.dCity=this.value; drawDesigners()">${['Semua', ...new Set(DESIGNERS.map(d => d.city))].map(x => `<option ${x === state.dCity ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      <div class="col-lg-3 text-lg-end"><button class="btn btn-ink w-100" onclick="openRegister()"><i class="bi bi-plus-lg me-2"></i>Daftarkan Label</button></div>
    </div>
    <div class="az mt-4" id="az"></div>
    <div class="meta mt-3" id="dCount"></div>
    <div class="row g-4 mt-1 pb-5" id="dGrid"></div>
  </div>`;
}
function drawDesigners(){
  const q = state.dQuery.toLowerCase();
  const base = DESIGNERS.filter(d => (state.dCat === 'Semua' || d.cat === state.dCat) && (state.dCity === 'Semua' || d.city === state.dCity)
    && (!q || (d.name + ' ' + d.tags.join(' ') + ' ' + d.cat).toLowerCase().includes(q)));
  const letters = new Set(base.map(d => d.name[0].toUpperCase()));
  $('#az').innerHTML = `<button class="${!state.dLetter ? 'on' : ''}" style="width:auto; padding:0 10px; font-family:var(--sans); font-size:12px; letter-spacing:.1em" onclick="state.dLetter=''; drawDesigners()">SEMUA</button>`
    + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => `<button class="${state.dLetter === l ? 'on' : ''}" ${letters.has(l) ? '' : 'disabled'} onclick="state.dLetter='${l}'; drawDesigners()">${l}</button>`).join('');
  const list = base.filter(d => !state.dLetter || d.name[0].toUpperCase() === state.dLetter).sort((a, b) => a.name.localeCompare(b.name));
  $('#dCount').textContent = `${list.length} perancang ditemukan`;
  $('#dGrid').innerHTML = list.length ? list.map(d => `<div class="col-md-6 col-xl-4"><div class="d-row" onclick="openDesigner('${d.id}')">
      ${ph(d.img, '', d.name)}
      <div class="min-w-0"><div class="eyebrow" style="font-size:10px">${d.cat}</div><h5>${esc(d.name)}</h5>
      <div class="meta mb-2"><i class="bi bi-geo-alt me-1"></i>${d.city} · sejak ${d.since}</div>
      <div>${d.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div></div></div></div>`).join('')
    : `<div class="col-12 empty"><i class="bi bi-person-badge"></i>Tidak ada perancang yang cocok dengan filter Anda.</div>`;
}
function openDesigner(id){
  const d = DESIGNERS.find(x => x.id === id);
  const rel = A.filter(a => a.id === d.id || a.title.toLowerCase().includes(d.name.toLowerCase())).slice(0, 3);
  $('#dModalBody').innerHTML = `
    <div class="row g-0">
      <div class="col-md-5">${ph(d.img, 'r-34', d.name)}</div>
      <div class="col-md-7 p-4 p-lg-5 position-relative">
        <button class="btn-close position-absolute" style="top:18px; right:18px" data-bs-dismiss="modal"></button>
        <div class="eyebrow">${d.cat}</div>
        <h3 class="serif fw-semibold mt-2" style="font-size:40px; line-height:1">${esc(d.name)}</h3>
        <div class="meta mb-3"><i class="bi bi-geo-alt me-1"></i>${d.city} · Berdiri sejak ${d.since}</div>
        <p style="font-weight:300; color:var(--ink-2); line-height:1.7">${esc(d.bio)}</p>
        <div class="mb-4">${d.tags.map(t => `<span class="chip">${t}</span>`).join('')}</div>
        ${rel.length ? `<div class="eyebrow mb-2">Liputan Terkait</div>${rel.map(a => `<div class="list-row py-2" onclick="bootstrap.Modal.getInstance('#dModal').hide(); location.href='article.html?id=${a.id}'"><div><h6 class="m-0" style="font-size:16px">${esc(a.title)}</h6><div class="meta">${a.date}</div></div></div>`).join('')}` : ''}
        <div class="d-flex gap-2 mt-4 flex-wrap">
          <button class="btn btn-ink" onclick="toast('Membuka Instagram ${esc(d.name).replace(/'/g, '')}')"><i class="bi bi-instagram me-2"></i>Instagram</button>
          <button class="btn btn-line" onclick="toast('Permintaan kolaborasi terkirim ke ${esc(d.name).replace(/'/g, '')}')">Hubungi</button>
          ${P.some(p => p.d === d.id) ? `<button class="btn btn-line" onclick="shopBrand('${d.id}')"><i class="bi bi-bag me-2"></i>Lihat Katalog</button>` : ''}
        </div>
      </div>
    </div>`;
  bootstrap.Modal.getOrCreateInstance('#dModal').show();
}
function openRegister(){
  $('#dModalBody').innerHTML = `<div class="p-4 p-lg-5">
    <div class="d-flex justify-content-between"><div><div class="eyebrow">Gratis</div><h3 class="serif fw-semibold mt-2" style="font-size:36px">Daftarkan Label Anda</h3></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <p class="text-muted" style="font-weight:300">Tim kurasi kami akan meninjau dan menghubungi Anda dalam 3–5 hari kerja.</p>
    <form class="row g-3 mt-1" onsubmit="event.preventDefault(); bootstrap.Modal.getInstance('#dModal').hide(); toast('Terima kasih! Pendaftaran Anda sedang ditinjau tim kurasi.')">
      <div class="col-md-6"><label class="meta mb-1">Nama Label / Desainer</label><input class="form-control" required></div>
      <div class="col-md-6"><label class="meta mb-1">Kota</label><input class="form-control" required></div>
      <div class="col-md-6"><label class="meta mb-1">Kategori</label><select class="form-select"><option>Ready to Wear</option><option>Couture</option><option>Wastra</option><option>Aksesori</option></select></div>
      <div class="col-md-6"><label class="meta mb-1">Instagram</label><input class="form-control" placeholder="@label"></div>
      <div class="col-12"><label class="meta mb-1">Ceritakan tentang label Anda</label><textarea class="form-control" rows="3"></textarea></div>
      <div class="col-12"><button class="btn btn-ink w-100">Kirim Pendaftaran</button></div>
    </form></div>`;
  bootstrap.Modal.getOrCreateInstance('#dModal').show();
}

function viewAbout(){
  return `<div class="page-hd"><div class="container-x"><div class="eyebrow">Tentang</div><h1>modest.id</h1>
    <p>Modest.id hadir sebagai rumah bagi muslimah modern untuk menemukan inspirasi gaya modest dan gaya hidup, serta memadukannya dengan spiritualitas.</p></div></div>
    <div class="container-x py-5"><div class="row g-4 text-center">
      ${[['bi-stars','Kurasi','Cerita pilihan redaksi dari runway hingga ruang galeri.'],['bi-people','Komunitas','Menghubungkan pembaca, perancang, dan pelaku industri.'],['bi-book','Iqra','Ruang renungan untuk menata hati di tengah kesibukan.']]
        .map(([ic, t, d]) => `<div class="col-md-4"><div class="p-5 h-100" style="background:var(--paper); border:1px solid var(--line)"><i class="bi ${ic} text-gold" style="font-size:30px"></i><h4 class="serif fw-semibold mt-3" style="font-size:28px">${t}</h4><p class="text-muted m-0" style="font-weight:300">${d}</p></div></div>`).join('')}
    </div></div>`;
}

/* ══════════════════════════════════════════════════════════════════
   CATALOG — e-commerce flow (data ada di data.js)
════════════════════════════════════════════════════════════════════ */
const pById = id => P.find(p => p.id === id);
const brandOf = p => DESIGNERS.find(d => d.id === p.d) || {name:p.d};
const rp = n => 'Rp' + n.toLocaleString('id-ID');
const sizesOf = p => p.sizes || SIZES;
const stars = r => `<span class="stars">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}</span>`;
let cart = [], wish = [];
try{ cart = JSON.parse(localStorage.getItem('modest_cart') || '[]'); wish = JSON.parse(localStorage.getItem('modest_wish') || '[]'); }catch(e){}
const persistShop = () => { try{ localStorage.setItem('modest_cart', JSON.stringify(cart)); localStorage.setItem('modest_wish', JSON.stringify(wish)); }catch(e){} };
const shop = {types:new Set(), brands:new Set(), colors:new Set(), price:'all', sort:'pop', wishOnly:false};
const pd = {id:null, color:null, size:null, qty:1, view:0};
const FREE_SHIP = 500000;

const crop = (pos, z = 1) => `object-position:${pos}; transform-origin:${pos}; scale:${z}`;
function pImg(p, ratio = 'r-34', view){ const v = view || {pos:p.pos, z:p.z}; return ph(PIMG[p.img], ratio, p.name, crop(v.pos, v.z)); }
const wishBtn = id => `<button class="save-btn ${wish.includes(id) ? 'on' : ''}" onclick="event.stopPropagation(); toggleWish('${id}', this)" aria-label="Wishlist"><i class="bi bi-heart${wish.includes(id) ? '-fill' : ''}"></i></button>`;

function pCard(p){
  return `<div class="p-card" onclick="location.href='product.html?id=${p.id}'">
    <div class="position-relative">${pImg(p)}
      ${p.badge ? `<span class="badge-x ${p.old ? 'sale' : ''}">${p.old ? '-' + Math.round((1 - p.price / p.old) * 100) + '%' : p.badge}</span>` : ''}
      ${wishBtn(p.id)}
      <div class="quick"><button class="btn btn-ink w-100" style="padding:10px" onclick="event.stopPropagation(); quickAdd('${p.id}')"><i class="bi bi-bag-plus me-2"></i>Tambah</button></div>
    </div>
    <div class="p-brand mt-3">${esc(brandOf(p).name)}</div>
    <div class="name">${esc(p.name)}</div>
    <div class="price">${rp(p.price)}${p.old ? `<s>${rp(p.old)}</s>` : ''}</div>
    <div class="d-flex align-items-center justify-content-between mt-2">
      <span>${p.colors.map(c => `<span class="sw" style="background:${C[c][1]}" title="${C[c][0]}"></span>`).join('')}</span>
      <span class="meta"><i class="bi bi-star-fill text-gold" style="font-size:10px"></i> ${p.rating.toFixed(1)}</span>
    </div></div>`;
}

function viewCatalog(){
  const cnt = f => P.filter(f).length;
  const check = (set, val, label, n) => `<label class="f-check"><input type="checkbox" ${shop[set].has(val) ? 'checked' : ''} onchange="toggleF('${set}','${val}')">${label}<span class="n">${n}</span></label>`;
  const brands = [...new Set(P.map(p => p.d))].map(id => DESIGNERS.find(d => d.id === id)).sort((a, b) => a.name.localeCompare(b.name));
  const colors = [...new Set(P.flatMap(p => p.colors))];
  return `
  <div class="page-hd"><div class="container-x">
    <div class="eyebrow">Shop the Edit</div><h1>Catalog</h1>
    <p>Busana modest pilihan dari perancang di Designer Directory — dikurasi redaksi, langsung dari label aslinya.</p>
  </div></div>
  <div class="container-x py-5"><div class="row g-4 g-lg-5">
    <aside class="col-lg-3">
      <button class="btn btn-line w-100 d-lg-none mb-3" data-bs-toggle="collapse" data-bs-target="#fBox"><i class="bi bi-sliders me-2"></i>Filter</button>
      <div class="collapse d-lg-block" id="fBox"><div style="position:sticky; top:84px">
        <div class="f-group"><h6>Kategori</h6>${TYPES.map(t => check('types', t, t, cnt(p => p.type === t))).join('')}</div>
        <div class="f-group"><h6>Harga</h6>${PRICES.map(([k, l]) => `<label class="f-check"><input type="radio" name="fp" ${shop.price === k ? 'checked' : ''} onchange="shop.price='${k}'; drawCatalog()">${l}</label>`).join('')}</div>
        <div class="f-group"><h6>Warna</h6><div class="swatch-pick">${colors.map(c => `<button class="${shop.colors.has(c) ? 'on' : ''}" style="background:${C[c][1]}" title="${C[c][0]}" onclick="toggleF('colors','${c}'); this.classList.toggle('on')"></button>`).join('')}</div></div>
        <div class="f-group"><h6>Desainer</h6>${brands.map(b => check('brands', b.id, esc(b.name), cnt(p => p.d === b.id))).join('')}</div>
        <button class="btn btn-line w-100 mt-3" onclick="resetShop()">Reset Filter</button>
      </div></div>
    </aside>
    <div class="col-lg-9">
      <div class="toolbar">
        <div class="meta" id="pCount"></div>
        <div class="d-flex gap-2 align-items-center">
          <button class="btn ${shop.wishOnly ? 'btn-ink' : 'btn-line'}" style="padding:8px 14px" onclick="shop.wishOnly=!shop.wishOnly; this.classList.toggle('btn-ink'); this.classList.toggle('btn-line'); drawCatalog()"><i class="bi bi-heart me-1"></i> Wishlist</button>
          <select class="form-select" onchange="shop.sort=this.value; drawCatalog()">
            ${[['pop','Terpopuler'],['new','Terbaru'],['low','Harga terendah'],['high','Harga tertinggi'],['rate','Rating tertinggi']].map(([k, l]) => `<option value="${k}" ${shop.sort === k ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="pChips"></div>
      <div class="row g-4 gy-5" id="pGrid"></div>
    </div>
  </div></div>`;
}
function filteredP(){
  const [, , lo, hi] = PRICES.find(x => x[0] === shop.price);
  let list = P.filter(p => (!shop.types.size || shop.types.has(p.type)) && (!shop.brands.size || shop.brands.has(p.d))
    && (!shop.colors.size || p.colors.some(c => shop.colors.has(c))) && (shop.price === 'all' || p.price >= lo && p.price < hi)
    && (!shop.wishOnly || wish.includes(p.id)));
  const sorts = {pop:(a, b) => b.sold - a.sold, new:(a, b) => P.indexOf(a) - P.indexOf(b), low:(a, b) => a.price - b.price, high:(a, b) => b.price - a.price, rate:(a, b) => b.rating - a.rating || b.rev - a.rev};
  return list.sort(sorts[shop.sort]);
}
function drawCatalog(){
  const list = filteredP();
  $('#pCount').textContent = `${list.length} produk`;
  const chips = [...[...shop.types].map(t => ['types', t, t]), ...[...shop.brands].map(b => ['brands', b, brandOf({d:b}).name]), ...[...shop.colors].map(c => ['colors', c, C[c][0]])];
  if(shop.price !== 'all') chips.push(['price', '', PRICES.find(x => x[0] === shop.price)[1]]);
  $('#pChips').innerHTML = chips.length ? `<div class="mb-4">${chips.map(([s, v, l]) => `<span class="chip-x" onclick="${s === 'price' ? `shop.price='all'` : `toggleF('${s}','${v}')`}; render(false)">${esc(l)} <i class="bi bi-x"></i></span>`).join('')}<a class="meta ms-2" href="javascript:void(0)" onclick="resetShop()">Hapus semua</a></div>` : '';
  $('#pGrid').innerHTML = list.length ? list.map(p => `<div class="col-6 col-md-4">${pCard(p)}</div>`).join('')
    : `<div class="col-12 empty"><i class="bi bi-bag"></i>${shop.wishOnly && !wish.length ? 'Wishlist Anda masih kosong.' : 'Tidak ada produk yang cocok dengan filter Anda.'}</div>`;
}
function toggleF(set, v){ shop[set].has(v) ? shop[set].delete(v) : shop[set].add(v); drawCatalog(); }
function resetShop(){ ['types','brands','colors'].forEach(k => shop[k].clear()); shop.price = 'all'; shop.wishOnly = false; render(false); }
function shopBrand(id){ location.href = 'catalog.html?brand=' + encodeURIComponent(id); }
function resetShopSilent(){ ['types','brands','colors'].forEach(k => shop[k].clear()); shop.price = 'all'; shop.wishOnly = false; }

/* ---------- Detail produk ---------- */
function viewProduct(id){
  const p = pById(id);
  if(!p) return `<div class="container-x empty"><i class="bi bi-bag"></i>Produk tidak ditemukan. <a class="link-more ms-2" href="catalog.html">Kembali ke Catalog</a></div>`;
  if(pd.id !== id) Object.assign(pd, {id, color:p.colors[0], size:null, qty:1, view:0});
  const b = brandOf(p);
  const [x, y] = p.pos.split(' ').map(parseFloat);
  const views = [{pos:p.pos, z:p.z}, {pos:`${x}% ${Math.max(0, y - 20)}%`, z:p.z * 1.7}, {pos:`${x}% ${Math.min(100, y + 25)}%`, z:p.z * 1.5}, {pos:p.pos, z:Math.max(1, p.z * .7)}];
  const related = [...P.filter(q => q.id !== p.id && q.d === p.d), ...P.filter(q => q.id !== p.id && q.d !== p.d && q.type === p.type), ...P.filter(q => q.id !== p.id)]
    .filter((q, i, arr) => arr.indexOf(q) === i).slice(0, 4);
  const inWish = wish.includes(p.id);
  return `
  <div class="container-x">
    <nav class="pt-4 meta"><a href="index.html">Home</a> <i class="bi bi-chevron-right mx-1" style="font-size:10px"></i> <a href="catalog.html">Catalog</a> <i class="bi bi-chevron-right mx-1" style="font-size:10px"></i> <a href="catalog.html?type=${encodeURIComponent(p.type)}">${p.type}</a></nav>
    <div class="row g-4 g-lg-5 py-4">
      <div class="col-lg-7"><div class="row g-3">
        <div class="col-2 d-none d-md-block gal-thumbs">${views.map((v, i) => `<div class="mb-3" onclick="pd.view=${i}; setView(${i}, this)">${ph(PIMG[p.img], i === pd.view ? 'on' : '', p.name, crop(v.pos, v.z))}</div>`).join('')}</div>
        <div class="col-md-10"><div class="position-relative gal-main" id="galMain" onmousemove="zoomImg(event)" onmouseleave="zoomImg()">${pImg(p, 'r-45', views[pd.view])}${p.badge ? `<span class="badge-x ${p.old ? 'sale' : ''}" style="position:absolute; top:14px; left:14px; background:${p.old ? 'var(--ink)' : 'var(--paper)'}; color:${p.old ? '#fff' : 'inherit'}; font-size:10px; letter-spacing:.18em; text-transform:uppercase; padding:5px 9px; z-index:2">${p.badge}</span>` : ''}</div>
          <div class="d-flex d-md-none gap-2 justify-content-center mt-3">${views.map((v, i) => `<button class="border-0 rounded-circle" style="width:8px; height:8px; background:${i === pd.view ? 'var(--ink)' : 'var(--line)'}" onclick="pd.view=${i}; render(false)"></button>`).join('')}</div>
        </div>
      </div></div>

      <div class="col-lg-5 p-info"><div style="position:sticky; top:84px">
        <a class="p-brand" href="javascript:void(0)" onclick="openDesigner('${b.id}')" style="color:var(--gold)">${esc(b.name)} <i class="bi bi-arrow-up-right"></i></a>
        <h1>${esc(p.name)}</h1>
        <div class="d-flex align-items-center gap-2 meta mb-3">${stars(p.rating)} <span>${p.rating.toFixed(1)}</span> · <a href="#reviews" onclick="event.preventDefault(); document.getElementById('reviews').scrollIntoView({behavior:'smooth'})" style="text-decoration:underline">${p.rev} ulasan</a> · <span>${p.sold.toLocaleString('id-ID')} terjual</span></div>
        <div class="price mb-1">${rp(p.price)}${p.old ? `<s>${rp(p.old)}</s><span class="off">Hemat ${Math.round((1 - p.price / p.old) * 100)}%</span>` : ''}</div>
        <div class="meta mb-4">atau 3× ${rp(Math.ceil(p.price / 3 / 100) * 100)} dengan cicilan 0%</div>

        <div class="lbl-sm">Warna: <span class="text-muted" style="letter-spacing:.04em; text-transform:none; font-weight:400">${C[pd.color][0]}</span></div>
        <div class="swatch-pick mb-3">${p.colors.map(c => `<button class="${c === pd.color ? 'on' : ''}" style="background:${C[c][1]}" title="${C[c][0]}" onclick="pd.color='${c}'; render(false)"></button>`).join('')}</div>

        <div class="d-flex justify-content-between align-items-end"><div class="lbl-sm">Ukuran${pd.size ? `: <span class="text-muted" style="letter-spacing:.04em; font-weight:400">${pd.size}</span>` : ''}</div>
          ${p.sizes ? '' : `<a class="meta mb-2" href="javascript:void(0)" onclick="openSizeGuide()" style="text-decoration:underline"><i class="bi bi-rulers me-1"></i>Panduan Ukuran</a>`}</div>
        <div class="size-pick mb-1" id="sizePick">${sizesOf(p).map(sz => `<button class="${sz === pd.size ? 'on' : ''}" ${p.out.includes(sz) ? 'disabled title="Stok habis"' : ''} onclick="pd.size='${sz}'; render(false)">${sz}</button>`).join('')}</div>
        ${p.out.length ? `<div class="meta mb-3">Ukuran ${p.out.join(', ')} sedang habis — <a href="javascript:void(0)" onclick="toast('Kami akan mengabari Anda saat stok tersedia')" style="text-decoration:underline">kabari saya</a></div>` : '<div class="mb-3"></div>'}

        <div class="d-flex gap-2 mb-2">
          <div class="qty"><button onclick="pd.qty=Math.max(1,pd.qty-1); render(false)"><i class="bi bi-dash"></i></button><span>${pd.qty}</span><button onclick="pd.qty=Math.min(10,pd.qty+1); render(false)"><i class="bi bi-plus"></i></button></div>
          <button class="btn btn-ink flex-grow-1" onclick="addFromPD()"><i class="bi bi-bag-plus me-2"></i>Tambah ke Keranjang</button>
          <button class="icon-btn" style="width:48px; height:48px; border:1px solid var(--line); border-radius:0; ${inWish ? 'color:var(--gold)' : ''}" onclick="toggleWish('${p.id}'); render(false)" aria-label="Wishlist"><i class="bi bi-heart${inWish ? '-fill' : ''}"></i></button>
        </div>
        <button class="btn btn-line w-100" onclick="addFromPD(true)">Beli Sekarang</button>

        <div class="perks">
          <div><i class="bi bi-truck"></i>Gratis ongkir di atas ${rp(FREE_SHIP)}</div>
          <div><i class="bi bi-arrow-repeat"></i>Tukar ukuran 14 hari</div>
          <div><i class="bi bi-patch-check"></i>100% original dari label</div>
        </div>

        <div class="accordion acc mt-4" id="pAcc">
          ${[['Deskripsi', p.desc + ' Tersedia dalam ' + p.colors.length + ' pilihan warna.', true], ['Material & Perawatan', MAT[p.type]], ['Pengiriman & Pengembalian', 'Dikirim langsung dari studio ' + esc(b.name) + (b.city ? ' di ' + b.city : '') + ' dalam 1–3 hari kerja. Penukaran ukuran gratis maksimal 14 hari selama label dan kemasan masih utuh.']]
            .map(([t, body, open], i) => `<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button ${open ? '' : 'collapsed'}" data-bs-toggle="collapse" data-bs-target="#acc${i}">${t}</button></h2><div id="acc${i}" class="accordion-collapse collapse ${open ? 'show' : ''}" data-bs-parent="#pAcc"><div class="accordion-body">${body}</div></div></div>`).join('')}
        </div>

        <div class="d-flex gap-3 align-items-center mt-4 p-3" style="background:var(--paper); border:1px solid var(--line); cursor:pointer" onclick="openDesigner('${b.id}')">
          <div style="width:56px; flex:none">${ph(b.img, 'r-11', b.name)}</div>
          <div class="min-w-0"><div class="eyebrow" style="font-size:10px">Tentang Desainer</div><div class="serif fw-semibold" style="font-size:20px">${esc(b.name)}</div><div class="meta">${b.cat || ''} · ${b.city || ''}</div></div>
          <i class="bi bi-chevron-right ms-auto text-muted"></i>
        </div>
      </div></div>
    </div>

    <div id="reviews" style="border-top:1px solid var(--line)"><div class="row g-5 py-5">
      <div class="col-lg-4">
        <div class="eyebrow">Ulasan</div>
        <div class="serif fw-semibold" style="font-size:64px; line-height:1">${p.rating.toFixed(1)}</div>
        <div class="mb-1">${stars(p.rating)}</div><div class="meta mb-3">Berdasarkan ${p.rev} ulasan</div>
        ${[5, 4, 3, 2, 1].map((n, i) => { const w = [78, 16, 4, 1, 1][i]; return `<div class="d-flex align-items-center gap-2 meta mb-1"><span style="width:12px">${n}</span><div class="ship-bar flex-grow-1 m-0"><div style="width:${w}%"></div></div><span style="width:30px">${w}%</span></div>`; }).join('')}
        <button class="btn btn-line w-100 mt-4" onclick="toast('Form ulasan tersedia setelah pesanan diterima')">Tulis Ulasan</button>
      </div>
      <div class="col-lg-8">
        ${[['Nadia R.', 5, 'Bahannya jatuh dan adem, warnanya persis seperti di foto. Ukuran sesuai panduan.', 'M · ' + C[p.colors[0]][0], '2 minggu lalu'],
           ['Salsabila H.', 5, 'Jahitannya rapi sekali, packaging cantik — cocok untuk hadiah. Sudah repeat order.', 'L · ' + C[p.colors[p.colors.length - 1]][0], '1 bulan lalu'],
           ['Ayu P.', 4, 'Suka modelnya, tapi pengiriman ke luar Jawa agak lama. Overall puas.', 'S · ' + C[p.colors[0]][0], '1 bulan lalu']]
          .map(([n, r, t, v, d]) => `<div class="review"><div class="d-flex justify-content-between"><div><b style="font-weight:500">${n}</b> <span class="meta ms-2"><i class="bi bi-patch-check-fill text-gold"></i> Pembeli terverifikasi</span></div><span class="meta">${d}</span></div>
            <div class="my-1">${stars(r)} <span class="meta ms-2">${p.sizes ? '' : v}</span></div><p class="m-0" style="font-weight:300; color:var(--ink-2)">${t}</p></div>`).join('')}
      </div>
    </div></div>
  </div>
  <section class="blk" style="background:var(--paper); border-top:1px solid var(--line)"><div class="container-x">
    ${secHead('Lengkapi Tampilan', 'Anda Mungkin Juga Suka', 'catalog.html')}
    <div class="row g-4 gy-5">${related.map(q => `<div class="col-6 col-lg-3">${pCard(q)}</div>`).join('')}</div>
  </div></section>`;
}
function setView(i, el){
  const p = pById(pd.id), [x, y] = p.pos.split(' ').map(parseFloat);
  const views = [{pos:p.pos, z:p.z}, {pos:`${x}% ${Math.max(0, y - 20)}%`, z:p.z * 1.7}, {pos:`${x}% ${Math.min(100, y + 25)}%`, z:p.z * 1.5}, {pos:p.pos, z:Math.max(1, p.z * .7)}];
  const img = $('#galMain img'); if(img) img.style.cssText = crop(views[i].pos, views[i].z);
  document.querySelectorAll('.gal-thumbs .ph').forEach(x => x.classList.remove('on'));
  el.querySelector('.ph').classList.add('on');
}
function zoomImg(e){
  const img = $('#galMain img'); if(!img) return;
  if(!e){ img.style.transform = ''; return; }
  const r = e.currentTarget.getBoundingClientRect();
  img.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
  img.style.transform = 'scale(1.8)';
}
function openSizeGuide(){
  const rows = [['XS', 84, 70, 136], ['S', 90, 76, 138], ['M', 96, 82, 140], ['L', 102, 88, 142], ['XL', 110, 96, 144]];
  $('#dModalBody').innerHTML = `<div class="p-4 p-lg-5">
    <div class="d-flex justify-content-between"><div><div class="eyebrow">Panduan</div><h3 class="serif fw-semibold mt-2" style="font-size:34px">Ukuran Busana</h3></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <p class="text-muted" style="font-weight:300">Ukur tubuh tanpa pakaian luar. Jika berada di antara dua ukuran, pilih ukuran yang lebih besar untuk siluet yang lebih longgar.</p>
    <table class="table size-tbl text-center mt-3"><thead><tr><th>Ukuran</th><th>Lingkar Dada</th><th>Lingkar Pinggang</th><th>Panjang Badan</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td><b style="font-weight:500">${r[0]}</b></td><td>${r[1]} cm</td><td>${r[2]} cm</td><td>${r[3]} cm</td></tr>`).join('')}</tbody></table>
    <button class="btn btn-ink w-100 mt-2" data-bs-dismiss="modal">Mengerti</button></div>`;
  bootstrap.Modal.getOrCreateInstance('#dModal').show();
}

/* ---------- Wishlist & keranjang ---------- */
function toggleWish(id, btn){
  const i = wish.indexOf(id);
  i >= 0 ? wish.splice(i, 1) : wish.unshift(id);
  persistShop();
  const on = i < 0;
  if(btn){ btn.classList.toggle('on', on); btn.innerHTML = `<i class="bi bi-heart${on ? '-fill' : ''}"></i>`; }
  toast(on ? 'Ditambahkan ke Wishlist' : 'Dihapus dari Wishlist');
}
function addToCart(id, color, size, qty, open = true){
  const line = cart.find(c => c.id === id && c.color === color && c.size === size);
  line ? line.qty = Math.min(10, line.qty + qty) : cart.push({id, color, size, qty});
  persistShop(); updateCart();
  if(open) openCart();
}
function quickAdd(id){
  const p = pById(id);
  const size = sizesOf(p).find(s => !p.out.includes(s) && (s === 'M' || p.sizes));
  addToCart(id, p.colors[0], size || sizesOf(p).find(s => !p.out.includes(s)), 1);
}
function addFromPD(buyNow = false){
  const p = pById(pd.id);
  if(!pd.size && !p.sizes){ toast('Silakan pilih ukuran terlebih dahulu'); $('#sizePick').animate([{transform:'translateX(-6px)'}, {transform:'translateX(6px)'}, {transform:'none'}], {duration:250}); return; }
  addToCart(p.id, pd.color, pd.size || sizesOf(p)[0], pd.qty, !buyNow);
  if(buyNow) openCheckout();
}
function setQty(i, d){ cart[i].qty += d; if(cart[i].qty < 1) cart.splice(i, 1); else cart[i].qty = Math.min(10, cart[i].qty); persistShop(); updateCart(); }
const subtotal = () => cart.reduce((n, c) => n + pById(c.id).price * c.qty, 0);
function updateCart(){
  const n = cart.reduce((a, c) => a + c.qty, 0);
  const el = $('#cartCount'); el.textContent = n; el.classList.toggle('d-none', !n);
  const sub = subtotal(), left = FREE_SHIP - sub;
  $('#cartBody').innerHTML = !cart.length ? `<div class="empty my-auto"><i class="bi bi-bag"></i>Keranjang Anda masih kosong.<div class="mt-4"><a class="btn btn-ink" href="catalog.html" onclick="bootstrap.Offcanvas.getInstance('#cart').hide()">Jelajahi Catalog</a></div></div>` : `
    <div class="meta">${left > 0 ? `Tambah <b style="color:var(--ink)">${rp(left)}</b> lagi untuk gratis ongkir` : '<i class="bi bi-check-circle-fill text-gold me-1"></i>Selamat! Pesanan Anda gratis ongkir'}</div>
    <div class="ship-bar"><div style="width:${Math.min(100, sub / FREE_SHIP * 100)}%"></div></div>
    <div class="flex-grow-1 overflow-auto">${cart.map((c, i) => { const p = pById(c.id); return `<div class="cart-item">
      ${pImg(p, '')}
      <div class="min-w-0 flex-grow-1">
        <div class="p-brand">${esc(brandOf(p).name)}</div>
        <div class="name" onclick="bootstrap.Offcanvas.getInstance('#cart').hide(); location.href='product.html?id=${p.id}'">${esc(p.name)}</div>
        <div class="meta mb-2">${C[c.color][0]} · ${c.size}</div>
        <div class="d-flex justify-content-between align-items-center">
          <div class="qty sm"><button onclick="setQty(${i},-1)"><i class="bi bi-dash"></i></button><span>${c.qty}</span><button onclick="setQty(${i},1)"><i class="bi bi-plus"></i></button></div>
          <span class="price">${rp(p.price * c.qty)}</span>
        </div>
      </div>
      <button class="icon-btn flex-none" style="width:28px; height:28px" onclick="cart.splice(${i},1); persistShop(); updateCart()" aria-label="Hapus"><i class="bi bi-x"></i></button>
    </div>`; }).join('')}</div>
    <div class="pt-3 border-top">
      <div class="d-flex justify-content-between mb-1"><span>Subtotal</span><span class="price">${rp(sub)}</span></div>
      <div class="meta mb-3">Ongkir dan voucher dihitung saat checkout.</div>
      <button class="btn btn-ink w-100" onclick="openCheckout()">Checkout <i class="bi bi-arrow-right ms-2"></i></button>
    </div>`;
}
function openCart(){ updateCart(); bootstrap.Offcanvas.getOrCreateInstance('#cart').show(); }

function openCheckout(){
  if(!cart.length) return toast('Keranjang masih kosong');
  bootstrap.Offcanvas.getInstance('#cart')?.hide();
  const sub = subtotal(), ship = sub >= FREE_SHIP ? 0 : 25000;
  $('#dModalBody').innerHTML = `<div class="row g-0">
    <div class="col-md-7 p-4 p-lg-5">
      <div class="d-flex justify-content-between"><div><div class="eyebrow">Checkout</div><h3 class="serif fw-semibold mt-2" style="font-size:34px">Pengiriman & Pembayaran</h3></div><button class="btn-close d-md-none" data-bs-dismiss="modal"></button></div>
      <form class="row g-3 mt-1" id="coForm" onsubmit="placeOrder(event)">
        <div class="col-md-6"><label class="meta mb-1">Nama Penerima</label><input class="form-control" required></div>
        <div class="col-md-6"><label class="meta mb-1">No. WhatsApp</label><input class="form-control" required placeholder="08…"></div>
        <div class="col-12"><label class="meta mb-1">Alamat Lengkap</label><textarea class="form-control" rows="2" required></textarea></div>
        <div class="col-md-6"><label class="meta mb-1">Kota</label><input class="form-control" required></div>
        <div class="col-md-6"><label class="meta mb-1">Kurir</label><select class="form-select"><option>JNE Reguler (2–3 hari)</option><option>SiCepat BEST (1–2 hari)</option><option>GoSend Same Day</option></select></div>
        <div class="col-12 mt-4"><div class="lbl-sm">Metode Pembayaran</div>
          ${[['bi-bank','Transfer Bank / Virtual Account'],['bi-wallet2','E-Wallet (GoPay, OVO, DANA)'],['bi-credit-card','Kartu Kredit — cicilan 0%'],['bi-cash-coin','Bayar di Tempat (COD)']].map(([ic, l], i) => `<label class="pay-opt"><input type="radio" name="pay" ${i ? '' : 'checked'}><i class="bi ${ic} text-gold"></i>${l}</label>`).join('')}
        </div>
      </form>
    </div>
    <div class="col-md-5 p-4 p-lg-5" style="background:var(--ivory-2)">
      <div class="d-none d-md-flex justify-content-end mb-2"><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div class="lbl-sm">Ringkasan Pesanan</div>
      ${cart.map(c => { const p = pById(c.id); return `<div class="d-flex gap-3 py-2"><div style="width:52px; flex:none">${pImg(p)}</div><div class="min-w-0 flex-grow-1"><div class="serif fw-semibold" style="font-size:16px; line-height:1.2">${esc(p.name)}</div><div class="meta">${C[c.color][0]} · ${c.size} · ×${c.qty}</div></div><div class="price small">${rp(p.price * c.qty)}</div></div>`; }).join('')}
      <div class="d-flex gap-2 my-3"><input class="form-control" id="voucher" placeholder="Kode voucher"><button class="btn btn-line" style="padding:8px 14px" onclick="applyVoucher()">Pakai</button></div>
      <div class="d-flex justify-content-between meta mb-1"><span>Subtotal</span><span>${rp(sub)}</span></div>
      <div class="d-flex justify-content-between meta mb-1"><span>Ongkos kirim</span><span>${ship ? rp(ship) : 'Gratis'}</span></div>
      <div class="d-flex justify-content-between meta mb-1 d-none" id="discRow"><span>Voucher MODEST10</span><span>-${rp(Math.round(sub * .1))}</span></div>
      <div class="d-flex justify-content-between pt-2 mt-2 border-top" style="border-color:var(--line)!important"><b style="font-weight:500">Total</b><b class="price" id="coTotal" data-base="${sub + ship}">${rp(sub + ship)}</b></div>
      <button class="btn btn-ink w-100 mt-4" type="submit" form="coForm">Bayar Sekarang</button>
      <div class="meta text-center mt-2"><i class="bi bi-shield-lock me-1"></i>Pembayaran aman & terenkripsi</div>
    </div></div>`;
  bootstrap.Modal.getOrCreateInstance('#dModal').show();
}
function applyVoucher(){
  if($('#voucher').value.trim().toUpperCase() !== 'MODEST10') return toast('Kode voucher tidak valid — coba MODEST10');
  const base = +$('#coTotal').dataset.base;
  $('#discRow').classList.remove('d-none');
  $('#coTotal').textContent = rp(base - Math.round(subtotal() * .1));
  toast('Voucher MODEST10 berhasil dipakai');
}
function placeOrder(e){
  e.preventDefault();
  const no = 'MDS-' + Date.now().toString().slice(-8);
  cart = []; persistShop(); updateCart();
  $('#dModalBody').innerHTML = `<div class="p-5 text-center">
    <i class="bi bi-check2-circle text-gold" style="font-size:56px"></i>
    <h3 class="serif fw-semibold mt-3" style="font-size:38px">Terima kasih!</h3>
    <p class="text-muted" style="font-weight:300">Pesanan <b style="color:var(--ink)">${no}</b> telah kami terima.<br>Instruksi pembayaran dan resi akan dikirim melalui WhatsApp.</p>
    <div class="d-flex gap-2 justify-content-center mt-4"><button class="btn btn-ink" data-bs-dismiss="modal" onclick="location.href='catalog.html'">Lanjut Belanja</button><button class="btn btn-line" data-bs-dismiss="modal">Tutup</button></div></div>`;
}

/* ══════════════════════════════════════════════════════════════════
   ROUTER & RENDER
════════════════════════════════════════════════════════════════════ */
const NAV = [['', 'Home'], ['fashion', 'Fashion'], ['lifestyle', 'Lifestyle'], ['art', 'Art & Culture'], ['iqra', 'Iqra'], ['catalog', 'Catalog'], ['designers', 'Designer Directory']];

// halaman ditentukan oleh <body data-page="…">, detail memakai ?id=
function route(){ const pg = document.body.dataset.page; return {page:pg === 'home' ? '' : pg, id:new URLSearchParams(location.search).get('id')}; }

function render(top = true){
  const {page, id} = route();
  const active = page === 'article' ? (byId(id) || {}).cat : page === 'product' ? 'catalog' : page === 'event' ? 'events' : page;
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === active));

  let html;
  if(page === '') html = viewHome();
  else if(catOf(page)) html = viewCategory(page);
  else if(page === 'article') html = viewArticle(id);
  else if(page === 'designers') html = viewDesigners();
  else if(page === 'catalog') html = viewCatalog();
  else if(page === 'events') html = viewEvents();
  else if(page === 'event') html = viewEvent(id);
  else if(page === 'product') html = viewProduct(id);
  else if(page === 'about') html = viewAbout();
  else html = viewHome();
  const app = $('#app');
  app.innerHTML = `<div class="view">${html}</div>`;

  clearInterval(heroTimer);
  if(page === '' || !['article','designers','about','catalog','product','events','event'].includes(page) && !catOf(page)){ heroIdx = 0; renderHero(); heroTimer = setInterval(() => heroGo(heroIdx + 1), 6000); }
  if(page === 'designers') drawDesigners();
  if(page === 'catalog') drawCatalog();
  if(page === 'events') drawEvents();
  tickCountdown();
  if(page === 'article' && byId(id)) document.title = byId(id).title + ' — modest.id';
  if(page === 'event' && EV.event(id)) document.title = EV.event(id).title + ' — modest.id Events';
  if(page === 'product' && pById(id)) document.title = pById(id).name + ' — modest.id Catalog';
  if(top) scrollTo({top:0});
  bootstrap.Offcanvas.getInstance('#mnav')?.hide();
}

/* ══════════════════════════════════════════════════════════════════
   ACTIONS
════════════════════════════════════════════════════════════════════ */
let bsToast;
function toast(msg){ $('#toastMsg').textContent = msg; (bsToast ||= new bootstrap.Toast('#toast', {delay:2600})).show(); }

function toggleSave(id, btn){
  const i = saved.indexOf(id);
  i >= 0 ? saved.splice(i, 1) : saved.unshift(id);
  persist(); updateSaved();
  const on = i < 0;
  if(btn){ btn.classList.toggle('on', on); btn.innerHTML = `<i class="bi bi-bookmark${on ? '-fill' : ''}"></i>`; }
  toast(on ? 'Disimpan ke Bacaan Tersimpan' : 'Dihapus dari Bacaan Tersimpan');
}
function updateSaved(){
  const el = $('#savedCount'); el.textContent = saved.length; el.classList.toggle('d-none', !saved.length);
  const list = saved.map(byId).filter(Boolean);
  $('#savedList').innerHTML = list.length ? list.map(a => `<div class="list-row" onclick="bootstrap.Offcanvas.getInstance('#saved').hide(); location.href='article.html?id=${a.id}'">
      ${ph(a.img, '', a.title)}<div class="min-w-0 flex-grow-1"><span class="tag-pill">${catOf(a.cat).label}</span><h6>${esc(a.title)}</h6><div class="meta">${a.date}</div></div>
      <button class="icon-btn flex-none" onclick="event.stopPropagation(); toggleSave('${a.id}'); render(false)"><i class="bi bi-x"></i></button></div>`).join('')
    : `<div class="empty"><i class="bi bi-bookmark-heart"></i>Belum ada bacaan tersimpan.<br><span class="small">Tekan ikon <i class="bi bi-bookmark d-inline" style="font-size:13px; color:inherit"></i> pada artikel untuk menyimpannya.</span></div>`;
}
function openSaved(){ updateSaved(); bootstrap.Offcanvas.getOrCreateInstance('#saved').show(); }

function openSearch(){ $('#search').classList.add('open'); document.body.style.overflow = 'hidden'; setTimeout(() => $('#q').focus(), 50); doSearch(); }
function closeSearch(){ $('#search').classList.remove('open'); document.body.style.overflow = ''; }
function doSearch(){
  const q = $('#q').value.trim().toLowerCase();
  $('#qSuggest').innerHTML = q ? '' : ['Raya','Gamis','Hijab','Batik','Runway','Renungan'].map(t => `<button class="chip border" onclick="$('#q').value='${t}'; doSearch()">${t}</button>`).join('');
  if(!q){ $('#qResult').innerHTML = `<div class="eyebrow mt-4 mb-2">Terpopuler</div>${POPULAR.map((a, i) => listRow(a, i)).join('')}`; return; }
  const res = A.filter(a => (a.title + ' ' + a.ex + ' ' + a.sub).toLowerCase().includes(q));
  const ds = DESIGNERS.filter(d => d.name.toLowerCase().includes(q));
  const ps = P.filter(p => (p.name + ' ' + p.type + ' ' + brandOf(p).name).toLowerCase().includes(q));
  const es = EV.published().filter(e => (e.title + ' ' + e.cat + ' ' + e.city).toLowerCase().includes(q));
  $('#qResult').innerHTML = `<div class="meta mb-3">${res.length + ds.length + ps.length + es.length} hasil untuk “${esc(q)}”</div>`
    + ds.map(d => `<div class="list-row" onclick="closeSearch(); openDesigner('${d.id}')"><div class="num"><i class="bi bi-person-badge" style="font-size:22px"></i></div><div><span class="tag-pill">Desainer</span><h6>${esc(d.name)}</h6><div class="meta">${d.cat} · ${d.city}</div></div></div>`).join('')
    + es.map(e => `<div class="list-row" onclick="closeSearch(); location.href='${evUrl(e.id)}'">${evImg(e, '')}<div class="min-w-0"><span class="tag-pill">Event · ${esc(e.cat)}</span><h6>${esc(e.title)}</h6><div class="meta">${evDateLabel(e, false)} · ${esc(e.city)}</div></div></div>`).join('')
    + ps.map(p => `<div class="list-row" onclick="closeSearch(); location.href='product.html?id=${p.id}'">${pImg(p, '')}<div class="min-w-0"><span class="tag-pill">Catalog · ${esc(brandOf(p).name)}</span><h6>${esc(p.name)}</h6><div class="meta">${rp(p.price)}</div></div></div>`).join('')
    + (res.length ? res.map(a => listRow(a, 0, true)).join('') : (ds.length || ps.length || es.length ? '' : `<div class="empty"><i class="bi bi-search"></i>Tidak ada hasil. Coba kata kunci lain.</div>`));
}
$('#q').addEventListener('input', doSearch);
$('#qResult').addEventListener('click', e => { if(e.target.closest('.list-row[onclick*="article"]')) closeSearch(); });
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeSearch();
  if(e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){ e.preventDefault(); openSearch(); }
});

function subscribe(e){ e.preventDefault(); toast(`Terima kasih! ${$('#nlEmail').value} telah terdaftar.`); e.target.reset(); }
function copyLink(){ navigator.clipboard?.writeText(location.href).catch(() => {}); toast('Tautan artikel disalin'); }

addEventListener('scroll', () => {
  $('#nav').classList.toggle('scrolled', scrollY > 140);
  $('#toTop').classList.toggle('show', scrollY > 800);
  const isArt = route().page === 'article';
  const h = document.documentElement.scrollHeight - innerHeight;
  $('#progress').style.width = isArt && h > 0 ? (scrollY / h * 100) + '%' : 0;
}, {passive:true});

/* INIT */
$('#today').textContent = new Date().toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
$('#footPop').innerHTML = POPULAR.slice(0, 3).map(a => `<a href="article.html?id=${a.id}" class="serif" style="font-size:17px; color:#EFE8DD; padding:8px 0; border-bottom:1px solid rgba(255,255,255,.08)">${esc(a.title)}</a>`).join('');
// filter katalog dari URL, mis. catalog.html?brand=khanaan atau ?type=Outer
const qp = new URLSearchParams(location.search);
if(qp.get('brand')) shop.brands.add(qp.get('brand'));
if(qp.get('type')) shop.types.add(qp.get('type'));
updateSaved();
updateCart();
updateMyTickets();
render();
EV.loadMine().then(updateMyTickets).catch(() => {});
