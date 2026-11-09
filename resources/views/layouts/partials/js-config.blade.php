<script>
  // konfigurasi dari Laravel untuk script mockup
  window.ASSET_BASE = @json(asset('assets') . '/');
  window.ROUTES = {
    events: @json(route('events.index')),
    event: @json(route('events.show')),
    api: @json(url('api')),
    adminApi: @json(url('admin/api')),
    admin: {
      dashboard: @json(route('admin.dashboard')),
      events: @json(route('admin.events')),
      orders: @json(route('admin.orders')),
      attendees: @json(route('admin.attendees')),
      promos: @json(route('admin.promos')),
      login: @json(route('admin.login')),
    },
  };
  // data awal (event, transaksi, promo) — pengganti localStorage
  window.EV_BOOT = @json($evBoot ?? null);
  window.ADMIN = @json(auth()->user()?->only('name', 'role'));
</script>
