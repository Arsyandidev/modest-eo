<?php

namespace Database\Seeders;

use App\Enums\EventCategory;
use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Data contoh Event Studio — port dari evSeed() di mockup JS.
 * Tanggal dihitung relatif terhadap hari seeder dijalankan;
 * s/e = selisih hari dari hari ini, fill = tingkat keterisian tiket.
 */
class EventDemoSeeder extends Seeder
{
    private const EVENTS = [
        ['id' => 'in2motionfest-2026', 'title' => 'IN2MOTIONFEST 2026', 'cat' => 'Fashion Show', 's' => 40, 'e' => 44, 'time' => ['10:00', '21:00'], 'featured' => true,
            'venue' => 'Jakarta Convention Center', 'city' => 'Jakarta', 'address' => 'Jl. Gatot Subroto, Senayan, Jakarta Pusat', 'img' => 'wastra',
            'excerpt' => 'Indonesia International Modest Fashion Festival kembali: lima hari fashion show, eksibisi, talkshow, dan business matching.',
            'desc' => 'IN2MOTIONFEST adalah festival mode modest internasional yang mempertemukan perancang, pelaku industri, dan pencinta mode dari berbagai negara. Tahun ini mengusung tema "One Vision, One Movement", menampilkan lebih dari 200 brand dalam fashion show, eksibisi, talkshow, hingga business matching.',
            'rundown' => [['10.00', 'Pembukaan Eksibisi', 'Hall A & B, lebih dari 200 booth brand modest'], ['13.00', 'Talkshow: Modest Goes Global', 'Bersama perancang dan buyer internasional'], ['16.00', 'Fashion Show Sesi 1', 'Koleksi Raya & Resort'], ['19.00', 'Fashion Show Sesi Malam', 'Show utama perancang tamu']],
            'speakers' => [['Vivi Zubedi', 'Perancang'], ['Khanaan', 'Perancang'], ['Heaven Lights', 'Brand']],
            'tickets' => [['day', 'Day Pass', 75000, 300, .62, 'Akses eksibisi & fashion show untuk 1 hari pilihan'],
                ['full', '5-Day Pass', 250000, 100, .5, 'Akses penuh 5 hari, termasuk talkshow'],
                ['vip', 'VIP Front Row', 750000, 24, .83, 'Kursi baris depan show malam + goodie bag eksklusif']]],
        ['id' => 'modest-talks-wastra', 'title' => 'Modest Talks: Wastra untuk Generasi Baru', 'cat' => 'Talkshow', 's' => 15, 'time' => ['13:00', '17:00'],
            'venue' => 'Galeri Nasional Indonesia', 'city' => 'Jakarta', 'address' => 'Jl. Medan Merdeka Timur No.14, Jakarta Pusat', 'img' => 'iwan',
            'excerpt' => 'Diskusi hangat tentang bagaimana batik, tenun, dan lurik menemukan tempatnya di lemari generasi muda.',
            'desc' => 'Sebuah sore bersama para pelestari dan perancang wastra. Kami membahas proses di balik selembar kain, tantangan regenerasi perajin, dan cara mengenakan wastra dalam gaya modest sehari-hari.',
            'rundown' => [['13.00', 'Registrasi & Welcome Tea', ''], ['13.30', 'Sesi 1: Wastra dan Identitas', ''], ['15.00', 'Sesi 2: Styling Wastra untuk Keseharian', ''], ['16.30', 'Tanya Jawab & Networking', '']],
            'speakers' => [['Batik Danar Hadi', 'Rumah Batik'], ['Nuraini Wastra', 'Studio Tenun'], ['Nadia Rahma', 'Moderator, Redaksi modest.id']],
            'tickets' => [['reg', 'Reguler', 75000, 120, .71, 'Kursi talkshow + welcome tea'],
                ['merch', 'Reguler + Tote Wastra', 175000, 40, .6, 'Termasuk tote bag lurik edisi terbatas']]],
        ['id' => 'hijab-masterclass', 'title' => 'Hijab Styling Masterclass', 'cat' => 'Workshop', 's' => 22, 'time' => ['10:00', '14:00'],
            'venue' => 'Studio modest.id', 'city' => 'Jakarta', 'address' => 'Jl. Kemang Raya No.8, Jakarta Selatan', 'img' => 'tex',
            'excerpt' => 'Kelas kecil 24 peserta: teknik drape pashmina, scarf silk, dan styling untuk acara formal.',
            'desc' => 'Belajar langsung dari stylist berpengalaman dalam kelas yang intim. Setiap peserta mendapatkan satu pashmina voal premium dan sesi foto hasil styling.',
            'rundown' => [['10.00', 'Pengenalan Bahan & Bentuk Wajah', ''], ['11.00', 'Praktik Drape Pashmina', ''], ['12.00', 'Ishoma', ''], ['13.00', 'Styling Formal & Sesi Foto', '']],
            'speakers' => [['Alma Hijab Studio', 'Hijab Stylist']],
            'tickets' => [['seat', 'Peserta', 350000, 24, .92, 'Termasuk pashmina voal premium & makan siang']]],
        ['id' => 'kajian-haya', 'title' => 'Kajian Iqra: Haya\' di Era Digital', 'cat' => 'Kajian', 's' => 0, 'time' => ['09:00', '11:30'],
            'venue' => 'Masjid Cut Meutia', 'city' => 'Jakarta', 'address' => 'Jl. Taman Cut Mutiah No.1, Menteng, Jakarta Pusat', 'img' => 'berkahf',
            'excerpt' => 'Kajian pagi tentang memaknai rasa malu sebagai penjaga martabat di ruang digital yang serba terbuka.',
            'desc' => 'Kajian terbuka untuk umum, khusus muslimah. Membahas adab bermedia sosial, menjaga diri dari riya\', dan menjadikan rasa malu sebagai mahkota. Tersedia area penitipan anak.',
            'rundown' => [['09.00', 'Tilawah & Pembukaan', ''], ['09.20', 'Kajian Utama', ''], ['10.45', 'Tanya Jawab', ''], ['11.15', 'Doa Penutup', '']],
            'speakers' => [['Ustazah Hanum Salsabila', 'Pemateri']],
            'tickets' => [['free', 'Peserta Umum', 0, 200, .74, 'Gratis, wajib registrasi']]],
        ['id' => 'halal-forum-2026', 'title' => 'Indonesia Halal Lifestyle Forum', 'cat' => 'Talkshow', 's' => 33, 'time' => ['08:30', '16:00'],
            'venue' => 'Hotel Mulia Senayan', 'city' => 'Jakarta', 'address' => 'Jl. Asia Afrika, Senayan, Jakarta Pusat', 'img' => 'halal',
            'excerpt' => 'Forum sehari tentang ekosistem halal: fashion, kosmetik, pariwisata, dan keuangan syariah.',
            'desc' => 'Forum yang mempertemukan regulator, pelaku usaha, dan investor untuk membahas peluang industri gaya hidup halal Indonesia di pasar global.',
            'rundown' => [['08.30', 'Registrasi', ''], ['09.30', 'Keynote: Halal Goes Global', ''], ['11.00', 'Panel Fashion & Kosmetik', ''], ['14.00', 'Panel Pariwisata & Keuangan Syariah', '']],
            'speakers' => [['Klamby', 'Panelis'], ['Sekar Ayu', 'Moderator']],
            'tickets' => [['delegate', 'Delegate', 500000, 100, .36, 'Akses semua sesi, makan siang & sertifikat'],
                ['student', 'Mahasiswa', 150000, 60, .55, 'Wajib menunjukkan kartu mahasiswa aktif']]],
        ['id' => 'raya-bazaar-2027', 'title' => 'Modest Raya Bazaar 2027', 'cat' => 'Bazaar', 's' => 110, 'e' => 112, 'time' => ['10:00', '22:00'],
            'venue' => 'Kota Kasablanka Hall', 'city' => 'Jakarta', 'address' => 'Jl. Casablanca Raya Kav.88, Jakarta Selatan', 'img' => 'imfw',
            'excerpt' => 'Tiga hari berburu koleksi Raya dari 150+ label modest lokal, lengkap dengan kuliner halal dan sesi styling.',
            'desc' => 'Bazaar tahunan menjelang Ramadan. Temukan koleksi Raya terbaru, aksesori, dan kebutuhan ibadah dari label-label modest pilihan, plus panggung mini talkshow setiap sore.',
            'rundown' => [['10.00', 'Bazaar Dibuka', ''], ['15.00', 'Mini Talkshow', ''], ['19.30', 'Fashion Parade', '']],
            'speakers' => [['Benang Jarum', 'Tenant Utama'], ['Heaven Lights', 'Tenant Utama']],
            'tickets' => [['early', 'Early Bird', 25000, 300, .48, 'Harga khusus hingga batas waktu', 45],
                ['reg', 'Reguler', 40000, 900, .08, 'Tiket masuk 1 hari']]],
        ['id' => 'art-walk-2027', 'title' => 'Modest Art Walk: Yogyakarta', 'cat' => 'Tur Seni', 's' => 78, 'time' => ['08:00', '18:00'], 'status' => 'draft',
            'venue' => 'Jogja National Museum', 'city' => 'Yogyakarta', 'address' => 'Jl. Prof. Ki Amri Yahya No.1, Yogyakarta', 'img' => 'artjog',
            'excerpt' => 'Tur seni sehari mengunjungi galeri dan studio seniman di Yogyakarta bersama kurator.',
            'desc' => 'Perjalanan sehari menyusuri ruang seni Yogyakarta: galeri kontemporer, studio seniman, dan pusat kerajinan, dipandu langsung oleh kurator.',
            'rundown' => [['08.00', 'Berkumpul di Jogja National Museum', ''], ['10.00', 'Kunjungan Studio Seniman', ''], ['13.00', 'Makan Siang', ''], ['14.30', 'Tur Galeri Kontemporer', '']],
            'speakers' => [['Aulia Putri', 'Kurator Tamu']],
            'tickets' => [['tour', 'Tur + Transport', 450000, 30, 0, 'Transport, makan siang & tiket masuk galeri']]],
        ['id' => 'muffest-2025-closing', 'title' => 'MUFFEST++ Closing Show', 'cat' => 'Fashion Show', 's' => -120, 'time' => ['15:00', '21:00'],
            'venue' => 'Jakarta Convention Center', 'city' => 'Jakarta', 'address' => 'Jl. Gatot Subroto, Senayan, Jakarta Pusat', 'img' => 'muffest',
            'excerpt' => 'Show pamungkas dengan ragam gaya dari masculine hingga cottagecore inspired.',
            'desc' => 'Show penutup yang menampilkan koleksi dari Sofie, Irna La Perle, REBORN29, Jenna & Kaia, dan banyak lagi.',
            'rundown' => [['15.00', 'Open Gate', ''], ['16.00', 'Show Sesi 1', ''], ['19.00', 'Closing Show', '']],
            'speakers' => [['Sofie', 'Perancang'], ['Jenna & Kaia', 'Perancang']],
            'tickets' => [['reg', 'Reguler', 100000, 300, .93, 'Kursi tribun'],
                ['vip', 'VIP', 400000, 40, 1, 'Kursi baris depan']]],
        ['id' => 'reborn29-show', 'title' => 'REBORN29: The Whisper of Grace', 'cat' => 'Fashion Show', 's' => -62, 'time' => ['19:00', '21:00'],
            'venue' => 'The Apurva Kempinski', 'city' => 'Bali', 'address' => 'Jl. Raya Nusa Dua Selatan, Bali', 'img' => 'reborn',
            'excerpt' => 'Peluncuran koleksi musim gugur/musim dingin REBORN29 dalam show intim di tepi pantai.',
            'desc' => 'Malam peluncuran koleksi dengan lapisan wol ringan dan tekstur rajut, ditutup dengan makan malam bersama.',
            'rundown' => [['19.00', 'Welcome Drink', ''], ['19.45', 'Show', ''], ['20.30', 'Dinner', '']],
            'speakers' => [['REBORN29', 'Perancang']],
            'tickets' => [['pass', 'Show Pass', 150000, 150, .88, 'Show + welcome drink']]],
    ];

