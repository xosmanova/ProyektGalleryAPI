/**
 * Lumina Gallery
 */

const state = {
  allPhotos: [],
  filteredPhotos: [],
  currentPage: 1,
  pageSize: 24,
  activeAlbum: 'all',
  searchQuery: '',
  sortBy: 'id-asc',
  viewMode: 'grid',
  favorites: new Set(JSON.parse(localStorage.getItem('lumina_favorites') || '[]')),
  currentModalIndex: -1,
  currentModalPhoto: null,
  activeFilter: 'normal',
  zoomLevel: 100
};

// DOM Elements
const DOM = {
  galleryGrid: document.getElementById('galleryGrid'),
  gallerySkeleton: document.getElementById('gallerySkeleton'),
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
  // Lightbox Modal
  lightboxModal: document.getElementById('lightboxModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalPrevBtn: document.getElementById('modalPrevBtn'),
  modalNextBtn: document.getElementById('modalNextBtn'),
  modalImage: document.getElementById('modalImage'),
  modalImageLoader: document.getElementById('modalImageLoader'),
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

// Fetch Photos
async function fetchPhotos() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/photos');
    if (!response.ok) throw new Error('Şəkillər yüklənmədi');
    
    state.allPhotos = await response.json();
    
    DOM.gallerySkeleton.classList.add('hidden');
    populateAlbumControls();
    DOM.statTotalCount.textContent = state.allPhotos.length.toLocaleString();
    applyFiltersAndSort();
  } catch (error) {
    console.error('API Error:', error);
    DOM.gallerySkeleton.innerHTML = `
      <div class="col-span-full py-16 text-center space-y-4">
        <i class="fa-solid fa-triangle-exclamation text-3xl text-rose-500"></i>
        <h3 class="text-lg font-bold text-white">Məlumat yüklənmədi</h3>
        <p class="text-slate-400 text-sm">İnternet bağlantınızı yoxlayın və yenidən cəhd edin.</p>
        <button onclick="location.reload()" class="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm">Yenilə</button>
      </div>
    `;
    showToast('Məlumatlar alına bilmədi', 'error');
  }
}

// Album Controls
function populateAlbumControls() {
  const albumsCount = 100;
  
  let pillsHtml = `
    <button data-album="all" class="album-pill active">
      <i class="fa-solid fa-layer-group mr-1.5"></i> Hamısı
    </button>
    <button data-album="favorites" class="album-pill">
      <i class="fa-solid fa-heart text-rose-500 mr-1.5"></i> Sevimlilər (<span id="pillFavCount">${state.favorites.size}</span>)
    </button>
  `;
  
  for (let i = 1; i <= 8; i++) {
    pillsHtml += `<button data-album="${i}" class="album-pill">Albom ${i}</button>`;
  }
  DOM.albumPillsContainer.innerHTML = pillsHtml;

  for (let i = 1; i <= albumsCount; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `Albom ${i}`;
    DOM.albumSelectDropdown.appendChild(opt);
  }
}

// Filter and Sort
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
    DOM.statActiveAlbum.textContent = `Albom ${albumNum}`;
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

// Render Gallery Cards
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

  const cardsHtml = currentSlice.map((photo, index) => {
    const isLiked = state.favorites.has(photo.id);
    const imageSrc = photo.url || `https://picsum.photos/seed/${photo.id}/600`;

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
          
          <div class="photo-card-overlay">
            <div class="flex items-center justify-between">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-black/60 backdrop-blur-md text-white border border-white/10">
                Albom ${photo.albumId}
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
              <span class="text-xs font-mono text-slate-300">#${photo.id}</span>
              <div class="flex items-center gap-1.5">
                <button 
                  type="button"
                  class="card-action-btn"
                  onclick="event.stopPropagation(); copyPhotoLink(${photo.id}, '${imageSrc}')"
                  title="Linki kopyala"
                >
                  <i class="fa-solid fa-link text-xs"></i>
                </button>
                <button 
                  type="button"
                  class="card-action-btn"
                  onclick="event.stopPropagation(); openLightbox(${index})"
                  title="Tam ölçüdə bax"
                >
                  <i class="fa-solid fa-expand text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="photo-card-content p-3.5 flex flex-col justify-between flex-grow space-y-2">
          <h4 class="photo-card-title text-sm font-medium text-main capitalize leading-snug line-clamp-2" title="${photo.title}">
            ${photo.title}
          </h4>
          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <span>600 &times; 600</span>
            <span class="text-blue-400">Baxış &rarr;</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  DOM.galleryGrid.innerHTML = cardsHtml;

  if (visibleCount >= state.filteredPhotos.length) {
    DOM.loadMoreContainer.classList.add('hidden');
  } else {
    DOM.loadMoreContainer.classList.remove('hidden');
    DOM.loadedCountText.textContent = `${visibleCount} / ${state.filteredPhotos.length} göstərilir`;
  }
}

// Skeleton Generator
function renderSkeletons(count) {
  DOM.gallerySkeleton.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'rounded-xl overflow-hidden glass-card p-4 space-y-4';
    card.innerHTML = `
      <div class="skeleton-shimmer h-60 rounded-lg"></div>
      <div class="space-y-2">
        <div class="skeleton-shimmer h-3.5 w-1/3 rounded-full"></div>
        <div class="skeleton-shimmer h-4 w-4/5 rounded-full"></div>
      </div>
    `;
    DOM.gallerySkeleton.appendChild(card);
  }
}

