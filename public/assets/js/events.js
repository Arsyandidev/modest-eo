/* ══════════════════════════════════════════════════════════════════
   EVENTS — halaman publik (daftar event & detail ?id=…)
   Data & API ada di events-data.js (objek EV); transaksi diproses server
════════════════════════════════════════════════════════════════════ */
const evState = {cat:'Semua', when:'upcoming', qty:{}, id:null};
const evUrl = id => `${ROUTES.event}?id=${id}`;
const evImg = (e, ratio = 'r-43') => ph(EV_IMG[e.img] || e.img, ratio, e.title);

function evBadge(e){
  const ph_ = EV.phase(e), left = EV.capacity(e) - EV.sold(e);
  if(ph_ === 'ended') return '<span class="ev-flag muted">Selesai</span>';
  if(ph_ === 'live') return '<span class="ev-flag live"><i class="bi bi-broadcast"></i> Berlangsung</span>';
  if(left <= 0) return '<span class="ev-flag dark">Sold Out</span>';
  if(left / EV.capacity(e) < .15) return `<span class="ev-flag">Sisa ${left} tiket</span>`;
  return '';
}
const evPrice = e => { const m = EV.minPrice(e); return m ? `Mulai ${rp(m)}` : 'Gratis'; };
const dateBlock = e => { const d = evDate(e.start); return `<div class="ev-date"><b>${d.getDate()}</b><span>${EV_MON[d.getMonth()]}</span></div>`; };

function evCard(e){
  const pct = Math.min(100, EV.sold(e) / EV.capacity(e) * 100);
  return `<a class="ev-card" href="${evUrl(e.id)}">
    <div class="position-relative">${evImg(e)}${dateBlock(e)}<div class="ev-flags">${evBadge(e)}</div></div>
    <div class="pt-3">
      <span class="tag-pill">${esc(e.cat)}</span>
      <h5>${esc(e.title)}</h5>
      <div class="meta mb-1"><i class="bi bi-calendar3 me-1"></i>${evDateLabel(e, false)} · ${e.time.split(' – ')[0]}</div>
      <div class="meta"><i class="bi bi-geo-alt me-1"></i>${esc(e.venue)}, ${esc(e.city)}</div>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <span class="price">${evPrice(e)}</span>
        ${EV.phase(e) === 'upcoming' ? `<span class="meta">${Math.round(pct)}% terisi</span>` : ''}
      </div>
      ${EV.phase(e) === 'upcoming' ? `<div class="ship-bar mt-2"><div style="width:${pct}%"></div></div>` : ''}
    </div></a>`;
}

/* ---------- Banner event unggulan (dipakai juga di Home) ---------- */
function evFeatured(){
  const list = EV.published().filter(e => EV.phase(e) !== 'ended').sort((a, b) => a.start.localeCompare(b.start));
  return list.find(e => e.featured) || list[0];
}
function evBanner(e, home = false){
  if(!e) return '';
  return `<div class="event">
    ${evImg(e, '')}
    <div class="body">
      <div class="eyebrow">${home ? 'Agenda · ' : ''}${evDateLabel(e, false)} · ${esc(e.city)}</div>
      <h3 class="mt-3">${esc(e.title)}</h3>
      <p class="mt-3 mb-4" style="font-weight:300; color:var(--ink-2)">${esc(e.excerpt)}</p>
      ${EV.phase(e) === 'upcoming' ? `<div class="countdown mb-4" data-start="${e.start}"></div>` : ''}
      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-ink" href="${evUrl(e.id)}"><i class="bi bi-ticket-perforated me-2"></i>${EV.minPrice(e) ? 'Beli Tiket' : 'Daftar Gratis'}</a>
        <a class="btn btn-line" href="${ROUTES.events}">Semua Event</a>
      </div>
    </div>
  </div>`;
}
function evHomeBlock(){
  const next = EV.published().filter(e => EV.phase(e) !== 'ended').sort((a, b) => a.start.localeCompare(b.start)).slice(0, 3);
  return `${evBanner(evFeatured(), true)}
    <div class="row g-4 mt-2">${next.map(e => `<div class="col-md-4"><a class="ev-mini" href="${evUrl(e.id)}">${dateBlock(e)}<div class="min-w-0"><span class="tag-pill">${esc(e.cat)}</span><h6>${esc(e.title)}</h6><div class="meta">${esc(e.venue)} · ${evPrice(e)}</div></div></a></div>`).join('')}</div>`;
}
function tickCountdown(){
  document.querySelectorAll('.countdown').forEach(el => {
    const ms = Math.max(0, evDate(el.dataset.start) - new Date());
    const parts = [[Math.floor(ms / 864e5), 'Hari'], [Math.floor(ms / 36e5) % 24, 'Jam'], [Math.floor(ms / 6e4) % 60, 'Menit'], [Math.floor(ms / 1e3) % 60, 'Detik']];
    el.innerHTML = parts.map(([n, l]) => `<div><b>${String(n).padStart(2, '0')}</b><span>${l}</span></div>`).join('');
  });
}
setInterval(tickCountdown, 1000);