    private const FIRST = ['Aisyah', 'Nadia', 'Salsabila', 'Hanum', 'Zahra', 'Aulia', 'Khadijah', 'Rania', 'Syifa', 'Nabila', 'Fatimah', 'Alya', 'Dinda', 'Putri', 'Sekar', 'Maryam', 'Annisa', 'Laila', 'Tiara', 'Kirana', 'Rahma', 'Hafsah', 'Inara', 'Naura'];

    private const LAST = ['Rahmawati', 'Putri', 'Hasanah', 'Azzahra', 'Lestari', 'Maharani', 'Salsabila', 'Nurhaliza', 'Wulandari', 'Kusuma', 'Pratiwi', 'Ramadhani', 'Fitriani', 'Anggraini', 'Safitri', 'Hidayah'];

    private const PAYMENTS = ['VA BCA', 'VA Mandiri', 'GoPay', 'OVO', 'QRIS', 'Kartu Kredit'];

    private const FEE = 5000;

    // hapus semua data event (dipakai "Reset Data Demo"); akun user tidak disentuh
    public function wipe(): void
    {
        DB::transaction(function () {
            foreach (['attendees', 'order_items', 'orders', 'promos', 'ticket_types', 'event_sessions', 'event_speakers', 'events'] as $table) {
                DB::table($table)->delete();
            }
        });
    }

