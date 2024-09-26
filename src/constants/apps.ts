import markdown_converter_logo from '@/assets/apps/markdown-converter-logo.svg'
import randomizer_converter_logo from '@/assets/apps/randomizer-logo.svg'
import color_generator_logo from '@/assets/apps/color-generator-logo.svg'
import calculator_logo from '@/assets/apps/calculator-logo.svg'
import tasks_logo from '@/assets/apps/tasks-logo.svg'
import sass_converter_logo from '@/assets/apps/sass-converter-logo.svg'
import notes_logo from '@/assets/apps/notes-logo.svg'
import battery_logo from '@/assets/apps/battery-logo.svg'
import qr_code_logo from '@/assets/apps/qr-code-logo.svg'
import { _src } from './string'
import { RoutesLinks } from '@/enums/links'
import type { AppItem } from '@/types/apps'

export const qrCode: AppItem = {
    logoURL: qr_code_logo[_src],
    name: 'QR Code',
    description: 'Create and read QR codes effortlessly with our user-friendly app. Share information, websites, contacts, and more using QR codes.',
    link: RoutesLinks.qrCode,
    color: '#FF2222',
    buildNumber: 1,
    buildVersion: '0.1.0',
}

export const battery: AppItem = {
    logoURL: battery_logo[_src],
    name: 'Battery',
    description: 'Stay informed about your device\'s battery health with our accurate and easy-to-use app. Track battery level, charging status, and estimated time to full.',
    link: RoutesLinks.battery,
    color: '#FF800B',
    buildNumber: 2,
    buildVersion: '0.1.1',
}

export const notes: AppItem = {
    logoURL: notes_logo[_src],
    name: 'Notes',
    description: 'Notes is your all-in-one note-taking solution. Capture ideas, add multimedia, and create task lists with ease. Stay organized and productive on the go.',
    link: RoutesLinks.notes,
    color: '#FF1F1F',
    buildNumber: 1,
    buildVersion: '0.1.0',
}

export const sassConverter: AppItem = {
    logoURL: sass_converter_logo[_src],
    name: 'SASS Converter',
    description: 'Simplify your SASS/SCSS development process with our powerful online converter. Quickly and accurately translate your code into clean, optimized CSS.',
    link: RoutesLinks.sassConverter,
    color: '#FF0056',
    buildNumber: 1,
    buildVersion: '0.0.1',
}

export const tasks: AppItem = {
    logoURL: tasks_logo[_src],
    name: 'Tasks',
    description: 'Simple and easy-to-use app that helps you stay organized and on track. With Tasks, you can create tasks, add them to lists, and mark them as completed.',
    link: RoutesLinks.tasks,
    color: '#9735E4',
    buildNumber: 4,
    buildVersion: '0.1.4',
}

export const calculator: AppItem = {
    logoURL: calculator_logo[_src],
    name: 'Calculator',
    description: 'Looking for a reliable and comprehensive calculator app? Look no further than our all-in-one calculator! With 5 calculators in one app, you can tackle any calculation that comes your way.',
    link: RoutesLinks.calculator,
    color: '#026BE3',
    buildNumber: 4,
    buildVersion: '0.1.3',
}

export const randomizer: AppItem = {
    logoURL: randomizer_converter_logo[_src],
    name: 'Randomizer',
    description: 'Explore our Randomizer Hub for a variety of tools that add a touch of unpredictability to your life. Generate random strings, words, numbers, colors, and even assemble teams. Embrace the unexpected!',
    link: RoutesLinks.randomizer,
    color: '#00FF48',
    buildNumber: 3,
    buildVersion: '0.1.3',
}

export const colorGenerator: AppItem = {
    logoURL: color_generator_logo[_src],
    name: 'Color generator',
    description: 'Generate accent pallete color for your app. Including color for light and dark mode.',
    link: RoutesLinks.colorGenerator,
    color: '#39BBFF',
    buildNumber: 3,
    buildVersion: '0.1.3',
}

export const markdownConverter: AppItem = {
    logoURL: markdown_converter_logo[_src],
    name: 'Markdown converter',
    description: 'Convert markdown to HTML effortlessly with our online markdown converter. Create beautifully formatted web content from plain text using our user-friendly tool.',
    link: RoutesLinks.markdownConverter,
    color: '#01B92A',
    buildNumber: 5,
    buildVersion: '0.1.4',
}

export const apps: AppItem[] = [
    qrCode,
    battery,
    // notes
    sassConverter,
    tasks,
    calculator,
    randomizer,
    colorGenerator,
    markdownConverter
]