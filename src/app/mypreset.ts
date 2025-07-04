import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{violet.50}',
            100: '{violet.100}',
            200: '{violet.200}',
            300: '{violet.300}',
            400: '{violet.400}',
            500: '{violet.500}',
            600: '{violet.600}',
            700: '{violet.700}',
            800: '{violet.800}',
            900: '{violet.900}',
            950: '{violet.950}'
        }
    }
});
// primary: {
//   50: '#f5f3ff',   // Lightest (backgrounds)
//   100: '#ede9fe',  // 
//   200: '#ddd6fe',  // Hover backgrounds
//   300: '#c4b5fd',  // Borders
//   400: '#a78bfa',  // Secondary elements
//   500: '#8b5cf6',  // PRIMARY BUTTONS (most visible)
//   600: '#7c3aed',  // 
//   700: '#6d28d9',  // Hover states
//   800: '#5b21b6',  // Text/icons
//   900: '#4c1d95',  // Dark accents
//   950: '#2e1065'   // Darkest (rarely used)
// }
export default MyPreset;