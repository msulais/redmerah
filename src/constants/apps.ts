import markdown_converter_logo from '@/assets/apps/markdown-converter-logo.svg'
import randomizer_converter_logo from '@/assets/apps/randomizer-logo.svg'
import color_generator_logo from '@/assets/apps/color-generator-logo.svg'
import calculator_logo from '@/assets/apps/calculator-logo.svg'
import tasks_logo from '@/assets/apps/tasks-logo.svg'
import sass_converter_logo from '@/assets/apps/sass-converter-logo.svg'
import notes_logo from '@/assets/apps/notes-logo.svg'
import battery_logo from '@/assets/apps/battery-logo.svg'
import qr_code_logo from '@/assets/apps/qr-code-logo.svg'
import color_gradient_logo from '@/assets/apps/color-gradient/logo.svg'
import emoji_picker_logo from '@/assets/apps/emoji-picker/logo.svg'
import latex_viewer_logo from '@/assets/apps/latex-viewer/logo.svg'
import color_picker_logo from '@/assets/apps/color-picker/logo.svg'
import { RoutesLinks } from '@/enums/links'
import type { AppItem } from '@/types/apps'

export const app_latex_viewer: AppItem = {
	logo_url: latex_viewer_logo.src,
	name: 'LaTeX Viewer',
	description: 'Visualize your LaTeX code effortlessly. Our app renders complex mathematical expressions and scientific notation, making it perfect for students, researchers, and educators.',
	link: RoutesLinks.latex_viewer,
	color: '#C247FF',
	build_number: 1,
	build_version: '0.0.1',
}

export const app_emoji_picker: AppItem = {
	logo_url: emoji_picker_logo.src,
	name: 'Emoji Picker',
	description: 'Emoji Picker is your ultimate emoji companion. Browse, search, and copy emojis with ease. Express yourself with the perfect emoji every time.',
	link: RoutesLinks.emoji_picker,
	color: '#00B0FF',
	build_number: 1,
	build_version: '0.0.1',
}

export const app_color_gradient: AppItem = {
	logo_url: color_gradient_logo.src,
	name: 'Color Gradient',
	description: 'Design beautiful color gradients with our intuitive app. Choose from linear and radial gradients, and stack them for complex effects. Generate clean CSS code to implement your designs.',
	link: RoutesLinks.color_gradient,
	color: '#F5FF00',
	build_number: 1,
	build_version: '0.0.1',
}

export const app_qr_code: AppItem = {
	logo_url: qr_code_logo.src,
	name: 'QR Code',
	description: 'Create and read QR codes effortlessly with our user-friendly app. Share information, websites, contacts, and more using QR codes.',
	link: RoutesLinks.qr_code,
	color: '#FF2222',
	build_number: 2,
	build_version: '0.1.2',
}

export const app_battery: AppItem = {
	logo_url: battery_logo.src,
	name: 'Battery',
	description: 'Stay informed about your device\'s battery health with our accurate and easy-to-use app. Track battery level, charging status, and estimated time to full.',
	link: RoutesLinks.battery,
	color: '#FF800B',
	build_number: 2,
	build_version: '0.1.1',
}

export const app_notes: AppItem = {
	logo_url: notes_logo.src,
	name: 'Notes',
	description: 'Notes is your all-in-one note-taking solution. Capture ideas, add multimedia, and create task lists with ease. Stay organized and productive on the go.',
	link: RoutesLinks.notes,
	color: '#FF1F1F',
	build_number: 1,
	build_version: '0.1.0',
}

export const app_sass_converter: AppItem = {
	logo_url: sass_converter_logo.src,
	name: 'SASS Converter',
	description: 'Simplify your SASS/SCSS development process with our powerful online converter. Quickly and accurately translate your code into clean, optimized CSS.',
	link: RoutesLinks.sass_converter,
	color: '#FF0056',
	build_number: 3,
	build_version: '0.1.0',
}

export const app_tasks: AppItem = {
	logo_url: tasks_logo.src,
	name: 'Tasks',
	description: 'Simple and easy-to-use app that helps you stay organized and on track. With Tasks, you can create tasks, add them to lists, and mark them as completed.',
	link: RoutesLinks.tasks,
	color: '#9735E4',
	build_number: 5,
	build_version: '0.2.0',
}

export const app_calculator: AppItem = {
	logo_url: calculator_logo.src,
	name: 'Calculator',
	description: 'Perform a wide range of calculations with our versatile calculator. From basic arithmetic to advanced scientific functions and programmer tools, we\'ve got you covered.',
	link: RoutesLinks.calculator,
	color: '#026BE3',
	build_number: 6,
	build_version: '0.1.5',
}

export const app_randomizer: AppItem = {
	logo_url: randomizer_converter_logo.src,
	name: 'Randomizer',
	description: 'Explore our Randomizer Hub for a variety of tools that add a touch of unpredictability to your life. Generate random strings, words, numbers, colors, and even assemble teams. Embrace the unexpected!',
	link: RoutesLinks.randomizer,
	color: '#00FF48',
	build_number: 5,
	build_version: '0.1.6',
}

export const app_color_generator: AppItem = {
	logo_url: color_generator_logo.src,
	name: 'Color Generator',
	description: 'Generate accent pallete color for your app. Including color for light and dark mode.',
	link: RoutesLinks.color_generator,
	color: '#39BBFF',
	build_number: 3,
	build_version: '0.1.3',
}

export const app_markdown_converter: AppItem = {
	logo_url: markdown_converter_logo.src,
	name: 'Markdown Converter',
	description: 'Convert markdown to HTML effortlessly with our online markdown converter. Create beautifully formatted web content from plain text using our user-friendly tool.',
	link: RoutesLinks.markdown_converter,
	color: '#01B92A',
	build_number: 6,
	build_version: '0.1.5',
}

export const app_color_picker: AppItem = {
	logo_url: color_picker_logo.src,
	name: 'Color Picker',
	description: 'Quickly and easily pick the perfect color with our online color picker tool.',
	link: RoutesLinks.color_picker,
	color: '#FF0401',
	build_number: 1,
	build_version: '0.0.1',
}

export const apps: AppItem[] = [
	app_color_picker,
	app_latex_viewer,
	app_emoji_picker,
	app_color_gradient,
	app_qr_code,
	app_battery,
	// notes
	app_sass_converter,
	app_tasks,
	app_calculator,
	app_randomizer,
	app_color_generator,
	app_markdown_converter
]