/* ---------- Daftar event ---------- */
function viewEvents(){
  const counts = c => EV.published().filter(e => c === 'Semua' || e.cat === c).length;
  return `
  <div class="page-hd"><div class="container-x">
    <div class="eyebrow">Agenda</div><h1>Events</h1>
    <p>Fashion show, talkshow, workshop, hingga kajian — temui komunitas modest.id secara langsung.</p>
  </div></div>
  <div class="container-x pt-5">${evBanner(evFeatured())}</div>
  <div class="container-x">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-5 pb-2">
      <div class="seg">${[['upcoming','Mendatang'], ['ended','Telah Berlangsung']].map(([k, l]) => `<button class="${evState.when === k ? 'on' : ''}" onclick="evState.when='${k}'; render(false)">${l}</button>`).join('')}</div>
      <button class="btn btn-line" style="padding:9px 16px" onclick="openMyTickets()"><i class="bi bi-ticket-perforated me-2"></i>Tiket Saya</button>
    </div>
    <div class="filters justify-content-start">${['Semua', ...EV_CATS].filter(c => counts(c)).map(c => `<button class="${evState.cat === c ? 'on' : ''}" onclick="evState.cat='${c}'; render(false)">${c}</button>`).join('')}</div>
    <div class="row g-4 gy-5 pb-5" id="evGrid"></div>
  </div>`;
}
function drawEvents(){
  const list = EV.published().filter(e => (evState.cat === 'Semua' || e.cat === evState.cat) && (evState.when === 'ended' ? EV.phase(e) === 'ended' : EV.phase(e) !== 'ended'))
    .sort((a, b) => evState.when === 'ended' ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start));
  $('#evGrid').innerHTML = list.length ? list.map(e => `<div class="col-sm-6 col-lg-4">${evCard(e)}</div>`).join('')
    : `<div class="col-12 empty"><i class="bi bi-calendar-x"></i>Belum ada event di kategori ini.</div>`;
}

