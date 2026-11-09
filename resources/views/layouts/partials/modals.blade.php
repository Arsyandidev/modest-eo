<!-- SEARCH -->
<div id="search">
  <div class="container-x py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <span class="eyebrow">Cari di modest.id</span>
      <button class="icon-btn" onclick="closeSearch()"><i class="bi bi-x-lg"></i></button>
    </div>
    <input id="q" placeholder="Ketik kata kunci…" autocomplete="off">
    <div class="mt-3 d-flex flex-wrap gap-2" id="qSuggest"></div>
    <div class="mt-4" id="qResult"></div>
  </div>
</div>

<!-- SAVED -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="saved" style="width:420px">
  <div class="offcanvas-header px-4 pt-4 border-bottom">
    <div><div class="eyebrow">Koleksi Anda</div><h4 class="serif fw-semibold m-0" style="font-size:28px">Bacaan Tersimpan</h4></div>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body px-4" id="savedList"></div>
</div>

<!-- CART -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="cart" style="width:440px">
  <div class="offcanvas-header px-4 pt-4 border-bottom">
    <div><div class="eyebrow">Belanja</div><h4 class="serif fw-semibold m-0" style="font-size:28px">Keranjang</h4></div>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body px-4 d-flex flex-column" id="cartBody"></div>
</div>

<!-- MY TICKETS -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="myTickets" style="width:420px">
  <div class="offcanvas-header px-4 pt-4 border-bottom">
    <div><div class="eyebrow">Events</div><h4 class="serif fw-semibold m-0" style="font-size:28px">Tiket Saya</h4></div>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body px-4" id="myTicketsBody"></div>
</div>

<!-- DESIGNER MODAL -->
<div class="modal fade" id="dModal" tabindex="-1"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content" id="dModalBody"></div></div></div>

<div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
  <div id="toast" class="toast align-items-center" role="status"><div class="d-flex"><div class="toast-body" id="toastMsg"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>
</div>
<button class="to-top" id="toTop" onclick="scrollTo({top:0})"><i class="bi bi-arrow-up"></i></button>
