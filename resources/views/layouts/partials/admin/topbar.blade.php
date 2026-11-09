<header class="adm-top">
  <button class="icon-btn d-lg-none" onclick="document.getElementById('side').classList.toggle('open')" aria-label="Menu"><i class="bi bi-list"></i></button>
  <div class="min-w-0"><div class="crumb">@yield('crumb')</div><h1>@yield('title')</h1></div>
  <form class="adm-search ms-auto" onsubmit="globalSearch(event)"><i class="bi bi-search"></i><input class="form-control" name="q" placeholder="Cari invoice, pembeli, kode tiket…"></form>
  <div class="dropdown ms-auto ms-md-0">
    <button class="icon-btn" data-bs-toggle="dropdown" aria-label="Notifikasi"><i class="bi bi-bell"></i></button>
    <ul class="dropdown-menu dropdown-menu-end" style="width:340px"><li class="px-3 py-2 eyebrow">Transaksi Terbaru</li><div id="notifList"></div><li><hr class="dropdown-divider"></li><li><a class="dropdown-item meta" href="{{ route('admin.orders') }}">Lihat semua transaksi</a></li></ul>
  </div>
</header>