/* ---------- Detail event ---------- */
function viewEvent(id){
  const e = EV.event(id);
  if(!e || e.status !== 'published') return `<div class="container-x empty"><i class="bi bi-calendar-x"></i>Event tidak ditemukan. <a class="link-more ms-2" href="${ROUTES.events}">Lihat semua event</a></div>`;
  if(evState.id !== id){ evState.id = id; evState.qty = {}; }
  const phase = EV.phase(e);
  const related = EV.published().filter(x => x.id !== e.id && EV.phase(x) !== 'ended').slice(0, 3);
  const mapQ = encodeURIComponent(`${e.venue}, ${e.address}`);
  return `
  <div class="container-x">
    <nav class="pt-4 meta"><a href="${ROUTES.events}">Home</a> <i class="bi bi-chevron-right mx-1" style="font-size:10px"></i> <a href="${ROUTES.events}">Events</a> <i class="bi bi-chevron-right mx-1" style="font-size:10px"></i> ${esc(e.cat)}</nav>
    <div class="row g-4 g-lg-5 py-4">
      <div class="col-lg-7">
        <div class="position-relative">${evImg(e, 'r-169')}<div class="ev-flags">${evBadge(e)}</div></div>
        <div class="pt-4">
          <span class="tag-pill">${esc(e.cat)}</span>
          <h1 class="serif fw-semibold mt-2" style="font-size:clamp(34px,5vw,52px); line-height:1.05">${esc(e.title)}</h1>
          <p class="lede serif fst-italic mt-3" style="font-size:21px; color:var(--ink-2); line-height:1.45">${esc(e.excerpt)}</p>
        </div>
        <div class="ev-facts my-4">
          <div><i class="bi bi-calendar3"></i><span class="lbl-sm m-0">Tanggal</span>${evDateLabel(e)}</div>
          <div><i class="bi bi-clock"></i><span class="lbl-sm m-0">Waktu</span>${e.time}</div>
          <div><i class="bi bi-geo-alt"></i><span class="lbl-sm m-0">Lokasi</span>${esc(e.venue)}, ${esc(e.city)}</div>
        </div>
        ${phase === 'upcoming' ? `<div class="countdown mb-4" data-start="${e.start}"></div>` : ''}
        <h3 class="serif fw-semibold mt-5" style="font-size:30px">Tentang Event</h3>
        <p style="font-weight:300; font-size:16.5px; line-height:1.8; color:var(--ink-2)">${esc(e.desc)}</p>

        <h3 class="serif fw-semibold mt-5 mb-3" style="font-size:30px">Rundown</h3>
        <div class="rundown">${e.rundown.map(([t, title, d]) => `<div><span class="t">${esc(t)}</span><div><b>${esc(title)}</b>${d ? `<div class="meta">${esc(d)}</div>` : ''}</div></div>`).join('')}</div>

        ${e.speakers.length ? `<h3 class="serif fw-semibold mt-5 mb-3" style="font-size:30px">Pembicara & Pengisi Acara</h3>
        <div class="row g-3">${e.speakers.map(s => { const d = DESIGNERS.find(x => x.id === s.d); return `<div class="col-sm-6"><div class="d-row spk py-3" style="gap:14px;${d ? '' : ' cursor:default'}" ${d ? `onclick="openDesigner('${d.id}')"` : ''}>
          <div style="width:60px; flex:none">${ph(d ? d.img : '', 'r-11', s.name)}</div>
          <div class="min-w-0"><div class="eyebrow" style="font-size:10px">${esc(s.role)}</div><h5 style="font-size:20px">${esc(s.name)}</h5>${d ? '<div class="meta">Lihat profil desainer <i class="bi bi-arrow-right"></i></div>' : ''}</div></div></div>`; }).join('')}</div>` : ''}

        <h3 class="serif fw-semibold mt-5 mb-3" style="font-size:30px">Lokasi</h3>
        <div class="ev-map"><i class="bi bi-geo-alt-fill"></i><div><b>${esc(e.venue)}</b><div class="meta">${esc(e.address)}</div></div>
          <a class="btn btn-line ms-auto" style="padding:9px 14px" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${mapQ}">Buka Maps</a></div>
      </div>

      <div class="col-lg-5"><div class="ticket-box" id="ticketBox">${ticketBox(e)}</div></div>
    </div>
  </div>
  ${related.length ? `<section class="blk" style="background:var(--paper); border-top:1px solid var(--line)"><div class="container-x">
    ${secHead('Agenda Lainnya', 'Event Mendatang', ROUTES.events)}
    <div class="row g-4 gy-5">${related.map(x => `<div class="col-md-4">${evCard(x)}</div>`).join('')}</div>
  </div></section>` : ''}`;
}

