import markdown_converter_logo from '@/assets/apps/markdown-converter-logo.svg'
import randomizer_converter_logo from '@/assets/apps/randomizer-logo.svg'
import color_generator_logo from '@/assets/apps/color-generator-logo.svg'
import calculator_logo from '@/assets/apps/calculator-logo.svg'
import tasks_logo from '@/assets/apps/tasks-logo.svg'
import { _src } from './string'
import type { AppItem } from '@/types/apps'
import { RoutesLinks } from '@/enums/links'

export const apps: AppItem[] = [
    {
        logoURL: tasks_logo[_src],
        title: 'Tasks',
        description: 'Simple and easy-to-use app that helps you stay organized and on track. With Tasks, you can create tasks, add them to lists, and mark them as completed.',
        link: RoutesLinks.tasks,
        color: '#9735E4',
        buildNumber: 2,
        buildVersion: '0.1.2',
    },
    {
        logoURL: calculator_logo[_src],
        title: 'Calculator',
        description: 'Looking for a reliable and comprehensive calculator app? Look no further than our all-in-one calculator! With 5 calculators in one app, you can tackle any calculation that comes your way.',
        link: RoutesLinks.calculator,
        color: '#026BE3',
        buildNumber: 1,
        buildVersion: '0.1.0',
    },
    {
        logoURL: randomizer_converter_logo[_src],
        title: 'Randomizer',
        description: 'Explore our Randomizer Hub for a variety of tools that add a touch of unpredictability to your life. Generate random strings, words, numbers, colors, and even assemble teams. Embrace the unexpected!',
        link: RoutesLinks.randomizer,
        color: '#00FF48',
        buildNumber: 1,
        buildVersion: '0.1.1',
    },
    {
        logoURL: color_generator_logo[_src],
        title: 'Color generator',
        description: 'Generate accent pallete color for your app. Including color for light and dark mode.',
        link: RoutesLinks.colorGenerator,
        color: '#39BBFF',
        buildNumber: 1,
        buildVersion: '0.1.1',
    },
    {
        logoURL: markdown_converter_logo[_src],
        title: 'Markdown converter',
        description: 'Convert markdown to HTML effortlessly with our online markdown converter. Create beautifully formatted web content from plain text using our user-friendly tool.',
        link: RoutesLinks.markdownConverter,
        color: '#01B92A',
        buildNumber: 2,
        buildVersion: '0.1.1',
    },
]