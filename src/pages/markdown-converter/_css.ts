export const defaultCSSText = `:root {
    --color-background-light: 250, 250, 250;
    --color-background-dark: 26, 26, 26;
    --color-surface-light: 255, 255, 255;
    --color-on-surface-light: 31, 31, 31;
    --color-surface-dark: 31, 31, 31;
    --color-on-surface-dark: 250, 250, 250;
    --color-accent-light: 0, 97, 29;
    --color-on-accent-light: 255, 255, 255;
    --color-accent-dark: 0, 204, 61;
    --color-on-accent-dark: 0, 0, 0;
    --color-background: var(--color-background-light);
    --color-accent: var(--color-accent-light);
    --color-on-accent: var(--color-on-accent-light);
    --color-surface: var(--color-surface-light);
    --color-on-surface: var(--color-on-surface-light);
    --font-family-sans-serif: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
    --font-family-monospace: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace ;

    background-color: rgb(var(--color-background));
    font-family: var(--font-family-sans-serif);
    color: rgb(var(--color-on-surface));
}

@media (prefers-color-scheme: dark) {
    :root {
        --color-background: var(--color-background-dark);
        --color-accent: var(--color-accent-dark);
        --color-on-accent: var(--color-on-accent-dark);
        --color-surface: var(--color-surface-dark);
        --color-on-surface: var(--color-on-surface-dark);

        color-scheme: dark;
    }

    :root * {
        color-scheme: dark;
    }
}

* {
    background-color: transparent;
    box-sizing: border-box;
    color: inherit;
    font-family: inherit;
    letter-spacing: inherit;
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;

    -webkit-tap-highlight-color: transparent;
}

a, button, :is(a, button) * {
    user-select: none;
    text-decoration: none;

    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
}

body {
    padding: 6px 8px;
}

body > :not(:first-child) {
    margin-top: 1em;
}

code {
    font-family: var(--font-family-monospace);
}

img {
    display: block;
}

p, li {
    text-align: justify;
}

img, audio, iframe, video {
    width: 100%;
    border-radius: 4px;
    border: none;
    box-shadow: 0 2px 4px -1px rgba(0, 0, 0, .3);
}

@media (prefers-color-scheme: dark) {
    img, audio, iframe, video {
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, .6);
    }
}

h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
}

h1 {
    font-weight: 100;
    font-size: 44px;
}

h2 {
    font-size: 36px;
}

h3 {
    font-size: 28px;
}

h4 {
    font-size: 20px;
}

h5 {
    font-size: 16px;
}

h6 {
    font-size: 14px;
}

figcaption {
    text-align: center;
    margin-top: 8px;
    font-size: 14px;
}

ul, ol {
    margin-left: 1.5em;
}

code {
    padding: 0 .2em;
    border-radius: .2em;
    background-color: rgba(var(--color-on-surface), .04);
    border: 1px solid rgba(var(--color-on-surface), .04);
}

pre {
    background-color: rgba(var(--color-on-surface), .04);
    border: 1px solid rgba(var(--color-on-surface), .04);
    padding: 8px 12px;
    border-radius: 4px;
    overflow: auto;
}

pre code {
    padding: 0;
    background-color: transparent;
    border: none;
}

a {
    --border-color: rgba(var(--color-accent), .08);

    text-decoration: underline;
    border: 1px solid transparent;
    color: rgb(var(--color-accent));
    transition: all .2s;
    padding: 0 .2em;
    border-radius: .2em;
}

@media (hover: hover) {
    a:hover {
        background-color: rgba(var(--color-accent), .12);
        border-color: var(--border-color);
    }
}

a:active {
    border-color: var(--border-color);
    background-color: rgba(var(--color-accent), .04);
}

blockquote {
    border: 1px solid rgb(var(--color-accent));
    border-left-width: 4px;
    padding: 8px;
    border-radius: 4px;
    position: relative;
}

blockquote > :not(blockquote) {
    padding-right: 12px;
}

blockquote blockquote {
    padding: 8px 8px 8px 12px;
    margin-top: 8px;
    border-radius: 4px;
}

blockquote blockquote::after {
    display: none;
}

hr {
    border-color: rgba(var(--color-on-surface), .32);
    border-style: dashed;
}

table {
    --border-color: rgba(var(--color-on-surface), .32);

    border: 1px solid var(--border-color);
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 4px;
    width: 100%;
    vertical-align: top;
}

th {
    background-color: rgba(var(--color-on-surface), .04);
    border: none;
    padding: 8px 12px;
    text-align: start;
}

th:first-child {
    border-bottom: 1px solid var(--border-color);
    border-radius: 4px 0 0 0;
    border-right: 1px solid var(--border-color);
}

th:nth-child(n+1) {
    border-bottom: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
}

th:last-child {
    border-bottom: 1px solid var(--border-color);
    border-right: none;
    border-radius: 0 4px 0 0;
}

td {
    border: none;
    border-bottom: 1px solid var(--border-color);
    border-right: 1px solid var(--border-color);
    padding: 8px 12px;
    vertical-align: top;
}

td:last-child {
    border-bottom: 1px solid var(--border-color);
    border-right: none;
}

tr:last-child td {
    border-bottom: none;
}`