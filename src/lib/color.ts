export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface HSV {
    h: number;
    s: number;
    v: number;
}

export function rgbToHsv({ r, g, b }: RGB): HSV {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    if (d !== 0) {
        switch (max) {
            case r:
                h = (g - b + d * (g < b ? 6 : 0)) / (6 * d);
                break;
            case g:
                h = (b - r + d * 2) / (6 * d);
                break;
            case b:
                h = (r - g + d * 4) / (6 * d);
                break;
        }
    }

    return {
        h,
        s: max === 0 ? 0 : d / max,
        v: max / 255,
    };
}

export function hsvToRgb({ h, s, v }: HSV): RGB {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    let r = 0;
    let g = 0;
    let b = 0;
    switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
}

export function rgbToHex({ r, g, b }: RGB): string {
    const hex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export function hexToRgb(hex: string): RGB {
    return {
        r: Number.parseInt(hex.slice(1, 3), 16),
        g: Number.parseInt(hex.slice(3, 5), 16),
        b: Number.parseInt(hex.slice(5, 7), 16),
    };
}

export function adjustBrightness(rgb: RGB, factor: number): RGB {
    const hsv = rgbToHsv(rgb);
    hsv.v = Math.min(Math.max(0, hsv.v * factor), 1);
    return hsvToRgb(hsv);
}

export function randomColor(brightness: number): RGB {
    return hsvToRgb({ h: Math.random(), s: 1, v: brightness });
}