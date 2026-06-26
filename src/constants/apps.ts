import type { AppItem } from '@/types/apps'
import * as Routes from '@/enums/routes.enum.js'
import logoMarkdownConverter from '@/assets/images/apps/markdown-converter.svg'
import logoRandomizer from '@/assets/images/apps/randomizer.svg'
import logoColorAccent from '@/assets/images/apps/color-accent.svg'
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
import logoGeolocation from '@/assets/images/apps/geolocation.svg'
import logoCompass from '@/assets/images/apps/compass.svg'
import logoNetworkInformation from '@/assets/images/apps/network-information.svg'
import logoVibrator from '@/assets/images/apps/vibrator.svg'
import logoContrastChecker from '@/assets/images/apps/contrast-checker.svg'
import logoCSSUnitConverter from '@/assets/images/apps/css-unit-converter.svg'

export const APP_CSS_UNIT_CONVERTER: AppItem = {
	logoUrl: logoCSSUnitConverter.src,
	name: 'CSS Unit Converter',
	description: "Instantly convert px, rem, em, %, vw/vh, angle and time formats. Fast, accurate, and copy-ready.",
	link: Routes.CSSUnitConverter,
	color: '#F81B1B',
}

export const APP_CONTRAST_CHECKER: AppItem = {
	logoUrl: logoContrastChecker.src,
	name: 'Contrast Checker',
	description: "Check color contrast for websites, apps, or print materials. Ensure your text is readable on any background.",
	link: Routes.ContrastChecker,
	color: '#0063F7',
}

export const APP_VIBRATOR: AppItem = {
	logoUrl: logoVibrator.src,
	name: 'Vibrator',
	description: "Instantly test the vibration on any compatible device. Use Vibrator to check your hardware's haptic feedback with a variety of patterns and durations in your browser.",
	link: Routes.Vibrator,
	color: '#1AE5E5',
}

export const APP_NETWORK_INFORMATION: AppItem = {
	logoUrl: logoNetworkInformation.src,
	name: 'Network Information',
	description: "Get detailed information about your network connection with Network Information. This app uses the Network Information API to provide real-time data on your connection type, speed, and status.",
	link: Routes.NetworkInformation,
	color: '#FFBD00',
}

export const APP_COMPASS: AppItem = {
	logoUrl: logoCompass.src,
	name: 'Compass',
	description: 'Get a true compass reading instantly with the Compass web app. It\'s a simple, internet-free tool for finding your way, whether you\'re hiking, navigating, or just curious.',
	link: Routes.Compass,
	color: '#1FFF3C',
}

export const APP_GEOLOCATION: AppItem = {
	logoUrl: logoGeolocation.src,
	name: 'Geolocation',
	description: 'Easily test and utilize the browser\'s Geolocation API with our straightforward web app. Get your current latitude, longitude, accuracy, and altitude without any hassle.',
	link: Routes.Geolocation,
	color: '#FF00FF',
}

export const APP_JAVASCRIPT_MINIFIER: AppItem = {
	logoUrl: logoJavaScriptMinifer.src,
	name: 'JavaScript Minifier',
	description: 'Optimize your website\'s performance with our JavaScript Minifier. Quickly minify JavaScript code for faster load times and reduced file sizes.',
	link: Routes.JavaScriptMinifier,
	color: '#FFC500',
}

export const APP_XML_ESCAPE: AppItem = {
	logoUrl: logoXmlEscape.src,
	name: 'XML Escape',
	description: 'Effortlessly escape and unescape XML entities with our user-friendly web app. Ensure your data is correctly formatted for XML with our reliable, privacy-focused tool. No third-party dependencies, enhancing performance and security.',
	link: Routes.XMLEscape,
	color: '#FFF600',
}

export const APP_CLOCK: AppItem = {
	logoUrl: logoClock.src,
	name: 'Clock',
	description: 'Discover our versatile clock web app! Display current time, set timers, and more. Your all-in-one time management solution.',
	link: Routes.Clock,
	color: '#0BEA57',
}

export const APP_LATEX_VIEWER: AppItem = {
	logoUrl: logoLatexViewer.src,
	name: 'LaTeX Viewer',
	description: 'Visualize your LaTeX code effortlessly. Our app renders complex mathematical expressions and scientific notation, making it perfect for students, researchers, and educators.',
	link: Routes.LatexViewer,
	color: '#C247FF',
}

export const APP_EMOJI_PICKER: AppItem = {
	logoUrl: logoEmojiPicker.src,
	name: 'Emoji Picker',
	description: 'Emoji Picker is your ultimate emoji companion. Browse, search, and copy emojis with ease. Express yourself with the perfect emoji every time.',
	link: Routes.EmojiPicker,
	color: '#EEB62F',
}

export const APP_COLOR_GRADIENT: AppItem = {
	logoUrl: logoColorGradient.src,
	name: 'Color Gradient',
	description: 'Design beautiful color gradients with our intuitive app. Choose from linear and radial gradients, and stack them for complex effects. Generate clean CSS code to implement your designs.',
	link: Routes.ColorGradient,
	color: '#7BFF2D',
}

