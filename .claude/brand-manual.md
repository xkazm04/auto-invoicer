# Brand Manual

## Colors

### Paper Perfect Theme (Primary)
- Background: `#F8F7F4` — warm paper off-white
- Text Primary: `#2C2825` — deep warm brown
- Text Secondary: `#5A544D` — medium brown
- Text Muted: `#8A7B6C` / `#9B8B7A` — warm grey-brown
- Accent Label: `#A89888` — dusty tan
- Card From: gradient `#F5F7FA` → `#EEF1F5` (cool grey)
- Card To: gradient `#FBF8F6` → `#F5F0EC` (warm cream)
- Icon From: `#E4E8ED` bg / `#7A8594` color
- Icon To: `#EDE6E0` bg / `#9A8B7C` color
- Input Text: `#3D3730`
- Input Placeholder: `#C5C0BA`
- Summary BG: gradient `#FAF8F5` → `#F5F2EE`
- Dividers: `#E8E4DF`, `#E0D9D2`, `#D5CCC3`
- Status Dot: `amber-400` with glow
- Button Primary: `#3D3730` / hover `#2C2825`
- Button Shadow: `rgba(61,55,48,0.2)`

### Minimal Mono Theme (Alt)
- Full neutral palette (`neutral-50` through `neutral-900`)
- No shadows, no border-radius, pure monochrome

### Global CSS Variables
- Light: `--background: #ffffff`, `--foreground: #171717`
- Dark: `--background: #0a0a0a`, `--foreground: #ededed`

## Typography

- **Headings / Body**: Geist (`--font-geist-sans`)
- **Code / Mono**: Geist Mono (`--font-geist-mono`)
- **Handwritten accents**: Caveat (`--font-caveat`) — used in Paper Perfect theme for labels
- **Fallback**: Arial, Helvetica, sans-serif

## Component Library

- **UI Kit**: Custom (no component library yet)
- **Icons**: Inline SVG (hand-drawn paths)
- **Animations**: CSS transitions (`transition-all`, `transition-colors`, `transition-shadow`)

## Design Tokens

- **Corner radius**: `rounded-xl` / `rounded-2xl` (Paper Perfect), `rounded-none` (Minimal Mono)
- **Shadows**: Layered box-shadows — e.g., `0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)`
- **Spacing**: Tailwind default scale (4px base)
- **Dark mode**: CSS custom properties with `prefers-color-scheme` (not yet theme-integrated)
