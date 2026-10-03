/**
 * LUMINA Gallery - Creative Photo Experience
 * Powered by JSONPlaceholder Photos API
 */

// State Management
const state = {
  allPhotos: [],
  filteredPhotos: [],
  currentPage: 1,
  pageSize: 24,
  activeAlbum: 'all', // 'all', number, or 'favorites'
  searchQuery: '',
  sortBy: 'id-asc',
  viewMode: 'grid', // 'grid', 'editorial', 'compact'
  favorites: new Set(JSON.parse(localStorage.getItem('lumina_favorites') || '[]')),
  currentModalIndex: -1,
  currentModalPhoto: null,
  activeFilter: 'normal',
  zoomLevel: 100,
  isSoundActive: false,
  audioCtx: null,
  ambientOscillators: []
};

// DOM Elements
const DOM = {
  galleryGrid: document.getElementById('galleryGrid'),
  gallerySkeleton: document.getElementById('gallerySkeleton'),
  skeletonCardTpl: document.getElementById('skeletonCardTpl'),
  emptyState: document.getElementById('emptyState'),
  loadMoreContainer: document.getElementById('loadMoreContainer'),
  loadMoreBtn: document.getElementById('loadMoreBtn'),
  loadedCountText: document.getElementById('loadedCountText'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  albumSelectDropdown: document.getElementById('albumSelectDropdown'),
  albumPillsContainer: document.getElementById('albumPillsContainer'),
  sortSelect: document.getElementById('sortSelect'),
  resetFiltersBtn: document.getElementById('resetFiltersBtn'),
  viewGridBtn: document.getElementById('viewGridBtn'),
  viewEditorialBtn: document.getElementById('viewEditorialBtn'),
  viewCompactBtn: document.getElementById('viewCompactBtn'),
  statTotalCount: document.getElementById('statTotalCount'),
  statLoadedCount: document.getElementById('statLoadedCount'),
  statActiveAlbum: document.getElementById('statActiveAlbum'),
  statLikedCount: document.getElementById('statLikedCount'),
  favoritesBadge: document.getElementById('favoritesBadge'),
  favoritesToggleBtn: document.getElementById('favoritesToggleBtn'),
  surpriseBtn: document.getElementById('surpriseBtn'),
  logoBtn: document.getElementById('logoBtn'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  themeIcon: document.getElementById('themeIcon'),
  ambientSoundBtn: document.getElementById('ambientSoundBtn'),
  soundIcon: document.getElementById('soundIcon'),
  // Lightbox Modal
  lightboxModal: document.getElementById('lightboxModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalPrevBtn: document.getElementById('modalPrevBtn'),
  modalNextBtn: document.getElementById('modalNextBtn'),
  modalImage: document.getElementById('modalImage'),
  modalImageLoader: document.getElementById('modalImageLoader'),
  modalImageBackdrop: document.getElementById('modalImageBackdrop'),
  modalTitle: document.getElementById('modalTitle'),
  modalAlbumBadge: document.getElementById('modalAlbumBadge'),
  modalIdBadge: document.getElementById('modalIdBadge'),
  modalLikeBtn: document.getElementById('modalLikeBtn'),
  modalLikeIcon: document.getElementById('modalLikeIcon'),
  modalLikeText: document.getElementById('modalLikeText'),
  modalShareBtn: document.getElementById('modalShareBtn'),
  modalDownloadBtn: document.getElementById('modalDownloadBtn'),
  filterButtons: document.querySelectorAll('.filter-preset-btn'),
  resetFilterBtn: document.getElementById('resetFilterBtn'),
  zoomSlider: document.getElementById('zoomSlider'),
  zoomValueText: document.getElementById('zoomValueText'),
  toastContainer: document.getElementById('toastContainer')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderSkeletons(12);
  fetchPhotos();
  initEventListeners();
  updateFavoritesBadge();
});

// 1. Fetch Data from JSONPlaceholder
async function fetchPhotos() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/photos');
    if (!response.ok) throw new Error('Şəkillər yüklənərkən xəta baş verdi');
    
    state.allPhotos = await response.json();
    
    // Hide skeletons
    DOM.gallerySkeleton.classList.add('hidden');
    
    // Setup albums in controls
    populateAlbumControls();
    
    // Update total count
    DOM.statTotalCount.textContent = state.allPhotos.length.toLocaleString();
    
    // Apply filters & render
    applyFiltersAndSort();
    
    showToast('5,000 foto uğurla yükləndi!', 'success');
  } catch (error) {
    console.error('API Error:', error);
    DOM.gallerySkeleton.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-4">
        <i class="fa-solid fa-triangle-exclamation text-4xl text-rose-500"></i>
        <h3 class="text-xl font-bold text-white">Məlumat yüklənmədi</h3>
        <p class="text-slate-400 text-sm">İnternet bağlantınızı yoxlayın və yenidən cəhd edin.</p>
        <button onclick="location.reload()" class="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium text-sm">Yenidən Sına</button>
      </div>
    `;
    showToast('Xəta: Məlumatlar alına bilmədi', 'error');
  }
}

// 2. Populate Album Controls (Pills and Dropdown)
function populateAlbumControls() {
  const albumsCount = 100;
  
  // Quick Pills: "Hamısı", "Sevimlilər", Albom 1 .. 8
  let pillsHtml = `
    <button data-album="all" class="album-pill active">
      <i class="fa-solid fa-layer-group mr-1.5"></i> Hamısı
    </button>
    <button data-album="favorites" class="album-pill">
      <i class="fa-solid fa-heart text-rose-500 mr-1.5"></i> Sevimlilər (<span id="pillFavCount">${state.favorites.size}</span>)
    </button>
  `;
  
  for (let i = 1; i <= 8; i++) {
    pillsHtml += `<button data-album="${i}" class="album-pill">Albom #${i}</button>`;
  }
  DOM.albumPillsContainer.innerHTML = pillsHtml;

  // Dropdown options (1-100)
  for (let i = 1; i <= albumsCount; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Albom ${i}`;
    DOM.albumSelectDropdown.appendChild(opt);
  }
}

// 3. Filter and Sort Logic
function applyFiltersAndSort(resetPage = true) {
  if (resetPage) state.currentPage = 1;

  let result = [...state.allPhotos];

  // Album Filter
  if (state.activeAlbum === 'favorites') {
    result = result.filter(photo => state.favorites.has(photo.id));
    DOM.statActiveAlbum.textContent = 'Sevimlilər';
  } else if (state.activeAlbum !== 'all') {
    const albumNum = parseInt(state.activeAlbum, 10);
    result = result.filter(photo => photo.albumId === albumNum);
    DOM.statActiveAlbum.textContent = `Albom #${albumNum}`;
  } else {
    DOM.statActiveAlbum.textContent = 'Hamısı';
  }

  // Search Query
  if (state.searchQuery.trim() !== '') {
    const query = state.searchQuery.toLowerCase().trim();
    result = result.filter(photo => 
      photo.title.toLowerCase().includes(query) || 
      photo.id.toString() === query ||
      `#${photo.id}` === query
    );
  }

  // Sorting
  switch (state.sortBy) {
    case 'id-asc':
      result.sort((a, b) => a.id - b.id);
      break;
    case 'id-desc':
      result.sort((a, b) => b.id - a.id);
      break;
    case 'title-asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      result.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'random':
      result.sort(() => Math.random() - 0.5);
      break;
  }

  state.filteredPhotos = result;
  renderGallery();
}

