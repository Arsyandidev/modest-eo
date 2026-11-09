<!-- NEWSLETTER -->
<section class="blk news">
  <div class="container-x">
    <div class="eyebrow">Newsletter</div>
    <h2 class="mt-2 mb-2">Kabar mode modest, setiap Jumat.</h2>
    <p class="text-muted mb-0" style="font-weight:300">Kurasi cerita fashion, gaya hidup, dan seni pilihan redaksi — langsung ke inbox Anda.</p>
    <form onsubmit="subscribe(event)">
      <input type="email" required placeholder="Alamat email Anda" id="nlEmail">
      <button type="submit">Berlangganan <i class="bi bi-arrow-right ms-1"></i></button>
    </form>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="container-x">
    <div class="row g-4 g-lg-5">
      <div class="col-lg-4">
        <a class="logo" href="{{ route('events.index') }}">modest<span>.</span>id</a>
        <p class="mt-3" style="max-width:340px">Rumah bagi muslimah modern untuk menemukan inspirasi gaya modest, gaya hidup, seni, dan spiritualitas — dikurasi dengan hati.</p>
        <div class="soc mt-4"><a href="javascript:void(0)"><i class="bi bi-instagram"></i></a><a href="javascript:void(0)"><i class="bi bi-tiktok"></i></a><a href="javascript:void(0)"><i class="bi bi-youtube"></i></a><a href="javascript:void(0)"><i class="bi bi-twitter-x"></i></a></div>
      </div>
      <div class="col-6 col-lg-2"><h6>Kanal</h6><div id="footCats"><a href="fashion.html">Fashion</a><a href="lifestyle.html">Lifestyle</a><a href="art-culture.html">Art &amp; Culture</a><a href="iqra.html">Iqra</a><a href="{{ route('events.index') }}">Events</a><a href="catalog.html">Catalog</a><a href="designers.html">Designer Directory</a></div></div>
      <div class="col-6 col-lg-2"><h6>Modest.id</h6><a href="about.html">Tentang Kami</a><a href="javascript:void(0)" onclick="toast('Halaman redaksi segera hadir')">Redaksi</a><a href="javascript:void(0)" onclick="toast('Media kit telah dikirim ke email Anda')">Media Kit</a><a href="javascript:void(0)" onclick="toast('Form kontak segera hadir')">Kontak</a></div>
      <div class="col-lg-4"><h6>Terpopuler</h6><div id="footPop"></div></div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 modest.id — dikelola oleh Modest Creative Team.</span>
      <span>Kebijakan Privasi · Syarat & Ketentuan</span>
    </div>
  </div>
</footer>