function ticketBox(e){
  const phase = EV.phase(e);
  const sel = e.tickets.map(t => ({t, q:evState.qty[t.id] || 0}));
  const sub = sel.reduce((n, x) => n + x.t.price * x.q, 0), n = sel.reduce((a, x) => a + x.q, 0);
  if(phase === 'ended') return `<div class="lbl-sm">Event telah selesai</div><p class="text-muted" style="font-weight:300">Terima kasih kepada ${EV.attendeeCount(e).toLocaleString('id-ID')} peserta yang telah hadir. Nantikan agenda berikutnya!</p><a class="btn btn-ink w-100" href="${ROUTES.events}">Lihat Event Mendatang</a>`;
  return `<div class="d-flex justify-content-between align-items-end mb-3"><div class="lbl-sm m-0">Pilih Tiket</div><span class="meta">${evPrice(e)}</span></div>
    ${sel.map(({t, q}) => { const left = EV.left(e, t), closed = !EV.onSale(t);
      return `<div class="tk ${left <= 0 || closed ? 'off' : ''}">
        <div class="min-w-0"><b>${esc(t.name)}</b><div class="meta">${esc(t.desc || '')}</div>
          <div class="price mt-1">${t.price ? rp(t.price) : 'Gratis'}</div>
          <div class="meta mt-1">${closed ? 'Penjualan ditutup' : left <= 0 ? 'Habis terjual' : left <= 20 ? `<span style="color:#A4523F">Sisa ${left} tiket</span>` : t.saleEnd ? `Berlaku s/d ${evDateLabel({start:t.saleEnd, end:t.saleEnd}, false)}` : ''}</div></div>
        ${left > 0 && !closed ? `<div class="qty sm flex-none"><button onclick="tkQty('${t.id}',-1)" ${q ? '' : 'disabled'}><i class="bi bi-dash"></i></button><span>${q}</span><button onclick="tkQty('${t.id}',1)" ${q >= Math.min(5, left) ? 'disabled' : ''}><i class="bi bi-plus"></i></button></div>` : ''}
      </div>`; }).join('')}
    <div class="d-flex justify-content-between mt-3 pt-3 border-top"><span>${n ? `${n} tiket` : 'Total'}</span><span class="price" style="font-size:20px">${rp(sub)}</span></div>
    <button class="btn btn-ink w-100 mt-3" ${n ? '' : 'disabled'} onclick="openEvCheckout()">${phase === 'live' ? 'Beli Tiket (On the Spot)' : sub ? 'Lanjut ke Pembayaran' : n ? 'Daftar Sekarang' : 'Pilih tiket terlebih dahulu'}</button>
    <div class="meta text-center mt-2">Maks. 5 tiket per jenis · E-tiket dikirim ke email</div>
    <div class="d-flex justify-content-center gap-2 mt-3 share">
      <button class="icon-btn" onclick="downloadIcs('${e.id}')" title="Tambahkan ke kalender"><i class="bi bi-calendar-plus"></i></button>
      <button class="icon-btn" onclick="toast('Dibagikan ke WhatsApp')"><i class="bi bi-whatsapp"></i></button>
      <button class="icon-btn" onclick="copyLink()"><i class="bi bi-link-45deg"></i></button>
    </div>`;
}
function tkQty(id, d){ evState.qty[id] = Math.max(0, (evState.qty[id] || 0) + d); $('#ticketBox').innerHTML = ticketBox(EV.event(evState.id)); }