    public function run(): void
    {
        mt_srand(20261031); // deterministik, seperti seed di mockup
        $today = today();
        $day = fn (int $offset) => $today->copy()->addDays($offset);

        DB::transaction(function () use ($today, $day) {
            $events = [];
            $tickets = []; // [slug][key] => TicketType

            foreach (self::EVENTS as $src) {
                $created = $day(min($src['s'], 0) - 60);
                $event = Event::create([
                    'slug' => $src['id'],
                    'title' => $src['title'],
                    'category' => EventCategory::fromLabel($src['cat']),
                    'excerpt' => $src['excerpt'],
                    'description' => $src['desc'],
                    'banner' => $src['img'],
                    'start_date' => $day($src['s']),
                    'end_date' => $day($src['e'] ?? $src['s']),
                    'start_time' => $src['time'][0],
                    'end_time' => $src['time'][1],
                    'venue' => $src['venue'],
                    'city' => $src['city'],
                    'address' => $src['address'],
                    'status' => $src['status'] ?? 'published',
                    'is_featured' => $src['featured'] ?? false,
                ]);
                $event->forceFill(['created_at' => $created, 'updated_at' => $created])->save();

                foreach ($src['rundown'] as $i => [$time, $title, $desc]) {
                    $event->sessions()->create(['time' => $time, 'title' => $title, 'description' => $desc ?: null, 'sort_order' => $i]);
                }
                foreach ($src['speakers'] as $i => [$name, $role]) {
                    $event->speakers()->create(['name' => $name, 'role' => $role, 'sort_order' => $i]);
                }
                foreach ($src['tickets'] as $i => $t) {
                    $tickets[$src['id']][$t[0]] = $event->ticketTypes()->create([
                        'name' => $t[1], 'price' => $t[2], 'quota' => $t[3], 'description' => $t[5],
                        'sale_ends_at' => isset($t[6]) ? $day($t[6]) : null, 'sort_order' => $i,
                    ]);
                }
                $events[$src['id']] = $event;
            }

            $promos = [
                ['MODEST10', 'percent', 10, 300, null, 60, true],
                ['IN2MOTION25', 'fixed', 25000, 80, 'in2motionfest-2026', 30, true],
                ['WASTRA20', 'percent', 20, 40, 'modest-talks-wastra', 10, true],
                ['RAYAEARLY', 'fixed', 5000, 150, 'raya-bazaar-2027', 45, false],
            ];
            $promoIds = [];
            foreach ($promos as [$code, $type, $value, $quota, $ev, $until, $active]) {
                $promoIds[$code] = DB::table('promos')->insertGetId([
                    'code' => $code, 'type' => $type, 'value' => $value, 'quota' => $quota, 'event_id' => $ev ? $events[$ev]->id : null,
                    'valid_until' => $day($until)->toDateString(), 'is_active' => $active, 'created_at' => now(), 'updated_at' => now(),
                ]);
            }

            $orders = $this->generateOrders($events, $tickets, $promos, $today);
            $this->insertOrders($orders, $promoIds);
        });
    }

