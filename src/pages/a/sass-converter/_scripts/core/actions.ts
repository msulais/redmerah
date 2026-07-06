import * as Ids from '../shared/ids.enum.js'
import * as Constant from '../shared/constant.enum.js'
import * as Converter from './converter.js'
import * as Tabs from './tabs.js'
import * as TabValues from '../shared/tab-values.enum.js'
import { delegateEvent } from '@/utils/event-registry.js'
import { $ } from './dom-utils.js'
import { downloadFile, pickFile, readFileAsText } from '@/utils/file'

const _ref_outputCSS    = $(Ids.OutputCSS) as HTMLTextAreaElement
const _ref_openFile     = $(Ids.AppBarMoreOpenFile) as HTMLButtonElement
const _ref_resetSASS    = $(Ids.AppBarMoreResetSASS) as HTMLButtonElement
const _ref_resetSCSS    = $(Ids.AppBarMoreResetSCSS) as HTMLButtonElement
const _ref_copySASS     = $(Ids.AppBarMoreCopySASS) as HTMLButtonElement
const _ref_copySCSS     = $(Ids.AppBarMoreCopySCSS) as HTMLButtonElement
const _ref_copyCSS      = $(Ids.AppBarMoreCopyCSS) as HTMLButtonElement
const _ref_downloadSASS = $(Ids.AppBarMoreDownloadSASS) as HTMLButtonElement
const _ref_downloadSCSS = $(Ids.AppBarMoreDownloadSCSS) as HTMLButtonElement
const _ref_downloadCSS  = $(Ids.AppBarMoreDownloadCSS) as HTMLButtonElement

function _initEvents(): void {
	delegateEvent(_ref_openFile, 'click', () => {
		pickFile('.sass,.scss,.css', true).then(async (files) => {
			if (files == null || files.length == 0) {
				return
			}

			let text: string = ''
			try {
				for (let i = 0; i < files.length; i++) {
					if (i > 0) text += '\n\n'

					const file = files[i]!
					text += await readFileAsText(file)
				}
			} catch {
				alert("Unable to read the selected file")
				return
			}

			switch (Tabs.sg_inputTab()) {
			case TabValues.InputSASS:
				Converter.sg_sass.set(text)
				break
			case TabValues.InputSCSS:
				Converter.sg_scss.set(text)
				break
			}
		})
	})

	delegateEvent(_ref_resetSASS, 'click', () => {
		Converter.sg_sass.set(Constant.DEFAULT_SASS_TEXT)
	})

	delegateEvent(_ref_resetSCSS, 'click', () => {
		Converter.sg_scss.set(Constant.DEFAULT_SCSS_TEXT)
	})

	delegateEvent(_ref_copySASS, 'click', () => {
		navigator.clipboard.writeText(Converter.sg_sass())
	})

	delegateEvent(_ref_copySCSS, 'click', () => {
		navigator.clipboard.writeText(Converter.sg_scss())
	})

	delegateEvent(_ref_copyCSS, 'click', () => {
		navigator.clipboard.writeText(_ref_outputCSS.value)
	})

	delegateEvent(_ref_downloadSASS, 'click', () => {
		downloadFile(new Blob([Converter.sg_sass()]), 'style.sass')
	})

	delegateEvent(_ref_downloadSCSS, 'click', () => {
		downloadFile(new Blob([Converter.sg_scss()]), 'style.scss')
	})

	delegateEvent(_ref_downloadCSS, 'click', () => {
		downloadFile(new Blob([_ref_outputCSS.value]), 'style.css')
	})

}

export default () => {
	_initEvents()
}