/* ---------- Checkout tiket ---------- */
let evPromo = null;
function openEvCheckout(){
  const e = EV.event(evState.id);
  const items = e.tickets.filter(t => evState.qty[t.id]).map(t => ({t:t.id, name:t.name, qty:evState.qty[t.id], price:+t.price}));
  const seats = items.flatMap(i => Array.from({length:i.qty}, () => i));
  const free = !items.some(i => i.price);
  evPromo = null;
  $('#dModalBody').innerHTML = `<div class="row g-0">
    <div class="col-md-7 p-4 p-lg-5">
      <div class="d-flex justify-content-between"><div><div class="eyebrow">${free ? 'Registrasi' : 'Checkout Tiket'}</div><h3 class="serif fw-semibold mt-2" style="font-size:32px">${esc(e.title)}</h3><div class="meta">${evDateLabel(e)} · ${esc(e.venue)}</div></div><button class="btn-close d-md-none" data-bs-dismiss="modal"></button></div>
      <form class="row g-3 mt-2" id="evForm" onsubmit="submitEvOrder(event)">
        <div class="col-12 lbl-sm mb-0 mt-3">Data Pemesan</div>
        <div class="col-md-6"><label class="meta mb-1">Nama Lengkap</label><input class="form-control" name="name" required oninput="syncFirst()"></div>
        <div class="col-md-6"><label class="meta mb-1">No. WhatsApp</label><input class="form-control" name="phone" required placeholder="08…"></div>
        <div class="col-12"><label class="meta mb-1">Email (e-tiket dikirim ke sini)</label><input class="form-control" type="email" name="email" required></div>
        <div class="col-12 lbl-sm mb-0 mt-4">Data Peserta</div>
        ${seats.map((s, i) => `<div class="col-12"><label class="meta mb-1">Peserta ${i + 1} · ${esc(s.name)}</label><input class="form-control att" data-t="${s.t}" required ${i ? '' : 'id="att0"'} placeholder="Nama sesuai identitas"></div>`).join('')}
        <div class="col-12"><label class="f-check"><input type="checkbox" id="sameBuyer" checked onchange="syncFirst()">Peserta 1 sama dengan pemesan</label></div>
        ${free ? '' : `<div class="col-12 mt-4"><div class="lbl-sm">Metode Pembayaran</div>
          ${[['VA BCA','bi-bank','Virtual Account BCA'],['VA Mandiri','bi-bank','Virtual Account Mandiri'],['QRIS','bi-qr-code','QRIS (semua e-wallet & m-banking)'],['GoPay','bi-wallet2','GoPay'],['Kartu Kredit','bi-credit-card','Kartu Kredit / Debit']].map(([v, ic, l], i) => `<label class="pay-opt"><input type="radio" name="pay" value="${v}" ${i ? '' : 'checked'}><i class="bi ${ic} text-gold"></i>${l}</label>`).join('')}</div>`}
      </form>
    </div>
    <div class="col-md-5 p-4 p-lg-5" style="background:var(--ivory-2)">
      <div class="d-none d-md-flex justify-content-end mb-2"><button class="btn-close" data-bs-dismiss="modal"></button></div>
      <div style="max-width:100%">${evImg(e, 'r-169')}</div>
      <div class="lbl-sm mt-3">Ringkasan</div>
      ${items.map(i => `<div class="d-flex justify-content-between py-1"><span>${esc(i.name)} × ${i.qty}</span><span>${i.price ? rp(i.price * i.qty) : 'Gratis'}</span></div>`).join('')}
      ${free ? '' : `<div class="d-flex gap-2 my-3"><input class="form-control" id="evPromoCode" placeholder="Kode promo"><button class="btn btn-line" style="padding:8px 14px" onclick="applyEvPromo()">Pakai</button></div>`}
      <div id="evSum"></div>
      <button class="btn btn-ink w-100 mt-4" type="submit" form="evForm">${free ? 'Konfirmasi Pendaftaran' : 'Bayar Sekarang'}</button>
      <div class="meta text-center mt-2"><i class="bi bi-shield-lock me-1"></i>Transaksi aman & terenkripsi</div>
    </div></div>`;
  evSummary(items);
  bootstrap.Modal.getOrCreateInstance('#dModal').show();
}
function evItems(){ const e = EV.event(evState.id); return e.tickets.filter(t => evState.qty[t.id]).map(t => ({t:t.id, name:t.name, qty:evState.qty[t.id], price:+t.price})); }
function evSummary(items = evItems()){
  const sub = items.reduce((n, i) => n + i.price * i.qty, 0), disc = EV.discount(evPromo, sub), fee = sub - disc > 0 ? EV_FEE : 0;
  $('#evSum').innerHTML = `<div class="d-flex justify-content-between meta pt-2 border-top"><span>Subtotal</span><span>${rp(sub)}</span></div>
    ${disc ? `<div class="d-flex justify-content-between meta"><span>Promo ${evPromo.code}</span><span>-${rp(disc)}</span></div>` : ''}
    ${fee ? `<div class="d-flex justify-content-between meta"><span>Biaya layanan</span><span>${rp(fee)}</span></div>` : ''}
    <div class="d-flex justify-content-between pt-2 mt-2 border-top"><b style="font-weight:500">Total</b><b class="price">${rp(sub - disc + fee)}</b></div>`;
}
async function applyEvPromo(){
  const code = $('#evPromoCode').value.trim();
  if(!code) return toast('Masukkan kode promo');
  try{ evPromo = await api('POST', `${ROUTES.api}/promos/check`, {code, ev:evState.id}); evSummary(); toast(`Promo ${evPromo.code} berhasil dipakai`); }
  catch(err){ toast(err.message); }
}
function syncFirst(){ const f = $('#att0'), on = $('#sameBuyer')?.checked; if(f && on) f.value = $('#evForm [name=name]').value; if(f) f.readOnly = !!on; }
// simpan respons checkout/pembayaran: pesanan + event (jumlah terjual terbaru)
function evSync({order, event}){ EV.putEvent(event); EV.putOrder(order); EV.remember(order.token); updateMyTickets(); return order; }
async function submitEvOrder(ev){
  ev.preventDefault();
  const f = new FormData(ev.target), items = evItems(), btn = $('button[form=evForm]');
  const attendees = [...document.querySelectorAll('#evForm .att')].map(i => ({n:i.value.trim(), t:i.dataset.t}));
  btn.disabled = true;
  try{
    const o = evSync(await api('POST', `${ROUTES.api}/orders`, {ev:evState.id, name:f.get('name'), email:f.get('email'), phone:f.get('phone'),
      items:items.map(({t, qty}) => ({t, qty})), attendees, promo:evPromo?.code || '', pay:f.get('pay')}));
    evState.qty = {};
    o.status === 'paid' ? showTickets(o.id) : showPayment(o.id);
  }catch(err){ toast(err.message); btn.disabled = false; }
}
async function payOrder(id){
  try{ evSync(await api('POST', `${ROUTES.api}/orders/${EV.order(id).token}/pay`)); showTickets(id); }
  catch(err){ toast(err.message); }
}
function showPayment(id){
  const o = EV.order(id);
  const va = o.pay.startsWith('VA'), qr = o.pay === 'QRIS' || o.pay === 'GoPay', card = o.pay === 'Kartu Kredit';
  const due = new Date(new Date(o.at).getTime() + 864e5);
  $('#dModalBody').innerHTML = `<div class="p-4 p-lg-5 text-center" style="max-width:520px; margin:0 auto">
    <div class="d-flex justify-content-end"><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="eyebrow">Menunggu Pembayaran</div>
    <h3 class="serif fw-semibold mt-2" style="font-size:34px">${rp(o.total)}</h3>
    <div class="meta mb-4">Invoice ${o.id} · bayar sebelum ${due.toLocaleString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</div>
    ${va ? `<div class="p-4 mb-3" style="background:var(--paper); border:1px solid var(--line)"><div class="lbl-sm">${o.pay}</div><div class="serif fw-semibold" style="font-size:30px; letter-spacing:.06em">8808 ${o.phone.slice(-8).replace(/(\d{4})/, '$1 ')}</div>
      <button class="btn btn-line mt-2" style="padding:7px 14px" onclick="toast('Nomor Virtual Account disalin')"><i class="bi bi-copy me-1"></i>Salin</button></div>` : ''}
    ${qr ? `<div class="p-4 mb-3 d-inline-block" style="background:#fff; border:1px solid var(--line)">${qrSvg(o.id, 180)}<div class="meta mt-2">Pindai dengan aplikasi ${o.pay === 'GoPay' ? 'Gojek' : 'e-wallet / m-banking'}</div></div>` : ''}
    ${card ? `<div class="text-start"><label class="meta mb-1">Nomor Kartu</label><input class="form-control mb-2" placeholder="4111 1111 1111 1111"><div class="d-flex gap-2"><input class="form-control" placeholder="MM/YY"><input class="form-control" placeholder="CVV"></div></div>` : ''}
    <button class="btn btn-ink w-100 mt-3" onclick="payOrder('${o.id}')">${card ? 'Bayar' : 'Saya Sudah Bayar'}</button>
    <div class="meta mt-2">Simulasi: tombol ini menggantikan konfirmasi dari payment gateway.</div>
  </div>`;
  bootstrap.Modal.getOrCreateInstance('#dModal').show();
}

