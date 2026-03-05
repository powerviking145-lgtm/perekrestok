// ===== КАРТА =====
let canvas, ctx;
let scale = 1;
let offsetX = 0, offsetY = 0;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let lastOffset = { x: 0, y: 0 };

function initMap() {
    canvas = document.getElementById('map-canvas');
    ctx    = canvas.getContext('2d');

    resizeCanvas();
    fitMap();
    redrawMap();

    // Touch
    canvas.addEventListener('touchstart',  onTouchStart,  { passive: false });
    canvas.addEventListener('touchmove',   onTouchMove,   { passive: false });
    canvas.addEventListener('touchend',    onTouchEnd);

    // Mouse
    canvas.addEventListener('mousedown',   onMouseDown);
    canvas.addEventListener('mousemove',   onMouseMove);
    canvas.addEventListener('mouseup',     onMouseUp);
    canvas.addEventListener('wheel',       onWheel, { passive: false });

    window.addEventListener('resize', () => {
        resizeCanvas();
        fitMap();
        redrawMap();
    });
}

function resizeCanvas() {
    const wrap = document.querySelector('.map-wrap');
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
}

function fitMap() {
    const mapW = STORE.gridCols * STORE.cellSize;
    const mapH = STORE.gridRows * STORE.cellSize;
    const scaleX = canvas.width  / (mapW + 40);
    const scaleY = canvas.height / (mapH + 40);
    scale = Math.min(scaleX, scaleY);
    offsetX = (canvas.width  - mapW * scale) / 2;
    offsetY = (canvas.height - mapH * scale) / 2;
}

// ===== РИСОВАНИЕ =====
function redrawMap() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawZones();
    drawWalls();
    drawPath();
    drawProducts();
    drawPlayer();

    ctx.restore();
}

function drawZones() {
    STORE.zones.forEach(zone => {
        const x = zone.x * STORE.cellSize;
        const y = zone.y * STORE.cellSize;
        const w = zone.w * STORE.cellSize;
        const h = zone.h * STORE.cellSize;

        // Фон зоны
        ctx.fillStyle = zone.color;
        roundRect(ctx, x, y, w, h, 10);
        ctx.fill();

        // Рамка
        ctx.strokeStyle = zone.labelColor + '40';
        ctx.lineWidth   = 1.5;
        roundRect(ctx, x, y, w, h, 10);
        ctx.stroke();

        // Название зоны
        ctx.fillStyle  = zone.labelColor;
        ctx.font       = `bold ${STORE.cellSize * 0.7}px sans-serif`;
        ctx.textAlign  = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(zone.label, x + w / 2, y + 6, w - 12);
    });
}

function drawWalls() {
    STORE.walls.forEach(wall => {
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(
            wall.x * STORE.cellSize,
            wall.y * STORE.cellSize,
            wall.w * STORE.cellSize,
            wall.h * STORE.cellSize
        );
    });
}

function drawPath() {
    if (!state.routeItems || state.routeItems.length === 0) return;

    const unchecked = state.routeItems.filter(p => !state.checkedItems.has(p.id));
    if (unchecked.length === 0) return;

    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#6CC14C';
    ctx.lineWidth   = 2;
    ctx.globalAlpha = 0.7;

    if (state.routePath && state.routePath.length > 1) {
        for (let i = 0; i < state.routePath.length - 1; i++) {
            const from = state.routePath[i];
            const to   = state.routePath[i + 1];
            const cx = (from.x + 0.5) * STORE.cellSize;
            const cy = (from.y + 0.5) * STORE.cellSize;
            if (i === 0) ctx.moveTo(cx, cy);
            ctx.lineTo((to.x + 0.5) * STORE.cellSize, (to.y + 0.5) * STORE.cellSize);
        }
    } else {
        const start = STORE.startPoint;
        const points = [start, ...unchecked.map(p => ({ x: p.x, y: p.y }))];
        for (let i = 0; i < points.length - 1; i++) {
            const from = points[i];
            const to   = points[i + 1];
            ctx.moveTo((from.x + 0.5) * STORE.cellSize, (from.y + 0.5) * STORE.cellSize);
            ctx.lineTo((to.x + 0.5) * STORE.cellSize, (to.y + 0.5) * STORE.cellSize);
        }
    }

    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
}