// Favorites
function toggleFavorite(id) {
  const photoId = Number(id);
  const isLiked = state.favorites.has(photoId);

  if (isLiked) {
    state.favorites.delete(photoId);
    showToast(`Foto #${photoId} sevimlilərdən çıxarıldı`, 'info');
  } else {
    state.favorites.add(photoId);
    showToast(`Foto #${photoId} sevimlilərə əlavə edildi`, 'love');
  }

  localStorage.setItem('lumina_favorites', JSON.stringify([...state.favorites]));
  updateFavoritesBadge();

  if (state.activeAlbum === 'favorites') {
    applyFiltersAndSort(false);
  } else {
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

// Lightbox Modal
function openLightbox(index) {
  if (index < 0 || index >= state.filteredPhotos.length) return;

  state.currentModalIndex = index;
  const photo = state.filteredPhotos[index];
  state.currentModalPhoto = photo;

  resetPhotoEffects();

  const fullImgSrc = photo.url || `https://picsum.photos/seed/${photo.id}/600`;

  DOM.modalImageLoader.classList.remove('hidden');
  DOM.modalImage.classList.add('opacity-0');

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

  DOM.modalTitle.textContent = photo.title;
  DOM.modalAlbumBadge.textContent = `Albom ${photo.albumId}`;
  DOM.modalIdBadge.textContent = `#${photo.id}`;

  updateModalLikeState(photo.id);

  DOM.modalPrevBtn.style.display = index > 0 ? 'flex' : 'none';
  DOM.modalNextBtn.style.display = index < state.filteredPhotos.length - 1 ? 'flex' : 'none';

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

// Filter & Zoom
function setPhotoFilter(filterName) {
  state.activeFilter = filterName;

  DOM.modalImage.className = 'max-w-full max-h-[65vh] lg:max-h-[75vh] object-contain rounded-xl shadow-xl transition-all duration-200';

  if (filterName !== 'normal') {
    DOM.modalImage.classList.add(`filter-${filterName}`);
  }

  DOM.filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterName);
  });

  applyZoom();
}

function resetPhotoEffects() {
  state.activeFilter = 'normal';
  state.zoomLevel = 100;
  DOM.zoomSlider.value = 100;
  DOM.zoomValueText.textContent = '100%';
  DOM.modalImage.className = 'max-w-full max-h-[65vh] lg:max-h-[75vh] object-contain rounded-xl shadow-xl transition-all duration-200';
  DOM.modalImage.style.transform = 'scale(1)';

  DOM.filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'normal');
  });
}

function applyZoom() {
  DOM.modalImage.style.transform = `scale(${state.zoomLevel / 100})`;
}

// Download
async function downloadCurrentPhoto() {
  if (!state.currentModalPhoto) return;

  const photo = state.currentModalPhoto;
  const imageUrl = photo.url || `https://picsum.photos/seed/${photo.id}/600`;
  const fileName = `photo-${photo.id}.jpg`;

  showToast('Şəkil endirilir...', 'info');

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

    showToast('Şəkil endirildi', 'success');
  } catch (err) {
    window.open(imageUrl, '_blank');
  }
}

// Copy Link
function copyPhotoLink(photoId, url) {
  const finalUrl = url || (state.currentModalPhoto ? state.currentModalPhoto.url : window.location.href);
  navigator.clipboard.writeText(finalUrl).then(() => {
    showToast('Link kopyalandı', 'success');
  }).catch(() => {
    showToast('Link kopyalana bilmədi', 'error');
  });
}

