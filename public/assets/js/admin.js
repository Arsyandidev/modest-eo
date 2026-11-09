/* ══════════════════════════════════════════════════════════════════
   EVENT STUDIO — dashboard admin event modest.id
   Halaman ditentukan oleh <body data-page="…">; data dari events-data.js (EV)
════════════════════════════════════════════════════════════════════ */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const rpShort = n => n >= 1e9 ? 'Rp' + (n / 1e9).toFixed(1).replace('.', ',') + 'M' : n >= 1e6 ? 'Rp' + (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace('.', ',') + 'jt' : n >= 1e3 ? 'Rp' + Math.round(n / 1e3) + 'rb' : 'Rp' + n;
const num = n => Number(n).toLocaleString('id-ID');
const dt = (iso, time = true) => { const d = new Date(iso); return `${d.getDate()} ${EV_MON[d.getMonth()]} ${d.getFullYear()}${time ? ', ' + String(d.getHours()).padStart(2, '0') + '.' + String(d.getMinutes()).padStart(2, '0') : ''}`; };
const qp = new URLSearchParams(location.search);
const PAGE = document.body.dataset.page;

const ORDER_ST = {paid:['Lunas','bi-check-circle-fill','good'], pending:['Menunggu','bi-hourglass-split','warn'], cancelled:['Dibatalkan','bi-x-circle-fill','bad'], refunded:['Refund','bi-arrow-counterclockwise','muted']};
const stOrder = s => { const [l, ic, c] = ORDER_ST[s]; return `<span class="st ${c}"><i class="bi ${ic}"></i>${l}</span>`; };
function stEvent(e){
  if(e.status === 'draft') return '<span class="st muted"><i class="bi bi-pencil"></i>Draft</span>';
  return {upcoming:'<span class="st good"><i class="bi bi-globe2"></i>Dipublikasikan</span>', live:'<span class="st gold"><i class="bi bi-broadcast"></i>Berlangsung</span>', ended:'<span class="st muted"><i class="bi bi-flag"></i>Selesai</span>'}[EV.phase(e)];
}
function thumb(src, alt = ''){
  const s = EV_IMG[src] || src;
  return `<div class="ph r-43 t1">${s ? `<img src="${IMG + s}" alt="${esc(alt)}" onerror="this.remove()">` : ''}</div>`;
}
const adminApi = path => ROUTES.adminApi + path;
const evName = id => (EV.event(id) || {title:'(event dihapus)'}).title;
const tkName = (e, t) => ((e && e.tickets.find(x => x.id === t)) || {name:t}).name;

/* ---------- UI helpers ---------- */
let bsToast;
function toast(msg){ $('#toastMsg').textContent = msg; (bsToast ||= new bootstrap.Toast('#toast', {delay:2600})).show(); }
function modal(html, size = ''){ $('#mDialog').className = `modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}`; $('#mBody').innerHTML = html; bootstrap.Modal.getOrCreateInstance('#m').show(); }
const closeModal = () => bootstrap.Modal.getInstance('#m')?.hide();
function confirmBox(title, msg, okLabel, fn, danger = false){
  modal(`<div class="p-4 p-lg-5"><h4 class="serif fw-semibold" style="font-size:28px">${title}</h4><div class="text-muted mb-4" style="font-weight:300">${msg}</div>
    <div class="d-flex gap-2 justify-content-end"><button class="btn btn-line" data-bs-dismiss="modal">Batal</button><button class="btn btn-ink" id="cfOk" ${danger ? 'style="background:var(--bad); border-color:var(--bad)"' : ''}>${okLabel}</button></div></div>`);
  $('#cfOk').onclick = () => { fn(); closeModal(); };
}
function csv(rows, name){
  const body = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + body], {type:'text/csv'})); a.download = name; a.click();
  toast(`${rows.length - 1} baris diekspor ke ${name}`);
}
function pager(total, page, size, fn){
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total ? (page - 1) * size + 1 : 0, to = Math.min(total, page * size);
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b);
  return `<div class="pager"><span>${from}–${to} dari ${num(total)}</span><div class="btns">
    <button ${page <= 1 ? 'disabled' : ''} onclick="${fn}(${page - 1})"><i class="bi bi-chevron-left"></i></button>
    ${nums.map((n, i) => `${i && n - nums[i - 1] > 1 ? '<span class="px-1">…</span>' : ''}<button class="${n === page ? 'on' : ''}" onclick="${fn}(${n})">${n}</button>`).join('')}
    <button ${page >= pages ? 'disabled' : ''} onclick="${fn}(${page + 1})"><i class="bi bi-chevron-right"></i></button></div></div>`;
}
// tooltip bersama untuk semua elemen ber-atribut data-tip (grafik)
document.addEventListener('mousemove', e => {
  const t = e.target.closest?.('[data-tip]'), tip = $('#tip');
  if(!tip) return;
  if(!t){ tip.style.display = 'none'; $$('.chart g.on').forEach(g => g.classList.remove('on')); return; }
  tip.innerHTML = t.dataset.tip; tip.style.display = 'block';
  const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = Math.max(8, e.clientY - tip.offsetHeight - 12);
  tip.style.left = x + 'px'; tip.style.top = y + 'px';
  $$('.chart g.on').forEach(g => g.classList.remove('on')); t.parentNode.classList?.add('on');
});

/* ---------- Charts (SVG, satu seri, warna champagne) ---------- */
function niceMax(v){ const p = Math.pow(10, Math.floor(Math.log10(v || 1))); return Math.ceil(v / p / (v / p > 5 ? 2 : 1)) * p * (v / p > 5 ? 2 : 1) || 1; }
function colChart(el, data, fmt = rpShort){
  const W = el.clientWidth || 640, H = 250, m = {t:14, r:6, b:28, l:58};
  const iw = W - m.l - m.r, ih = H - m.t - m.b, max = niceMax(Math.max(...data.map(d => d.v), 1));
  const band = iw / data.length, bw = Math.max(2, Math.min(24, band * .62)), y = v => m.t + ih - v / max * ih;
  const every = Math.ceil(data.length / Math.max(2, Math.floor(iw / 64)));
  let svg = '';
  for(let i = 0; i <= 4; i++){ const v = max / 4 * i, yy = y(v); svg += `<line class="${i ? 'grid' : 'base'}" x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}"/><text class="tick" x="${m.l - 10}" y="${yy + 4}" text-anchor="end">${fmt(v)}</text>`; }
  data.forEach((d, i) => {
    const x = m.l + band * i + (band - bw) / 2, top = y(d.v), h = m.t + ih - top, r = Math.min(4, h, bw / 2);
    const path = h > 0 ? `M${x},${m.t + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${m.t + ih} Z` : '';
    svg += `<g><rect class="hit" x="${m.l + band * i}" y="${m.t}" width="${band}" height="${ih}" data-tip="${esc(d.tip || `<b>${d.label}</b><br>${fmt(d.v)}`)}"/>${path ? `<path class="bar" d="${path}"/>` : ''}</g>`;
    if(i % every === 0) svg += `<text class="tick" x="${m.l + band * i + band / 2}" y="${H - 8}" text-anchor="middle">${d.label}</text>`;
  });
  el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik">${svg}</svg>`;
}
function hbars(rows, fmt){
  const max = Math.max(...rows.map(r => r.v), 1);
  return `<div class="hb">${rows.map(r => `<div class="l" title="${esc(r.label)}">${esc(r.label)}</div><div class="track"><div class="fill" style="width:${Math.max(1, r.v / max * 78)}%" data-tip="${esc(r.tip || `<b>${esc(r.label)}</b><br>${fmt(r.v)}`)}"></div><span class="v">${r.vl || fmt(r.v)}</span></div>`).join('')}</div>`;
}

/* ══════════════════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════════════════════ */
let revRange = 30, revTable = false;
const dayKey = iso => ymd(new Date(iso));
function revSeries(days){
  const out = [], base = new Date(); base.setHours(0, 0, 0, 0);
  const paid = EV.orders().filter(o => o.status === 'paid');
  const by = {}; paid.forEach(o => { const k = dayKey(o.paidAt || o.at); (by[k] ||= {v:0, n:0}); by[k].v += o.total; by[k].n++; });
  for(let i = days - 1; i >= 0; i--){ const d = new Date(base); d.setDate(d.getDate() - i); const k = ymd(d), r = by[k] || {v:0, n:0};
    out.push({label:`${d.getDate()} ${EV_MON[d.getMonth()]}`, v:r.v, n:r.n, tip:`<b>${EV_DAY[d.getDay()]}, ${d.getDate()} ${EV_MON[d.getMonth()]}</b><br>${rp(r.v)} · ${r.n} pesanan`}); }
  return out;
}
function periodStats(from, to){
  const os = EV.orders().filter(o => { const t = new Date(o.at); return t >= from && t < to; });
  const paid = os.filter(o => o.status === 'paid');
  return {rev:paid.reduce((n, o) => n + o.total, 0), tickets:paid.reduce((n, o) => n + o.att.length, 0), orders:os.length};
}
function delta(a, b){ if(!b) return '<span class="delta">—</span>'; const p = (a - b) / b * 100; return `<span class="delta"><b class="${p >= 0 ? 'up' : 'down'}"><i class="bi bi-arrow-${p >= 0 ? 'up' : 'down'}-right"></i> ${Math.abs(p).toFixed(0)}%</b> vs 30 hari sebelumnya</span>`; }

