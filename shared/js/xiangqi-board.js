/**
 * Xiangqi (Chinese Chess) Board Renderer
 * Renders SVG-based xiangqi board with pieces
 * 
 * Position format (simplified FEN-like):
 * Upper case = Red, Lower case = Black
 * K=帥, A=仕, E=相, R=車, H=馬, C=炮, P=兵
 * k=將, a=士, e=象, r=車, h=馬, c=炮, p=卒
 * 
 * Position string: rows separated by '/', from top (black side) to bottom (red side)
 * Numbers represent empty squares
 */
const XiangqiBoard = (() => {
    const COLS = 9;
    const ROWS = 10;
    const CELL = 44;
    const PADDING = 30;
    const PIECE_R = 19;

    const pieceNames = {
        'K': '帥', 'A': '仕', 'E': '相', 'R': '車', 'H': '馬', 'C': '炮', 'P': '兵',
        'k': '將', 'a': '士', 'e': '象', 'r': '車', 'h': '馬', 'c': '炮', 'p': '卒'
    };

    const isRed = (piece) => piece === piece.toUpperCase();

    function parseFEN(fen) {
        const pieces = [];
        const rows = fen.split('/');
        for (let r = 0; r < rows.length; r++) {
            let c = 0;
            for (const ch of rows[r]) {
                if (/\d/.test(ch)) {
                    c += parseInt(ch);
                } else {
                    pieces.push({ piece: ch, row: r, col: c });
                    c++;
                }
            }
        }
        return pieces;
    }

    function render(container, fen, options = {}) {
        const { caption = '', highlights = [], arrows = [], size = 'medium' } = options;
        const scale = size === 'small' ? 0.7 : size === 'large' ? 1.2 : 1;
        const cellSize = CELL * scale;
        const padding = PADDING * scale;
        const pieceR = PIECE_R * scale;
        const width = (COLS - 1) * cellSize + padding * 2;
        const height = (ROWS - 1) * cellSize + padding * 2;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="xiangqi-board" style="max-width:${width}px">`;

        // Background
        svg += `<rect width="${width}" height="${height}" fill="#f0d9a0" rx="4"/>`;

        // Grid lines
        svg += `<g stroke="#5c3d1e" stroke-width="${1 * scale}">`;
        // Horizontal lines
        for (let r = 0; r < ROWS; r++) {
            const y = padding + r * cellSize;
            svg += `<line x1="${padding}" y1="${y}" x2="${padding + (COLS - 1) * cellSize}" y2="${y}"/>`;
        }
        // Vertical lines (with river gap)
        for (let c = 0; c < COLS; c++) {
            const x = padding + c * cellSize;
            if (c === 0 || c === COLS - 1) {
                svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${padding + (ROWS - 1) * cellSize}"/>`;
            } else {
                svg += `<line x1="${x}" y1="${padding}" x2="${x}" y2="${padding + 4 * cellSize}"/>`;
                svg += `<line x1="${x}" y1="${padding + 5 * cellSize}" x2="${x}" y2="${padding + (ROWS - 1) * cellSize}"/>`;
            }
        }
        // Palace diagonals
        const palaceX1 = padding + 3 * cellSize;
        const palaceX2 = padding + 5 * cellSize;
        svg += `<line x1="${palaceX1}" y1="${padding}" x2="${palaceX2}" y2="${padding + 2 * cellSize}"/>`;
        svg += `<line x1="${palaceX2}" y1="${padding}" x2="${palaceX1}" y2="${padding + 2 * cellSize}"/>`;
        svg += `<line x1="${palaceX1}" y1="${padding + 7 * cellSize}" x2="${palaceX2}" y2="${padding + 9 * cellSize}"/>`;
        svg += `<line x1="${palaceX2}" y1="${padding + 7 * cellSize}" x2="${palaceX1}" y2="${padding + 9 * cellSize}"/>`;
        svg += `</g>`;

        // River text
        const riverY = padding + 4.5 * cellSize;
        svg += `<text x="${padding + 1.5 * cellSize}" y="${riverY}" font-size="${14 * scale}" fill="#5c3d1e" text-anchor="middle" dominant-baseline="middle" font-family="serif">楚 河</text>`;
        svg += `<text x="${padding + 6.5 * cellSize}" y="${riverY}" font-size="${14 * scale}" fill="#5c3d1e" text-anchor="middle" dominant-baseline="middle" font-family="serif">漢 界</text>`;

        // Highlights
        highlights.forEach(h => {
            const hx = padding + h.col * cellSize;
            const hy = padding + h.row * cellSize;
            svg += `<rect x="${hx - cellSize / 2}" y="${hy - cellSize / 2}" width="${cellSize}" height="${cellSize}" fill="rgba(255, 200, 0, 0.3)" rx="4"/>`;
        });

        // Arrows
        arrows.forEach(a => {
            const x1 = padding + a.from.col * cellSize;
            const y1 = padding + a.from.row * cellSize;
            const x2 = padding + a.to.col * cellSize;
            const y2 = padding + a.to.row * cellSize;
            svg += `<defs><marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto"><polygon points="0 0, 6 2, 0 4" fill="rgba(220,50,50,0.7)"/></marker></defs>`;
            svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(220,50,50,0.7)" stroke-width="${2.5 * scale}" marker-end="url(#arrowhead)"/>`;
        });

        // Pieces
        const pieces = parseFEN(fen);
        pieces.forEach(p => {
            const x = padding + p.col * cellSize;
            const y = padding + p.row * cellSize;
            const red = isRed(p.piece);
            const color = red ? '#c0392b' : '#1a1a2e';
            const bgColor = red ? '#fff8f0' : '#fff8f0';
            const borderColor = red ? '#c0392b' : '#1a1a2e';

            svg += `<circle cx="${x}" cy="${y}" r="${pieceR}" fill="${bgColor}" stroke="${borderColor}" stroke-width="${2 * scale}"/>`;
            svg += `<circle cx="${x}" cy="${y}" r="${pieceR - 3 * scale}" fill="none" stroke="${borderColor}" stroke-width="${0.5 * scale}"/>`;
            svg += `<text x="${x}" y="${y}" font-size="${16 * scale}" fill="${color}" text-anchor="middle" dominant-baseline="middle" font-weight="bold" font-family="serif">${pieceNames[p.piece]}</text>`;
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

    // Initial position
    const INITIAL_FEN = 'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR';

    return { render, parseFEN, INITIAL_FEN };
})();
