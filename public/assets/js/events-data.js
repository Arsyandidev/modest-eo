/* ══════════════════════════════════════════════════════════════════
   EVENTS — data & API bersama (situs publik + dashboard admin)
   Data awal disuntikkan Laravel lewat window.EV_BOOT; setiap perubahan
   dikirim ke server lewat api() lalu state lokal diperbarui dari respons.
════════════════════════════════════════════════════════════════════ */
const EV_IMG = {
  wastra:'article/thumbnail-gaya-kini-wastra-dari-sekolah-mode-di-in2motionfest-2025-1761101657.jpg',
  muffest:'article/thumbnail-masculine-hingga-cottagecore-inspired-di-show-pamungkas-muffest-2025-1741671421.jpg',
  imfw:'news/thumbnail-indonesia-modest-fashion-week-imfw-2022-kembali-digelar--1666316490.jpeg',
  reborn:'article/thumbnail-the-whisper-of-grace-koleksi-musim-gugurmusim-dingin-reborn29-1742976292.jpg',
  tex:'article/thumbnail-aspirasi-hidup-dalam-desain-berpendar-ts-scarf-by-tex-saverio-1741324279.jpeg',
  iwan:'news/thumbnail-menerjemahkan-keselarasan-semesta-iwan-tirta-private-collection-1496897078.jpg',
  artjog:'article/thumbnail-artjog-2022-kembali-meluaskan-pandangan-seni-1661177664.jpg',
  halal:'article/thumbnail-indonesia-halal-industry-award-2021-1640784682.jpg',
  berkahf:'news/thumbnail-hidupkan-tiap-detik-hidup-kita-dengan-kebaikan-pesan-detikdetikberkahf-1710733499.jpg',
  borneo:'news/thumbnail-mystery-of--borneo-merayakan-tradisi-dan-budaya-kalimantan-di-the-apurva-kempinski-bali--1662625570.jpg',
};
const EV_CATS = ['Fashion Show', 'Talkshow', 'Workshop', 'Bazaar', 'Kajian', 'Tur Seni'];
const EV_FEE = 5000; // hanya untuk tampilan ringkasan; total final dihitung server

// panggil endpoint Laravel (JSON + CSRF); error dilempar sebagai Error berisi pesan yang siap ditampilkan
async function api(method, url, body){
  const res = await fetch(url, {method, headers:{'Accept':'application/json', 'Content-Type':'application/json', 'X-CSRF-TOKEN':document.querySelector('meta[name=csrf-token]').content},
    body:body === undefined ? undefined : JSON.stringify(body)});
  const data = await res.json().catch(() => ({}));
  if(res.ok) return data;
  if(res.status === 401 && ROUTES.admin) location.href = ROUTES.admin.login;
  const msg = res.status === 419 ? 'Sesi kedaluwarsa, muat ulang halaman' : res.status === 429 ? 'Terlalu banyak permintaan, coba sebentar lagi'
    : data.errors ? Object.values(data.errors)[0][0] : res.status === 404 ? 'Data tidak ditemukan' : data.message || 'Terjadi kesalahan, coba lagi';
  throw new Error(msg);
}

