/**
 * Gomoku Board Renderer
 * Renders SVG-based Go/Gomoku board with stones and move numbers
 * 
 * Position format:
 * Array of moves: [{row, col, color}] where color is 'b' or 'w'
 * Or a position string: 'b7h8,w8h8,b7g7,...' 
 * Or a grid string: 15 rows of 15 chars (. = empty, X = black, O = white)
 */
const GomokuBoard = (() => {
    const CELL = 30;
    const PADDING = 24;
    const STONE_R = 13;
    const DEFAULT_SIZE = 15;

    function parsePositionString(str) {
        const moves = [];
        if (!str) return moves;
        str.split(',').forEach((m, i) => {
            const match = m.trim().match(/^([bw])(\d+)[,\s]*(\d+)$/);
            if (match) {
                moves.push({ color: match[1], row: parseInt(match[2]), col: parseInt(match[3]), num: i + 1 });
            }
        });
        return moves;
    }

    function parseGrid(grid) {
        const moves = [];
        const rows = grid.trim().split('\n');
        rows.forEach((row, r) => {
            [...row.trim()].forEach((ch, c) => {
                if (ch === 'X' || ch === 'x') moves.push({ color: 'b', row: r, col: c });
                else if (ch === 'O' || ch === 'o') moves.push({ color: 'w', row: r, col: c });
            });
        });
        return moves;
    }

    function render(container, position, options = {}) {
        const {
            caption = '',
            boardSize = DEFAULT_SIZE,
            showNumbers = true,
            highlights = [],
            markers = [],
            size = 'medium',
            lastMove = -1
        } = options;

        const scale = size === 'small' ? 0.75 : size === 'large' ? 1.15 : 1;
        const cellSize = CELL * scale;
        const padding = PADDING * scale;
        const stoneR = STONE_R * scale;
        const width = (boardSize - 1) * cellSize + padding * 2;
        const height = (boardSize - 1) * cellSize + padding * 2;

        // Parse position
        let moves = [];
        if (Array.isArray(position)) {
            moves = position;
        } else if (typeof position === 'string') {
            if (position.includes('\n') || (position.length > 50 && !position.includes(','))) {
                moves = parseGrid(position);
            } else {
                moves = parsePositionString(position);
            }
        }

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="gomoku-board" style="max-width:${width}px">`;

        // Background
        svg += `<rect width="${width}" height="${height}" fill="#dcb35c" rx="4"/>`;

        // Grid lines
        svg += `<g stroke="#5c4a1e" stroke-width="${0.8 * scale}">`;
        for (let i = 0; i < boardSize; i++) {
            const pos = padding + i * cellSize;
            svg += `<line x1="${padding}" y1="${pos}" x2="${padding + (boardSize - 1) * cellSize}" y2="${pos}"/>`;
            svg += `<line x1="${pos}" y1="${padding}" x2="${pos}" y2="${padding + (boardSize - 1) * cellSize}"/>`;
        }
        svg += `</g>`;

        // Star points (天元 and corners)
        const starPoints = boardSize === 15 ? [[3, 3], [3, 11], [7, 7], [11, 3], [11, 11], [3, 7], [7, 3], [7, 11], [11, 7]] :
                          boardSize === 19 ? [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]] : [[7, 7]];
        starPoints.forEach(([r, c]) => {
            const x = padding + c * cellSize;
            const y = padding + r * cellSize;
            svg += `<circle cx="${x}" cy="${y}" r="${3 * scale}" fill="#5c4a1e"/>`;
        });

        // Coordinate labels
        svg += `<g font-size="${9 * scale}" fill="#5c4a1e" font-family="monospace" text-anchor="middle">`;
        for (let i = 0; i < boardSize; i++) {
            const label = String.fromCharCode(65 + i + (i >= 8 ? 1 : 0)); // Skip 'I'
            svg += `<text x="${padding + i * cellSize}" y="${padding - 12 * scale}">${label}</text>`;
            svg += `<text x="${padding - 14 * scale}" y="${padding + i * cellSize + 3 * scale}" text-anchor="end">${boardSize - i}</text>`;
        }
        svg += `</g>`;

        // Highlights
        highlights.forEach(h => {
            const hx = padding + h.col * cellSize;
            const hy = padding + h.row * cellSize;
            svg += `<rect x="${hx - cellSize * 0.45}" y="${hy - cellSize * 0.45}" width="${cellSize * 0.9}" height="${cellSize * 0.9}" fill="rgba(255, 80, 80, 0.25)" rx="3"/>`;
        });

        // Stones
        moves.forEach((m, idx) => {
            const x = padding + m.col * cellSize;
            const y = padding + m.row * cellSize;
            const isBlack = m.color === 'b';

            // Stone shadow
            svg += `<circle cx="${x + 1 * scale}" cy="${y + 1.5 * scale}" r="${stoneR}" fill="rgba(0,0,0,0.2)"/>`;

            if (isBlack) {
                svg += `<circle cx="${x}" cy="${y}" r="${stoneR}" fill="#1a1a1a"/>`;
                svg += `<circle cx="${x - 3 * scale}" cy="${y - 3 * scale}" r="${4 * scale}" fill="rgba(255,255,255,0.15)"/>`;
            } else {
                svg += `<circle cx="${x}" cy="${y}" r="${stoneR}" fill="#f5f5f0" stroke="#888" stroke-width="${0.5 * scale}"/>`;
                svg += `<circle cx="${x - 3 * scale}" cy="${y - 3 * scale}" r="${4 * scale}" fill="rgba(255,255,255,0.5)"/>`;
            }

            // Move number
            if (showNumbers && m.num) {
                const textColor = isBlack ? '#fff' : '#111';
                const fontSize = m.num > 99 ? 8 * scale : m.num > 9 ? 9.5 * scale : 11 * scale;
                svg += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle" font-weight="500" font-family="monospace">${m.num}</text>`;
            }

            // Last move marker
            if (idx === (lastMove >= 0 ? lastMove : moves.length - 1) && !showNumbers) {
                const markerColor = isBlack ? '#ff6b6b' : '#e63946';
                svg += `<circle cx="${x}" cy="${y}" r="${4 * scale}" fill="${markerColor}"/>`;
            }
        });

        // Custom markers (for annotations like threats)
        markers.forEach(mk => {
            const x = padding + mk.col * cellSize;
            const y = padding + mk.row * cellSize;
            if (mk.type === 'x') {
                const s = 5 * scale;
                svg += `<g stroke="${mk.color || '#e63946'}" stroke-width="${2 * scale}">`;
                svg += `<line x1="${x - s}" y1="${y - s}" x2="${x + s}" y2="${y + s}"/>`;
                svg += `<line x1="${x + s}" y1="${y - s}" x2="${x - s}" y2="${y + s}"/>`;
                svg += `</g>`;
            } else if (mk.type === 'circle') {
                svg += `<circle cx="${x}" cy="${y}" r="${6 * scale}" fill="none" stroke="${mk.color || '#e63946'}" stroke-width="${2 * scale}"/>`;
            } else if (mk.type === 'square') {
                const s = 6 * scale;
                svg += `<rect x="${x - s}" y="${y - s}" width="${s * 2}" height="${s * 2}" fill="none" stroke="${mk.color || '#4ecdc4'}" stroke-width="${2 * scale}"/>`;
            } else if (mk.type === 'label') {
                svg += `<text x="${x}" y="${y}" font-size="${11 * scale}" fill="${mk.color || '#e63946'}" text-anchor="middle" dominant-baseline="middle" font-weight="bold">${mk.text}</text>`;
            }
        });

        svg += `</svg>`;

        const wrapper = document.createElement('div');
        wrapper.className = 'board-diagram';
        wrapper.innerHTML = svg + (caption ? `<p class="board-caption">${caption}</p>` : '');

        if (typeof container === 'string') {
            document.getElementById(container).appendChild(wrapper);
        } else {
            container.appendChild(wrapper);
        }
        return wrapper;
    }

    return { render, parsePositionString, parseGrid };
})();