function drawProducts() {
    state.routeItems.forEach((p, idx) => {
        const cx = (p.x + 0.5) * STORE.cellSize;
        const cy = (p.y + 0.5) * STORE.cellSize;
        const r  = STORE.cellSize * 0.7;
        const done = state.checkedItems.has(p.id);

        // Тень
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur  = 6;

        // Круг
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = done ? '#156938' : (p.isPromo ? '#B6DC79' : '#6CC14C');
        ctx.fill();

        ctx.shadowBlur = 0;

        // Номер
        ctx.fillStyle    = 'white';
        ctx.font         = `bold ${STORE.cellSize * 0.65}px sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';

        if (done) {
            ctx.fillText('✓', cx, cy);
        } else {
            ctx.fillText(idx + 1, cx, cy);
        }

        // Название под точкой
        if (!done) {
            ctx.fillStyle    = '#0F172A';
            ctx.font         = `${STORE.cellSize * 0.55}px sans-serif`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'top';
            const label = p.name.length > 12 ? p.name.slice(0, 11) + '…' : p.name;
            ctx.fillText(label, cx, cy + r + 3);
        }
    });
}

function drawPlayer() {
    const last = [...state.checkedItems].pop();
    let pos = STORE.startPoint;

    if (last) {
        const found = state.routeItems.find(p => p.id === last);
        if (found) pos = { x: found.x, y: found.y };
    }

    const cx = (pos.x + 0.5) * STORE.cellSize;
    const cy = (pos.y + 0.5) * STORE.cellSize;
    const r  = STORE.cellSize * 0.55;

    // Пульс
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(108,193,76,0.15)';
    ctx.fill();

    // Круг игрока
    ctx.shadowColor = 'rgba(108,193,76,0.4)';
    ctx.shadowBlur  = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#6CC14C';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Иконка человека
    ctx.fillStyle    = 'white';
    ctx.font         = `bold ${STORE.cellSize * 0.65}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('У', cx, cy);
}

// ===== ВСПОМОГАТЕЛЬНЫЕ =====
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

// ===== TOUCH =====
let lastTouchDist = 0;
let touches = [];

function onTouchStart(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    if (touches.length === 1) {
        isDragging = true;
        dragStart  = { x: touches[0].clientX, y: touches[0].clientY };
        lastOffset = { x: offsetX, y: offsetY };
    } else if (touches.length === 2) {
        lastTouchDist = getTouchDist(touches);
    }
}

function onTouchMove(e) {
    e.preventDefault();
    touches = Array.from(e.touches);
    if (touches.length === 1 && isDragging) {
        offsetX = lastOffset.x + (touches[0].clientX - dragStart.x);
        offsetY = lastOffset.y + (touches[0].clientY - dragStart.y);
        redrawMap();
    } else if (touches.length === 2) {
        const dist  = getTouchDist(touches);
        const delta = dist / lastTouchDist;
        const cx    = (touches[0].clientX + touches[1].clientX) / 2;
        const cy    = (touches[0].clientY + touches[1].clientY) / 2;
        zoomAt(cx, cy, delta);
        lastTouchDist = dist;
    }
}

function onTouchEnd() {
    isDragging = false;
}

function getTouchDist(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
}

// ===== MOUSE =====
function onMouseDown(e) {
    isDragging = true;
    dragStart  = { x: e.clientX, y: e.clientY };
    lastOffset = { x: offsetX, y: offsetY };
}

function onMouseMove(e) {
    if (!isDragging) return;
    offsetX = lastOffset.x + (e.clientX - dragStart.x);
    offsetY = lastOffset.y + (e.clientY - dragStart.y);
    redrawMap();
}

function onMouseUp() {
    isDragging = false;
}

function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAt(e.clientX, e.clientY, delta);
}

function zoomAt(cx, cy, delta) {
    const newScale = Math.min(Math.max(scale * delta, 0.3), 5);
    const factor   = newScale / scale;
    offsetX = cx - factor * (cx - offsetX);
    offsetY = cy - factor * (cy - offsetY);
    scale   = newScale;
    redrawMap();
}