const EV = {
  MINE:'modest_my_order_tokens', db:null,

  today(){ return ymd(new Date()); },
  load(){ return this.db ||= window.EV_BOOT || {scope:'public', events:[], orders:[], promos:[]}; },
  isAdmin(){ return this.load().scope === 'admin'; },

  events(){ return this.load().events; },
  event(id){ return this.events().find(e => e.id === id); },
  published(){ return this.events().filter(e => e.status === 'published'); },
  orders(evId){ const o = this.load().orders; return evId ? o.filter(x => x.ev === evId) : o; },
  order(id){ return this.orders().find(o => o.id === id); },
  promos(){ return this.load().promos; },

  phase(e){ const t = this.today(); return e.end < t ? 'ended' : e.start <= t ? 'live' : 'upcoming'; },
  counts(o){ return o.status === 'paid' || o.status === 'pending'; },
  // admin menghitung dari daftar transaksi; situs publik memakai angka "sold" dari server
  sold(e, tId){
    if(!this.isAdmin()) return e.tickets.filter(t => !tId || t.id === tId).reduce((n, t) => n + (t.sold || 0), 0);
    return this.orders(e.id).filter(this.counts).reduce((n, o) => n + o.items.filter(i => !tId || i.t === tId).reduce((a, i) => a + i.qty, 0), 0);
  },
  capacity(e){ return e.tickets.reduce((n, t) => n + +t.quota, 0); },
  left(e, t){ return Math.max(0, t.quota - this.sold(e, t.id)); },
  revenue(e){ return this.orders(e.id).filter(o => o.status === 'paid').reduce((n, o) => n + o.total, 0); },
  minPrice(e){ return Math.min(...e.tickets.map(t => +t.price)); },
  onSale(t){ return !t.saleEnd || t.saleEnd >= this.today(); },
  attendees(evId){ return this.orders(evId).filter(o => o.status === 'paid').flatMap(o => o.att.map(a => ({...a, order:o}))); },
  attendeeCount(e){ return this.isAdmin() ? this.attendees(e.id).length : (e.attendeeCount || 0); },
  promoUsed(code){ return this.orders().filter(o => o.promo === code && o.status !== 'cancelled').length; },
  // pratinjau di form transaksi manual admin; validasi final tetap di server
  checkPromo(code, evId){
    const p = this.promos().find(x => x.code === code.trim().toUpperCase());
    if(!p) return {err:'Kode promo tidak ditemukan'};
    if(!p.active) return {err:'Kode promo sedang tidak aktif'};
    if(p.until && p.until < this.today()) return {err:'Kode promo sudah kedaluwarsa'};
    if(p.ev && p.ev !== evId) return {err:'Kode promo tidak berlaku untuk event ini'};
    if(this.promoUsed(p.code) >= p.quota) return {err:'Kuota kode promo sudah habis'};
    return {promo:p};
  },
  discount(p, subtotal){ return !p ? 0 : Math.min(subtotal, p.type === 'pct' ? Math.round(subtotal * p.val / 100) : +p.val); },

  // perbarui state lokal dari respons server
  putEvent(e){ const l = this.events(), i = l.findIndex(x => x.id === e.id); i >= 0 ? (l[i] = e) : l.unshift(e); return e; },
  putOrder(o){ const l = this.orders(), i = l.findIndex(x => x.id === o.id); i >= 0 ? (l[i] = o) : l.unshift(o); return o; },
  putPromo(p){ const l = this.promos(), i = l.findIndex(x => x.key === p.key); i >= 0 ? (l[i] = p) : l.unshift(p); return p; },

  // "Tiket Saya" di situs publik: token pesanan disimpan di browser pembeli
  tokens(){ try{ return JSON.parse(localStorage.getItem(this.MINE) || '[]'); }catch(e){ return []; } },
  remember(token){ try{ localStorage.setItem(this.MINE, JSON.stringify([token, ...this.tokens().filter(t => t !== token)].slice(0, 50))); }catch(e){} },
  async loadMine(){ const tokens = this.tokens(); if(tokens.length) this.load().orders = await api('POST', `${ROUTES.api}/orders/mine`, {tokens}); },
  mine(){ return this.orders(); },
};

function ymd(d){ return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const EV_MON = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const EV_DAY = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const evDate = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
function evDateLabel(e, long = true){
  const a = evDate(e.start), b = evDate(e.end);
  const f = d => `${d.getDate()} ${EV_MON[d.getMonth()]} ${d.getFullYear()}`;
  if(e.start === e.end) return long ? `${EV_DAY[a.getDay()]}, ${f(a)}` : f(a);
  return a.getMonth() === b.getMonth() ? `${a.getDate()}–${f(b)}` : `${a.getDate()} ${EV_MON[a.getMonth()]} – ${f(b)}`;
}

// QR tiruan (pola deterministik dari kode tiket) untuk e-tiket — situs & admin
function qrSvg(text, size = 120){
  let h = 2166136261; for(const ch of text){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  const n = 25, cell = size / n, rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
  const finder = (x, y) => `<rect x="${x * cell}" y="${y * cell}" width="${7 * cell}" height="${7 * cell}" fill="#1E1B18"/><rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${5 * cell}" height="${5 * cell}" fill="#fff"/><rect x="${(x + 2) * cell}" y="${(y + 2) * cell}" width="${3 * cell}" height="${3 * cell}" fill="#1E1B18"/>`;
  const inF = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let r = '';
  for(let y = 0; y < n; y++) for(let x = 0; x < n; x++) if(!inF(x, y) && rnd() < .5) r += `<rect x="${x * cell}" y="${y * cell}" width="${cell + .3}" height="${cell + .3}"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR ${String(text).replace(/[<>&"]/g, '')}"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#1E1B18">${r}</g>${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
}
