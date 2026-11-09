<?php

namespace App\Enums;

enum OrderSource: string
{
    case Web = 'web';
    case Admin = 'admin'; // transaksi manual / on-site
}