function pageDash(){
  const now = new Date(), d30 = new Date(now - 30 * 864e5), d60 = new Date(now - 60 * 864e5);
  const cur = periodStats(d30, now), prev = periodStats(d60, d30);
  const pending = EV.orders().filter(o => o.status === 'pending');
  const active = EV.events().filter(e => e.status === 'published' && EV.phase(e) !== 'ended').sort((a, b) => a.start.localeCompare(b.start));
  const live = active.filter(e => EV.phase(e) === 'live');
  const low = active.flatMap(e => e.tickets.map(t => ({e, t, left:EV.left(e, t)}))).filter(x => x.left > 0 && x.left / x.t.quota < .15);
  const drafts = EV.events().filter(e => e.status === 'draft');
  const hr = now.getHours(), greet = hr < 11 ? 'Selamat pagi' : hr < 15 ? 'Selamat siang' : hr < 18 ? 'Selamat sore' : 'Selamat malam';
  const pays = {}; EV.orders().filter(o => o.status === 'paid' && o.total).forEach(o => { pays[o.pay] = (pays[o.pay] || 0) + 1; });

  $('#app').innerHTML = `
  <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div><div class="eyebrow">${EV_DAY[now.getDay()]}, ${dt(now, false)}</div><h2 class="serif fw-semibold m-0" style="font-size:38px">${greet}, ${esc(adminName().split(' ')[0])}.</h2></div>
    <div class="d-flex gap-2"><a class="btn btn-line btn-sm-x" href="${ROUTES.admin.orders}?new=1"><i class="bi bi-receipt me-2"></i>Transaksi Baru</a><a class="btn btn-ink btn-sm-x" href="${ROUTES.admin.events}?new=1"><i class="bi bi-plus-lg me-2"></i>Buat Event</a></div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-6 col-xl-3"><div class="kpi"><i class="bi bi-cash-stack ic"></i><div class="lbl">Pendapatan · 30 hari</div><div class="val">${rpShort(cur.rev)}</div>${delta(cur.rev, prev.rev)}</div></div>
    <div class="col-6 col-xl-3"><div class="kpi"><i class="bi bi-ticket-perforated ic"></i><div class="lbl">Tiket Terjual · 30 hari</div><div class="val">${num(cur.tickets)}</div>${delta(cur.tickets, prev.tickets)}</div></div>
    <div class="col-6 col-xl-3"><a class="kpi d-block" href="${ROUTES.admin.orders}?st=pending"><i class="bi bi-hourglass-split ic"></i><div class="lbl">Menunggu Pembayaran</div><div class="val">${pending.length}</div><span class="delta">${rp(pending.reduce((n, o) => n + o.total, 0))} belum dibayar</span></a></div>
    <div class="col-6 col-xl-3"><a class="kpi d-block" href="${ROUTES.admin.events}"><i class="bi bi-calendar-event ic"></i><div class="lbl">Event Aktif</div><div class="val">${active.length}</div><span class="delta">${live.length} berlangsung hari ini · ${drafts.length} draft</span></a></div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-xl-8"><div class="panel">
      <div class="panel-hd"><div><h5>Pendapatan Harian</h5><div class="sub">Pesanan lunas, termasuk biaya layanan</div></div>
        <div class="d-flex gap-2 align-items-center"><div class="seg">${[7, 30, 90].map(n => `<button class="${revRange === n ? 'on' : ''}" onclick="revRange=${n}; drawRev()">${n} hari</button>`).join('')}</div>
        <button class="btn btn-line btn-sm-x" onclick="revTable=!revTable; drawRev()" id="revToggle"></button></div></div>
      <div class="panel-bd"><div class="d-flex gap-4 mb-3" id="revSum"></div><div class="chart" id="revChart"></div></div>
    </div></div>
    <div class="col-xl-4"><div class="panel">
      <div class="panel-hd"><h5>Perlu Tindakan</h5></div>
      <div class="panel-bd p-0">
        ${live.map(e => `<a class="list-row px-4" href="${ROUTES.admin.attendees}?ev=${e.id}"><div class="num"><i class="bi bi-broadcast" style="font-size:20px"></i></div><div class="min-w-0"><h6>${esc(e.title)} berlangsung hari ini</h6><div class="meta">${num(EV.attendees(e.id).filter(a => a.in).length)} / ${num(EV.attendees(e.id).length)} peserta check-in · buka check-in</div></div></a>`).join('')}
        ${pending.length ? `<a class="list-row px-4" href="${ROUTES.admin.orders}?st=pending"><div class="num"><i class="bi bi-hourglass-split" style="font-size:20px"></i></div><div class="min-w-0"><h6>${pending.length} pesanan menunggu pembayaran</h6><div class="meta">Konfirmasi transfer manual atau batalkan</div></div></a>` : ''}
        ${low.slice(0, 3).map(x => `<a class="list-row px-4" href="${ROUTES.admin.events}?edit=${x.e.id}"><div class="num"><i class="bi bi-exclamation-diamond" style="font-size:20px"></i></div><div class="min-w-0"><h6>${esc(x.t.name)} hampir habis</h6><div class="meta">${esc(x.e.title)} · sisa ${x.left} dari ${x.t.quota}</div></div></a>`).join('')}
        ${drafts.map(e => `<a class="list-row px-4" href="${ROUTES.admin.events}?edit=${e.id}"><div class="num"><i class="bi bi-pencil-square" style="font-size:20px"></i></div><div class="min-w-0"><h6>${esc(e.title)} masih draft</h6><div class="meta">Lengkapi dan publikasikan</div></div></a>`).join('')}
      </div>
    </div></div>
  </div>
  <div class="row g-3 mb-3">
    <div class="col-xl-7"><div class="panel"><div class="panel-hd"><div><h5>Penjualan per Event</h5><div class="sub">Tiket terjual dari total kuota, event aktif</div></div><a class="link-more" href="${ROUTES.admin.events}">Kelola</a></div>
      <div class="panel-bd">${hbars(active.map(e => { const s = EV.sold(e), c = EV.capacity(e); return {label:e.title, v:s / c * 100, vl:`${num(s)} / ${num(c)} · ${Math.round(s / c * 100)}%`, tip:`<b>${esc(e.title)}</b><br>${num(s)} dari ${num(c)} tiket · ${rp(EV.revenue(e))}`}; }), v => Math.round(v) + '%')}</div></div></div>
    <div class="col-xl-5"><div class="panel"><div class="panel-hd"><div><h5>Metode Pembayaran</h5><div class="sub">Jumlah pesanan lunas berbayar</div></div></div>
      <div class="panel-bd">${hbars(Object.entries(pays).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({label:k, v})), v => num(v) + ' pesanan')}</div></div></div>
  </div>
  <div class="panel"><div class="panel-hd"><h5>Transaksi Terbaru</h5><a class="link-more" href="${ROUTES.admin.orders}">Semua Transaksi</a></div>
    <div class="tbl-wrap">${orderTable(EV.orders().slice(0, 8))}</div></div>`;
  drawRev();
}
function drawRev(){
  const data = revSeries(revRange);
  $$('#app .seg button').forEach(b => b.classList.toggle('on', b.textContent === `${revRange} hari`));
  const total = data.reduce((n, d) => n + d.v, 0), best = data.reduce((a, d) => d.v > a.v ? d : a, data[0]);
  $('#revSum').innerHTML = `<div><div class="lbl-sm m-0" style="font-size:10px; color:var(--muted)">Total ${revRange} hari</div><div class="serif fw-semibold" style="font-size:26px">${rp(total)}</div></div>
    <div><div class="lbl-sm m-0" style="font-size:10px; color:var(--muted)">Rata-rata / hari</div><div class="serif fw-semibold" style="font-size:26px">${rp(total / revRange)}</div></div>
    <div class="d-none d-md-block"><div class="lbl-sm m-0" style="font-size:10px; color:var(--muted)">Hari tertinggi</div><div class="serif fw-semibold" style="font-size:26px">${best.label}</div></div>`;
  $('#revToggle').innerHTML = revTable ? '<i class="bi bi-bar-chart me-1"></i>Grafik' : '<i class="bi bi-table me-1"></i>Tabel';
  if(revTable) $('#revChart').innerHTML = `<div style="max-height:250px; overflow:auto"><table class="tbl"><thead><tr><th>Tanggal</th><th class="num">Pesanan</th><th class="num">Pendapatan</th></tr></thead><tbody>${[...data].reverse().map(d => `<tr><td>${d.label}</td><td class="num">${d.n}</td><td class="num">${rp(d.v)}</td></tr>`).join('')}</tbody></table></div>`;
  else colChart($('#revChart'), data);
}
addEventListener('resize', () => { if(PAGE === 'dash' && !revTable) drawRev(); });