/* ---------- E-tiket ---------- */
function showTickets(id){
  const o = EV.order(id), e = EV.event(o.ev);
  $('#dModalBody').innerHTML = `<div class="p-4 p-lg-5">
    <div class="d-flex justify-content-between align-items-start"><div><div class="eyebrow"><i class="bi bi-check-circle-fill me-1"></i>${o.status === 'paid' ? 'Pembayaran Berhasil' : 'Menunggu Pembayaran'}</div>
      <h3 class="serif fw-semibold mt-2" style="font-size:34px">E-Tiket Anda</h3><div class="meta">Invoice ${o.id} · dikirim ke ${esc(o.email)}</div></div><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="mt-4">${o.att.map(a => { const t = e.tickets.find(x => x.id === a.t) || {name:a.t}; return `<div class="eticket">
      <div class="body"><div class="eyebrow" style="font-size:10px">${esc(e.cat)} · ${esc(t.name)}</div>
        <div class="serif fw-semibold" style="font-size:24px; line-height:1.1">${esc(e.title)}</div>
        <div class="meta mt-2"><i class="bi bi-calendar3 me-1"></i>${evDateLabel(e)} · ${e.time}</div>
        <div class="meta"><i class="bi bi-geo-alt me-1"></i>${esc(e.venue)}, ${esc(e.city)}</div>
        <div class="mt-3"><span class="meta">Peserta</span><div style="font-weight:500">${esc(a.n)}</div></div></div>
      <div class="stub">${o.status === 'paid' ? qrSvg(a.c, 112) : '<div class="meta p-3">QR aktif setelah pembayaran</div>'}<div class="code">${a.c}</div>${a.in ? '<div class="meta"><i class="bi bi-check2-circle"></i> Sudah check-in</div>' : ''}</div>
    </div>`; }).join('')}</div>
    <div class="d-flex flex-wrap gap-2 mt-3">
      <button class="btn btn-ink" onclick="window.print()"><i class="bi bi-download me-2"></i>Unduh / Cetak</button>
      <button class="btn btn-line" onclick="downloadIcs('${e.id}')"><i class="bi bi-calendar-plus me-2"></i>Tambah ke Kalender</button>
      <button class="btn btn-line" onclick="toast('E-tiket dikirim ulang ke ${esc(o.email)}')">Kirim Ulang Email</button>
    </div></div>`;
  bootstrap.Modal.getOrCreateInstance('#dModal').show();
  if($('#ticketBox')) $('#ticketBox').innerHTML = ticketBox(e);
}
function downloadIcs(id){
  const e = EV.event(id), d = s => s.replace(/-/g, '');
  const end = evDate(e.end); end.setDate(end.getDate() + 1);
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//modest.id//events//ID', 'BEGIN:VEVENT', `UID:${e.id}@modest.id`, `DTSTART;VALUE=DATE:${d(e.start)}`, `DTEND;VALUE=DATE:${d(ymd(end))}`,
    `SUMMARY:${e.title}`, `LOCATION:${e.venue}, ${e.address}`, `DESCRIPTION:${e.excerpt}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'})); a.download = `${e.id}.ics`; a.click();
  toast('File kalender (.ics) diunduh');
}

/* ---------- Tiket Saya ---------- */
const ST_LABEL = {paid:['Lunas','bi-check-circle-fill','good'], pending:['Menunggu Pembayaran','bi-hourglass-split','warn'], cancelled:['Dibatalkan','bi-x-circle-fill','bad'], refunded:['Refund','bi-arrow-counterclockwise','muted']};
function updateMyTickets(){
  const list = EV.mine(), el = $('#myTicketsBody');
  if(!el) return;
  el.innerHTML = list.length ? list.map(o => { const e = EV.event(o.ev) || {title:'Event dihapus', start:o.at.slice(0, 10), end:o.at.slice(0, 10), img:''}; const [l, ic, c] = ST_LABEL[o.status];
    return `<div class="list-row" onclick="${o.status === 'pending' ? `showPayment('${o.id}')` : `showTickets('${o.id}')`}; bootstrap.Offcanvas.getInstance('#myTickets').hide()">
      <div class="flex-none">${dateBlock(e)}</div>
      <div class="min-w-0"><h6>${esc(e.title)}</h6><div class="meta">${o.att.length} tiket · ${o.total ? rp(o.total) : 'Gratis'}</div><span class="st ${c} mt-1"><i class="bi ${ic}"></i>${l}</span></div></div>`; }).join('')
    : `<div class="empty"><i class="bi bi-ticket-perforated"></i>Belum ada tiket.<div class="mt-4"><a class="btn btn-ink" href="${ROUTES.events}">Jelajahi Event</a></div></div>`;
}
function openMyTickets(){ updateMyTickets(); bootstrap.Offcanvas.getOrCreateInstance('#myTickets').show(); }
