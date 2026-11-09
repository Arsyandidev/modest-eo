<?php

namespace App\Enums;

enum EventCategory: string
{
    case FashionShow = 'fashion-show';
    case Talkshow = 'talkshow';
    case Workshop = 'workshop';
    case Bazaar = 'bazaar';
    case Kajian = 'kajian';
    case TurSeni = 'tur-seni';

    public function label(): string
    {
        return match ($this) {
            self::FashionShow => 'Fashion Show',
            self::Talkshow => 'Talkshow',
            self::Workshop => 'Workshop',
            self::Bazaar => 'Bazaar',
            self::Kajian => 'Kajian',
            self::TurSeni => 'Tur Seni',
        };
    }

    public static function labels(): array
    {
        return array_map(fn (self $c) => $c->label(), self::cases());
    }

    public static function fromLabel(string $label): self
    {
        foreach (self::cases() as $case) {
            if ($case->label() === $label) {
                return $case;
            }
        }

        throw new \ValueError("Kategori tidak dikenal: {$label}");
    }
}
