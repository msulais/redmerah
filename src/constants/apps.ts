import type { AppItem } from '@/types/apps'
import { RoutesLinks } from '@/enums/links'
import logoMarkdownConverter from '@/assets/images/apps/markdown-converter.svg'
import logoRandomizer from '@/assets/images/apps/randomizer.svg'
import logoColorGenerator from '@/assets/images/apps/color-generator.svg'
import logoCalculator from '@/assets/images/apps/calculator.svg'
import logoTasks from '@/assets/images/apps/tasks.svg'
import logoSassConverter from '@/assets/images/apps/sass-converter.svg'
import logoBattery from '@/assets/images/apps/battery.svg'
import logoQRCode from '@/assets/images/apps/qr-code.svg'
import logoColorGradient from '@/assets/images/apps/color-gradient.svg'
import logoEmojiPicker from '@/assets/images/apps/emoji-picker.svg'
import logoLatexViewer from '@/assets/images/apps/latex-viewer.svg'
import logoColorPicker from '@/assets/images/apps/color-picker.svg'
import logoClock from '@/assets/images/apps/clock.svg'
import logoXmlEscape from '@/assets/images/apps/xml-escape.svg'
import logoJavaScriptMinifer from '@/assets/images/apps/javascript-minifier.svg'
import logoMediaPlayer from '@/assets/images/apps/media-player.svg'
import logoUrlEncoder from '@/assets/images/apps/url-encoder.svg'
import logoDeadPixelTest from '@/assets/images/apps/dead-pixel-test.svg'

export const APP_JAVASCRIPT_MINIFIER: AppItem = {
	logoUrl: logoJavaScriptMinifer.src,
	name: 'JavaScript Minifier',
	description: 'Optimize your website\'s performance with our JavaScript Minifier. Quickly minify JavaScript code for faster load times and reduced file sizes.',
	link: RoutesLinks.javascriptMinifier,
	color: '#FFC500',
	buildNumber: 2,
	buildVersion: '0.0.2',
}

export const APP_XML_ESCAPE: AppItem = {
	logoUrl: logoXmlEscape.src,
	name: 'XML Escape',
	description: 'Effortlessly escape and unescape XML entities with our user-friendly web app. Ensure your data is correctly formatted for XML with our reliable, privacy-focused tool. No third-party dependencies, enhancing performance and security.',
	link: RoutesLinks.xmlEscape,
	color: '#FFF600',
	buildNumber: 1,
	buildVersion: '0.0.1',
}

export const APP_CLOCK: AppItem = {
	logoUrl: logoClock.src,
	name: 'Clock',
	description: 'Discover our versatile clock web app! Display current time, set timers, and more. Your all-in-one time management solution.',
	link: RoutesLinks.clock,
	color: '#0BEA57',
	buildNumber: 1,
	buildVersion: '0.0.1',
}

export const APP_LATEX_VIEWER: AppItem = {
	logoUrl: logoLatexViewer.src,
	name: 'LaTeX Viewer',
	description: 'Visualize your LaTeX code effortlessly. Our app renders complex mathematical expressions and scientific notation, making it perfect for students, researchers, and educators.',
	link: RoutesLinks.latexViewer,
	color: '#C247FF',
	buildNumber: 4,
	buildVersion: '0.0.4',
}

export const APP_EMOJI_PICKER: AppItem = {
	logoUrl: logoEmojiPicker.src,
	name: 'Emoji Picker',
	description: 'Emoji Picker is your ultimate emoji companion. Browse, search, and copy emojis with ease. Express yourself with the perfect emoji every time.',
	link: RoutesLinks.emojiPicker,
	color: '#EEB62F',
	buildNumber: 2,
	buildVersion: '0.0.2',
}

export const APP_COLOR_GRADIENT: AppItem = {
	logoUrl: logoColorGradient.src,
	name: 'Color Gradient',
	description: 'Design beautiful color gradients with our intuitive app. Choose from linear and radial gradients, and stack them for complex effects. Generate clean CSS code to implement your designs.',
	link: RoutesLinks.colorGradient,
	color: '#7BFF2D',
	buildNumber: 5,
	buildVersion: '0.0.9',
}

export const APP_QR_CODE: AppItem = {
	logoUrl: logoQRCode.src,
	name: 'QR Code',
	description: 'Create and read QR codes effortlessly with our user-friendly app. Share information, websites, contacts, and more using QR codes.',
	link: RoutesLinks.qrCode,
	color: '#FF2222',
	buildNumber: 3,
	buildVersion: '0.1.3',
}

export const APP_BATTERY: AppItem = {
	logoUrl: logoBattery.src,
	name: 'Battery',
	description: 'Stay informed about your device\'s battery health with our accurate and easy-to-use app. Track battery level, charging status, and estimated time to full.',
	link: RoutesLinks.battery,
	color: '#FF800B',
	buildNumber: 3,
	buildVersion: '0.1.2',
}