    private function generateOrders(array $events, array $tickets, array $promos, Carbon $today): array
    {
        $orders = [];
        $usedCodes = [];

        foreach (self::EVENTS as $src) {
            $event = $events[$src['id']];
            $past = $event->end_date->lt($today);
            $live = $event->start_date->lte($today) && ! $past;

            foreach ($src['tickets'] as [$key, , $price, $quota, $fill]) {
                $ticket = $tickets[$src['id']][$key];
                $target = (int) round($quota * $fill);
                $sold = 0;

                while ($sold < $target) {
                    $qty = min($target - $sold, $this->pick([1, 1, 1, 2, 2, 3]));
                    $back = $past
                        ? (int) floor($this->rnd() * 40) + ($today->gt($event->start_date) ? (int) $event->start_date->diffInDays($today) : 0)
                        : (int) floor(pow($this->rnd(), 1.4) * 45);
                    $at = $today->copy()->subDays($back)->setTime(7 + (int) floor($this->rnd() * 15), (int) floor($this->rnd() * 60));
                    if ($at->isFuture()) { // pesanan "hari ini" tidak boleh melewati waktu sekarang
                        $at = now()->subMinutes(5 + (int) floor($this->rnd() * 120));
                    }

                    $r = $this->rnd();
                    $status = 'paid';
                    if (! $past && $back <= 1 && $r < .35 && $price) {
                        $status = 'pending';
                    } elseif ($r < .04) {
                        $status = 'cancelled';
                    } elseif ($r < .06 && $price) {
                        $status = 'refunded';
                    }

                    $promo = $price && $this->rnd() < .15
                        ? ($src['id'] === 'in2motionfest-2026' && $this->rnd() < .5 ? $promos[1] : $promos[0])
                        : null;
                    $sub = $price * $qty;
                    $disc = $promo ? min($sub, $promo[1] === 'percent' ? (int) round($sub * $promo[2] / 100) : $promo[2]) : 0;
                    $fee = $sub ? self::FEE : 0;

                    $first = $this->pick(self::FIRST);
                    $last = $this->pick(self::LAST);
                    $attendees = [];
                    for ($i = 0; $i < $qty; $i++) {
                        $checked = $status === 'paid' && ($past ? $this->rnd() < .87 : ($live ? $this->rnd() < .45 : false));
                        do {
                            $code = 'MDS-'.strtoupper(Str::padLeft(base_convert((string) mt_rand(0, 36 ** 6 - 1), 10, 36), 6, '7'));
                        } while (isset($usedCodes[$code]));
                        $usedCodes[$code] = true;

                        $attendees[] = [
                            'code' => $code,
                            'name' => $i ? $this->pick(self::FIRST).' '.$this->pick(self::LAST) : "{$first} {$last}",
                            'in' => $checked ? $event->start_date->copy()->setTime(8 + (int) floor($this->rnd() * 3), (int) floor($this->rnd() * 60)) : null,
                        ];
                    }

                    $orders[] = [
                        'event' => $event, 'ticket' => $ticket, 'qty' => $qty, 'at' => $at, 'status' => $status,
                        'name' => "{$first} {$last}",
                        'email' => strtolower("{$first}.{$last}").$this->pick(['@gmail.com', '@yahoo.co.id', '@outlook.com']),
                        'phone' => '08'.(1100000000 + (int) floor($this->rnd() * 8.8e9)),
                        'promo' => $promo[0] ?? null, 'sub' => $sub, 'disc' => $disc, 'fee' => $fee, 'total' => $sub - $disc + $fee,
                        'pay' => $price ? $this->pick(self::PAYMENTS) : 'Gratis', 'attendees' => $attendees,
                    ];

                    if ($status !== 'cancelled' && $status !== 'refunded') {
                        $sold += $qty;
                    }
                }
            }
        }

        usort($orders, fn ($a, $b) => $a['at'] <=> $b['at']);

        return $orders;
    }