/* ══════════════════════════════════════════════════════════════════
   EVENTS — daftar, buat, edit, duplikat, hapus
════════════════════════════════════════════════════════════════════ */
const evf = {tab:'all', q:''};
const EV_TABS = [['all','Semua'], ['upcoming','Mendatang'], ['live','Berlangsung'], ['draft','Draft'], ['ended','Selesai']];
const inTab = (e, t) => t === 'all' || (t === 'draft' ? e.status === 'draft' : e.status === 'published' && EV.phase(e) === t);
function pageEvents(){
  $('#app').innerHTML = `
  <div class="adm-tools">
    <div class="grow position-relative" style="max-width:360px"><i class="bi bi-search position-absolute text-muted" style="left:12px; top:11px"></i><input class="form-control ps-5 w-100" placeholder="Cari event…" value="${esc(evf.q)}" oninput="evf.q=this.value; drawEvList()"></div>
    <div class="ms-auto d-flex gap-2"><a class="btn btn-line btn-sm-x" href="${ROUTES.events}" target="_blank"><i class="bi bi-box-arrow-up-right me-2"></i>Lihat di Situs</a><button class="btn btn-ink btn-sm-x" onclick="openEditor()"><i class="bi bi-plus-lg me-2"></i>Buat Event</button></div>
  </div>
  <div class="tabs-x" id="evTabs"></div>
  <div class="panel"><div class="tbl-wrap" id="evList"></div></div>`;
  drawEvList();
  if(qp.get('new')) openEditor();
  if(qp.get('edit')) openEditor(qp.get('edit'));
}
function drawEvList(){
  const all = EV.events();
  $('#evTabs').innerHTML = EV_TABS.map(([k, l]) => `<button class="${evf.tab === k ? 'on' : ''}" onclick="evf.tab='${k}'; drawEvList()">${l}<span class="n">${all.filter(e => inTab(e, k)).length}</span></button>`).join('');
  const q = evf.q.toLowerCase();
  const list = all.filter(e => inTab(e, evf.tab) && (!q || (e.title + e.city + e.cat).toLowerCase().includes(q))).sort((a, b) => b.start.localeCompare(a.start));
  $('#evList').innerHTML = list.length ? `<table class="tbl"><thead><tr><th>Event</th><th>Tanggal</th><th>Status</th><th>Terjual</th><th class="num">Pendapatan</th><th></th></tr></thead><tbody>
    ${list.map(e => { const s = EV.sold(e), c = EV.capacity(e); return `<tr class="click" onclick="openEditor('${e.id}')">
      <td><div class="d-flex gap-3 align-items-center"><div class="thumb">${thumb(e.img, e.title)}</div><div class="min-w-0"><div class="t-title">${esc(e.title)}${e.featured ? ' <i class="bi bi-star-fill text-gold" style="font-size:12px" title="Unggulan"></i>' : ''}</div><div class="meta">${esc(e.cat)} · ${esc(e.venue)}, ${esc(e.city)}</div></div></div></td>
      <td class="text-nowrap">${evDateLabel(e, false)}<div class="meta">${esc(e.time)}</div></td>
      <td>${stEvent(e)}</td>
      <td><div class="mono">${num(s)} / ${num(c)}</div><div class="bar-sm mt-1"><div style="width:${Math.min(100, s / c * 100)}%"></div></div></td>
      <td class="num">${rp(EV.revenue(e))}</td>
      <td class="text-end" onclick="event.stopPropagation()"><div class="dropdown"><button class="icon-btn" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></button><ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="javascript:void(0)" onclick="openEditor('${e.id}')"><i class="bi bi-pencil me-2"></i>Edit</a></li>
        <li><a class="dropdown-item" href="${ROUTES.admin.attendees}?ev=${e.id}"><i class="bi bi-people me-2"></i>Peserta & Check-in</a></li>
        <li><a class="dropdown-item" href="${ROUTES.admin.orders}?ev=${e.id}"><i class="bi bi-receipt me-2"></i>Transaksi</a></li>
        <li><a class="dropdown-item" href="${e.status === 'published' ? `${ROUTES.event}?id=${e.id}` : 'javascript:void(0)'}" ${e.status === 'published' ? 'target="_blank"' : `onclick="toast('Event draft belum tampil di situs')"`}><i class="bi bi-box-arrow-up-right me-2"></i>Lihat di Situs</a></li>
        <li><a class="dropdown-item" href="javascript:void(0)" onclick="dupEvent('${e.id}')"><i class="bi bi-copy me-2"></i>Duplikat</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" style="color:var(--bad)" href="javascript:void(0)" onclick="delEvent('${e.id}')"><i class="bi bi-trash me-2"></i>Hapus</a></li>
      </ul></div></td></tr>`; }).join('')}</tbody></table>`
    : `<div class="empty"><i class="bi bi-calendar-x"></i>Tidak ada event.</div>`;
}
async function dupEvent(id){
  try{ EV.putEvent(await api('POST', adminApi(`/events/${id}/duplicate`))); drawEvList(); toast('Event diduplikat sebagai draft'); }
  catch(err){ toast(err.message); }
}
async function draftEvent(id){
  try{ EV.putEvent(await api('PATCH', adminApi(`/events/${id}/status`), {status:'draft'})); closeModal(); drawEvList(); toast('Event dijadikan draft'); }
  catch(err){ toast(err.message); }
}
function delEvent(id){
  const e = EV.event(id), n = EV.orders(id).length;
  if(n) return modal(`<div class="p-4 p-lg-5"><h4 class="serif fw-semibold" style="font-size:28px">Event tidak bisa dihapus</h4>
    <p class="text-muted" style="font-weight:300"><b style="color:var(--ink)">${esc(e.title)}</b> sudah memiliki ${num(n)} transaksi. Untuk menjaga riwayat keuangan, ubah statusnya menjadi <b style="color:var(--ink)">Draft</b> agar tidak tampil di situs.</p>
    <div class="d-flex gap-2 justify-content-end"><button class="btn btn-line" data-bs-dismiss="modal">Tutup</button>${e.status === 'published' ? `<button class="btn btn-ink" onclick="draftEvent('${id}')">Jadikan Draft</button>` : ''}</div></div>`);
  confirmBox('Hapus event?', `<b style="color:var(--ink)">${esc(e.title)}</b> akan dihapus permanen.`, 'Hapus', async () => {
    try{ await api('DELETE', adminApi(`/events/${id}`)); EV.load().events = EV.events().filter(x => x.id !== id); drawEvList(); toast('Event dihapus'); }
    catch(err){ toast(err.message); }
  }, true);
}