export const APP_SASS_CONVERTER: AppItem = {
	logoUrl: logoSassConverter.src,
	name: 'SASS Converter',
	description: 'Simplify your SASS/SCSS development process with our powerful online converter. Quickly and accurately translate your code into clean, optimized CSS.',
	link: RoutesLinks.sassConverter,
	color: '#FF0056',
	buildNumber: 4,
	buildVersion: '0.1.1',
}

export const APP_TASKS: AppItem = {
	logoUrl: logoTasks.src,
	name: 'Tasks',
	description: 'Simple and easy-to-use app that helps you stay organized and on track. With Tasks, you can create tasks, add them to lists, and mark them as completed.',
	link: RoutesLinks.tasks,
	color: '#9735E4',
	buildNumber: 5,
	buildVersion: '0.2.0',
}

export const APP_CALCULATOR: AppItem = {
	logoUrl: logoCalculator.src,
	name: 'Calculator',
	description: 'Perform a wide range of calculations with our versatile calculator. From basic arithmetic to advanced scientific functions and programmer tools, we\'ve got you covered.',
	link: RoutesLinks.calculator,
	color: '#026BE3',
	buildNumber: 8,
	buildVersion: '0.1.7',
}

export const APP_RANDOMIZER: AppItem = {
	logoUrl: logoRandomizer.src,
	name: 'Randomizer',
	description: 'Explore our Randomizer Hub for a variety of tools that add a touch of unpredictability to your life. Generate random strings, words, numbers, colors, and even assemble teams. Embrace the unexpected!',
	link: RoutesLinks.randomizer,
	color: '#00FF48',
	buildNumber: 7,
	buildVersion: '0.1.8',
}

export const APP_COLOR_GENERATOR: AppItem = {
	logoUrl: logoColorGenerator.src,
	name: 'Color Generator',
	description: 'Generate accent pallete color for your app. Including color for light and dark mode.',
	link: RoutesLinks.colorGenerator,
	color: '#39BBFF',
	buildNumber: 5,
	buildVersion: '0.1.6',
}

export const APP_MARKDOWN_CONVERTER: AppItem = {
	logoUrl: logoMarkdownConverter.src,
	name: 'Markdown Converter',
	description: 'Convert markdown to HTML effortlessly with our online markdown converter. Create beautifully formatted web content from plain text using our user-friendly tool.',
	link: RoutesLinks.markdownConverter,
	color: '#01B92A',
	buildNumber: 8,
	buildVersion: '0.1.8',
}

export const APP_COLOR_PICKER: AppItem = {
	logoUrl: logoColorPicker.src,
	name: 'Color Picker',
	description: 'Quickly and easily pick the perfect color with our online color picker tool.',
	link: RoutesLinks.colorPicker,
	color: '#FF0066',
	buildNumber: 4,
	buildVersion: '0.0.5',
}

export const APP_MEDIA_PLAYER: AppItem = {
	logoUrl: logoMediaPlayer.src,
	name: 'Media Player',
	description: 'Play any media format from images to audio/video files. Load from your device or stream via URL directly in browser.',
	link: RoutesLinks.mediaPlayer,
	color: '#0195FF',
	buildNumber: 1,
	buildVersion: '0.0.1',
}

export const APP_URL_ENCODER: AppItem = {
	logoUrl: logoUrlEncoder.src,
	name: 'URL Encoder',
	description: 'Encode URLs for web safety or decode them to readable text. Our free tool handles special characters, spaces, and UTF-8 encoding/decoding instantly. Perfect for developers and SEO.',
	link: RoutesLinks.urlEncoder,
	color: '#00AAFF',
	buildNumber: 1,
	buildVersion: '0.0.1',
}

export const APP_DEAD_PIXEL_TEST: AppItem = {
	logoUrl: logoDeadPixelTest.src,
	name: 'Dead Pixel Test',
	description: 'Test your screen for dead pixels, stuck pixels, and other display anomalies with our comprehensive web app. Get a crystal-clear view of your monitor\'s health.',
	link: RoutesLinks.deadPixelTest,
	color: '#FF0000',
	buildNumber: 1,
	buildVersion: '0.0.1',
}

export const APPS: AppItem[] = [
	APP_DEAD_PIXEL_TEST,
	APP_URL_ENCODER,
	APP_QR_CODE,
	APP_EMOJI_PICKER,
	APP_MEDIA_PLAYER,
	APP_RANDOMIZER,
	APP_JAVASCRIPT_MINIFIER,
	APP_COLOR_PICKER,
	APP_CLOCK,
	APP_XML_ESCAPE,
	APP_LATEX_VIEWER,
	APP_COLOR_GRADIENT,
	APP_BATTERY,
	APP_SASS_CONVERTER,
	// APP_TASKS,
	APP_CALCULATOR,
	APP_COLOR_GENERATOR,
	APP_MARKDOWN_CONVERTER
]