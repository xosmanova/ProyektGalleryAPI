# 🌌 LUMINA — Yaradıcı Foto Qalereya və Kəşfiyyat Platforması

Bu veb-sayt **[JSONPlaceholder Photos API](https://jsonplaceholder.typicode.com/photos)** (5,000 fotoşəkil) əsasında hazırlanmış, ultra-müasir, estetik və zəngin interaktiv imkanlara malik yaradıcı foto sərgi platformasıdır.

---

## ✨ Kreativ Xüsusiyyətlər və İmkanlar

1. **🎨 Yaradıcı Lightbox Studio (Foto Redaktoru)**
   - **Canlı CSS Filtrləri:** İstənilən fotoya bir kliklə *Noir (B&W)*, *Vintage Sepia*, *Cyberpunk Neon*, *Buz Mavisi (Cold)* və *Negative Invert* filtrləri tətbiq edin.
   - **İnteraktiv Zoom Slider:** Şəkilləri 100%-dən 250%-ə qədər böyüdərək incə detallarına baxın.
   - **Dinamik Ambient Glow:** Lightbox açıldıqda arxa fonda baxılan fotonun yumşaq atmosferik parıltısı yaranır.
   - **Təkbətək və Klaviaturadan İdarəetmə:** Sol (`←`) və Sağ (`→`) oxlarla şəkillər arasında rahat keçid, `ESC` ilə bağlanma.

2. **🎵 Sintetik Ambient Zen Audio & Səs Effektləri**
   - Web Audio API vasitəsilə heç bir xarici audio fayla ehtiyac olmadan fotolara baxarkən dincəldici fon atmosferi yaradan zen akkord generatoru.
   - Sevimlilərə əlavə edərkən və filtrləri dəyişərkən mikro-interaktiv pop səs effektləri.

3. **🖼️ 3 Fərqli Baxış Rejimi (View Modes)**
   - **Standart Qəfəs (Standard Grid):** Müasir 4 sütunlu balanslaşdırılmış görünüş.
   - **Editorial Jurnal Rejimi (Magazine Layout):** Sənət jurnalları üslubunda böyük və kiçik kartların dinamik kombinasiyası.
   - **Kompakt Miniatürlər (Compact Grid):** Çoxlu fotoları bir ekranda sürətli nəzərdən keçirmək üçün sıx grid.

4. **📂 Albom və Kateqoriya İdarəetməsi**
   - 100 müxtəlif albom arasında sürətli filtrasiya.
   - Ən populyar albomlar üçün üfüqi sürüşən interaktiv etiketlər (pills).
   - Bütün 100 albom üçün xüsusi açılan menyu (dropdown).

5. **❤️ Sevimlilər (Favorites) Sistemi**
   - Bəyəndiyiniz fotoları `LocalStorage`-da saxlayır, səhifəni yeniləsəniz belə silinmir.
   - Başlıqda və statistikada canlı sayğac.
   - Tək kliklə yalnız sevdiyiniz fotoları göstərən rejim.

6. **🔍 Canlı Debounce Axtarış və Çeşidləmə**
   - Başlıq və ID nömrəsi üzrə anlıq axtarış.
   - ID artan/azalan, Ad (A-Z / Z-A) və **Təsadüfi Qarışdırma (Shuffle)**.

7. **🎲 "Məni Təəccübləndir" (Surprise Explorer)**
   - 5000 foto içərisindən təsadüfi bir sənət əsərini seçib birbaşa tam ekran studiyada qarşınıza çıxarır.

8. **📥 Şəkli Endirmək (Download) və Link Kopyalamaq**
   - Şəkilləri yüksək keyfiyyətdə və xüsusi fayl adı ilə (`lumina-photo-id.jpg`) birbaşa kompüterinizə endirin.

9. **🌗 Gecə / Gündüz Rejimi (Dark / Light Theme)**
   - *Midnight Luxe* tünd mövzu və *Minimalist Pearl* işıqlı mövzu arasında bir kliklə keçid.

---

## 🚀 Saytı Necə İşə Salmaq Olar?

Heç bir quraşdırma və ya `npm install` tələb olunmur:

1. Qovluqdakı **`index.html`** faylını iki dəfə klikləyərək istənilən brauzerdə (Chrome, Edge, Firefox, Brave) açın.
2. Və ya istəyə uyğun olaraq terminalda qısa server işə sala bilərsiniz:
   ```powershell
   # Python ilə:
   python -m http.server 3000
   ```
   Brauzerdə: `http://localhost:3000`

---

## 🛠️ İstifadə Edilən Texnologiyalar
- **HTML5 & CSS3** (Müasir semantik struktur və Glassmorphism effektləri)
- **Tailwind CSS & Custom Animations** (Responsiv dizayn və rəvan animasiyalar)
- **Vanilla JavaScript (ES6+)** (Təmiz, yüksək performanslı və modulyar kod)
- **Web Audio API** (Səs effektləri və ambient musiqi generatoru)
- **FontAwesome 6 & Google Fonts (Plus Jakarta Sans)**