/* Editor event */
let ed = null, edTab = 'info';
const ED_TABS = [['info','Detail'], ['when','Jadwal & Lokasi'], ['tickets','Tiket'], ['program','Rundown & Pembicara'], ['publish','Publikasi']];
function openEditor(id){
  const src = id && EV.event(id);
  ed = src ? JSON.parse(JSON.stringify(src)) : {id:'', title:'', cat:EV_CATS[0], excerpt:'', desc:'', img:'wastra', start:EV.today(), end:EV.today(), start_time:'10:00', end_time:'17:00', venue:'', city:'Jakarta', address:'', status:'draft', featured:false,
    rundown:[['10.00', 'Pembukaan', '']], speakers:[], tickets:[{id:'', name:'Reguler', price:100000, quota:100, saleEnd:'', desc:''}]};
  ed._new = !src; edTab = 'info';
  modal(`<div class="d-flex justify-content-between align-items-start px-4 px-lg-5 pt-4 pb-0"><div><div class="eyebrow">${ed._new ? 'Event Baru' : 'Edit Event'}</div><h3 class="serif fw-semibold mt-1 mb-0" style="font-size:30px" id="edTitle">${esc(ed.title || 'Tanpa judul')}</h3></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="px-4 px-lg-5"><div class="nav-tabs-x mt-3" id="edTabs"></div></div>
    <div class="px-4 px-lg-5 py-4" id="edBody" style="min-height:360px"></div>
    <div class="d-flex justify-content-between align-items-center gap-2 px-4 px-lg-5 py-3 border-top" style="background:var(--ivory-2)">
      <span class="meta">${ed._new ? 'Event baru disimpan sebagai draft hingga dipublikasikan.' : `Dibuat ${dt(ed.created || EV.today(), false)} · ${num(EV.orders(ed.id).length)} transaksi`}</span>
      <div class="d-flex gap-2"><button class="btn btn-line btn-sm-x" data-bs-dismiss="modal">Batal</button><button class="btn btn-ink btn-sm-x" onclick="saveEvent()"><i class="bi bi-check2 me-2"></i>Simpan</button></div>
    </div>`, 'modal-xl');
  drawEditor();
}
function edTabGo(t){ collectEd(); edTab = t; drawEditor(); }
function drawEditor(){
  $('#edTabs').innerHTML = ED_TABS.map(([k, l]) => `<button class="${edTab === k ? 'on' : ''}" onclick="edTabGo('${k}')">${l}</button>`).join('');
  const f = (label, html, col = 'col-12') => `<div class="${col}"><label class="meta mb-1">${label}</label>${html}</div>`;
  const inp = (k, attrs = '') => `<input class="form-control" data-k="${k}" value="${esc(ed[k])}" ${attrs}>`;
  let h = '';
  if(edTab === 'info') h = `<div class="row g-3">
    ${f('Judul Event *', inp('title', 'oninput="$(\'#edTitle\').textContent=this.value||\'Tanpa judul\'"'), 'col-md-8')}
    ${f('Kategori', `<select class="form-select" data-k="cat">${EV_CATS.map(c => `<option ${c === ed.cat ? 'selected' : ''}>${c}</option>`).join('')}</select>`, 'col-md-4')}
    ${f('Ringkasan (tampil di kartu event)', `<textarea class="form-control" rows="2" data-k="excerpt" maxlength="180">${esc(ed.excerpt)}</textarea>`)}
    ${f('Deskripsi Lengkap', `<textarea class="form-control" rows="5" data-k="desc">${esc(ed.desc)}</textarea>`)}
    ${f('Banner Event', `<div class="img-pick">${Object.keys(EV_IMG).map(k => `<label><input type="radio" name="edImg" value="${k}" ${ed.img === k ? 'checked' : ''}>${thumb(k)}</label>`).join('')}</div>
      <div class="meta mt-2"><i class="bi bi-cloud-arrow-up me-1"></i>Di sistem produksi, banner diunggah langsung (rasio 16:9, min. 1600px).</div>`)}
  </div>`;
  if(edTab === 'when') h = `<div class="row g-3">
    ${f('Tanggal Mulai *', `<input type="date" class="form-control" data-k="start" value="${ed.start}">`, 'col-md-4')}
    ${f('Tanggal Selesai *', `<input type="date" class="form-control" data-k="end" value="${ed.end}">`, 'col-md-4')}
    ${f('Jam Mulai', `<input type="time" class="form-control" data-k="start_time" value="${ed.start_time || ''}">`, 'col-md-2')}
    ${f('Jam Selesai', `<input type="time" class="form-control" data-k="end_time" value="${ed.end_time || ''}">`, 'col-md-2')}
    ${f('Nama Venue *', inp('venue'), 'col-md-8')}
    ${f('Kota', inp('city'), 'col-md-4')}
    ${f('Alamat Lengkap', `<textarea class="form-control" rows="2" data-k="address">${esc(ed.address)}</textarea>`)}
  </div>`;
  if(edTab === 'tickets') h = `<div class="d-flex justify-content-between align-items-center mb-3"><div><b style="font-weight:500">Jenis Tiket</b><div class="meta">Harga 0 = tiket gratis (registrasi). Tiket yang sudah terjual tidak bisa dihapus.</div></div><button class="btn btn-line btn-sm-x" onclick="collectEd(); ed.tickets.push({id:'', name:'', price:0, quota:50, saleEnd:'', desc:''}); drawEditor()"><i class="bi bi-plus-lg me-1"></i>Tambah Tiket</button></div>
    ${ed.tickets.map((t, i) => { const sold = ed._new || !t.id ? 0 : EV.sold(EV.event(ed.id) || ed, t.id); return `<div class="ed-row" style="grid-template-columns:2fr 1.2fr .9fr 1.2fr auto">
      <div><label>Nama tiket *</label><input class="form-control" data-t="${i}" data-f="name" value="${esc(t.name)}"></div>
      <div><label>Harga (Rp)</label><input type="number" min="0" step="1000" class="form-control" data-t="${i}" data-f="price" value="${t.price}"></div>
      <div><label>Kuota${sold ? ` · ${sold} terjual` : ''}</label><input type="number" min="${Math.max(1, sold)}" class="form-control" data-t="${i}" data-f="quota" value="${t.quota}"></div>
      <div><label>Akhir penjualan</label><input type="date" class="form-control" data-t="${i}" data-f="saleEnd" value="${t.saleEnd || ''}"></div>
      <button class="icon-btn mb-1" ${sold ? 'disabled title="Sudah ada penjualan"' : ''} onclick="collectEd(); ed.tickets.splice(${i},1); drawEditor()"><i class="bi bi-trash"></i></button>
      <div style="grid-column:1/-1"><label>Keterangan</label><input class="form-control" data-t="${i}" data-f="desc" value="${esc(t.desc)}" placeholder="Fasilitas yang didapat"></div>
    </div>`; }).join('')}`;
  if(edTab === 'program') h = `<div class="row g-4"><div class="col-lg-7">
      <div class="d-flex justify-content-between align-items-center mb-2"><b style="font-weight:500">Rundown</b><button class="btn btn-line btn-sm-x" onclick="collectEd(); ed.rundown.push(['','','']); drawEditor()"><i class="bi bi-plus-lg me-1"></i>Sesi</button></div>
      ${ed.rundown.map((r, i) => `<div class="ed-row" style="grid-template-columns:90px 1fr auto"><div><label>Jam</label><input class="form-control" data-r="${i}" data-f="0" value="${esc(r[0])}"></div><div><label>Sesi</label><input class="form-control" data-r="${i}" data-f="1" value="${esc(r[1])}"></div>
        <button class="icon-btn mb-1" onclick="collectEd(); ed.rundown.splice(${i},1); drawEditor()"><i class="bi bi-trash"></i></button><div style="grid-column:1/-1"><input class="form-control" data-r="${i}" data-f="2" value="${esc(r[2])}" placeholder="Keterangan (opsional)"></div></div>`).join('')}
    </div><div class="col-lg-5">
      <div class="d-flex justify-content-between align-items-center mb-2"><b style="font-weight:500">Pembicara & Pengisi</b><button class="btn btn-line btn-sm-x" onclick="collectEd(); ed.speakers.push({name:'', role:''}); drawEditor()"><i class="bi bi-plus-lg me-1"></i>Tambah</button></div>
      ${ed.speakers.map((s, i) => `<div class="ed-row" style="grid-template-columns:1fr auto"><div><label>Nama</label><input class="form-control" data-s="${i}" data-f="name" value="${esc(s.name)}"></div><button class="icon-btn mb-1" onclick="collectEd(); ed.speakers.splice(${i},1); drawEditor()"><i class="bi bi-trash"></i></button>
        <div><label>Peran</label><input class="form-control" data-s="${i}" data-f="role" value="${esc(s.role)}"></div><div></div></div>`).join('') || '<div class="meta">Belum ada pembicara.</div>'}
    </div></div>`;
  if(edTab === 'publish') h = `<div class="row g-4"><div class="col-lg-6">
      <div class="sec-lbl mt-0">Status</div>
      ${[['published','Dipublikasikan','Tampil di halaman Events dan bisa dibeli.'], ['draft','Draft','Hanya terlihat di dashboard.']].map(([v, l, d]) => `<label class="pay-opt"><input type="radio" name="edSt" value="${v}" ${ed.status === v ? 'checked' : ''}><div><b style="font-weight:500">${l}</b><div class="meta">${d}</div></div></label>`).join('')}
      <div class="form-check form-switch mt-4"><input class="form-check-input" type="checkbox" id="edFeat" ${ed.featured ? 'checked' : ''}><label class="form-check-label" for="edFeat">Jadikan <b style="font-weight:500">event unggulan</b> (banner di Home & halaman Events)</label></div>
    </div><div class="col-lg-6">
      <div class="sec-lbl mt-0">Pratinjau Kartu</div>
      <div style="max-width:320px">${thumb(ed.img)}<div class="pt-3"><span class="tag-pill">${esc(ed.cat)}</span><div class="t-title mt-1" style="font-size:22px">${esc(ed.title || 'Tanpa judul')}</div><div class="meta mt-1">${ed.start ? evDateLabel(ed, false) : ''} · ${esc(ed.venue || 'Venue')}</div><div class="price mt-2">${ed.tickets.length ? (Math.min(...ed.tickets.map(t => +t.price)) ? 'Mulai ' + rp(Math.min(...ed.tickets.map(t => +t.price))) : 'Gratis') : '—'}</div></div></div>
    </div></div>`;
  $('#edBody').innerHTML = h;
}
function collectEd(){
  $$('#edBody [data-k]').forEach(i => { ed[i.dataset.k] = i.value; });
  const img = $('#edBody [name=edImg]:checked'); if(img) ed.img = img.value;
  $$('#edBody [data-t]').forEach(i => { const t = ed.tickets[i.dataset.t]; t[i.dataset.f] = i.type === 'number' ? +i.value : i.value; });
  $$('#edBody [data-r]').forEach(i => { ed.rundown[i.dataset.r][+i.dataset.f] = i.value; });
  $$('#edBody [data-s]').forEach(i => { ed.speakers[i.dataset.s][i.dataset.f] = i.value; });
  const st = $('#edBody [name=edSt]:checked'); if(st) ed.status = st.value;
  if($('#edFeat')) ed.featured = $('#edFeat').checked;
}
async function saveEvent(){
  collectEd();
  const err = !ed.title.trim() ? ['info', 'Judul event wajib diisi'] : !ed.start || !ed.end ? ['when', 'Tanggal wajib diisi'] : ed.end < ed.start ? ['when', 'Tanggal selesai tidak boleh sebelum tanggal mulai']
    : !ed.venue.trim() ? ['when', 'Nama venue wajib diisi'] : !ed.tickets.length ? ['tickets', 'Minimal satu jenis tiket'] : ed.tickets.some(t => !t.name.trim() || !(t.quota > 0)) ? ['tickets', 'Nama & kuota setiap tiket wajib diisi'] : null;
  if(err){ edTab = err[0]; drawEditor(); return toast(err[1]); }
  ed.speakers = ed.speakers.filter(s => s.name.trim());
  ed.rundown = ed.rundown.filter(r => r[1].trim());
  const isNew = ed._new, {_new, ...payload} = ed;
  try{
    const saved = await api(isNew ? 'POST' : 'PUT', adminApi(isNew ? '/events' : `/events/${ed.id}`), payload);
    if(saved.featured) EV.events().forEach(e => { if(e.id !== saved.id) e.featured = false; });
    EV.putEvent(saved); closeModal(); drawEvList();
    toast(isNew ? `Event "${saved.title}" dibuat${saved.status === 'published' ? ' & dipublikasikan' : ' sebagai draft'}` : 'Perubahan event disimpan');
  }catch(err){ toast(err.message); }
}

