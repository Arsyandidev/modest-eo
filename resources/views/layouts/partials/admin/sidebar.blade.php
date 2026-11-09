@php
  $menu = [
    ['admin.dashboard', 'bi-grid-1x2', 'Dashboard'],
    ['admin.events', 'bi-calendar-event', 'Events'],
    ['admin.orders', 'bi-receipt', 'Transaksi'],
    ['admin.attendees', 'bi-person-check', 'Peserta & Check-in'],
    ['admin.promos', 'bi-ticket-perforated', 'Promo'],
  ];
@endphp
<!-- SIDEBAR -->
<aside class="adm-side" id="side">
  <div class="adm-brand"><a class="logo" href="{{ route('admin.dashboard') }}">modest<span>.</span>id</a><small>Event Studio</small></div>
  <nav class="adm-nav">
    <div class="grp">Menu</div>
    @foreach ($menu as [$route, $icon, $label])
      <a href="{{ route($route) }}" @class(['active' => request()->routeIs($route)])><i class="bi {{ $icon }}"></i>{{ $label }}@if ($route === 'admin.orders')<span class="count d-none" id="pendingBadge">0</span>@endif</a>
    @endforeach
    <div class="grp">Lainnya</div>
    <a href="{{ route('events.index') }}" target="_blank"><i class="bi bi-box-arrow-up-right"></i>Lihat Situs</a>
    @if (app()->isLocal())
      <a href="javascript:void(0)" onclick="resetDemo()"><i class="bi bi-arrow-repeat"></i>Reset Data Demo</a>
    @endif
  </nav>
  <div class="adm-user">
    <div class="avatar" id="adminInitial">{{ mb_substr(auth()->user()->name, 0, 1) }}</div>
    <div class="min-w-0 flex-grow-1"><div class="text-truncate" id="adminName">{{ auth()->user()->name }}</div><div class="meta">{{ auth()->user()->isAdmin() ? 'Event Manager' : 'Staff Check-in' }}</div></div>
    <form method="POST" action="{{ route('admin.logout') }}" id="logoutForm">
      @csrf
      <button class="icon-btn" title="Keluar"><i class="bi bi-box-arrow-right"></i></button>
    </form>
  </div>
</aside>