// 4. Render Gallery Cards
function renderGallery() {
  const visibleCount = state.currentPage * state.pageSize;
  const currentSlice = state.filteredPhotos.slice(0, visibleCount);

  if (state.filteredPhotos.length === 0) {
    DOM.galleryGrid.innerHTML = '';
    DOM.emptyState.classList.remove('hidden');
    DOM.loadMoreContainer.classList.add('hidden');
    DOM.statLoadedCount.textContent = '0';
    return;
  }

  DOM.emptyState.classList.add('hidden');
  DOM.statLoadedCount.textContent = currentSlice.length.toLocaleString();

  // Create HTML cards
  const cardsHtml = currentSlice.map((photo, index) => {
    const isLiked = state.favorites.has(photo.id);
    const fallbackSeed = `https://picsum.photos/seed/${photo.id}/600`;
    const imageSrc = photo.url || fallbackSeed;

    return `
      <article class="photo-card group" data-id="${photo.id}" data-index="${index}">
        <div class="photo-card-img-wrapper cursor-pointer" onclick="openLightbox(${index})">
          <img 
            src="${imageSrc}" 
            alt="${photo.title}" 
            loading="lazy"
            class="photo-card-img"
            onerror="this.onerror=null; this.src='https://picsum.photos/seed/${photo.id}/600';"
          />
          
          <!-- Hover Overlay -->
          <div class="photo-card-overlay">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                Albom #${photo.albumId}
              </span>
              <button 
                type="button"
                class="card-action-btn ${isLiked ? 'is-liked' : ''}" 
                onclick="event.stopPropagation(); toggleFavorite(${photo.id})"
                title="${isLiked ? 'Sevimlilərdən çıxar' : 'Sevimlilərə əlavə et'}"
              >
                <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              </button>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs font-mono font-medium text-slate-300">#${photo.id}</span>
              <div class="flex items-center gap-1.5">
                <button 
                  type="button"
                  class="card-action-btn"
                  onclick="event.stopPropagation(); copyPhotoLink(${photo.id}, '${imageSrc}')"
                  title="Linki Kopyala"
                >
                  <i class="fa-solid fa-link text-xs"></i>
                </button>
                <button 
                  type="button"
                  class="card-action-btn"
                  onclick="event.stopPropagation(); openLightbox(${index})"
                  title="Böyüt / Redaktə et"
                >
                  <i class="fa-solid fa-expand text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Content Footer -->
        <div class="photo-card-content p-4 flex flex-col justify-between flex-grow space-y-2">
          <h4 class="photo-card-title text-sm font-semibold text-slate-200 capitalize leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors" title="${photo.title}">
            ${photo.title}
          </h4>
          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <span>600 &times; 600 px</span>
            <span class="text-purple-400 font-medium">Baxış &rarr;</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  DOM.galleryGrid.innerHTML = cardsHtml;

  // Handle Load More visibility
  if (visibleCount >= state.filteredPhotos.length) {
    DOM.loadMoreContainer.classList.add('hidden');
  } else {
    DOM.loadMoreContainer.classList.remove('hidden');
    DOM.loadedCountText.textContent = `${visibleCount} / ${state.filteredPhotos.length} foto göstərilir`;
  }
}

// 5. Skeleton Loader generator
function renderSkeletons(count) {
  DOM.gallerySkeleton.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'rounded-3xl overflow-hidden glass-card p-4 space-y-4';
    card.innerHTML = `
      <div class="skeleton-shimmer h-60 rounded-2xl"></div>
      <div class="space-y-2">
        <div class="skeleton-shimmer h-4 w-1/3 rounded-full"></div>
        <div class="skeleton-shimmer h-5 w-4/5 rounded-full"></div>
      </div>
    `;
    DOM.gallerySkeleton.appendChild(card);
  }
}

// 6. Favorites Management
function toggleFavorite(id) {
  const photoId = Number(id);
  const isLiked = state.favorites.has(photoId);

  if (isLiked) {
    state.favorites.delete(photoId);
    showToast(`Foto #${photoId} sevimlilərdən çıxarıldı`, 'info');
  } else {
    state.favorites.add(photoId);
    playPopSound();
    showToast(`Foto #${photoId} sevimlilərə əlavə edildi!`, 'love');
  }

  // Save to LocalStorage
  localStorage.setItem('lumina_favorites', JSON.stringify([...state.favorites]));
  updateFavoritesBadge();

  // If in favorites view, refresh
  if (state.activeAlbum === 'favorites') {
    applyFiltersAndSort(false);
  } else {
    // Update heart icons on cards without full re-render
    const card = document.querySelector(`.photo-card[data-id="${photoId}"]`);
    if (card) {
      const btn = card.querySelector('.card-action-btn');
      const icon = btn.querySelector('i');
      if (state.favorites.has(photoId)) {
        btn.classList.add('is-liked');
        icon.className = 'fa-solid fa-heart';
      } else {
        btn.classList.remove('is-liked');
        icon.className = 'fa-regular fa-heart';
      }
    }
  }

  // Update modal like button if currently viewing this photo
  if (state.currentModalPhoto && state.currentModalPhoto.id === photoId) {
    updateModalLikeState(photoId);
  }
}

function updateFavoritesBadge() {
  const count = state.favorites.size;
  DOM.favoritesBadge.textContent = count;
  DOM.statLikedCount.textContent = count;
  const pillFavCount = document.getElementById('pillFavCount');
  if (pillFavCount) pillFavCount.textContent = count;
}

// 7. Lightbox Studio Modal Logic
function openLightbox(index) {
  if (index < 0 || index >= state.filteredPhotos.length) return;

  state.currentModalIndex = index;
  const photo = state.filteredPhotos[index];
  state.currentModalPhoto = photo;

  // Reset filters and zoom
  resetPhotoEffects();

  const fullImgSrc = photo.url || `https://picsum.photos/seed/${photo.id}/600`;

  // Show Loader
  DOM.modalImageLoader.classList.remove('hidden');
  DOM.modalImage.classList.add('opacity-0');

  // Preload image
  const img = new Image();
  img.src = fullImgSrc;
  img.onload = () => {
    DOM.modalImage.src = fullImgSrc;
    DOM.modalImageLoader.classList.add('hidden');
    DOM.modalImage.classList.remove('opacity-0');
  };
  img.onerror = () => {
    DOM.modalImage.src = `https://picsum.photos/seed/${photo.id}/600`;
    DOM.modalImageLoader.classList.add('hidden');
    DOM.modalImage.classList.remove('opacity-0');
  };

  // Set Ambient Background
  DOM.modalImageBackdrop.style.backgroundImage = `url('${fullImgSrc}')`;

  // Meta info
  DOM.modalTitle.textContent = photo.title;
  DOM.modalAlbumBadge.textContent = `Albom #${photo.albumId}`;
  DOM.modalIdBadge.textContent = `Foto ID: #${photo.id}`;

  // Like button status
  updateModalLikeState(photo.id);

  // Prev / Next arrow state
  DOM.modalPrevBtn.style.display = index > 0 ? 'flex' : 'none';
  DOM.modalNextBtn.style.display = index < state.filteredPhotos.length - 1 ? 'flex' : 'none';

  // Open modal
  DOM.lightboxModal.classList.remove('opacity-0', 'pointer-events-none');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  DOM.lightboxModal.classList.add('opacity-0', 'pointer-events-none');
  document.body.style.overflow = '';
  state.currentModalPhoto = null;
  state.currentModalIndex = -1;
  resetPhotoEffects();
}

function updateModalLikeState(photoId) {
  const isLiked = state.favorites.has(photoId);
  if (isLiked) {
    DOM.modalLikeIcon.className = 'fa-solid fa-heart text-rose-500';
    DOM.modalLikeText.textContent = 'Bəyənildi';
    DOM.modalLikeBtn.classList.add('border-rose-500/50', 'bg-rose-500/10');
  } else {
    DOM.modalLikeIcon.className = 'fa-regular fa-heart text-slate-300';
    DOM.modalLikeText.textContent = 'Bəyən';
    DOM.modalLikeBtn.classList.remove('border-rose-500/50', 'bg-rose-500/10');
  }
}

// 8. Creative Filter & Zoom Studio
function setPhotoFilter(filterName) {
  state.activeFilter = filterName;

  // Clear previous filter classes
  DOM.modalImage.className = 'max-w-full max-h-[65vh] lg:max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-300';

  if (filterName !== 'normal') {
    DOM.modalImage.classList.add(`filter-${filterName}`);
  }

  // Update active button UI
  DOM.filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterName);
  });

  applyZoom();
  playFilterSound();
  showToast(`Filtr tətbiq edildi: ${filterName.toUpperCase()}`, 'info');
}

