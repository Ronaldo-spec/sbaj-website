<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#1d2775">
    <meta name="description"
        content="Website demonstrasi budidaya dan pemasok kepiting. Konten bisnis akan dilengkapi setelah verifikasi klien.">
    <title>{{ $site['brand_name'] }} | Budidaya & Supplier Kepiting</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>

<body>
    <a class="skip-link" href="#tentang">Lewati navigasi ke konten utama</a>
    <header class="site-header" id="site-header">
        <div class="nav-shell">
            <a class="brand" href="#profil" aria-label="Kembali ke bagian atas">
                <img src="{{ asset('images/logo.png') }}" alt="Logo SBAJ Farm" class="brand-logo" width="48"
                    height="48">
                <path d="M4 19.5c5-5 9-5 14 0s7 5 10 1" stroke="currentColor" stroke-width="2.8"
                    stroke-linecap="round" />
                <path d="M4 25c5-5 9-5 14 0s7 5 10 1" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" />
                <path d="M13 5l-3 7M19 5l3 7M13 10h6" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" />
                </svg>
                <span>{{ $site['brand_name'] }}</span>
            </a>

            <nav class="desktop-nav" aria-label="Navigasi utama">
                @foreach ($site['navigation'] as $item)
                    <a href="#{{ $item['target'] }}">{{ $item['label'] }}</a>
                @endforeach
            </nav>

            <button type="button" class="menu-toggle" id="menu-toggle" aria-label="Buka menu"
                aria-controls="mobile-nav" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
        <nav class="mobile-nav" id="mobile-nav" aria-label="Navigasi mobile" hidden>
            @foreach ($site['navigation'] as $item)
                <a href="#{{ $item['target'] }}">{{ $item['label'] }}</a>
            @endforeach
        </nav>
    </header>

    <main>
        <section id="profil" class="hero" data-carousel aria-label="Galeri utama usaha">
            @foreach ($site['hero_slides'] as $slide)
                <article class="hero-slide {{ $loop->first ? 'is-active' : '' }}" data-slide
                    aria-hidden="{{ $loop->first ? 'false' : 'true' }}">
                    <img src="{{ asset($slide['image']) }}" alt="{{ $slide['alt'] }}"
                        style="--hero-position: {{ $slide['position'] }}; --hero-mobile-position: {{ $slide['mobile_position'] ?? $slide['position'] }}"
                        @if ($loop->first) fetchpriority="high" @endif>
                    <div class="hero-shade" aria-hidden="true"></div>
                    @if (!empty($slide['title']) || !empty($slide['subtitle']))
                        <div class="hero-caption">
                            @if (!empty($slide['title']))
                                @if ($loop->first)
                                    <h1>{{ $slide['title'] }}</h1>
                                @else
                                    <h2>{{ $slide['title'] }}</h2>
                                @endif
                            @endif
                            @if (!empty($slide['subtitle']))
                                <p>{{ $slide['subtitle'] }}</p>
                            @endif
                        </div>
                    @endif
                </article>
            @endforeach

            <div class="hero-pagination" role="group" aria-label="Pilih foto slideshow">
                @foreach ($site['hero_slides'] as $slide)
                    <button type="button" class="hero-dot {{ $loop->first ? 'is-active' : '' }}"
                        data-slide-to="{{ $loop->index }}"
                        aria-label="Tampilkan foto {{ $loop->iteration }} dari {{ count($site['hero_slides']) }}"
                        @if ($loop->first) aria-current="true" @endif></button>
                @endforeach
            </div>
            <a href="#tentang" class="scroll-hint" aria-label="Gulir ke informasi usaha">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </a>
        </section>

        <section class="section section-intro" id="tentang">
            <div class="container intro-layout">
                <div>
                    <span class="eyebrow">Tentang Kami</span>
                    <h2>Berawal dari budidaya. Siap membangun kemitraan.</h2>
                </div>
                <div>
                    <p>Ini adalah contoh tampilan company profile untuk usaha budidaya dan penjualan kepiting. Profil
                        resmi, lokasi, serta deskripsi operasional akan diisi setelah memperoleh informasi dari klien.
                    </p>
                    <a class="text-link" href="#produk">Jelajahi produk <span aria-hidden="true">↗</span></a>
                </div>
            </div>
        </section>

        <section class="section section-light" id="produk">
            <div class="container">
                <span class="eyebrow">Pilihan Produk</span>
                <div class="section-heading">
                    <h2>Katalog Produk</h2>
                    <p>Contoh kartu katalog. Nama, grade, ukuran, dan ketersediaan harus dikonfirmasi terlebih dahulu.
                    </p>
                </div>
                <div class="product-grid">
                    <article class="product-card">
                        <img src="{{ asset('images/hero/hero-01.webp') }}" alt="Visual demonstrasi kepiting"
                            loading="lazy">
                        <div class="product-content"><span class="card-meta">PRODUK DEMO 01</span>
                            <h3>Kepiting — Contoh Produk</h3>
                            <p>Spesifikasi dan ukuran menyusul konfirmasi.</p><a href="#kontak" class="text-link">Tanya
                                produk ↗</a>
                        </div>
                    </article>
                    <article class="product-card">
                        <img src="{{ asset('images/hero/hero-03.webp') }}" alt="Visual demonstrasi sortir kepiting"
                            loading="lazy">
                        <div class="product-content"><span class="card-meta">PRODUK DEMO 02</span>
                            <h3>Penawaran Pasokan</h3>
                            <p>MOQ dan wilayah distribusi akan dilengkapi.</p><a href="#kontak" class="text-link">Tanya
                                penawaran ↗</a>
                        </div>
                    </article>
                </div>
            </div>
        </section>

        <section class="section section-dark" id="budidaya">
            <div class="container story-layout">
                <div>
                    <span class="eyebrow">Budidaya</span>
                    <h2>Cerita di balik sumber pasokan.</h2>
                    <p>Section ini nantinya menjelaskan proses budidaya aktual, pengelolaan kualitas, dan tahapan
                        operasional yang telah diverifikasi bersama klien.</p>
                </div>
                <img src="{{ asset('images/hero/hero-02.webp') }}" alt="Ilustrasi area pesisir" loading="lazy">
            </div>
        </section>

        <section class="section section-light" id="galeri">
            <div class="container">
                <span class="eyebrow">Dokumentasi</span>
                <div class="section-heading">
                    <h2>Galeri Usaha</h2>
                    <p>Foto sementara untuk menguji tampilan galeri. Bukan foto usaha klien.</p>
                </div>
                <div class="gallery-grid">
                    @foreach ($site['hero_slides'] as $slide)
                        <figure><img src="{{ asset($slide['image']) }}" alt="{{ $slide['alt'] }}" loading="lazy">
                            <figcaption>{{ $slide['title'] }}</figcaption>
                        </figure>
                    @endforeach
                </div>
            </div>
        </section>

        <section class="section section-news" id="informasi">
            <div class="container news-layout">
                <div><span class="eyebrow">Informasi</span>
                    <h2>Kabar & Pembaruan</h2>
                </div>
                <div class="news-placeholder"><span class="card-meta">COMING SOON</span>
                    <h3>Informasi usaha akan ditampilkan di sini.</h3>
                    <p>Untuk tahap pertama, belum ada berita yang diterbitkan.</p>
                </div>
            </div>
        </section>

        <section class="section section-contact" id="kontak">
            <div class="container contact-layout">
                <div><span class="eyebrow">Kontak</span>
                    <h2>Mari membicarakan kebutuhan pasokan Anda.</h2>
                    <p>Informasi resmi kontak, lokasi, dan metode pemesanan akan diisi saat data klien tersedia.</p>
                </div>
                <div class="contact-panel">
                    <span class="contact-label">{{ $site['brand_name'] }}</span>
                    <p>Nomor WhatsApp:
                        <strong>{{ !empty($site['whatsapp_number']) ? '+' . $site['whatsapp_number'] : 'Belum dikonfigurasi' }}</strong>
                    </p>
                    <p>Alamat usaha: <strong>Menunggu data klien</strong></p>
                    <p>Jam operasional: <strong>Menunggu data klien</strong></p>
                </div>
            </div>
        </section>
    </main>

    @php
        $waNumber = preg_replace('/\D+/', '', $site['whatsapp_number'] ?? '');
        $waMessage = rawurlencode($site['whatsapp_message'] ?? 'Halo, saya ingin menghubungi usaha Anda.');
    @endphp
    @if ($waNumber)
        <a class="whatsapp-fab" href="https://wa.me/{{ $waNumber }}?text={{ $waMessage }}" target="_blank"
            rel="noopener noreferrer" aria-label="Hubungi melalui WhatsApp" title="Hubungi melalui WhatsApp">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </a>
    @else
        <span class="whatsapp-fab is-disabled" aria-label="WhatsApp belum dikonfigurasi"
            title="Isi nomor WhatsApp di config/website.php">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
                <path
                    d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
                    stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </span>
    @endif

    <footer class="footer">
        <div class="container">© {{ date('Y') }} {{ $site['brand_name'] }} · Website demonstrasi</div>
    </footer>
</body>

</html>
