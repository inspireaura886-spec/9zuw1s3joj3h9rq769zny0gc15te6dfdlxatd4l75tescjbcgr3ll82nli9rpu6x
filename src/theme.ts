// src/theme.ts
export const THEME = {
  width: 1080,
  height: 1920,
  fps: 30,
  totalFrames: 1530, // 51.0s
  safeBottomY: 1440, // Bottom 25% (1440..1920) kept clear of important visuals for external captions
  colors: {
    // Anime-noir dusk sky (no night, no stars)
    duskTop: '#160E2E',
    duskUpperMid: '#2D1D54',
    duskLowerMid: '#6E3562',
    duskHorizon: '#D46A4E',
    duskAmberGlow: '#F29F58',

    // Morning canyon search palette (35.98s - 41.33s)
    dawnTop: '#24204A',
    dawnMid: '#6B496E',
    dawnHorizon: '#E89966',

    // Hard purple-blue cel-shaded shadows & silhouettes
    silhouetteBlack: '#06050B',
    celShadowDark: '#100C24',
    celShadowMid: '#1E1842',
    celRimPurple: '#564399',
    celRimBlue: '#4868B8',
    celRimAmber: '#E57C4E',

    // Featureless matte-black triangle (zero lights, pure flat void)
    triangleMatte: '#030306',
    triangleEdgeSubtle: '#120F24',

    // Green thermal-scope HUD (5.91s - 13.64s & 31.76s - 34.20s)
    thermalBgDark: '#03140A',
    thermalBgMid: '#082E17',
    thermalGrid: '#156E38',
    thermalBright: '#4AFF88',
    thermalWhiteHot: '#D4FFE2',
    thermalColdTriangle: '#010804',

    // High-contrast UI / Document / Text accents
    textWhite: '#F8F6FF',
    textAmber: '#FFB84D',
    textCrimson: '#FF3B4E',
    hudCyan: '#64D2FF',
  },
  fonts: {
    display: "'Impact', 'Arial Black', 'Franklin Gothic Heavy', 'Helvetica Neue', sans-serif",
    sans: "'Helvetica Neue', 'Arial', sans-serif",
    mono: "'Courier New', 'Consolas', monospace",
  },
} as const;
