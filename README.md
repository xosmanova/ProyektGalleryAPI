# Lumina — Foto Qalereya

JSONPlaceholder Photos API əsasında hazırlanmış foto qalereya veb-tətbiqi.

## Xüsusiyyətlər

- **Albomlar üzrə filtr:** 100 müxtəlif albom üzrə şəkillərin çeşidlənməsi.
- **Axtarış və çeşidləmə:** Başlıq və ID üzrə anlıq axtarış, əlifba sırası və ID-yə görə sıralama.
- **Baxış rejimləri:** Qəfəs (Grid), Editorial və Kompakt görünüşlər.
- **Lightbox baxış:** Şəkilləri tam ekranda nəzərdən keçirmək, rəng filtrləri (B&W, Sepia, İsti, Soyuq, Kontrast) və böyütmə (zoom).
- **Sevimlilər:** Bəyənilən fotoların `LocalStorage` vasitəsilə yadda saxlanması.
- **Şəkil endirmə:** Fotoların birbaşa cihaza endirilməsi və link kopyalama.
- **Gecə / Gündüz rejimi:** Dark və Light interfeys seçimi.

## Quraşdırma və İşə Salma

Layihə heç bir əlavə paket tələb etmir:

1. `index.html` faylını brauzerdə açın.
2. Və ya lokal server ilə:
   ```bash
   python -m http.server 3000
   ```
   Ünvan: `http://localhost:3000`

## Texnologiyalar

- HTML5 / CSS3 / JavaScript (ES6+)
- Tailwind CSS
- FontAwesome Icons
- JSONPlaceholder REST API
