<!-- TOPBAR -->
<div class="topbar">
  <div class="container-x">
    <span id="today"></span>
    <div class="d-none d-sm-flex gap-4">
      <a href="about.html">About</a><a href="designers.html">Designer Directory</a><a href="javascript:void(0)" onclick="openMyTickets()">Tiket Saya</a><a href="javascript:void(0)" onclick="openSaved()">Bacaan Tersimpan</a>
    </div>
  </div>
</div>

<!-- MASTHEAD -->
<header class="masthead">
  <a class="logo" href="{{ route('events.index') }}">modest<span>.</span>id</a>
  <div class="tagline">style modestly, live faithfully</div>
</header>

<!-- NAV -->
<nav id="nav">
  <div class="container-x">
    <button class="icon-btn d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#mnav" aria-label="Menu"><i class="bi bi-list"></i></button>
    <a class="nav-logo" href="{{ route('events.index') }}">modest<span class="text-gold">.</span>id</a>
    <ul class="nav-links" id="navLinks">
      <li><a href="{{ route('events.index') }}" data-nav="">Home</a></li>
      <li><a href="fashion.html" data-nav="fashion">Fashion</a></li>
      <li><a href="lifestyle.html" data-nav="lifestyle">Lifestyle</a></li>
      <li><a href="art-culture.html" data-nav="art">Art &amp; Culture</a></li>
      <li><a href="iqra.html" data-nav="iqra">Iqra</a></li>
      <li><a href="{{ route('events.index') }}" data-nav="events" class="active">Events</a></li>
      <li><a href="catalog.html" data-nav="catalog">Catalog</a></li>
      <li><a href="designers.html" data-nav="designers">Designer Directory</a></li>
    </ul>
    <div class="d-flex gap-1 ms-auto ms-lg-0">
      <button class="icon-btn" onclick="openSearch()" aria-label="Cari"><i class="bi bi-search"></i></button>
      <button class="icon-btn" onclick="openSaved()" aria-label="Tersimpan"><i class="bi bi-bookmark"></i><span class="dot d-none" id="savedCount">0</span></button>
      <button class="icon-btn" onclick="openCart()" aria-label="Keranjang"><i class="bi bi-bag"></i><span class="dot d-none" id="cartCount">0</span></button>
    </div>
  </div>
</nav>

<!-- MOBILE NAV -->
<div class="offcanvas offcanvas-start" tabindex="-1" id="mnav">
  <div class="offcanvas-header px-4 pt-4">
    <span class="logo" style="font-size:32px">modest<span>.</span>id</span>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
  </div>
  <div class="offcanvas-body px-4 mnav" id="mnavLinks">
    <a href="{{ route('events.index') }}" data-nav="">Home</a>
    <a href="fashion.html" data-nav="fashion">Fashion</a>
    <a href="lifestyle.html" data-nav="lifestyle">Lifestyle</a>
    <a href="art-culture.html" data-nav="art">Art &amp; Culture</a>
    <a href="iqra.html" data-nav="iqra">Iqra</a>
    <a href="{{ route('events.index') }}" data-nav="events" class="active">Events</a>
    <a href="catalog.html" data-nav="catalog">Catalog</a>
    <a href="designers.html" data-nav="designers">Designer Directory</a>
  </div>
</div>
