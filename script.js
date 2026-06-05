// ==========================================
// BỘ NÃO THUẬT TOÁN (CIPHER ENGINE)
// ==========================================
const CipherEngine = {

    // 1. CHỮ THẾ CHỮ
    "chu-the-chu": {
        getShift: (key) => {
            const cleanKey = key.replace(/\s+/g, '').toUpperCase();
            const match = cleanKey.match(/^([A-Z])=([A-Z])$/);
            if (!match) return 0;
            let shift = match[2].charCodeAt(0) - match[1].charCodeAt(0);
            if (shift < 0) shift += 26;
            return shift;
        },
        process: (text, key) => {
            const shift = CipherEngine["chu-the-chu"].getShift(key);
            return text.toUpperCase().split('').map(char => {
                const code = char.charCodeAt(0);
                if (code >= 65 && code <= 90) {
                    return String.fromCharCode(((code - 65 + shift) % 26) + 65);
                }
                return char;
            }).join('');
        },
        encrypt: (text, key) => CipherEngine["chu-the-chu"].process(text, key),
        decrypt: (text, key) => CipherEngine["chu-the-chu"].process(text, key)
    },

    // 2. CHỮ THẾ SỐ
    "chu-the-so": {
        encrypt: (text, key) => {
            const cleanKey = key.replace(/\s+/g, '').toUpperCase();
            const match = cleanKey.match(/^([A-Z])=(\d+)$/);
            if (!match) return "LỖI: Khóa sai định dạng (Ví dụ: A=1)";
            const keyChar = match[1].charCodeAt(0), keyNum = parseInt(match[2], 10);
            const words = text.toUpperCase().trim().split(/\s+/);
            return words.map(word => {
                return word.split('').map(char => {
                    const code = char.charCodeAt(0);
                    if (code >= 65 && code <= 90) {
                        let num = ((code - keyChar) + (keyNum - 1)) % 26;
                        if (num < 0) num += 26;
                        return num + 1;
                    }
                    return char;
                }).join('-');
            }).join(' ');
        },
        decrypt: (text, key) => {
            const cleanKey = key.replace(/\s+/g, '').toUpperCase();
            const match = cleanKey.match(/^([A-Z])=(\d+)$/);
            if (!match) return "LỖI: Khóa sai định dạng (Ví dụ: A=1)";
            const keyChar = match[1].charCodeAt(0), keyNum = parseInt(match[2], 10);
            const words = text.trim().split(/\s+/);
            return words.map(word => {
                return word.split('-').map(token => {
                    if (/^\d+$/.test(token)) {
                        const num = parseInt(token, 10);
                        let codeOffset = (num - keyNum + (keyChar - 65)) % 26;
                        if (codeOffset < 0) codeOffset += 26;
                        return String.fromCharCode(codeOffset + 65);
                    }
                    return token;
                }).join('');
            }).join(' ');
        }
    },

    // 3. BẢNG TRA
    "bang-tra": {
        subDictionaries: {
            morse: {
                'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
                'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
                'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
                'Y': '-.--', 'Z': '--..'
            },
            chuongBo: {
                'A': '└', 'B': '└•', 'C': '凵', 'D': '凵•', 'E': '┘', 'F': '┘•',
                'G': '⊏', 'H': '⊏•', 'I': '口', 'J': '口•', 'K': '⊐', 'L': '⊐•',
                'M': '┌', 'N': '┌•', 'O': '冂', 'P': '冂•', 'Q': '┐', 'R': '┐•',
                'S': '∧', 'T': '∧•', 'U': '∨', 'V': '∨•', 'W': '>', 'X': '>•',
                'Y': '<', 'Z': '<•'
            },
            chuongBoCau: {
                'A': '└', 'B': '凵', 'C': '┘', 'D': '⊏', 'E': '口', 'F': '⊐', 'G': '┌', 'H': '冂', 'I': '┐',
                'J': '╰', 'K': '︶', 'L': '╯', 'M': '⊂', 'N': '○', 'O': '⊃', 'P': '╭', 'Q': '︵', 'R': '╮',
                'S': '\\‾', 'T': '|‾|', 'U': '‾/', 'V': '\\', 'W': '|_|', 'X': '/', 'Y': '╰─', 'Z': '─╯'
            }
        },
        getDictionary: (key) => {
            if (!key) return CipherEngine["bang-tra"].subDictionaries.morse;
            const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "");
            if (normalizedKey.includes("bocau")) return CipherEngine["bang-tra"].subDictionaries.chuongBoCau;
            if (normalizedKey.includes("bo")) return CipherEngine["bang-tra"].subDictionaries.chuongBo;
            return CipherEngine["bang-tra"].subDictionaries.morse;
        },
        encrypt: (text, key) => {
            const dict = CipherEngine["bang-tra"].getDictionary(key);
            return text.toUpperCase().trim().split(/\s+/).map(word => {
                return word.split('').map(char => dict[char] || char).join(' ');
            }).join(' / ');
        },
        decrypt: (text, key) => {
            const dict = CipherEngine["bang-tra"].getDictionary(key);
            const revDict = {};
            for (let k in dict) revDict[dict[k]] = k;
            return text.trim().split(/\s*\/\s*/).map(word => {
                return word.split(/\s+/).map(tok => revDict[tok] || tok).join('');
            }).join(' ');
        }
    },

    // 4. TỌA ĐỘ
    "toa-do": {
        matrix: [['A', 'B', 'C', 'D', 'E'], ['F', 'G', 'H', 'I', 'K'], ['L', 'M', 'N', 'O', 'P'], ['Q', 'R', 'S', 'T', 'U'], ['V', 'W', 'X', 'Y', 'Z']],
        getHeaders: (key) => {
            let cleanKey = key.replace(/\s+/g, '').toUpperCase();
            let rowHeaders = [], colHeaders = [];
            const match = cleanKey.match(/^([A-Z0-9]{5})=([A-Z0-9]{5})$/);
            if (match) { rowHeaders = match[1].split(''); colHeaders = match[2].split(''); }
            else if (/^[1-5]$/.test(cleanKey)) {
                let startNum = parseInt(cleanKey, 10);
                for (let i = 0; i < 5; i++) {
                    let num = (startNum - 1 + i) % 5 + 1;
                    rowHeaders.push(num.toString()); colHeaders.push(num.toString());
                }
            } else { rowHeaders = colHeaders = ['1', '2', '3', '4', '5']; }
            return { rows: rowHeaders, cols: colHeaders };
        },
        encrypt: (text, key) => {
            const { rows, cols } = CipherEngine["toa-do"].getHeaders(key);
            return text.toUpperCase().trim().split(/\s+/).map(word => {
                return word.split('').map(char => {
                    let targetChar = char === 'J' ? 'I' : char;
                    for (let r = 0; r < 5; r++) { for (let c = 0; c < 5; c++) { if (CipherEngine["toa-do"].matrix[r][c] === targetChar) return rows[r] + cols[c]; } }
                    return char;
                }).join('-');
            }).join(' ');
        },
        decrypt: (text, key) => {
            const { rows, cols } = CipherEngine["toa-do"].getHeaders(key);
            return text.trim().split(/\s+/).map(word => {
                return word.split('-').map(token => {
                    if (token.length === 2) {
                        let rIdx = rows.indexOf(token[0]), cIdx = cols.indexOf(token[1]);
                        if (rIdx !== -1 && cIdx !== -1) return CipherEngine["toa-do"].matrix[rIdx][cIdx];
                    }
                    return token;
                }).join('');
            }).join(' ');
        }
    },

    // ==========================================
    // CÁC HÀM HỖ TRỢ TỰ ĐỘNG TÍNH TOÁN MA TRẬN TỐI ƯU
    // ==========================================
    _findBestMatrixSize: (len, forceSquare = false) => {
        if (forceSquare) {
            const side = Math.ceil(Math.sqrt(len));
            return { rows: side, cols: side };
        }

        let startSide = Math.ceil(Math.sqrt(len));
        let bestRows = startSide;
        let bestCols = Math.ceil(len / startSide);
        let minZ = (bestRows * bestCols) - len;

        // Quét ngược từ căn bậc hai xuống để ưu tiên các cấu trúc có X và Y sát nhau nhất (|X - Y| nhỏ nhất)
        for (let r = startSide; r >= 2; r--) {
            let c = Math.ceil(len / r);
            let numZ = (r * c) - len;

            // Nếu tìm thấy cấu trúc có số lượng chèn Z ít hơn hoặc bằng nhưng dáng ma trận cân đối hơn
            if (numZ < minZ || (numZ === minZ && Math.abs(c - r) < Math.abs(bestCols - bestRows))) {
                minZ = numZ;
                bestRows = r;
                bestCols = c;
            }
        }

        return { rows: bestRows, cols: bestCols };
    },

    // HÀM XUẤT MA TRẬN TRẦN VỚI KHOẢNG CÁCH NGẮN NHẤT (1 SPACE)
    _generatePlainMatrixView: (matrix, title) => {
        const rows = matrix.length;
        const cols = matrix[0].length;
        let output = `--- MA TRẬN CHỮ SẮP XẾP (${title.toUpperCase()}) ---\n\n`;

        for (let r = 0; r < rows; r++) {
            let rowStr = "";
            for (let c = 0; c < cols; c++) {
                rowStr += (matrix[r][c] || ' ') + " "; // Đúng 1 khoảng cách đơn
            }
            output += rowStr.trimEnd() + "\n";
        }
        return output;
    },

    // 5. LOẠI: MƯA RƠI (ĐIỀN XÉO) - TỐI ƯU KHOẢNG CÁCH XY
    "mua-roi": {
        encrypt: (text) => {
            let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
            if (!cleanText) return "Vui lòng nhập văn bản!";

            const { rows, cols } = CipherEngine._findBestMatrixSize(cleanText.length, false);
            let grid = Array(rows).fill(null).map(() => Array(cols).fill(''));

            let charIdx = 0;
            for (let k = 0; k < rows + cols - 1; k++) {
                for (let r = 0; r < rows; r++) {
                    let c = k - r;
                    if (c >= 0 && c < cols) {
                        if (charIdx < cleanText.length) {
                            grid[r][c] = cleanText[charIdx++];
                        } else {
                            grid[r][c] = 'Z';
                        }
                    }
                }
            }

            let cipherText = "";
            for (let r = 0; r < rows; r++) { cipherText += grid[r].join(''); }

            let matrixView = CipherEngine._generatePlainMatrixView(grid, `Mưa Rơi: ${rows}x${cols}`);
            return `${matrixView}\n>> BẢN MÃ THU ĐƯỢC:\n${cipherText}`;
        },
        decrypt: (text) => {
            let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
            if (!cleanText) return "Vui lòng nhập mật thư!";

            const { rows, cols } = CipherEngine._findBestMatrixSize(cleanText.length, false);
            let grid = []; let idx = 0;
            for (let r = 0; r < rows; r++) {
                grid.push(cleanText.substr(idx, cols).split(''));
                idx += cols;
            }

            let plainText = "";
            for (let k = 0; k < rows + cols - 1; k++) {
                for (let r = 0; r < rows; r++) {
                    let c = k - r;
                    if (c >= 0 && c < cols) { plainText += grid[r][c]; }
                }
            }

            let matrixView = CipherEngine._generatePlainMatrixView(grid, `Mưa Rơi Giải Mã: ${rows}x${cols}`);
            return `${matrixView}\n>> BẠCH VĂN ĐÃ GIẢI ĐƯỢC:\n${plainText}`;
        }
    },

    // 6. LOẠI: XOẮN ỐC - KHÔNG KHUNG
    "xoan-oc": {
        getSpiralCoords: (size) => {
            let coords = [];
            let top = 0, bottom = size - 1, left = 0, right = size - 1;
            while (top <= bottom && left <= right) {
                for (let i = left; i <= right; i++) coords.push([top, i]); top++;
                for (let i = top; i <= bottom; i++) coords.push([i, right]); right--;
                if (top <= bottom) { for (let i = right; i >= left; i--) coords.push([bottom, i]); bottom--; }
                if (left <= right) { for (let i = bottom; i >= top; i--) coords.push([i, left]); left++; }
            }
            return coords;
        },
        encrypt: (text, key) => {
            let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
            if (!cleanText) return "Vui lòng nhập văn bản!";

            const { rows: size } = CipherEngine._findBestMatrixSize(cleanText.length, true);
            let grid = Array(size).fill(null).map(() => Array(size).fill(''));
            let coords = CipherEngine["xoan-oc"].getSpiralCoords(size);

            const isInsideOut = key.trim().toLowerCase().includes("trong");
            if (isInsideOut) coords.reverse();

            for (let i = 0; i < size * size; i++) {
                let [r, c] = coords[i];
                if (i < cleanText.length) {
                    grid[r][c] = cleanText[i];
                } else {
                    grid[r][c] = 'Z';
                }
            }

            let cipherText = "";
            for (let r = 0; r < size; r++) { cipherText += grid[r].join(''); }

            let modeText = isInsideOut ? "Từ trong ra" : "Từ ngoài vào";
            let matrixView = CipherEngine._generatePlainMatrixView(grid, `Xoắn Ốc (${modeText}): ${size}x${size}`);
            return `${matrixView}\n>> BẢN MÃ THU ĐƯỢC:\n${cipherText}`;
        },
        decrypt: (text, key) => {
            let cleanText = text.toUpperCase().replace(/[^A-Z]/g, '');
            if (!cleanText) return "Vui lòng nhập mật thư!";

            const size = Math.ceil(Math.sqrt(cleanText.length));
            let grid = []; let idx = 0;
            for (let r = 0; r < size; r++) {
                grid.push(cleanText.substr(idx, size).split(''));
                idx += size;
            }

            let coords = CipherEngine["xoan-oc"].getSpiralCoords(size);
            const isInsideOut = key.trim().toLowerCase().includes("trong");
            if (isInsideOut) coords.reverse();

            let plainText = "";
            for (let i = 0; i < coords.length; i++) {
                let [r, c] = coords[i];
                if (grid[r] && grid[r][c]) { plainText += grid[r][c]; }
            }

            let matrixView = CipherEngine._generatePlainMatrixView(grid, `Xoắn Ốc Giải Mã: ${size}x${size}`);
            return `${matrixView}\n>> BẠCH VĂN ĐÃ GIẢI ĐƯỢC:\n${plainText}`;
        }
    }
};

// ==========================================
// BỘ LẮNG NGHE SỰ KIỆN GIAO DIỆN (UI EVENT LISTENERS)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const cipherType = document.getElementById("cipherType");
    const cipherKey = document.getElementById("cipherKey");
    const inputText = document.getElementById("inputText");
    const outputText = document.getElementById("outputText");

    const processCipher = (mode) => {
        const type = cipherType.value;
        const key = cipherKey.value.trim();
        const text = inputText.value;

        const bypassKey = (type === "bang-tra" || type === "mua-roi" || type === "xoan-oc");
        if (!key && !bypassKey) {
            outputText.value = "Vui lòng nhập Khóa (Key)!";
            return;
        }

        if (CipherEngine[type]) {
            outputText.value = mode === "encrypt"
                ? CipherEngine[type].encrypt(text, key)
                : CipherEngine[type].decrypt(text, key);
        } else {
            outputText.value = "Tính năng đang được phát triển!";
        }
    };

    document.getElementById("btnEncrypt").addEventListener("click", () => processCipher("encrypt"));
    document.getElementById("btnDecrypt").addEventListener("click", () => processCipher("decrypt"));
});