import logoMarkdownConverter from '@/assets/apps/markdown-converter-logo.svg'
import logoRandomizerConverter from '@/assets/apps/randomizer-logo.svg'
import logoColorGenerator from '@/assets/apps/color-generator-logo.svg'
import logoCalculator from '@/assets/apps/calculator-logo.svg'
import logoTasks from '@/assets/apps/tasks-logo.svg'
import logoSassConverter from '@/assets/apps/sass-converter-logo.svg'
import logoNotes from '@/assets/apps/notes-logo.svg'
import logoBattery from '@/assets/apps/battery-logo.svg'
import logoQRCode from '@/assets/apps/qr-code-logo.svg'
import logoColorGradient from '@/assets/apps/color-gradient/logo.svg'
import logoEmojiPicker from '@/assets/apps/emoji-picker/logo.svg'
import logoLatexViewer from '@/assets/apps/latex-viewer/logo.svg'
import logoColorPicker from '@/assets/apps/color-picker/logo.svg'
import logoUSBChecker from '@/assets/apps/usb-checker/logo.svg'
import { RoutesLinks } from '@/enums/links'
import type { AppItem } from '@/types/apps'

export const APP_USB_CHECKER: AppItem = {
	logoUrl: logoUSBChecker.src,
	name: 'USB Checker',
	description: 'Easily check your device\'s USB specifications with our USB Checker web app, powered by the WebUSB API. Ensure compatibility and optimize performance with just a click.',
	link: RoutesLinks.usbChecker,
	color: '#297BE6',
	buildNumber: 1,
	buildVersion: '0.0.1',
}

export const APP_LATEX_VIEWER: AppItem = {
	logoUrl: logoLatexViewer.src,
	name: 'LaTeX Viewer',
	description: 'Visualize your LaTeX code effortlessly. Our app renders complex mathematical expressions and scientific notation, making it perfect for students, researchers, and educators.',
	link: RoutesLinks.latexViewer,
	color: '#C247FF',
	buildNumber: 2,
	buildVersion: '0.0.2',
}

export const APP_EMOJI_PICKER: AppItem = {
	logoUrl: logoEmojiPicker.src,
	name: 'Emoji Picker',
	description: 'Emoji Picker is your ultimate emoji companion. Browse, search, and copy emojis with ease. Express yourself with the perfect emoji every time.',
	link: RoutesLinks.emojiPicker,
	color: '#00B0FF',
	buildNumber: 2,
	buildVersion: '0.0.2',
}

export const APP_COLOR_GRADIENT: AppItem = {
	logoUrl: logoColorGradient.src,
	name: 'Color Gradient',
	description: 'Design beautiful color gradients with our intuitive app. Choose from linear and radial gradients, and stack them for complex effects. Generate clean CSS code to implement your designs.',
	link: RoutesLinks.colorGradient,
	color: '#F5FF00',
	buildNumber: 5,
	buildVersion: '0.0.9',
}

export const APP_QR_CODE: AppItem = {
	logoUrl: logoQRCode.src,
	name: 'QR Code',
	description: 'Create and read QR codes effortlessly with our user-friendly app. Share information, websites, contacts, and more using QR codes.',
	link: RoutesLinks.qrCode,
	color: '#FF2222',
	buildNumber: 2,
	buildVersion: '0.1.2',
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

export const APP_NOTES: AppItem = {
	logoUrl: logoNotes.src,
	name: 'Notes',
	description: 'Notes is your all-in-one note-taking solution. Capture ideas, add multimedia, and create task lists with ease. Stay organized and productive on the go.',
	link: RoutesLinks.notes,
	color: '#FF1F1F',
	buildNumber: 1,
	buildVersion: '0.1.0',
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
	logoUrl: logoRandomizerConverter.src,
	name: 'Randomizer',
	description: 'Explore our Randomizer Hub for a variety of tools that add a touch of unpredictability to your life. Generate random strings, words, numbers, colors, and even assemble teams. Embrace the unexpected!',
	link: RoutesLinks.randomizer,
	color: '#00FF48',
	buildNumber: 5,
	buildVersion: '0.1.6',
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
	color: '#FF0401',
	buildNumber: 4,
	buildVersion: '0.0.5',
}

export const APPS: AppItem[] = [
	APP_USB_CHECKER,
	APP_COLOR_PICKER,
	APP_LATEX_VIEWER,
	APP_EMOJI_PICKER,
	APP_COLOR_GRADIENT,
	APP_QR_CODE,
	APP_BATTERY,
	// APP_NOTES
	APP_SASS_CONVERTER,
	APP_TASKS,
	APP_CALCULATOR,
	APP_RANDOMIZER,
	APP_COLOR_GENERATOR,
	APP_MARKDOWN_CONVERTER
]