    private function insertOrders(array $orders, array $promoIds): void
    {
        foreach ($orders as $n => $o) {
            $at = $o['at'];
            $orderId = DB::table('orders')->insertGetId([
                'invoice_number' => 'INV-'.$at->format('ym').'-'.str_pad((string) ($n + 1), 4, '0', STR_PAD_LEFT),
                'access_token' => Str::random(40),
                'event_id' => $o['event']->id,
                'buyer_name' => $o['name'],
                'buyer_email' => $o['email'],
                'buyer_phone' => $o['phone'],
                'promo_id' => $o['promo'] ? $promoIds[$o['promo']] : null,
                'promo_code' => $o['promo'],
                'subtotal' => $o['sub'],
                'discount' => $o['disc'],
                'service_fee' => $o['fee'],
                'total' => $o['total'],
                'payment_method' => $o['pay'],
                'status' => $o['status'],
                'source' => 'web',
                'expires_at' => $o['status'] === 'pending' ? $at->copy()->addDay() : null,
                'paid_at' => in_array($o['status'], ['paid', 'refunded'], true) ? $at : null,
                'cancelled_at' => $o['status'] === 'cancelled' ? $at->copy()->addHours(6) : null,
                'refunded_at' => $o['status'] === 'refunded' ? $at->copy()->addDays(2) : null,
                'refund_reason' => $o['status'] === 'refunded' ? 'Permintaan pembeli' : null,
                'created_at' => $at,
                'updated_at' => $at,
            ]);

            $itemId = DB::table('order_items')->insertGetId([
                'order_id' => $orderId, 'ticket_type_id' => $o['ticket']->id, 'ticket_name' => $o['ticket']->name,
                'unit_price' => $o['ticket']->price, 'quantity' => $o['qty'], 'created_at' => $at, 'updated_at' => $at,
            ]);

            DB::table('attendees')->insert(array_map(fn ($a) => [
                'order_id' => $orderId, 'order_item_id' => $itemId, 'ticket_type_id' => $o['ticket']->id, 'event_id' => $o['event']->id,
                'ticket_code' => $a['code'], 'name' => $a['name'], 'checked_in_at' => $a['in'], 'created_at' => $at, 'updated_at' => $at,
            ], $o['attendees']));
        }
    }

    private function rnd(): float
    {
        return mt_rand() / (mt_getrandmax() + 1);
    }

    private function pick(array $items): mixed
    {
        return $items[(int) floor($this->rnd() * count($items))];
    }
}