function resetPhotoEffects() {
  state.activeFilter = 'normal';
  state.zoomLevel = 100;
  DOM.zoomSlider.value = 100;
  DOM.zoomValueText.textContent = '100%';
  DOM.modalImage.className = 'max-w-full max-h-[65vh] lg:max-h-[75vh] object-contain rounded-2xl shadow-2xl transition-all duration-300';
  DOM.modalImage.style.transform = 'scale(1)';

  DOM.filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'normal');
  });
}

function applyZoom() {
  DOM.modalImage.style.transform = `scale(${state.zoomLevel / 100})`;
}

// 9. Download Photo with Custom Name
async function downloadCurrentPhoto() {
  if (!state.currentModalPhoto) return;

  const photo = state.currentModalPhoto;
  const imageUrl = photo.url || `https://picsum.photos/seed/${photo.id}/600`;
  const fileName = `lumina-photo-${photo.id}-album-${photo.albumId}.jpg`;

  showToast('Şəkil yüklənir...', 'info');

  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    showToast('Foto uğurla cihazınıza endirildi!', 'success');
  } catch (err) {
    // Fallback: Open in new window
    window.open(imageUrl, '_blank');
    showToast('Şəkil yeni pəncərədə açıldı', 'info');
  }
}

// 10. Copy Link / Share
function copyPhotoLink(photoId, url) {
  const finalUrl = url || (state.currentModalPhoto ? state.currentModalPhoto.url : window.location.href);
  navigator.clipboard.writeText(finalUrl).then(() => {
    showToast(`Foto #${photoId} linki kopyalandı!`, 'success');
  }).catch(() => {
    showToast('Link kopyalana bilmədi', 'error');
  });
}

