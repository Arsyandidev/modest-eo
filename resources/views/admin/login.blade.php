@extends('layouts.admin')

@section('title', 'Masuk')
@section('page', 'login')

@section('content')
<div class="login">
  <div class="art">
    <div class="ph"><img src="{{ asset('assets/img/uploads/article/thumbnail-gaya-kini-wastra-dari-sekolah-mode-di-in2motionfest-2025-1761101657.jpg') }}" alt="" onerror="this.remove()"></div>
    <div class="cap"><div class="eyebrow" style="color:#E7D2B0">Event Studio</div><h2 class="serif fw-semibold mt-2" style="font-size:44px; line-height:1.05">Kelola setiap agenda,<br><i>dari tiket hingga hari H.</i></h2></div>
  </div>
  <div class="d-flex align-items-center justify-content-center p-4" style="background:var(--paper)">
    <form method="POST" action="{{ route('admin.login') }}">
      @csrf
      <a class="logo" href="{{ route('events.index') }}" style="font-size:44px">modest<span>.</span>id</a>
      <div class="eyebrow mt-1 mb-4">Event Studio · Admin</div>
      <h3 class="serif fw-semibold" style="font-size:32px">Masuk ke dashboard</h3>
      <p class="text-muted mb-4" style="font-weight:300">Gunakan akun tim modest.id Anda.</p>
      @error('email')<div class="scan-res bad mb-3 py-2"><i class="bi bi-x-octagon-fill"></i><div>{{ $message }}</div></div>@enderror
      <label class="meta mb-1">Email</label><input class="form-control mb-3" type="email" name="email" required autofocus value="{{ old('email') }}">
      <div class="d-flex justify-content-between"><label class="meta mb-1">Kata Sandi</label><a class="meta" href="javascript:void(0)" onclick="toast('Tautan reset kata sandi dikirim ke email Anda')">Lupa kata sandi?</a></div>
      <input class="form-control mb-3" type="password" name="password" required>
      <label class="f-check mb-4"><input type="checkbox" name="remember" value="1" checked>Ingat saya di perangkat ini</label>
      <button class="btn btn-ink w-100">Masuk</button>
      @if (app()->isLocal())
        <div class="meta text-center mt-4">Akun demo: nadia.rahma@modest.id / mockup123</div>
      @endif
    </form>
  </div>
</div>
<div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3"><div id="toast" class="toast align-items-center" role="status"><div class="d-flex"><div class="toast-body" id="toastMsg"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div></div>
@endsection
