// ===== СОСТОЯНИЕ =====
const POPULAR_KEY = 'navishop_popular';

const state = {
    currentScreen: 'home',
    shoppingList: [],
    routeItems: [],
    routePath: [], // извилистый маршрут (обход стеллажей)
    checkedItems: new Set(),
    currentPromoItem: null,
    upsellTimer: null,
    upsellShownZones: new Set(),
    giftShown: false,
    pendingFinish: false, // показать «Свободная касса» только после рекомендации (апселл)
    arStream: null,
    arOrientationHandler: null,
};

// ===== НАВИГАЦИЯ =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + id).classList.add('active');
    state.currentScreen = id;
    if (id !== 'ar') stopAR();
}

// ===== ПОИСК =====
const searchInput  = document.getElementById('search-input');
const searchDropdown = document.getElementById('search-dropdown');

searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 1) { searchDropdown.classList.add('hidden'); return; }

    const results = STORE.products.filter(p =>
        p.name.toLowerCase().includes(q)
    ).slice(0, 8);

    if (results.length === 0) { searchDropdown.classList.add('hidden'); return; }

    searchDropdown.innerHTML = results.map(p => `
        <div class="dropdown-item" data-id="${p.id}">
            <div class="dropdown-item-icon">
                <i class="fa-solid ${p.icon}"></i>
            </div>
            <div class="dropdown-item-info">
                <div class="dropdown-item-name">${p.name}</div>
                <div class="dropdown-item-zone">${ZONE_NAMES[p.zone]}</div>
            </div>
            <div class="dropdown-item-add">+</div>
        </div>
    `).join('');

    searchDropdown.classList.remove('hidden');
});

searchDropdown.addEventListener('click', e => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    const id = parseInt(item.dataset.id);
    const product = STORE.products.find(p => p.id === id);
    if (product) addToList(product);
    searchInput.value = '';
    searchDropdown.classList.add('hidden');
});

document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrap')) {
        searchDropdown.classList.add('hidden');
    }
});

// ===== СПИСОК =====
function addToList(product) {
    if (state.shoppingList.find(p => p.id === product.id)) return;
    state.shoppingList.push(product);
    savePopular(product.id);
    renderList();
    updateGoButton();

    // Сразу показать экран с предложением составить список (баннер)
    if (state.shoppingList.length === 1) {
        setTimeout(() => showUpsellBanner(), 0);
    }
}

function removeFromList(id) {
    state.shoppingList = state.shoppingList.filter(p => p.id !== id);
    renderList();
    updateGoButton();
}

