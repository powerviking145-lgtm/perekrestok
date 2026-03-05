class PathFinder {
    constructor(cols, rows) {
        this.cols = cols;
        this.rows = rows;
        this.grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    }

    setWall(x, y) {
        if (this.inBounds(x, y)) this.grid[y][x] = 1;
    }

    setRect(x, y, w, h) {
        for (let row = y; row < y + h; row++)
            for (let col = x; col < x + w; col++)
                this.setWall(col, row);
    }

    inBounds(x, y) {
        return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
    }

    isWalkable(x, y) {
        return this.inBounds(x, y) && this.grid[y][x] === 0;
    }

    heuristic(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    findPath(startX, startY, endX, endY) {
        if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
            const nb = this.getWalkableNeighbor(endX, endY);
            if (nb) { endX = nb.x; endY = nb.y; }
            else return [];
        }

        const open   = [];
        const closed = new Set();
        const gScore = {};
        const fScore = {};
        const parent = {};
        const key    = (x, y) => `${x},${y}`;

        const start = { x: startX, y: startY };
        const end   = { x: endX,   y: endY   };

        gScore[key(start.x, start.y)] = 0;
        fScore[key(start.x, start.y)] = this.heuristic(start, end);
        open.push(start);

        while (open.length > 0) {
            open.sort((a, b) =>
                (fScore[key(a.x, a.y)] || Infinity) -
                (fScore[key(b.x, b.y)] || Infinity)
            );

            const current = open.shift();
            const ck = key(current.x, current.y);

            if (current.x === end.x && current.y === end.y) {
                return this.reconstructPath(parent, current, key);
            }

            closed.add(ck);

            const dirs = [
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: -1, y: 0 }, { x: 1, y: 0 }
            ];

            for (const d of dirs) {
                const nx = current.x + d.x;
                const ny = current.y + d.y;
                const nk = key(nx, ny);

                if (!this.isWalkable(nx, ny) || closed.has(nk)) continue;

                const tentG = (gScore[ck] || 0) + 1;
                if (tentG < (gScore[nk] || Infinity)) {
                    parent[nk] = current;
                    gScore[nk] = tentG;
                    fScore[nk] = tentG + this.heuristic({ x: nx, y: ny }, end);
                    if (!open.find(n => n.x === nx && n.y === ny)) {
                        open.push({ x: nx, y: ny });
                    }
                }
            }
        }
        return [];
    }

    getWalkableNeighbor(x, y) {
        const dirs = [
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 1, y: 1 }, { x: -1, y: -1 },
            { x: 1, y: -1 },{ x: -1, y: 1 }
        ];
        for (const d of dirs) {
            const nx = x + d.x, ny = y + d.y;
            if (this.isWalkable(nx, ny)) return { x: nx, y: ny };
        }
        return null;
    }

    reconstructPath(parent, current, keyFn) {
        const path = [];
        let node = current;
        while (node) {
            path.unshift({ x: node.x, y: node.y });
            node = parent[keyFn(node.x, node.y)];
        }
        return path;
    }

    // Жадный алгоритм — оптимальный порядок обхода товаров
    optimizeRoute(start, targets) {
        if (targets.length === 0) return [];
        const result    = [];
        let current     = start;
        const remaining = [...targets];

        while (remaining.length > 0) {
            let nearestIdx  = 0;
            let nearestDist = Infinity;

            for (let i = 0; i < remaining.length; i++) {
                const dist =
                    Math.abs(current.x - remaining[i].x) +
                    Math.abs(current.y - remaining[i].y);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIdx  = i;
                }
            }

            result.push(remaining[nearestIdx]);
            current = remaining[nearestIdx];
            remaining.splice(nearestIdx, 1);
        }
        return result;
    }

    buildGrid() {
        // Блокируем внутренности зон (края — проходы)
        STORE.zones.forEach(z => {
            this.setRect(z.x + 1, z.y + 1, z.w - 2, z.h - 2);
        });
        // Внешние стены
        STORE.walls.forEach(w => {
            this.setRect(w.x, w.y, w.w, w.h);
        });
    }
}