// 11. Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast-msg pointer-events-auto px-4 py-3 rounded-2xl glass-card text-xs font-semibold flex items-center gap-2.5 shadow-2xl border ${
    type === 'success' ? 'border-emerald-500/40 text-emerald-300' :
    type === 'love' ? 'border-rose-500/40 text-rose-300' :
    type === 'error' ? 'border-rose-500/50 text-rose-400' :
    'border-purple-500/40 text-purple-200'
  }`;

  const iconClass = 
    type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' :
    type === 'love' ? 'fa-solid fa-heart text-rose-500' :
    type === 'error' ? 'fa-solid fa-triangle-exclamation text-rose-400' :
    'fa-solid fa-circle-info text-purple-400';

  toast.innerHTML = `
    <i class="${iconClass} text-sm"></i>
    <span>${message}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// 12. Creative Web Audio Synthesizer (Zero-dependency Ambient & Sound Effects)
function playPopSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
}

function playFilterSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function toggleAmbientSound() {
  state.isSoundActive = !state.isSoundActive;

  if (state.isSoundActive) {
    try {
      if (!state.audioCtx) {
        state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }

      // Generate a calm zen pad chord (F minor 9: F3, C4, Eb4, G4)
      const freqs = [174.61, 261.63, 311.13, 392.00];
      state.ambientOscillators = freqs.map(freq => {
        const osc = state.audioCtx.createOscillator();
        const gain = state.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.02; // Very gentle background volume
        osc.connect(gain);
        gain.connect(state.audioCtx.destination);
        osc.start();
        return { osc, gain };
      });

      DOM.soundIcon.className = 'fa-solid fa-volume-high text-cyan-400 sound-playing';
      showToast('Ambient zen atmosferi aktivləşdirildi 🎵', 'info');
    } catch (e) {
      console.error(e);
    }
  } else {
    if (state.ambientOscillators) {
      state.ambientOscillators.forEach(({ osc, gain }) => {
        gain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + 0.3);
        setTimeout(() => osc.stop(), 300);
      });
      state.ambientOscillators = [];
    }
    DOM.soundIcon.className = 'fa-solid fa-volume-xmark text-slate-400';
    DOM.soundIcon.classList.remove('sound-playing');
    showToast('Ambient səs dayandırıldı', 'info');
  }
}