export const APP_QR_CODE: AppItem = {
	logoUrl: logoQRCode.src,
	name: 'QR Code',
	description: 'Create and read QR codes effortlessly with our user-friendly app. Share information, websites, contacts, and more using QR codes.',
	link: Routes.QRCode,
	color: '#FF2222',
}

export const APP_BATTERY: AppItem = {
	logoUrl: logoBattery.src,
	name: 'Battery',
	description: 'Stay informed about your device\'s battery health with our accurate and easy-to-use app. Track battery level, charging status, and estimated time to full.',
	link: Routes.Battery,
	color: '#FF800B',
}

export const APP_SASS_CONVERTER: AppItem = {
	logoUrl: logoSassConverter.src,
	name: 'SASS Converter',
	description: 'Simplify your SASS/SCSS development process with our powerful online converter. Quickly and accurately translate your code into clean, optimized CSS.',
	link: Routes.SASSConverter,
	color: '#FF0056',
}

export const APP_TASKS: AppItem = {
	logoUrl: logoTasks.src,
	name: 'Tasks',
	description: 'Simple and easy-to-use app that helps you stay organized and on track. With Tasks, you can create tasks, add them to lists, and mark them as completed.',
	link: Routes.Tasks,
	color: '#9735E4',
}

export const APP_CALCULATOR: AppItem = {
	logoUrl: logoCalculator.src,
	name: 'Calculator',
	description: 'Perform a wide range of calculations with our versatile calculator. From basic arithmetic to advanced scientific functions and programmer tools, we\'ve got you covered.',
	link: Routes.Calculator,
	color: '#026BE3',
}

export const APP_RANDOMIZER: AppItem = {
	logoUrl: logoRandomizer.src,
	name: 'Randomizer',
	description: 'Explore our Randomizer Hub for a variety of tools that add a touch of unpredictability to your life. Generate random strings, words, numbers, colors, and even assemble teams. Embrace the unexpected!',
	link: Routes.Randomizer,
	color: '#00FF48',
}

export const APP_COLOR_ACCENT: AppItem = {
	logoUrl: logoColorAccent.src,
	name: 'Color Accent',
	description: 'Generate accent pallete color for your app. Including color for light and dark mode.',
	link: Routes.ColorAccent,
	color: '#39BBFF',
}

export const APP_MARKDOWN_CONVERTER: AppItem = {
	logoUrl: logoMarkdownConverter.src,
	name: 'Markdown Converter',
	description: 'Convert markdown to HTML effortlessly with our online markdown converter. Create beautifully formatted web content from plain text using our user-friendly tool.',
	link: Routes.MarkdownConverter,
	color: '#01B92A',
}

export const APP_COLOR_PICKER: AppItem = {
	logoUrl: logoColorPicker.src,
	name: 'Color Picker',
	description: 'Quickly and easily pick the perfect color with our online color picker tool.',
	link: Routes.ColorPicker,
	color: '#FF0066',
}

export const APP_MEDIA_PLAYER: AppItem = {
	logoUrl: logoMediaPlayer.src,
	name: 'Media Player',
	description: 'Play any media format from images to audio/video files. Load from your device or stream via URL directly in browser.',
	link: Routes.MediaPlayer,
	color: '#0195FF',
}

export const APP_URL_ENCODER: AppItem = {
	logoUrl: logoUrlEncoder.src,
	name: 'URL Encoder',
	description: 'Encode URLs for web safety or decode them to readable text. Our free tool handles special characters, spaces, and UTF-8 encoding/decoding instantly. Perfect for developers and SEO.',
	link: Routes.URLEncoder,
	color: '#00AAFF',
}

export const APP_DEAD_PIXEL_TEST: AppItem = {
	logoUrl: logoDeadPixelTest.src,
	name: 'Dead Pixel Test',
	description: 'Test your screen for dead pixels, stuck pixels, and other display anomalies with our comprehensive web app. Get a crystal-clear view of your monitor\'s health.',
	link: Routes.DeadPixelTest,
	color: '#FF0000',
}

export const APPS: AppItem[] = [
	APP_CSS_UNIT_CONVERTER,
	APP_CONTRAST_CHECKER,
	APP_VIBRATOR,
	APP_NETWORK_INFORMATION,
	APP_COMPASS,
	APP_GEOLOCATION,
	APP_DEAD_PIXEL_TEST,
	APP_RANDOMIZER,
	APP_URL_ENCODER,
	APP_QR_CODE,
	APP_EMOJI_PICKER,
	APP_MEDIA_PLAYER,
	APP_JAVASCRIPT_MINIFIER,
	APP_COLOR_PICKER,
	APP_CLOCK,
	APP_XML_ESCAPE,
	APP_LATEX_VIEWER,
	APP_COLOR_GRADIENT,
	APP_BATTERY,
	APP_SASS_CONVERTER,
	APP_CALCULATOR,
	APP_COLOR_ACCENT,
	APP_MARKDOWN_CONVERTER
]