// Toast Notifications
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast-msg pointer-events-auto px-4 py-2.5 rounded-xl glass-card text-xs font-medium flex items-center gap-2 shadow-xl border ${
    type === 'success' ? 'border-emerald-500/40 text-emerald-300' :
    type === 'love' ? 'border-rose-500/40 text-rose-300' :
    type === 'error' ? 'border-rose-500/50 text-rose-400' :
    'border-blue-500/40 text-blue-200'
  }`;

  const iconClass = 
    type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' :
    type === 'love' ? 'fa-solid fa-heart text-rose-500' :
    type === 'error' ? 'fa-solid fa-triangle-exclamation text-rose-400' :
    'fa-solid fa-circle-info text-blue-400';

  toast.innerHTML = `
    <i class="${iconClass} text-xs"></i>
    <span>${message}</span>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 250);
  }, 2400);
}

// Theme
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
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
    DOM.themeIcon.className = 'fa-solid fa-moon text-amber-400';
  } else {
    DOM.themeIcon.className = 'fa-solid fa-sun text-amber-500';
  }
}

// Event Listeners
function initEventListeners() {
  let searchTimeout;
  DOM.searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const val = e.target.value;
    DOM.clearSearchBtn.classList.toggle('hidden', val === '');
    searchTimeout = setTimeout(() => {
      state.searchQuery = val;
      applyFiltersAndSort();
    }, 200);
  });

  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    state.searchQuery = '';
    applyFiltersAndSort();
  });

  DOM.albumPillsContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.album-pill');
    if (!pill) return;

    document.querySelectorAll('.album-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    state.activeAlbum = pill.dataset.album;
    DOM.albumSelectDropdown.value = state.activeAlbum === 'favorites' ? 'all' : state.activeAlbum;
    applyFiltersAndSort();
  });

  DOM.albumSelectDropdown.addEventListener('change', (e) => {
    state.activeAlbum = e.target.value;
    document.querySelectorAll('.album-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.album === state.activeAlbum);
    });
    applyFiltersAndSort();
  });

  DOM.sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    applyFiltersAndSort();
  });

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

  DOM.viewGridBtn.addEventListener('click', () => setViewMode('grid'));
  DOM.viewEditorialBtn.addEventListener('click', () => setViewMode('editorial'));
  DOM.viewCompactBtn.addEventListener('click', () => setViewMode('compact'));

  DOM.loadMoreBtn.addEventListener('click', () => {
    state.currentPage++;
    renderGallery();
  });

  DOM.favoritesToggleBtn.addEventListener('click', () => {
    state.activeAlbum = state.activeAlbum === 'favorites' ? 'all' : 'favorites';
    document.querySelectorAll('.album-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.album === state.activeAlbum);
    });
    applyFiltersAndSort();
  });

  DOM.surpriseBtn.addEventListener('click', () => {
    if (state.allPhotos.length === 0) return;
    const randomIndex = Math.floor(Math.random() * state.allPhotos.length);
    state.filteredPhotos = [state.allPhotos[randomIndex]];
    renderGallery();
    openLightbox(0);
  });

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

  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

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

  DOM.modalLikeBtn.addEventListener('click', () => {
    if (state.currentModalPhoto) {
      toggleFavorite(state.currentModalPhoto.id);
    }
  });

  DOM.modalShareBtn.addEventListener('click', () => {
    if (state.currentModalPhoto) {
      copyPhotoLink(state.currentModalPhoto.id, state.currentModalPhoto.url);
    }
  });

  DOM.modalDownloadBtn.addEventListener('click', downloadCurrentPhoto);

  DOM.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setPhotoFilter(btn.dataset.filter);
    });
  });

  DOM.resetFilterBtn.addEventListener('click', resetPhotoEffects);

  DOM.zoomSlider.addEventListener('input', (e) => {
    state.zoomLevel = e.target.value;
    DOM.zoomValueText.textContent = `${state.zoomLevel}%`;
    applyZoom();
  });

  window.addEventListener('keydown', (e) => {
    if (!DOM.lightboxModal.classList.contains('pointer-events-none')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && state.currentModalIndex > 0) openLightbox(state.currentModalIndex - 1);
      if (e.key === 'ArrowRight' && state.currentModalIndex < state.filteredPhotos.length - 1) openLightbox(state.currentModalIndex + 1);
    }
  });
}

function setViewMode(mode) {
  state.viewMode = mode;

  DOM.viewGridBtn.classList.toggle('active', mode === 'grid');
  DOM.viewEditorialBtn.classList.toggle('active', mode === 'editorial');
  DOM.viewCompactBtn.classList.toggle('active', mode === 'compact');

  DOM.galleryGrid.classList.remove('editorial-mode', 'compact-mode');
  if (mode === 'editorial') DOM.galleryGrid.classList.add('editorial-mode');
  if (mode === 'compact') DOM.galleryGrid.classList.add('compact-mode');
}
