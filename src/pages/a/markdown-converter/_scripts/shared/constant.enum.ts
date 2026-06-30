import * as TabValues from './tab-values.enum.js'
import * as BrTheme from '@/web-components/components/br-theme.server.js'
import * as Apps from "@/constants/apps"
import type { EnumOf } from '@/types/collections.js'

export const APP = Apps.APP_MARKDOWN_CONVERTER
export const DEFAULT_THEME: BrTheme.ThemeMode = BrTheme.ThemeMode.Auto
export const DEFAULT_ANIMATION: BrTheme.Animation = BrTheme.Animation.Auto
export const DEFAULT_TAB_INPUT_VALUE: EnumOf<typeof TabValues> = TabValues.InputMarkdown
export const DEFAULT_TAB_OUTPUT_VALUE: EnumOf<typeof TabValues> = TabValues.OutputPreview
export const DEFAULT_TEXT_WRAP = true
export const DEFAULT_CSS_TEXT = `
/* --- Base Variables (Light Mode Default) --- */
:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --text: #334155;
  --heading: #0f172a;
  --border: #e2e8f0;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --code-bg: #f8fafc;
  --code-text: #db2777;
  --quote-bg: #f1f5f9;
  --quote-border: #94a3b8;
  --table-stripe: #f8fafc;
}

/* --- Dark Mode Variables --- */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0f172a; /* Deep slate background */
    --text: #cbd5e1; /* Legible off-white text */
    --heading: #f8fafc; /* Crisp white for headings */
    --border: #334155; /* Subtle dark border */
    --primary: #60a5fa; /* Brighter blue for links to ensure contrast */
    --primary-hover: #93c5fd;
    --code-bg: #1e293b; /* Slightly lighter than background for code blocks */
    --code-text: #f472b6; /* Bright pink for inline code readability */
    --quote-bg: #1e293b;
    --quote-border: #64748b;
    --table-stripe: #1e293b;
  }
}

/* --- Base Document --- */
html, body {
  margin: 0;
  padding: 0;
  background-color: var(--bg);
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  word-wrap: break-word;
  padding: 2rem;
  /* Smooth transition for users switching themes while the app is open */
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* --- Typography & Spacing --- */
body > *:first-child { margin-top: 0; }
body > *:last-child { margin-bottom: 0; }
p { margin-bottom: 1.25em; }

/* --- Headings --- */
h1, h2, h3, h4, h5, h6 {
  color: var(--heading);
  font-weight: 600;
  line-height: 1.25;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

h1 { font-size: 2.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
h2 { font-size: 1.875rem; border-bottom: 1px solid var(--border); padding-bottom: 0.3em; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; color: var(--quote-border); }

/* --- Links --- */
a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease-in-out;
}

a:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* --- Lists --- */
ul, ol {
  margin-bottom: 1.25em;
  padding-left: 2em;
}

li { margin-bottom: 0.25em; }
ul ul, ul ol, ol ul, ol ol { margin-top: 0.25em; margin-bottom: 0; }

/* --- Blockquotes --- */
blockquote {
  margin: 0 0 1.25em 0;
  padding: 1em 1.5em;
  background-color: var(--quote-bg);
  border-left: 4px solid var(--quote-border);
  border-radius: 0 8px 8px 0;
  color: var(--text);
  font-style: italic;
}

blockquote p:last-child { margin-bottom: 0; }

/* --- Code & Preformatted Text --- */
code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875em;
  background-color: var(--code-bg);
  color: var(--code-text);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

pre {
  background-color: var(--code-bg);
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--border);
  margin-bottom: 1.25em;
}

pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: 0.875em;
}

/* --- Tables --- */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.25em;
}

th, td {
  padding: 0.75em 1em;
  border: 1px solid var(--border);
  text-align: left;
}

th {
  background-color: var(--quote-bg);
  font-weight: 600;
  color: var(--heading);
}

tr:nth-child(even) {
  background-color: var(--table-stripe);
}

/* --- Images --- */
img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
  margin: 1.25em auto;
}

/* --- Horizontal Rules --- */
hr {
  height: 1px;
  background-color: var(--border);
  border: none;
  margin: 2em 0;
}`
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

[Markdown Converter](https://redmerah.com/a/markdown-converter)

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
<p><a href="https://redmerah.com/a/markdown-converter">Markdown Converter</a></p>
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

export const DEFAULT_PREVIEW_TEXT = `<style>${DEFAULT_CSS_TEXT}</style>${DEFAULT_HTML_TEXT}`