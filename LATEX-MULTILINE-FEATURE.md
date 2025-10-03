# LaTeX Multi-line Environment Support

## Overview
MindNote now supports LaTeX multi-line environments, allowing users to write complex mathematical equations using standard LaTeX syntax beyond the basic inline `$...$` and display `$$...$$` modes.

## Supported Environments
The following LaTeX environments are now supported:

### Alignment Environments
- **`align`** - Multi-line equations with alignment
  ```latex
  \begin{align}
  x &= a + b \\
  y &= c + d
  \end{align}
  ```

- **`align*`** - Unnumbered aligned equations
  ```latex
  \begin{align*}
  f(x) &= x^2 + 2x + 1 \\
  &= (x + 1)^2
  \end{align*}
  ```

- **`aligned`** - Aligned environment for use within equations
  ```latex
  \begin{aligned}
  a &= b \\
  c &= d
  \end{aligned}
  ```

### Equation Environments
- **`equation`** - Single numbered equation
  ```latex
  \begin{equation}
  E = mc^2
  \end{equation}
  ```

- **`equation*`** - Single unnumbered equation
  ```latex
  \begin{equation*}
  F = ma
  \end{equation*}
  ```

### Gathering Environments
- **`gather`** - Multiple centered equations
  ```latex
  \begin{gather}
  a = b \\
  c = d
  \end{gather}
  ```

- **`gather*`** - Unnumbered gathered equations
  ```latex
  \begin{gather*}
  x + y = z \\
  p + q = r
  \end{gather*}
  ```

- **`gathered`** - Gathered environment for use within equations
  ```latex
  \begin{gathered}
  a = b \\
  c = d
  \end{gathered}
  ```

### Matrix Environments
- **`matrix`** - Basic matrix
  ```latex
  \begin{matrix}
  a & b \\
  c & d
  \end{matrix}
  ```

- **`pmatrix`** - Matrix with parentheses
  ```latex
  \begin{pmatrix}
  1 & 2 \\
  3 & 4
  \end{pmatrix}
  ```

- **`bmatrix`** - Matrix with square brackets
  ```latex
  \begin{bmatrix}
  1 & 0 \\
  0 & 1
  \end{bmatrix}
  ```

- **`vmatrix`** - Matrix with vertical bars (determinant)
  ```latex
  \begin{vmatrix}
  a & b \\
  c & d
  \end{vmatrix}
  ```

- **`Vmatrix`** - Matrix with double vertical bars
  ```latex
  \begin{Vmatrix}
  a & b \\
  c & d
  \end{Vmatrix}
  ```

### Other Environments
- **`cases`** - Piecewise functions
  ```latex
  \begin{cases}
  x^2 & \text{if } x \geq 0 \\
  -x^2 & \text{if } x < 0
  \end{cases}
  ```

- **`split`** - Split long equations
  ```latex
  \begin{split}
  a &= b + c \\
  &\quad + d + e
  \end{split}
  ```

## Rendering Details

### Visual Styling
LaTeX environments are rendered with special styling:
- **Card-like container** with subtle background (theme-aware)
- **Border** to visually separate from regular content
- **Padding** for breathing room
- **Horizontal scroll** for wide equations
- **Centered display** for alignment

### Theme Integration
The LaTeX blocks automatically adapt to the current theme:
- Light theme: Light gray background with dark border
- Dark theme: Dark gray background with light border

## Usage Examples

### Complex Equation System
```latex
\begin{align}
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{H} &= \mathbf{J} + \frac{\partial \mathbf{D}}{\partial t} \\
\nabla \cdot \mathbf{D} &= \rho \\
\nabla \cdot \mathbf{B} &= 0
\end{align}
```

### Piecewise Function
```latex
f(x) = \begin{cases}
  \sin(x) & \text{if } 0 \leq x < \pi \\
  \cos(x) & \text{if } \pi \leq x < 2\pi \\
  0 & \text{otherwise}
\end{cases}
```

### Matrix Operations
```latex
\mathbf{A} = \begin{bmatrix}
  a_{11} & a_{12} & a_{13} \\
  a_{21} & a_{22} & a_{23} \\
  a_{31} & a_{32} & a_{33}
\end{bmatrix}
```

## Technical Implementation

### Processing Pipeline
1. **Preprocessing**: `preprocessLatex()` function scans markdown for LaTeX environments
2. **Pattern Matching**: Uses regex to identify `\begin{environment}...\end{environment}` blocks
3. **Rendering**: KaTeX renders with `displayMode: true` and `trust: true` options
4. **Wrapping**: Output wrapped in `.latex-block` div for styling

### KaTeX Configuration
```typescript
katex.renderToString(mathContent, {
  displayMode: true,
  throwOnError: false,
  trust: true // Required for \begin and \end commands
});
```

### Supported in Both Views
LaTeX environments work in:
- **Editor preview** (split view)
- **Full preview mode**
- **Exported notes**

## Browser Compatibility
LaTeX rendering works in all modern browsers that support:
- ES6+ JavaScript
- CSS Grid and Flexbox
- Web fonts (for KaTeX fonts)

## Performance Considerations
- LaTeX is preprocessed before markdown parsing for efficiency
- KaTeX compilation is done once per environment
- Rendered HTML is cached by the browser
- No re-rendering unless content changes

## Limitations
1. **Nested environments**: Limited nesting support (depends on KaTeX)
2. **Custom commands**: Only KaTeX-supported commands work
3. **Numbering**: Equation numbering not preserved across sessions
4. **References**: Cross-references (`\ref`, `\label`) not supported

## Future Enhancements
- [ ] Equation numbering persistence
- [ ] Cross-reference support
- [ ] Custom LaTeX macros/commands
- [ ] Export to LaTeX format
- [ ] Equation editor UI

## Related Features
- Inline math: `$x^2 + y^2 = z^2$`
- Display math: `$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$`
- Markdown preview with real-time rendering
- Split view with synchronized scrolling

---

**Implementation Date**: December 2024
**KaTeX Version**: 0.16.x
**Status**: ✅ Active and stable