function renderList() {
    const container = document.getElementById('shopping-list');
    const countEl   = document.getElementById('list-count');

    countEl.textContent = state.shoppingList.length + ' товаров';

    if (state.shoppingList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-bag-shopping"></i></div>
                <p>Список пуст</p>
                <span>Найдите товар через поиск выше</span>
            </div>`;
        return;
    }

    container.innerHTML = state.shoppingList.map(p => `
        <div class="list-item">
            <div class="list-item-icon">
                <i class="fa-solid ${p.icon}"></i>
            </div>
            <div class="list-item-info">
                <div class="list-item-name">${p.name}</div>
                <div class="list-item-zone">${ZONE_NAMES[p.zone]}</div>
            </div>
            <button class="list-item-remove" data-id="${p.id}">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `).join('');

    container.querySelectorAll('.list-item-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromList(parseInt(btn.dataset.id)));
    });
}

function updateGoButton() {
    const btn = document.getElementById('btn-go-shop');
    btn.disabled = state.shoppingList.length === 0;
}

document.getElementById('clear-list').addEventListener('click', () => {
    state.shoppingList = [];
    renderList();
    updateGoButton();
});

// ===== UPSELL БАННЕР (список) =====
function showUpsellBanner() {
    if (state.shoppingList.length > 1) return;
    document.getElementById('upsell-banner').classList.remove('hidden');
}

document.getElementById('btn-upsell-yes').addEventListener('click', () => {
    document.getElementById('upsell-banner').classList.add('hidden');
    searchInput.focus();
});

document.getElementById('btn-upsell-no').addEventListener('click', () => {
    document.getElementById('upsell-banner').classList.add('hidden');
});

// ===== МАРШРУТ =====
function buildRoutePath() {
    state.routePath = [];
    if (!state.routeItems.length) return;
    const pf = new PathFinder(STORE.gridCols, STORE.gridRows);
    pf.buildGrid();
    const targets = state.routeItems.map(p => ({ x: p.x, y: p.y }));
    const ordered = pf.optimizeRoute(STORE.startPoint, targets);
    let from = STORE.startPoint;
    for (const to of ordered) {
        const segment = pf.findPath(from.x, from.y, to.x, to.y);
        state.routePath.push(...segment);
        from = to;
    }
}

document.getElementById('btn-go-shop').addEventListener('click', () => {
    state.routeItems   = [...state.shoppingList];
    state.checkedItems = new Set();
    state.upsellShownZones = new Set();
    buildRoutePath();
    showScreen('map');
    initMap();
    renderChecklist();
    updateProgress();
    updateNextItem();
});

// ===== ЧЕКЛИСТ =====
function renderChecklist() {
    const container = document.getElementById('items-checklist');
    container.innerHTML = state.routeItems.map(p => `
        <div class="check-item ${state.checkedItems.has(p.id) ? 'done' : ''}" data-id="${p.id}">
            <div class="check-box">
                ${state.checkedItems.has(p.id) ? '<i class="fa-solid fa-check"></i>' : ''}
            </div>
            <div class="check-icon"><i class="fa-solid ${p.icon}"></i></div>
            <div class="check-name">${p.name}</div>
            <div class="check-zone">${ZONE_NAMES[p.zone]}</div>
        </div>
    `).join('');

    container.querySelectorAll('.check-item').forEach(el => {
        el.addEventListener('click', () => toggleCheck(parseInt(el.dataset.id)));
    });
}

function toggleCheck(id) {
    const product = state.routeItems.find(p => p.id === id);
    if (!product) return;

    if (state.checkedItems.has(id)) {
        state.checkedItems.delete(id);
    } else {
        state.checkedItems.add(id);
        // Показать upsell попап для этой зоны
        maybeShowUpsellModal(product);
        // Показать подарок если первый товар
        if (state.checkedItems.size === 1 && !state.giftShown) {
            setTimeout(() => showGiftBubble(), 800);
        }
        // Всё найдено — финалку «Свободная касса» покажем только после рекомендации (апселл)
        if (state.checkedItems.size === state.routeItems.length && state.routeItems.length > 0) {
            state.pendingFinish = true;
            setTimeout(() => {
                if (!state.pendingFinish) return;
                const upsellVisible = !document.getElementById('upsell-modal-overlay').classList.contains('hidden');
                if (!upsellVisible) {
                    state.pendingFinish = false;
                    showFinishModal();
                }
            }, 600);
        }
    }

    renderChecklist();
    updateProgress();
    updateNextItem();
    redrawMap();
}

function updateProgress() {
    const total   = state.routeItems.length;
    const done    = state.checkedItems.size;
    const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('progress-text').textContent = done + ' / ' + total + ' найдено';
}

function updateNextItem() {
    const next = state.routeItems.find(p => !state.checkedItems.has(p.id));
    if (next) {
        document.getElementById('next-item-name').textContent = next.name;
        document.getElementById('next-item-zone').textContent = ZONE_NAMES[next.zone];
    } else {
        document.getElementById('next-item-name').textContent = 'Все товары найдены!';
        document.getElementById('next-item-zone').textContent = '';
    }
}

// ===== UPSELL ПОПАП — АКЦИОННЫЙ ТОВАР =====
function maybeShowUpsellModal(checkedProduct) {
    const zone = checkedProduct.zone;

    // Уже показывали для этой зоны — пропускаем
    if (state.upsellShownZones.has(zone)) return;

    // Есть ли акционный товар в этой зоне
    const promoList = PROMO_ITEMS[zone];
    if (!promoList || promoList.length === 0) return;

    // Берём случайный из списка акций зоны
    const promo = promoList[Math.floor(Math.random() * promoList.length)];

    // Не предлагать если уже в списке
    const alreadyInList = state.routeItems.find(p => p.name === promo.name);
    if (alreadyInList) return;

    state.upsellShownZones.add(zone);
    state.currentPromoItem = promo;

    showUpsellModal(promo);
}

function showUpsellModal(promo) {
    document.getElementById('upsell-product-icon').innerHTML =
        `<i class="fa-solid ${promo.icon}"></i>`;
    document.getElementById('upsell-product-name').textContent = promo.name;
    document.getElementById('upsell-product-zone').textContent = ZONE_NAMES[promo.zone];
    document.getElementById('upsell-old-price').textContent   = promo.oldPrice + ' руб';
    document.getElementById('upsell-new-price').textContent   = promo.newPrice + ' руб';
    document.getElementById('upsell-discount').textContent    = '-' + promo.discount + '%';

    document.getElementById('upsell-modal-overlay').classList.remove('hidden');

    // Запустить таймер
    startUpsellTimer();
}

function startUpsellTimer() {
    clearInterval(state.upsellTimer);
    let seconds = 10 * 60; // 10 минут

    const timerEl = document.getElementById('upsell-timer');

    function tick() {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        timerEl.textContent =
            String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

        if (seconds <= 0) {
            clearInterval(state.upsellTimer);
            closeUpsellModal();
            return;
        }
        seconds--;
    }

    tick();
    state.upsellTimer = setInterval(tick, 1000);
}

function closeUpsellModal() {
    clearInterval(state.upsellTimer);
    document.getElementById('upsell-modal-overlay').classList.add('hidden');
    state.currentPromoItem = null;
    if (state.pendingFinish) {
        state.pendingFinish = false;
        showFinishModal();
    }
}

// Построить маршрут до акционного товара
document.getElementById('btn-upsell-route').addEventListener('click', () => {
    if (!state.currentPromoItem) return;

    const promo = state.currentPromoItem;

    // Добавляем в маршрут как обычный товар
    const promoAsProduct = {
        id:   9000 + Math.floor(Math.random() * 1000),
        name: promo.name,
        zone: promo.zone,
        x:    promo.x,
        y:    promo.y,
        icon: promo.icon,
        isPromo: true,
    };

    state.routeItems.push(promoAsProduct);
    closeUpsellModal();
    buildRoutePath();
    renderChecklist();
    updateProgress();
    updateNextItem();
    redrawMap();
});

document.getElementById('btn-upsell-skip').addEventListener('click', () => {
    closeUpsellModal();
});

// ===== ПОДАРОК =====
function showGiftBubble() {
    state.giftShown = true;
    document.getElementById('gift-bubble').classList.remove('hidden');
}

document.getElementById('btn-open-gift').addEventListener('click', () => {
    document.getElementById('gift-bubble').classList.add('hidden');
    document.getElementById('gift-modal-overlay').classList.remove('hidden');
});

document.getElementById('gift-modal-close').addEventListener('click', () => {
    document.getElementById('gift-modal-overlay').classList.add('hidden');
});

document.getElementById('gift-copy-btn').addEventListener('click', () => {
    const code = document.getElementById('gift-promo-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        document.getElementById('gift-copy-success').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('gift-copy-success').classList.add('hidden');
        }, 2500);
    });
});

// ===== ФИНАЛ: СВОБОДНАЯ КАССА =====
function showFinishModal() {
    document.getElementById('finish-stub').classList.add('hidden');
    document.getElementById('finish-overlay').classList.remove('hidden');
}

document.getElementById('btn-finish-scan').addEventListener('click', () => {
    document.getElementById('finish-stub').classList.remove('hidden');
});

document.getElementById('btn-finish-close').addEventListener('click', () => {
    document.getElementById('finish-overlay').classList.add('hidden');
});

// ===== AR-НАВИГАЦИЯ =====
function getArTargetData() {
    const next = state.routeItems.find(p => !state.checkedItems.has(p.id));
    if (!next) return null;
    const current = state.checkedItems.size === 0
        ? STORE.startPoint
        : { x: state.routeItems[state.checkedItems.size - 1].x, y: state.routeItems[state.checkedItems.size - 1].y };
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    if (dx === 0 && dy === 0) return { next, current, targetBearingDeg: 0 };
    // Карта: x вправо, y вниз. Север = вверх = -y. Угол в градусах: 0 = восток, 90 = север.
    const rad = Math.atan2(-dy, dx);
    let deg = (rad * 180 / Math.PI);
    if (deg < 0) deg += 360;
    const distCells = Math.sqrt(dx * dx + dy * dy);
    const distM = Math.round(distCells * STORE.cellSize * 0.04); // примерная метровка
    return { next, current, targetBearingDeg: deg, distM: Math.max(1, distM) };
}

function updateARUI() {
    const data = getArTargetData();
    const nameEl = document.getElementById('ar-next-name');
    const zoneEl = document.getElementById('ar-next-zone');
    const distEl = document.getElementById('ar-distance');
    const fillEl = document.getElementById('ar-progress-fill');
    const textEl = document.getElementById('ar-progress-text');
    const total = state.routeItems.length;
    const done = state.checkedItems.size;

    if (total > 0) {
        const pct = Math.round((done / total) * 100);
        if (fillEl) fillEl.style.width = pct + '%';
        if (textEl) textEl.textContent = done + ' / ' + total;
    }

    if (!data) {
        if (nameEl) nameEl.textContent = 'Все найдено!';
        if (zoneEl) zoneEl.textContent = '';
        if (distEl) distEl.textContent = '';
        return null;
    }
    if (nameEl) nameEl.textContent = data.next.name;
    if (zoneEl) zoneEl.textContent = ZONE_NAMES[data.next.zone];
    if (distEl) distEl.textContent = '~' + data.distM + ' м';
    return data;
}

function updateARArrow(alphaDeg) {
    const data = getArTargetData();
    const wrap = document.getElementById('ar-arrow-wrap');
    if (!wrap) return;
    if (!data) {
        wrap.style.opacity = '0.3';
        wrap.style.transform = 'rotate(0deg)';
        return;
    }
    wrap.style.opacity = '1';
    // alpha = куда смотрит телефон (0 = север). Стрелка должна смотреть "вперёд" когда телефон смотрит на цель.
    // Поворот стрелки: цель в направлении (targetBearingDeg). Стрелка вверх = 0. rotate(X): когда X = alpha - targetBearing, стрелка указывает на цель.
    const rotation = (typeof alphaDeg === 'number' ? alphaDeg : 0) - data.targetBearingDeg;
    wrap.style.transform = 'rotate(' + rotation + 'deg)';
}

function stopAR() {
    if (state.arStream) {
        state.arStream.getTracks().forEach(t => t.stop());
        state.arStream = null;
    }
    if (state.arOrientationHandler) {
        window.removeEventListener('deviceorientation', state.arOrientationHandler);
        state.arOrientationHandler = null;
    }
}

function isLikelyDesktop() {
    return window.innerWidth > 768 || (!('ontouchstart' in window) && !navigator.maxTouchPoints);
}

function startAR() {
    const video = document.getElementById('ar-video');
    const pcHint = document.getElementById('ar-pc-hint');
    if (!video) return;

    if (isLikelyDesktop() && pcHint) {
        pcHint.classList.remove('hidden');
    } else if (pcHint) {
        pcHint.classList.add('hidden');
    }

    updateARUI();
    const data = getArTargetData();
    updateARArrow(data ? 0 : 0);

    const onOrientation = (e) => {
        if (e.alpha != null) updateARArrow(e.alpha);
    };

    const requestOrientation = () => {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then((p) => { if (p === 'granted') enableOrientation(); })
                .catch(() => { enableOrientation(); });
        } else {
            enableOrientation();
        }
    };

    function enableOrientation() {
        state.arOrientationHandler = onOrientation;
        window.addEventListener('deviceorientation', onOrientation);
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
            state.arStream = stream;
            video.srcObject = stream;
            requestOrientation();
        })
        .catch(() => {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    state.arStream = stream;
                    video.srcObject = stream;
                    requestOrientation();
                })
                .catch(() => {
                    alert('Нет доступа к камере');
                });
        });
}

document.getElementById('btn-open-ar').addEventListener('click', () => {
    if (state.routeItems.length === 0) return;
    showScreen('ar');
    startAR();
});

document.getElementById('btn-back-ar').addEventListener('click', () => {
    stopAR();
    showScreen('map');
    initMap();
    renderChecklist();
    updateProgress();
    updateNextItem();
    redrawMap();
});

// ===== КНОПКИ НАВИГАЦИИ =====
document.getElementById('btn-open-store').addEventListener('click', () => showScreen('main'));
document.getElementById('btn-back-home').addEventListener('click',  () => showScreen('home'));
document.getElementById('btn-back-main').addEventListener('click',  () => {
    clearInterval(state.upsellTimer);
    showScreen('main');
});
document.getElementById('btn-suggest').addEventListener('click',    () => showScreen('suggest'));
document.getElementById('btn-back-suggest').addEventListener('click', () => showScreen('home'));

document.getElementById('btn-reset-route').addEventListener('click', () => {
    state.checkedItems = new Set();
    state.upsellShownZones = new Set();
    state.routePath = [];
    clearInterval(state.upsellTimer);
    document.getElementById('upsell-modal-overlay').classList.add('hidden');
    renderChecklist();
    updateProgress();
    updateNextItem();
    redrawMap();
});

// ===== ПОПУЛЯРНЫЕ ТОВАРЫ =====
function getPopular() {
    try {
        const raw = localStorage.getItem(POPULAR_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (_) { return {}; }
}

function savePopular(productId) {
    const counts = getPopular();
    counts[productId] = (counts[productId] || 0) + 1;
    localStorage.setItem(POPULAR_KEY, JSON.stringify(counts));
}

function renderPopularTab() {
    const container = document.getElementById('popular-list');
    const counts = getPopular();
    const entries = Object.entries(counts)
        .map(([id, count]) => ({ id: parseInt(id, 10), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state popular-empty">
                <div class="empty-icon"><i class="fa-solid fa-chart-line"></i></div>
                <p>Пока пусто</p>
                <span>Добавляйте товары в список — здесь появятся ваши частые покупки</span>
            </div>`;
        return;
    }

    const products = entries
        .map(e => STORE.products.find(p => p.id === e.id))
        .filter(Boolean);

    container.innerHTML = products.map(p => `
        <div class="list-item popular-item" data-id="${p.id}">
            <div class="list-item-icon">
                <i class="fa-solid ${p.icon}"></i>
            </div>
            <div class="list-item-info">
                <div class="list-item-name">${p.name}</div>
                <div class="list-item-zone">${ZONE_NAMES[p.zone]}</div>
            </div>
            <div class="list-item-add">+</div>
        </div>
    `).join('');

    container.querySelectorAll('.popular-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = parseInt(el.dataset.id, 10);
            const product = STORE.products.find(pr => pr.id === id);
            if (product) addToList(product);
        });
    });
}

// ===== ТАБЫ =====
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.dataset.tab;
        document.getElementById('tab-' + tabId).classList.add('active');
        if (tabId === 'popular') renderPopularTab();
    });
});

// ===== ЗАЯВКА =====
document.getElementById('btn-send-suggest').addEventListener('click', () => {
    const name    = document.getElementById('suggest-name').value.trim();
    const address = document.getElementById('suggest-address').value.trim();
    if (!name || !address) return;
    document.getElementById('suggest-success').classList.remove('hidden');
    document.getElementById('suggest-name').value    = '';
    document.getElementById('suggest-address').value = '';
    document.getElementById('suggest-tg').value      = '';
    setTimeout(() => {
        document.getElementById('suggest-success').classList.add('hidden');
    }, 3000);
});

// ===== route-info =====
document.getElementById('btn-go-shop').addEventListener('click', () => {
    document.getElementById('route-info').textContent =
        state.shoppingList.length + ' товаров';
}, true);