// 13. Theme Toggle (Dark / Light)
function initTheme() {
  const savedTheme = localStorage.getItem('lumina_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('lumina_theme', next);
  updateThemeIcon(next);
  showToast(`${next === 'dark' ? 'Qaranlıq (Dark)' : 'İşıqlı (Light)'} rejimə keçildi`, 'info');
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    DOM.themeIcon.className = 'fa-solid fa-moon text-amber-400';
  } else {
    DOM.themeIcon.className = 'fa-solid fa-sun text-amber-500';
  }
}

// 14. Event Listeners Setup
function initEventListeners() {
  // Search input with debounce
  let searchTimeout;
  DOM.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const val = e.target.value;
    DOM.clearSearchBtn.classList.toggle('hidden', val === '');
    searchTimeout = setTimeout(() => {
      state.searchQuery = val;
      applyFiltersAndSort();
    }, 250);
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    state.searchQuery = '';
    applyFiltersAndSort();
  });

  // Album pills container delegation
  DOM.albumPillsContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.album-pill');
    if (!pill) return;

    document.querySelectorAll('.album-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    state.activeAlbum = pill.dataset.album;
    DOM.albumSelectDropdown.value = state.activeAlbum === 'favorites' ? 'all' : state.activeAlbum;
    applyFiltersAndSort();
  });

  // Album dropdown
  DOM.albumSelectDropdown.addEventListener('change', (e) => {
    state.activeAlbum = e.target.value;
    // Sync pills
    document.querySelectorAll('.album-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.album === state.activeAlbum);
    });
    applyFiltersAndSort();
  });

  // Sort dropdown
  DOM.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    applyFiltersAndSort();
  });

  // Reset filters
  DOM.resetFiltersBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.activeAlbum = 'all';
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    DOM.albumSelectDropdown.value = 'all';
    document.querySelectorAll('.album-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.album === 'all');
    });
    applyFiltersAndSort();
  });

  // View modes
  DOM.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  DOM.viewEditorialBtn.addEventListener('click', () => setViewMode('editorial'));
  DOM.viewCompactBtn.addEventListener('click', () => setViewMode('compact'));

  // Load more
  DOM.loadMoreBtn.addEventListener('click', () => {
    state.currentPage++;
    renderGallery();
  });

  // Favorites toggle from header
  DOM.favoritesToggleBtn.addEventListener('click', () => {
    state.activeAlbum = state.activeAlbum === 'favorites' ? 'all' : 'favorites';
    document.querySelectorAll('.album-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.album === state.activeAlbum);
    });
    applyFiltersAndSort();
  });

  // Surprise / Random Photo Explorer
  DOM.surpriseBtn.addEventListener('click', () => {
    if (state.allPhotos.length === 0) return;
    const randomIndex = Math.floor(Math.random() * state.allPhotos.length);
    state.filteredPhotos = [state.allPhotos[randomIndex]];
    renderGallery();
    openLightbox(0);
    showToast('Təsadüfi foto kəşf edildi!', 'love');
  });

  // Logo click resets to home
  DOM.logoBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.activeAlbum = 'all';
    DOM.searchInput.value = '';
    DOM.albumSelectDropdown.value = 'all';
    document.querySelectorAll('.album-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.album === 'all');
    });
    applyFiltersAndSort();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Theme & Sound toggles
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  DOM.ambientSoundBtn.addEventListener('click', toggleAmbientSound);

  // Lightbox Modal Controls
  DOM.closeModalBtn.addEventListener('click', closeLightbox);
  DOM.lightboxModal.addEventListener('click', (e) => {
    if (e.target === DOM.lightboxModal) closeLightbox();
  });

  DOM.modalPrevBtn.addEventListener('click', () => {
    if (state.currentModalIndex > 0) {
      openLightbox(state.currentModalIndex - 1);
    }
  });

  DOM.modalNextBtn.addEventListener('click', () => {
    if (state.currentModalIndex < state.filteredPhotos.length - 1) {
      openLightbox(state.currentModalIndex + 1);
    }
  });

  // Modal Like button
  DOM.modalLikeBtn.addEventListener('click', () => {
    if (state.currentModalPhoto) {
      toggleFavorite(state.currentModalPhoto.id);
    }
  });

  // Modal Share button
  DOM.modalShareBtn.addEventListener('click', () => {
    if (state.currentModalPhoto) {
      copyPhotoLink(state.currentModalPhoto.id, state.currentModalPhoto.url);
    }
  });

  // Modal Download button
  DOM.modalDownloadBtn.addEventListener('click', downloadCurrentPhoto);

  // Creative Studio Filters
  DOM.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setPhotoFilter(btn.dataset.filter);
    });
  });

  DOM.resetFilterBtn.addEventListener('click', resetPhotoEffects);

  // Zoom Slider
  DOM.zoomSlider.addEventListener('input', (e) => {
    state.zoomLevel = e.target.value;
    DOM.zoomValueText.textContent = `${state.zoomLevel}%`;
    applyZoom();
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!DOM.lightboxModal.classList.contains('pointer-events-none')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && state.currentModalIndex > 0) openLightbox(state.currentModalIndex - 1);
      if (e.key === 'ArrowRight' && state.currentModalIndex < state.filteredPhotos.length - 1) openLightbox(state.currentModalIndex + 1);
    }
  });
}

// 15. View Mode Switcher
function setViewMode(mode) {
  state.viewMode = mode;

  DOM.viewGridBtn.classList.toggle('active', mode === 'grid');
  DOM.viewEditorialBtn.classList.toggle('active', mode === 'editorial');
  DOM.viewCompactBtn.classList.toggle('active', mode === 'compact');

  DOM.galleryGrid.classList.remove('editorial-mode', 'compact-mode');
  if (mode === 'editorial') DOM.galleryGrid.classList.add('editorial-mode');
  if (mode === 'compact') DOM.galleryGrid.classList.add('compact-mode');

  showToast(`Görünüş dəyişdirildi: ${mode === 'editorial' ? 'Editorial Jurnal' : mode === 'compact' ? 'Kompakt Grid' : 'Standart Qəfəs'}`, 'info');
}
