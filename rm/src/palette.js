// HUMANE CAPTION PALETTES (user 2026-11-03): every caption / tag chip / kinetic card / label colour in every kit reads the
// ACTIVE palette from here. No component may fall back to the old yellow/red template colours.
// Pick per Short: put `import './palette.pick.js';` as the FIRST import of the story's entry.jsx, where palette.pick.js is
//   import {setPalette} from '<rel>/palette.js'; setPalette('sage');
// or pass inputProps {palette: 'sage'}. Unset -> DEFAULT ('stone'), never yellow.
import RAW from './real3d/caption_schemes.json';
import {getInputProps} from 'remotion';
export const PALETTES = Object.fromEntries(Object.entries(RAW).filter(([k]) => !k.startsWith('_')));
export const DEFAULT_PALETTE = 'stone';
let ACTIVE = DEFAULT_PALETTE;
try { const ip = getInputProps(); if (ip && ip.palette && PALETTES[ip.palette]) ACTIVE = ip.palette; } catch (e) { /* no input props */ }
let LOCKED = ACTIVE !== DEFAULT_PALETTE; // input props win over a pick file
export const setPalette = (name) => { if (!PALETTES[name]) throw new Error(`unknown caption palette ${name}`); if (!LOCKED) ACTIVE = name; };
export const paletteName = () => ACTIVE;
export const pal = () => PALETTES[ACTIVE];
// Banned template colours (QA fails if any appears in a story/kit text style): kept here so the check and the kit agree.
export const BANNED = ['#ffd93b', '#ffd21f', '#ff5a4e', '#d6302a', '#ff3b2f', '#ffd400', '#ffff00', '#ff0000'];
