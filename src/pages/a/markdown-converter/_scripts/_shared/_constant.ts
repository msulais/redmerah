import { APP_MARKDOWN_CONVERTER } from "@/constants/apps"
import { PlatformAnimationMode, PlatformThemeMode } from "@/enums/platforms"
import type { AppItem } from "@/types/apps"
import { pxToRem } from "@/utils/css"

export const APP: AppItem = APP_MARKDOWN_CONVERTER
export const DEFAULT_THEME = PlatformThemeMode.auto
export const DEFAULT_ANIMATION = PlatformAnimationMode.auto
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_CSS_TEXT = `:root {
    --g-color-background-light: 250, 250, 250;
    --g-color-background-dark: 26, 26, 26;
    --g-color-surface-light: 255, 255, 255;
    --g-color-on-surface-light: 31, 31, 31;
    --g-color-surface-dark: 31, 31, 31;
    --g-color-on-surface-dark: 250, 250, 250;
    --g-color-accent-light: 0, 110, 21;
    --g-color-accent-dark: 74, 226, 80;
    --g-color-on-accent-light: 255, 255, 255;
    --g-color-on-accent-dark: 0, 57, 6;
    --g-color-background: var(--g-color-background-light);
    --g-color-accent: var(--g-color-accent-light);
    --g-color-on-accent: var(--g-color-on-accent-light);
    --g-color-surface: var(--g-color-surface-light);
    --g-color-on-surface: var(--g-color-on-surface-light);
    --g-font-family-sans-serif: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
    --g-font-family-monospace: ui-monospace, Menlo, Monaco, "Cascadia Mono", "Segoe UI Mono", "Roboto Mono", "Oxygen Mono", "Ubuntu Monospace", "Source Code Pro", "Fira Mono", "Droid Sans Mono", "Courier New", monospace ;

    background-color: rgb(var(--g-color-background));
    font-family: var(--g-font-family-sans-serif);
    color: rgb(var(--g-color-on-surface));
}

@media (prefers-color-scheme: dark) {
    :root {
        --g-color-background: var(--g-color-background-dark);
        --g-color-accent: var(--g-color-accent-dark);
        --g-color-on-accent: var(--g-color-on-accent-dark);
        --g-color-surface: var(--g-color-surface-dark);
        --g-color-on-surface: var(--g-color-on-surface-dark);

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
    padding: ${pxToRem(6)}rem ${pxToRem(8)}rem;
}

body > :not(:first-child) {
    margin-top: 1em;
}

code {
    font-family: var(--g-font-family-monospace);
}

img {
    display: block;
}

p, li {
    text-align: justify;
}

img, audio, iframe, video {
    width: 100%;
    border-radius: ${pxToRem(4)}rem;
    border: none;
    box-shadow: 0 ${pxToRem(2)}rem ${pxToRem(4)}rem -${pxToRem(1)}rem rgba(0, 0, 0, .3);
}

@media (prefers-color-scheme: dark) {
    img, audio, iframe, video {
        box-shadow: 0 ${pxToRem(2)}rem ${pxToRem(4)}rem -${pxToRem(1)}rem rgba(0, 0, 0, .6);
    }
}

h1, h2, h3, h4, h5, h6 {
    font-weight: 500;
}

h1 {
    font-weight: 100;
    font-size: ${pxToRem(44)}rem;
}

h2 {
    font-size: ${pxToRem(36)}rem;
}

h3 {
    font-size: ${pxToRem(28)}rem;
}

h4 {
    font-size: ${pxToRem(20)}rem;
}

h5 {
    font-size: ${pxToRem(16)}rem;
}

h6 {
    font-size: ${pxToRem(14)}rem;
}

figcaption {
    text-align: center;
    margin-top: ${pxToRem(8)}rem;
    font-size: ${pxToRem(14)}rem;
}

ul, ol {
    margin-left: 1.5em;
}

code {
    padding: 0 .2em;
    border-radius: .2em;
    background-color: rgba(var(--g-color-on-surface), .04);
    border: ${pxToRem(1)}rem solid rgba(var(--g-color-on-surface), .04);
}

pre {
    background-color: rgba(var(--g-color-on-surface), .04);
    border: ${pxToRem(1)}rem solid rgba(var(--g-color-on-surface), .04);
    padding: ${pxToRem(8)}rem ${pxToRem(12)}rem;
    border-radius: ${pxToRem(4)}rem;
    overflow: auto;
}

pre code {
    padding: 0;
    background-color: transparent;
    border: none;
}

a {
    --border-color: rgba(var(--g-color-accent), .08);

    text-decoration: underline;
    border: ${pxToRem(1)}rem solid transparent;
    color: rgb(var(--g-color-accent));
    transition: all .2s;
    padding: 0 .2em;
    border-radius: .2em;
}

@media (hover: hover) {
    a:hover {
        background-color: rgba(var(--g-color-accent), .12);
        border-color: var(--border-color);
    }
}

a:active {
    border-color: var(--border-color);
    background-color: rgba(var(--g-color-accent), .04);
}

blockquote {
    border: ${pxToRem(1)}rem solid rgb(var(--g-color-accent));
    border-left-width: ${pxToRem(4)}rem;
    padding: ${pxToRem(8)}rem;
    border-radius: ${pxToRem(4)}rem;
    position: relative;
}

blockquote > :not(blockquote) {
    padding-right: ${pxToRem(12)}rem;
}

blockquote blockquote {
    padding: ${pxToRem(8)}rem ${pxToRem(8)}rem ${pxToRem(8)}rem ${pxToRem(12)}rem;
    margin-top: ${pxToRem(8)}rem;
    border-radius: ${pxToRem(4)}rem;
}

blockquote blockquote::after {
    display: none;
}

hr {
    border-color: rgba(var(--g-color-on-surface), .32);
    border-style: dashed;
}

table {
    --border-color: rgba(var(--g-color-on-surface), .32);

    border: ${pxToRem(1)}rem solid var(--border-color);
    border-collapse: separate;
    border-spacing: 0;
    border-radius: ${pxToRem(4)}rem;
    width: 100%;
    vertical-align: top;
}

th {
    background-color: rgba(var(--g-color-on-surface), .04);
    border: none;
    padding: ${pxToRem(8)}rem ${pxToRem(12)}rem;
    text-align: start;
}

th:first-child {
    border-bottom: ${pxToRem(1)}rem solid var(--border-color);
    border-radius: ${pxToRem(4)}rem 0 0 0;
    border-right: ${pxToRem(1)}rem solid var(--border-color);
}

th:nth-child(n+1) {
    border-bottom: ${pxToRem(1)}rem solid var(--border-color);
    border-right: ${pxToRem(1)}rem solid var(--border-color);
}

th:last-child {
    border-bottom: ${pxToRem(1)}rem solid var(--border-color);
    border-right: none;
    border-radius: 0 ${pxToRem(4)}rem 0 0;
}

td {
    border: none;
    border-bottom: ${pxToRem(1)}rem solid var(--border-color);
    border-right: ${pxToRem(1)}rem solid var(--border-color);
    padding: ${pxToRem(8)}rem ${pxToRem(12)}rem;
    vertical-align: top;
}

td:last-child {
    border-bottom: ${pxToRem(1)}rem solid var(--border-color);
    border-right: none;
}

tr:last-child td {
    border-bottom: none;
}`
export const DEFAULT_PREVIEW_TEXT = `<style>${DEFAULT_CSS_TEXT}</style><h1>Welcome to the Markdown Converter!</h1>
<p>This editor allows you to write Markdown text and instantly see the corresponding HTML output. Here are some examples of Markdown syntax:</p>
<h2>Headings</h2>
<p>You can create headings by using hash symbols (#). The number of hash symbols indicates the level of the heading.</p>
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
<h2>Emphasis</h2>
<p>You can add emphasis to text using asterisks (*) or underscores (_).</p>
<p><em>Italic</em>
<strong>Bold</strong>
<em>Italic</em>
<strong>Bold</strong>
<em><strong>Bold+Italic</strong></em></p>
<h2>Lists</h2>
<p>You can create ordered and unordered lists.</p>
<p>Unordered list:</p>
<ul>
<li>Item 1<ul>
<li>Item 1.1</li>
<li>Item 1.2</li>
</ul>
</li>
<li>Item 2</li>
<li>Item 3</li>
</ul>
<ul>
<li>Item 1<ul>
<li>Item 1.1</li>
<li>Item 1.2</li>
</ul>
</li>
<li>Item 2</li>
<li>Item 3</li>
</ul>
<p>Ordered list:</p>
<ol>
<li>Item 1<ol>
<li>Item 1.1</li>
<li>Item 1.2</li>
</ol>
</li>
<li>Item 2</li>
<li>Item 3</li>
</ol>
<h2>Links</h2>
<p>You can create links using square brackets for the link text and parentheses for the URL.</p>
<p><a href="https://redmerah.com/markdown-converter">Markdown Converter</a></p>
<h2>Images</h2>
<p>You can add images using similar syntax as links, but with an exclamation mark (!) in front.</p>
<p><img src="https://loremflickr.com/720/405/abstract" alt="Alt Text"></p>
<h2>Block Code</h2>
<p>You can represent blocks of code using triple backticks (\`\`\`).</p>
<pre><code class="language-python">def greet(name):
        print(f"Hello, {name}!")

greet("user A")
# output: Hello, user A
</code></pre>
<h2>Inline Code</h2>
<p>You can highlight inline code by enclosing it in single backticks (\`).</p>
<p>To install a package, use the <code>pip install</code> command.</p>
<h2>Tables</h2>
<p>You can create tables using hyphens (-) for the header row and pipes (|) to separate columns.</p>
<table>
<thead>
<tr>
<th>Column 1</th>
<th>Column 2</th>
</tr>
</thead>
<tbody><tr>
<td>Cell 1</td>
<td>Cell 2</td>
</tr>
<tr>
<td>Cell 3</td>
<td>Cell 4</td>
</tr>
</tbody></table>
<h2>Blockquote</h2>
<p>You can create blockquotes by using the greater-than symbol (&gt;) at the beginning of a line.</p>
<blockquote>
<p>This is a blockquote.</p>
<p>It can span multiple lines.</p>
<blockquote>
<p>Nested blockquote</p>
</blockquote>
</blockquote>
<p>Feel free to modify this text and experiment with Markdown syntax. Enjoy editing!</p>
`
export const DEFAULT_MARKDOWN_TEXT = `# Welcome to the Markdown Converter!

This editor allows you to write Markdown text and instantly see the corresponding HTML output. Here are some examples of Markdown syntax:

## Headings

You can create headings by using hash symbols (#). The number of hash symbols indicates the level of the heading.

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Emphasis

You can add emphasis to text using asterisks (*) or underscores (_).

*Italic*
**Bold**
_Italic_
__Bold__
***Bold+Italic***

## Lists

You can create ordered and unordered lists.

Unordered list:
- Item 1
    - Item 1.1
    - Item 1.2
- Item 2
- Item 3

* Item 1
    * Item 1.1
    * Item 1.2
* Item 2
* Item 3

Ordered list:
1. Item 1
     1. Item 1.1
     2. Item 1.2
2. Item 2
3. Item 3

## Links

You can create links using square brackets for the link text and parentheses for the URL.

[Markdown Converter](https://redmerah.com/markdown-converter)

## Images

You can add images using similar syntax as links, but with an exclamation mark (!) in front.

![Alt Text](https://loremflickr.com/720/405/abstract)

## Block Code

You can represent blocks of code using triple backticks (\`\`\`).

\`\`\`python
def greet(name):
        print(f"Hello, {name}!")

greet("User")
# output: Hello, user
\`\`\`

## Inline Code

You can highlight inline code by enclosing it in single backticks (\`).

To install a package, use the \`pip install\` command.

## Tables

You can create tables using hyphens (-) for the header row and pipes (|) to separate columns.

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

## Blockquote

You can create blockquotes by using the greater-than symbol (>) at the beginning of a line.

> This is a blockquote.
>
> It can span multiple lines.
>
> > Nested blockquote

Feel free to modify this text and experiment with Markdown syntax. Enjoy editing!`
export const DEFAULT_HTML_TEXT = `<h1>Welcome to the Markdown Converter!</h1>
<p>This editor allows you to write Markdown text and instantly see the corresponding HTML output. Here are some examples of Markdown syntax:</p>
<h2>Headings</h2>
<p>You can create headings by using hash symbols (#). The number of hash symbols indicates the level of the heading.</p>
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>
<h2>Emphasis</h2>
<p>You can add emphasis to text using asterisks (*) or underscores (_).</p>
<p><em>Italic</em>
  <strong>Bold</strong>
  <em>Italic</em>
  <strong>Bold</strong>
  <em><strong>Bold+Italic</strong></em>
</p>
<h2>Lists</h2>
<p>You can create ordered and unordered lists.</p>
<p>Unordered list:</p>
<ul>
  <li>
    Item 1
    <ul>
      <li>Item 1.1</li>
      <li>Item 1.2</li>
    </ul>
  </li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
<ul>
  <li>
    Item 1
    <ul>
      <li>Item 1.1</li>
      <li>Item 1.2</li>
    </ul>
  </li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
<p>Ordered list:</p>
<ol>
  <li>
    Item 1
    <ol>
      <li>Item 1.1</li>
      <li>Item 1.2</li>
    </ol>
  </li>
  <li>Item 2</li>
  <li>Item 3</li>
</ol>
<h2>Links</h2>
<p>You can create links using square brackets for the link text and parentheses for the URL.</p>
<p><a href="https://redmerah.com/markdown-converter">Markdown Converter</a></p>
<h2>Images</h2>
<p>You can add images using similar syntax as links, but with an exclamation mark (!) in front.</p>
<p><img src="https://loremflickr.com/720/405/abstract" alt="Alt Text"></p>
<h2>Block Code</h2>
<p>You can represent blocks of code using triple backticks (\`\`\`).</p>
<pre><code class="language-python">def greet(name):
        print(f"Hello, {name}!")

greet("User")
# output: Hello, user
</code></pre>
<h2>Inline Code</h2>
<p>You can highlight inline code by enclosing it in single backticks (\`).</p>
<p>To install a package, use the <code>pip install</code> command.</p>
<h2>Tables</h2>
<p>You can create tables using hyphens (-) for the header row and pipes (|) to separate columns.</p>
<table>
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
    <tr>
      <td>Cell 3</td>
      <td>Cell 4</td>
    </tr>
  </tbody>
</table>
<h2>Blockquote</h2>
<p>You can create blockquotes by using the greater-than symbol (>) at the beginning of a line.</p>
<blockquote>
  <p>This is a blockquote.</p>
  <p>It can span multiple lines.</p>
  <blockquote>
    <p>Nested blockquote</p>
  </blockquote>
</blockquote>
<p>Feel free to modify this text and experiment with Markdown syntax. Enjoy editing!</p>`