/* ══════════════════════════════════════════════════════════════════
   TRANSAKSI — daftar, detail, transaksi manual, refund
════════════════════════════════════════════════════════════════════ */
const of = {q:qp.get('q') || '', ev:qp.get('ev') || '', st:qp.get('st') || '', pay:'', range:'all', page:1};
function orderTable(list){
  return list.length ? `<table class="tbl"><thead><tr><th>Invoice</th><th>Tanggal</th><th>Pembeli</th><th>Event</th><th class="num">Tiket</th><th class="num">Total</th><th>Pembayaran</th><th>Status</th></tr></thead><tbody>
    ${list.map(o => `<tr class="click" onclick="openOrder('${o.id}')"><td class="mono">${o.id}${o.src === 'admin' ? ' <i class="bi bi-shop text-gold" title="Transaksi manual"></i>' : ''}</td><td class="text-nowrap meta">${dt(o.at)}</td>
      <td><div>${esc(o.name)}</div><div class="meta">${esc(o.email || o.phone)}</div></td><td style="max-width:220px"><div class="text-truncate">${esc(evName(o.ev))}</div></td>
      <td class="num">${o.att.length}</td><td class="num">${o.total ? rp(o.total) : 'Gratis'}</td><td class="text-nowrap">${esc(o.pay)}</td><td>${stOrder(o.status)}</td></tr>`).join('')}</tbody></table>`
    : `<div class="empty"><i class="bi bi-receipt"></i>Tidak ada transaksi yang cocok.</div>`;
}
function filteredOrders(){
  const q = of.q.toLowerCase(), from = of.range === 'all' ? 0 : Date.now() - of.range * 864e5;
  return EV.orders().filter(o => (!of.ev || o.ev === of.ev) && (!of.st || o.status === of.st) && (!of.pay || o.pay === of.pay) && new Date(o.at) >= from
    && (!q || (o.id + ' ' + o.name + ' ' + o.email + ' ' + o.phone + ' ' + o.att.map(a => a.c + ' ' + a.n).join(' ')).toLowerCase().includes(q)));
}
function pageOrders(){
  const pays = [...new Set(EV.orders().map(o => o.pay))].sort();
  $('#app').innerHTML = `
  <div class="row g-3 mb-3" id="oKpi"></div>
  <div class="adm-tools">
    <div class="grow position-relative"><i class="bi bi-search position-absolute text-muted" style="left:12px; top:11px"></i><input class="form-control ps-5 w-100" id="oq" placeholder="Invoice, nama, email, atau kode tiket…" value="${esc(of.q)}" oninput="of.q=this.value; of.page=1; drawOrders()"></div>
    <select class="form-select" onchange="of.ev=this.value; of.page=1; drawOrders()"><option value="">Semua event</option>${EV.events().map(e => `<option value="${e.id}" ${of.ev === e.id ? 'selected' : ''}>${esc(e.title)}</option>`).join('')}</select>
    <select class="form-select" onchange="of.st=this.value; of.page=1; drawOrders()"><option value="">Semua status</option>${Object.entries(ORDER_ST).map(([k, [l]]) => `<option value="${k}" ${of.st === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    <select class="form-select" onchange="of.pay=this.value; of.page=1; drawOrders()"><option value="">Semua metode</option>${pays.map(p => `<option>${esc(p)}</option>`).join('')}</select>
    <select class="form-select" onchange="of.range=this.value==='all'?'all':+this.value; of.page=1; drawOrders()"><option value="all">Semua waktu</option><option value="7">7 hari</option><option value="30">30 hari</option><option value="90">90 hari</option></select>
    <button class="btn btn-line btn-sm-x" onclick="exportOrders()"><i class="bi bi-download me-2"></i>CSV</button>
    <button class="btn btn-ink btn-sm-x" onclick="openManual()"><i class="bi bi-plus-lg me-2"></i>Transaksi Baru</button>
  </div>
  <div class="panel"><div class="tbl-wrap" id="oList"></div><div id="oPager"></div></div>`;
  drawOrders();
  if(qp.get('new')) openManual();
  if(qp.get('id') && EV.order(qp.get('id'))) openOrder(qp.get('id'));
}
function drawOrders(){
  const list = filteredOrders(), size = 15, paid = list.filter(o => o.status === 'paid');
  const k = (lbl, val, sub, ic) => `<div class="col-6 col-xl-3"><div class="kpi"><i class="bi ${ic} ic"></i><div class="lbl">${lbl}</div><div class="val" style="font-size:30px">${val}</div><span class="delta">${sub}</span></div></div>`;
  $('#oKpi').innerHTML = k('Transaksi', num(list.length), 'sesuai filter', 'bi-receipt') + k('Nilai Lunas', rpShort(paid.reduce((n, o) => n + o.total, 0)), `${num(paid.length)} pesanan lunas`, 'bi-cash-stack')
    + k('Menunggu', num(list.filter(o => o.status === 'pending').length), 'belum dibayar', 'bi-hourglass-split') + k('Batal / Refund', num(list.filter(o => o.status === 'cancelled' || o.status === 'refunded').length), rp(list.filter(o => o.status === 'refunded').reduce((n, o) => n + o.total, 0)) + ' direfund', 'bi-arrow-counterclockwise');
  of.page = Math.min(of.page, Math.max(1, Math.ceil(list.length / size)));
  $('#oList').innerHTML = orderTable(list.slice((of.page - 1) * size, of.page * size));
  $('#oPager').innerHTML = list.length ? pager(list.length, of.page, size, 'oPage') : '';
}
function oPage(n){ of.page = n; drawOrders(); $('#oList').scrollIntoView({block:'nearest'}); }
function exportOrders(){
  csv([['Invoice','Tanggal','Status','Event','Pembeli','Email','Telepon','Tiket','Jumlah','Promo','Diskon','Biaya Layanan','Total','Pembayaran'],
    ...filteredOrders().map(o => { const e = EV.event(o.ev); return [o.id, o.at, ORDER_ST[o.status][0], evName(o.ev), o.name, o.email, o.phone, o.items.map(i => `${tkName(e, i.t)} x${i.qty}`).join('; '), o.att.length, o.promo, o.disc, o.fee, o.total, o.pay]; })],
    `transaksi-modest-${EV.today()}.csv`);
}

function openOrder(id){
  const o = EV.order(id), e = EV.event(o.ev);
  const sub = o.items.reduce((n, i) => n + i.price * i.qty, 0);
  const tl = [[o.at, `Pesanan dibuat${o.src === 'admin' ? ' oleh admin (on-site)' : ' via situs'}`], o.paidAt && [o.paidAt, `Pembayaran diterima · ${o.pay}`], o.cancelledAt && [o.cancelledAt, 'Pesanan dibatalkan'],
    o.refundedAt && [o.refundedAt, `Refund diproses${o.note ? ` — ${o.note}` : ''}`], ...o.att.filter(a => a.in).slice(0, 3).map(a => [a.in, `Check-in: ${a.n}`])].filter(Boolean).sort((a, b) => a[0].localeCompare(b[0]));
  $('#ocBody').innerHTML = `
    <div class="d-flex justify-content-between align-items-start"><div><div class="eyebrow">Transaksi</div><h4 class="serif fw-semibold mt-1 mb-1" style="font-size:28px">${o.id}</h4><div class="meta">${dt(o.at)}</div></div>${stOrder(o.status)}</div>
    <div class="sec-lbl">Pembeli</div>
    <dl class="kv"><dt>Nama</dt><dd>${esc(o.name)}</dd><dt>Email</dt><dd>${esc(o.email || '—')}</dd><dt>Telepon</dt><dd>${esc(o.phone || '—')}</dd></dl>
    <div class="sec-lbl">Event</div>
    <div class="d-flex gap-3 align-items-center"><div style="width:72px">${thumb(e?.img, e?.title)}</div><div><div class="t-title">${esc(evName(o.ev))}</div><div class="meta">${e ? `${evDateLabel(e, false)} · ${esc(e.venue)}` : ''}</div></div></div>
    <div class="sec-lbl">Rincian Pembayaran</div>
    <table class="tbl"><tbody>${o.items.map(i => `<tr><td class="px-0">${esc(tkName(e, i.t))} × ${i.qty}</td><td class="num px-0">${rp(i.price * i.qty)}</td></tr>`).join('')}
      ${o.disc ? `<tr><td class="px-0 meta">Promo ${esc(o.promo)}</td><td class="num px-0 meta">-${rp(o.disc)}</td></tr>` : ''}
      ${o.fee ? `<tr><td class="px-0 meta">Biaya layanan</td><td class="num px-0 meta">${rp(o.fee)}</td></tr>` : ''}
      <tr><td class="px-0"><b style="font-weight:500">Total</b> <span class="meta">· ${esc(o.pay)}</span></td><td class="num px-0"><b style="font-weight:500">${rp(o.total)}</b></td></tr></tbody></table>
    <div class="sec-lbl">Peserta (${o.att.length})</div>
    ${o.att.map((a, i) => `<div class="d-flex justify-content-between align-items-center py-2 border-bottom" style="border-color:var(--line-2)!important"><div><div>${esc(a.n)}</div><div class="meta mono">${a.c} · ${esc(tkName(e, a.t))}</div></div>
      ${o.status === 'paid' ? (a.in ? `<span class="st good"><i class="bi bi-check2"></i>${dt(a.in).split(', ')[1]}</span>` : `<button class="btn btn-line" style="padding:5px 12px; font-size:11px" onclick="checkIn('${o.id}',${i}); openOrder('${o.id}')">Check-in</button>`) : '<span class="meta">—</span>'}</div>`).join('')}
    <div class="sec-lbl">Riwayat</div>
    <ul class="timeline">${tl.map(([t, l]) => `<li><div>${esc(l)}</div><div class="meta">${dt(t)}</div></li>`).join('')}</ul>
    <div class="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
      ${o.status === 'pending' ? `<button class="btn btn-ink btn-sm-x" onclick="orderAct('${o.id}','paid')"><i class="bi bi-check2 me-2"></i>Konfirmasi Pembayaran</button><button class="btn btn-line btn-sm-x" onclick="orderAct('${o.id}','cancelled')">Batalkan</button>` : ''}
      ${o.status === 'paid' ? `<button class="btn btn-ink btn-sm-x" onclick="adminTickets('${o.id}')"><i class="bi bi-ticket-perforated me-2"></i>E-Tiket</button><button class="btn btn-line btn-sm-x" onclick="toast('E-tiket dikirim ulang ke ${esc(o.email || o.phone)}')">Kirim Ulang</button>${o.total ? `<button class="btn btn-line btn-sm-x" onclick="orderAct('${o.id}','refunded')">Refund</button>` : ''}` : ''}
      <button class="btn btn-line btn-sm-x" onclick="printInvoice('${o.id}')"><i class="bi bi-printer me-2"></i>Invoice</button>
    </div>`;
  bootstrap.Offcanvas.getOrCreateInstance('#oc').show();
}
function orderAct(id, st){
  const o = EV.order(id);
  const done = async (note = '') => {
    try{ EV.putOrder(await api('PATCH', adminApi(`/orders/${id}/status`), {status:st, note})); }
    catch(err){ return toast(err.message); }
    openOrder(id); refresh(); updateBadge();
    toast({paid:'Pembayaran dikonfirmasi — e-tiket dikirim ke pembeli', cancelled:'Pesanan dibatalkan, kuota tiket dikembalikan', refunded:'Refund diproses'}[st]); };
  if(st === 'paid') return done();
  if(st === 'cancelled') return confirmBox('Batalkan pesanan?', `Pesanan <b style="color:var(--ink)">${o.id}</b> atas nama ${esc(o.name)} akan dibatalkan dan kuota tiket dikembalikan.`, 'Batalkan Pesanan', () => done(), true);
  modal(`<div class="p-4 p-lg-5"><h4 class="serif fw-semibold" style="font-size:28px">Proses refund</h4>
    <p class="text-muted" style="font-weight:300">Dana <b style="color:var(--ink)">${rp(o.total)}</b> dikembalikan ke ${esc(o.name)} via ${esc(o.pay)}. Tiket menjadi tidak berlaku.</p>
    <label class="meta mb-1">Alasan refund</label><select class="form-select mb-3" id="rfWhy"><option>Permintaan pembeli</option><option>Event dijadwalkan ulang</option><option>Pembayaran ganda</option><option>Lainnya</option></select>
    <div class="d-flex gap-2 justify-content-end"><button class="btn btn-line" data-bs-dismiss="modal">Batal</button><button class="btn btn-ink" style="background:var(--bad); border-color:var(--bad)" onclick="const w=$('#rfWhy').value; closeModal(); window._rf(w)">Proses Refund</button></div></div>`);
  window._rf = done;
}
function adminTickets(id){
  const o = EV.order(id), e = EV.event(o.ev);
  modal(`<div class="p-4 p-lg-5"><div class="d-flex justify-content-between"><div><div class="eyebrow">${o.id}</div><h4 class="serif fw-semibold mt-1" style="font-size:28px">E-Tiket</h4></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
    ${o.att.map(a => `<div class="eticket"><div class="body"><div class="eyebrow" style="font-size:10px">${esc(tkName(e, a.t))}</div><div class="t-title" style="font-size:22px">${esc(evName(o.ev))}</div>
      <div class="meta mt-1">${e ? `${evDateLabel(e)} · ${esc(e.venue)}` : ''}</div><div class="mt-2"><span class="meta">Peserta</span><div style="font-weight:500">${esc(a.n)}</div></div></div>
      <div class="stub">${qrSvg(a.c, 104)}<div class="code">${a.c}</div></div></div>`).join('')}
    <button class="btn btn-ink mt-2" onclick="window.print()"><i class="bi bi-printer me-2"></i>Cetak</button></div>`, 'modal-lg');
}
function printInvoice(id){
  const o = EV.order(id), e = EV.event(o.ev);
  modal(`<div class="p-4 p-lg-5"><div class="d-flex justify-content-between align-items-start"><div><span class="logo" style="font-size:30px">modest<span>.</span>id</span><div class="meta">Event Studio · Jakarta</div></div><div class="text-end"><div class="eyebrow">Invoice</div><div class="mono">${o.id}</div><div class="meta">${dt(o.at)}</div></div></div>
    <div class="row mt-4"><div class="col-6"><div class="sec-lbl mt-0">Ditagihkan kepada</div>${esc(o.name)}<div class="meta">${esc(o.email)}<br>${esc(o.phone)}</div></div><div class="col-6 text-end"><div class="sec-lbl mt-0">Status</div>${stOrder(o.status)}</div></div>
    <table class="tbl mt-4"><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Harga</th><th class="num">Jumlah</th></tr></thead><tbody>
      ${o.items.map(i => `<tr><td>${esc(evName(o.ev))} — ${esc(tkName(e, i.t))}</td><td class="num">${i.qty}</td><td class="num">${rp(i.price)}</td><td class="num">${rp(i.price * i.qty)}</td></tr>`).join('')}
      ${o.disc ? `<tr><td colspan="3" class="text-end meta">Promo ${esc(o.promo)}</td><td class="num">-${rp(o.disc)}</td></tr>` : ''}
      ${o.fee ? `<tr><td colspan="3" class="text-end meta">Biaya layanan</td><td class="num">${rp(o.fee)}</td></tr>` : ''}
      <tr><td colspan="3" class="text-end"><b style="font-weight:500">Total</b></td><td class="num"><b style="font-weight:500">${rp(o.total)}</b></td></tr></tbody></table>
    <div class="d-flex gap-2 justify-content-end mt-3"><button class="btn btn-line" data-bs-dismiss="modal">Tutup</button><button class="btn btn-ink" onclick="window.print()"><i class="bi bi-printer me-2"></i>Cetak</button></div></div>`, 'modal-lg');
}

/* Transaksi manual (penjualan on-site / komplimen) */
let mt = {ev:'', qty:{}};
function openManual(){
  const evs = EV.events().filter(e => e.status === 'published' && EV.phase(e) !== 'ended');
  mt = {ev:(qp.get('ev') && evs.find(e => e.id === qp.get('ev')) ? qp.get('ev') : (evs.find(e => EV.phase(e) === 'live') || evs[0]).id), qty:{}};
  modal(`<div class="d-flex justify-content-between align-items-start px-4 px-lg-5 pt-4"><div><div class="eyebrow">Transaksi Manual</div><h3 class="serif fw-semibold mt-1" style="font-size:30px">Penjualan On-site</h3><div class="meta">Untuk penjualan di lokasi, reseller, atau tiket komplimen.</div></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <form class="row g-0" onsubmit="submitManual(event)" id="mtForm">
      <div class="col-lg-7 px-4 px-lg-5 py-4">
        <label class="meta mb-1">Event</label><select class="form-select mb-3" onchange="mt.ev=this.value; mt.qty={}; drawManual()">${evs.map(e => `<option value="${e.id}" ${e.id === mt.ev ? 'selected' : ''}>${esc(e.title)} — ${evDateLabel(e, false)}</option>`).join('')}</select>
        <div id="mtTickets"></div>
        <div class="row g-3 mt-1">
          <div class="col-md-6"><label class="meta mb-1">Nama Pembeli *</label><input class="form-control" name="name" required></div>
          <div class="col-md-6"><label class="meta mb-1">No. WhatsApp</label><input class="form-control" name="phone" placeholder="08…"></div>
          <div class="col-12"><label class="meta mb-1">Email (untuk e-tiket)</label><input class="form-control" type="email" name="email"></div>
          <div class="col-12"><label class="f-check"><input type="checkbox" name="sameAll" checked>Gunakan nama pembeli untuk semua peserta</label></div>
        </div>
      </div>
      <div class="col-lg-5 px-4 px-lg-5 py-4" style="background:var(--ivory-2)">
        <label class="meta mb-1">Metode Pembayaran</label>
        <select class="form-select mb-3" name="pay" onchange="drawManualSum()">${['Tunai', 'EDC / Debit', 'QRIS', 'Transfer Bank', 'Komplimen'].map(p => `<option>${p}</option>`).join('')}</select>
        <label class="meta mb-1">Kode Promo</label><input class="form-control mb-3" name="promo" placeholder="Opsional" oninput="drawManualSum()">
        <label class="meta mb-1">Status</label>
        <select class="form-select mb-3" name="status"><option value="paid">Lunas — terbitkan e-tiket</option><option value="pending">Menunggu pembayaran</option></select>
        <div id="mtSum"></div>
        <button class="btn btn-ink w-100 mt-3" type="submit"><i class="bi bi-check2 me-2"></i>Simpan Transaksi</button>
      </div>
    </form>`, 'modal-xl');
  drawManual();
}
function drawManual(){
  const e = EV.event(mt.ev);
  $('#mtTickets').innerHTML = `<div class="sec-lbl mt-0">Tiket</div>${e.tickets.map(t => { const left = EV.left(e, t), q = mt.qty[t.id] || 0; return `<div class="tk"><div><b>${esc(t.name)}</b><div class="meta">${t.price ? rp(t.price) : 'Gratis'} · sisa ${left}</div></div>
    ${left ? `<div class="qty sm"><button type="button" onclick="mt.qty['${t.id}']=Math.max(0,${q}-1); drawManual()"><i class="bi bi-dash"></i></button><span>${q}</span><button type="button" ${q >= left ? 'disabled' : ''} onclick="mt.qty['${t.id}']=${q}+1; drawManual()"><i class="bi bi-plus"></i></button></div>` : '<span class="meta">Habis</span>'}</div>`; }).join('')}`;
  drawManualSum();
}
function manualPromo(){
  const f = $('#mtForm'); if(!f) return {};
  if(f.pay.value === 'Komplimen') return {promo:{code:'KOMPLIMEN', type:'pct', val:100}};
  return f.promo.value.trim() ? EV.checkPromo(f.promo.value, mt.ev) : {};
}
function drawManualSum(){
  const e = EV.event(mt.ev), items = e.tickets.filter(t => mt.qty[t.id]);
  const sub = items.reduce((n, t) => n + t.price * mt.qty[t.id], 0), p = manualPromo(), disc = EV.discount(p.promo, sub);
  $('#mtSum').innerHTML = `${items.map(t => `<div class="d-flex justify-content-between py-1"><span>${esc(t.name)} × ${mt.qty[t.id]}</span><span>${rp(t.price * mt.qty[t.id])}</span></div>`).join('') || '<div class="meta">Belum ada tiket dipilih.</div>'}
    ${p.err ? `<div class="meta" style="color:var(--bad)">${p.err}</div>` : disc ? `<div class="d-flex justify-content-between meta"><span>${p.promo.code}</span><span>-${rp(disc)}</span></div>` : ''}
    <div class="d-flex justify-content-between pt-2 mt-2 border-top"><b style="font-weight:500">Total</b><b class="price">${rp(sub - disc)}</b></div>`;
}
async function submitManual(ev){
  ev.preventDefault();
  const f = ev.target, e = EV.event(mt.ev), items = e.tickets.filter(t => mt.qty[t.id]).map(t => ({t:t.id, qty:mt.qty[t.id], price:+t.price}));
  if(!items.length) return toast('Pilih minimal satu tiket');
  const p = manualPromo(); if(p.err) return toast(p.err);
  const name = f.name.value.trim(), attendees = items.flatMap(i => Array.from({length:i.qty}, (_, k) => ({n:f.sameAll.checked || !k ? name : `${name} (${k + 1})`, t:i.t})));
  let o;
  try{ o = EV.putOrder(await api('POST', adminApi('/orders'), {ev:mt.ev, name, email:f.email.value, phone:f.phone.value, items:items.map(({t, qty}) => ({t, qty})), attendees,
    promo:f.pay.value === 'Komplimen' ? '' : f.promo.value.trim(), pay:f.pay.value, status:f.status.value})); }
  catch(err){ return toast(err.message); }
  closeModal(); refresh(); updateBadge(); toast(`Transaksi ${o.id} tersimpan`);
  if(PAGE === 'orders') setTimeout(() => openOrder(o.id), 350);
}

/* ══════════════════════════════════════════════════════════════════
   PESERTA & CHECK-IN
════════════════════════════════════════════════════════════════════ */
const af = {ev:'', q:'', st:'all', t:'', page:1};
let scans = [];
function defaultEvent(){
  const evs = EV.events().filter(e => e.status === 'published');
  return (evs.find(e => EV.phase(e) === 'live') || evs.filter(e => EV.phase(e) === 'upcoming').sort((a, b) => a.start.localeCompare(b.start))[0] || evs[0]).id;
}
function checkIn(orderId, idx, undo = false){
  const a = EV.order(orderId).att[idx], prev = a.in;
  a.in = undo ? null : new Date().toISOString();
  api(undo ? 'DELETE' : 'POST', adminApi(`/attendees/${encodeURIComponent(a.c)}/check-in`))
    .then(r => { a.in = r.in; })
    .catch(err => { a.in = prev; toast(err.message); refresh(); });
}
function pageAttendees(){
  af.ev = qp.get('ev') && EV.event(qp.get('ev')) ? qp.get('ev') : defaultEvent();
  $('#app').innerHTML = `
  <div class="d-flex flex-wrap gap-3 align-items-end mb-4">
    <div style="min-width:280px; flex:1; max-width:520px"><label class="meta mb-1">Event</label><select class="form-select" onchange="af.ev=this.value; af.t=''; af.page=1; drawAtt(true)">${EV.events().filter(e => e.status === 'published').sort((a, b) => b.start.localeCompare(a.start)).map(e => `<option value="${e.id}" ${e.id === af.ev ? 'selected' : ''}>${esc(e.title)} — ${evDateLabel(e, false)}${EV.phase(e) === 'live' ? ' (hari ini)' : ''}</option>`).join('')}</select></div>
    <div class="ms-auto d-flex gap-2"><button class="btn btn-line btn-sm-x" onclick="exportAtt()"><i class="bi bi-download me-2"></i>CSV</button><button class="btn btn-ink btn-sm-x" onclick="openScanner()"><i class="bi bi-qr-code-scan me-2"></i>Scan Tiket</button></div>
  </div>
  <div class="row g-3 mb-3" id="aKpi"></div>
  <div class="adm-tools">
    <div class="grow position-relative" style="max-width:380px"><i class="bi bi-search position-absolute text-muted" style="left:12px; top:11px"></i><input class="form-control ps-5 w-100" placeholder="Nama peserta, kode tiket, invoice…" oninput="af.q=this.value; af.page=1; drawAtt()"></div>
    <div class="seg" id="aSeg"></div>
    <select class="form-select" id="aTk" onchange="af.t=this.value; af.page=1; drawAtt()"></select>
  </div>
  <div class="panel"><div class="tbl-wrap" id="aList"></div><div id="aPager"></div></div>`;
  drawAtt(true);
}
function attList(){
  const q = af.q.toLowerCase();
  return EV.attendees(af.ev).filter(a => (af.st === 'all' || (af.st === 'in' ? a.in : !a.in)) && (!af.t || a.t === af.t) && (!q || (a.n + ' ' + a.c + ' ' + a.order.id + ' ' + a.order.name).toLowerCase().includes(q)));
}
function drawAtt(full){
  const e = EV.event(af.ev), all = EV.attendees(af.ev), inn = all.filter(a => a.in).length, pct = all.length ? inn / all.length * 100 : 0;
  if(full){
    $('#aTk').innerHTML = `<option value="">Semua tiket</option>${e.tickets.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}`;
  }
  $('#aKpi').innerHTML = `
    <div class="col-6 col-xl-3"><div class="kpi"><i class="bi bi-people ic"></i><div class="lbl">Tiket Terbit</div><div class="val">${num(all.length)}</div><span class="delta">dari ${num(EV.capacity(e))} kuota</span></div></div>
    <div class="col-6 col-xl-3"><div class="kpi"><i class="bi bi-person-check ic"></i><div class="lbl">Sudah Check-in</div><div class="val">${num(inn)}</div><span class="delta">${num(all.length - inn)} belum hadir</span></div></div>
    <div class="col-xl-6"><div class="kpi"><div class="lbl">Kehadiran per Jenis Tiket</div><div class="mt-3">${hbars(e.tickets.map(t => { const ta = all.filter(a => a.t === t.id), ti = ta.filter(a => a.in).length; return {label:t.name, v:ta.length ? ti / ta.length * 100 : 0, vl:`${num(ti)} / ${num(ta.length)}`, tip:`<b>${esc(t.name)}</b><br>${num(ti)} dari ${num(ta.length)} peserta check-in`}; }), v => Math.round(v) + '%')}</div>
      <div class="delta mt-2">Total kehadiran <b>${pct.toFixed(0)}%</b> · ${EV.phase(e) === 'live' ? '<span class="st gold ms-1"><i class="bi bi-broadcast"></i>Berlangsung</span>' : EV.phase(e) === 'ended' ? 'event selesai' : 'event belum dimulai'}</div></div></div>`;
  $('#aSeg').innerHTML = [['all','Semua'], ['in','Sudah'], ['out','Belum']].map(([k, l]) => `<button class="${af.st === k ? 'on' : ''}" onclick="af.st='${k}'; af.page=1; drawAtt()">${l}</button>`).join('');
  const list = attList(), size = 20;
  af.page = Math.min(af.page, Math.max(1, Math.ceil(list.length / size)));
  $('#aList').innerHTML = list.length ? `<table class="tbl"><thead><tr><th>Kode Tiket</th><th>Peserta</th><th>Tiket</th><th>Pemesan</th><th>Check-in</th><th class="text-end">Aksi</th></tr></thead><tbody>
    ${list.slice((af.page - 1) * size, af.page * size).map(a => { const idx = a.order.att.findIndex(x => x.c === a.c); return `<tr>
      <td class="mono">${a.c}</td><td>${esc(a.n)}</td><td>${esc(tkName(e, a.t))}</td>
      <td><a href="${ROUTES.admin.orders}?id=${a.order.id}" class="mono" style="text-decoration:underline">${a.order.id}</a><div class="meta">${esc(a.order.name)}</div></td>
      <td>${a.in ? `<span class="st good"><i class="bi bi-check2"></i>${dt(a.in)}</span>` : '<span class="meta">Belum</span>'}</td>
      <td class="text-end">${a.in ? `<button class="btn btn-line" style="padding:5px 12px; font-size:11px" onclick="checkIn('${a.order.id}',${idx},true); drawAtt(); toast('Check-in dibatalkan')">Batalkan</button>`
        : `<button class="btn btn-ink" style="padding:5px 12px; font-size:11px" onclick="checkIn('${a.order.id}',${idx}); drawAtt(); toast('${esc(a.n).replace(/&#39;/g, '')} berhasil check-in')">Check-in</button>`}</td></tr>`; }).join('')}</tbody></table>`
    : `<div class="empty"><i class="bi bi-people"></i>${all.length ? 'Tidak ada peserta yang cocok.' : 'Belum ada peserta untuk event ini.'}</div>`;
  $('#aPager').innerHTML = list.length ? pager(list.length, af.page, size, 'aPage') : '';
}
function aPage(n){ af.page = n; drawAtt(); }
function exportAtt(){
  const e = EV.event(af.ev);
  csv([['Kode Tiket','Nama Peserta','Jenis Tiket','Invoice','Pemesan','Email','Check-in'], ...attList().map(a => [a.c, a.n, tkName(e, a.t), a.order.id, a.order.name, a.order.email, a.in || ''])], `peserta-${e.id}.csv`);
}
function openScanner(){
  const e = EV.event(af.ev);
  modal(`<div class="row g-0">
    <div class="col-md-6"><div class="scan-frame h-100"><div class="box"><div class="line"></div></div><div class="position-absolute bottom-0 start-0 end-0 p-3 text-center meta" style="color:#BDB4A7">Arahkan QR e-tiket ke kamera</div></div></div>
    <div class="col-md-6 p-4">
      <div class="d-flex justify-content-between"><div><div class="eyebrow">Check-in</div><h4 class="serif fw-semibold mt-1" style="font-size:26px">${esc(e.title)}</h4></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <form class="d-flex gap-2 mt-3" onsubmit="event.preventDefault(); doScan($('#scanCode').value); $('#scanCode').value=''; $('#scanCode').focus()">
        <input class="form-control mono" id="scanCode" placeholder="MDS-XXXXXX" autocomplete="off" style="text-transform:uppercase"><button class="btn btn-ink btn-sm-x">Cek</button></form>
      <button class="btn btn-link p-0 mt-2 meta" style="text-decoration:underline" onclick="demoScan()">Demo: pindai tiket acak yang belum check-in</button>
      <div id="scanRes" class="mt-3"></div>
      <div class="sec-lbl">Pindaian sesi ini</div><div id="scanLog" class="meta">Belum ada.</div>
    </div></div>`, 'modal-lg');
  setTimeout(() => $('#scanCode')?.focus(), 400);
  drawScanLog();
}
function doScan(code){
  code = code.trim().toUpperCase(); if(!code) return;
  const hit = EV.orders().flatMap(o => o.att.map((a, i) => ({o, a, i}))).find(x => x.a.c === code);
  let cls, ic, title, sub;
  if(!hit){ [cls, ic, title, sub] = ['bad', 'bi-x-octagon-fill', 'Tiket tidak dikenal', `Kode ${esc(code)} tidak terdaftar.`]; }
  else if(hit.o.ev !== af.ev){ [cls, ic, title, sub] = ['warn', 'bi-exclamation-triangle-fill', 'Event berbeda', `Tiket ini untuk ${esc(evName(hit.o.ev))}.`]; }
  else if(hit.o.status !== 'paid'){ [cls, ic, title, sub] = ['bad', 'bi-x-octagon-fill', 'Tiket tidak berlaku', `Status pesanan: ${ORDER_ST[hit.o.status][0]}.`]; }
  else if(hit.a.in){ [cls, ic, title, sub] = ['warn', 'bi-exclamation-triangle-fill', 'Sudah check-in', `${esc(hit.a.n)} masuk pukul ${dt(hit.a.in).split(', ')[1]}.`]; }
  else { checkIn(hit.o.id, hit.i); [cls, ic, title, sub] = ['good', 'bi-check-circle-fill', 'Check-in berhasil', `${esc(hit.a.n)} · ${esc(tkName(EV.event(af.ev), hit.a.t))}`]; }
  $('#scanRes').innerHTML = `<div class="scan-res ${cls}"><i class="bi ${ic}"></i><div><b style="font-weight:500">${title}</b><div class="meta">${sub}</div><div class="mono meta mt-1">${esc(code)}</div></div></div>`;
  scans.unshift({code, cls, title, at:new Date()}); drawScanLog(); drawAtt();
}
function demoScan(){
  const a = EV.attendees(af.ev).filter(x => !x.in);
  if(!a.length) return toast('Semua peserta sudah check-in');
  doScan(a[Math.floor(Math.random() * a.length)].c);
}
function drawScanLog(){ if($('#scanLog') && scans.length) $('#scanLog').innerHTML = scans.slice(0, 6).map(s => `<div class="d-flex justify-content-between py-1"><span class="mono">${s.code}</span><span class="st ${s.cls}">${s.title}</span></div>`).join(''); }

/* ══════════════════════════════════════════════════════════════════
   PROMO
════════════════════════════════════════════════════════════════════ */
function pagePromos(){
  $('#app').innerHTML = `<div class="adm-tools"><div class="meta">Kode promo dipakai di checkout tiket situs dan transaksi manual.</div><button class="btn btn-ink btn-sm-x ms-auto" onclick="openPromo()"><i class="bi bi-plus-lg me-2"></i>Buat Promo</button></div>
    <div class="panel"><div class="tbl-wrap" id="pList"></div></div>`;
  drawPromos();
}
function drawPromos(){
  const t = EV.today();
  $('#pList').innerHTML = `<table class="tbl"><thead><tr><th>Kode</th><th>Diskon</th><th>Berlaku untuk</th><th>Pemakaian</th><th>Berlaku s/d</th><th>Aktif</th><th></th></tr></thead><tbody>
    ${EV.promos().map((p, i) => { const used = EV.promoUsed(p.code), exp = p.until && p.until < t; return `<tr>
      <td class="mono"><b style="font-weight:500">${esc(p.code)}</b></td><td>${p.type === 'pct' ? p.val + '%' : rp(p.val)}</td><td>${p.ev ? esc(evName(p.ev)) : 'Semua event'}</td>
      <td><div class="mono">${num(used)} / ${num(p.quota)}</div><div class="bar-sm mt-1"><div style="width:${Math.min(100, used / p.quota * 100)}%"></div></div></td>
      <td class="text-nowrap">${p.until ? dt(p.until, false) : '—'}${exp ? ' <span class="st bad ms-1">Kedaluwarsa</span>' : ''}</td>
      <td><div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" ${p.active ? 'checked' : ''} onchange="togglePromo(${i}, this)"></div></td>
      <td class="text-end text-nowrap"><button class="icon-btn" onclick="openPromo(${i})"><i class="bi bi-pencil"></i></button><button class="icon-btn" onclick="delPromo(${i})"><i class="bi bi-trash"></i></button></td></tr>`; }).join('')}</tbody></table>`;
}
function openPromo(i){
  const p = i != null ? EV.promos()[i] : {code:'', type:'pct', val:10, quota:100, ev:'', until:'', active:true};
  modal(`<form class="p-4 p-lg-5" onsubmit="savePromo(event, ${i ?? 'null'})"><div class="d-flex justify-content-between"><h4 class="serif fw-semibold" style="font-size:28px">${i != null ? 'Edit Promo' : 'Promo Baru'}</h4><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="row g-3 mt-1">
      <div class="col-12"><label class="meta mb-1">Kode *</label><input class="form-control mono" name="code" required value="${esc(p.code)}" style="text-transform:uppercase" placeholder="RAYA2027"></div>
      <div class="col-6"><label class="meta mb-1">Jenis</label><select class="form-select" name="type"><option value="pct" ${p.type === 'pct' ? 'selected' : ''}>Persentase (%)</option><option value="fix" ${p.type === 'fix' ? 'selected' : ''}>Nominal (Rp)</option></select></div>
      <div class="col-6"><label class="meta mb-1">Nilai *</label><input type="number" min="1" class="form-control" name="val" required value="${p.val}"></div>
      <div class="col-6"><label class="meta mb-1">Kuota pemakaian</label><input type="number" min="1" class="form-control" name="quota" value="${p.quota}"></div>
      <div class="col-6"><label class="meta mb-1">Berlaku s/d</label><input type="date" class="form-control" name="until" value="${p.until}"></div>
      <div class="col-12"><label class="meta mb-1">Berlaku untuk</label><select class="form-select" name="ev"><option value="">Semua event</option>${EV.events().map(e => `<option value="${e.id}" ${p.ev === e.id ? 'selected' : ''}>${esc(e.title)}</option>`).join('')}</select></div>
      <div class="col-12"><div class="form-check form-switch"><input class="form-check-input" type="checkbox" name="active" id="pAct" ${p.active ? 'checked' : ''}><label class="form-check-label" for="pAct">Aktif</label></div></div>
    </div>
    <div class="d-flex gap-2 justify-content-end mt-4"><button type="button" class="btn btn-line" data-bs-dismiss="modal">Batal</button><button class="btn btn-ink">Simpan</button></div></form>`);
}
async function savePromo(ev, i){
  ev.preventDefault();
  const f = ev.target, code = f.code.value.trim().toUpperCase().replace(/\s+/g, '');
  if(EV.promos().some((p, k) => p.code === code && k !== i)) return toast('Kode promo sudah dipakai');
  if(f.type.value === 'pct' && +f.val.value > 100) return toast('Persentase maksimal 100%');
  const p = {code, type:f.type.value, val:+f.val.value, quota:+f.quota.value || 1, ev:f.ev.value, until:f.until.value, active:f.active.checked};
  try{ EV.putPromo(await api(i == null ? 'POST' : 'PUT', adminApi(i == null ? '/promos' : `/promos/${EV.promos()[i].key}`), p)); }
  catch(err){ return toast(err.message); }
  closeModal(); drawPromos(); toast(`Promo ${code} disimpan`);
}
async function togglePromo(i, input){
  const p = EV.promos()[i];
  try{ EV.putPromo(await api('PUT', adminApi(`/promos/${p.key}`), {...p, active:input.checked})); toast(`Promo ${p.code} ${input.checked ? 'diaktifkan' : 'dinonaktifkan'}`); }
  catch(err){ input.checked = !input.checked; toast(err.message); }
}
function delPromo(i){
  const p = EV.promos()[i], used = EV.promoUsed(p.code);
  confirmBox('Hapus promo?', `Kode <b style="color:var(--ink)">${esc(p.code)}</b> akan dihapus.${used ? ` Riwayat ${used} transaksi yang memakainya tetap tersimpan.` : ''}`, 'Hapus', async () => {
    try{ await api('DELETE', adminApi(`/promos/${p.key}`)); EV.promos().splice(i, 1); drawPromos(); toast('Promo dihapus'); }
    catch(err){ toast(err.message); }
  }, true);
}

/* ══════════════════════════════════════════════════════════════════
   LAYOUT, LOGIN & INIT
════════════════════════════════════════════════════════════════════ */
function adminName(){ return window.ADMIN?.name || 'Admin'; }
function resetDemo(){
  confirmBox('Reset data demo?', 'Semua event, transaksi, dan promo dikembalikan ke data contoh awal. Perubahan Anda akan hilang.', 'Reset Data', async () => {
    try{ await api('POST', adminApi('/demo/reset')); location.reload(); }catch(err){ toast(err.message); }
  }, true);
}
function updateBadge(){
  const n = EV.orders().filter(o => o.status === 'pending').length, b = $('#pendingBadge');
  if(b){ b.textContent = n; b.classList.toggle('d-none', !n); }
  const list = $('#notifList');
  if(list) list.innerHTML = EV.orders().slice(0, 6).map(o => `<li><a class="dropdown-item py-2" href="${ROUTES.admin.orders}?id=${o.id}"><div class="d-flex justify-content-between gap-3"><span class="mono">${o.id}</span>${stOrder(o.status)}</div><div class="meta text-truncate" style="max-width:280px">${esc(o.name)} · ${esc(evName(o.ev))}</div></a></li>`).join('');
}
function globalSearch(ev){ ev.preventDefault(); location.href = ROUTES.admin.orders + '?q=' + encodeURIComponent(ev.target.q.value); }
function refresh(){ ({dash:pageDash, events:drawEvList, orders:drawOrders, attendees:() => drawAtt(), promos:drawPromos})[PAGE]?.(); }

if(PAGE !== 'login'){
  EV.load();
  updateBadge();
  ({dash:pageDash, events:pageEvents, orders:pageOrders, attendees:pageAttendees, promos:pagePromos})[PAGE]();
}
