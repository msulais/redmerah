import * as Ids from '../shared/ids.enum.js'
import * as Minify from './minify.js'
import * as Constant from '../shared/constant.enum.js'
import { $ } from "./dom-utils.js"
import { delegateEvent } from '@/utils/event-registry'
import { downloadFile, pickFile, readFileAsText } from '@/utils/file'

const _ref_openFile       = $(Ids.PopoverAppBarMoreOpenFile) as HTMLButtonElement
const _ref_resetInput     = $(Ids.PopoverAppBarMoreReset) as HTMLButtonElement
const _ref_copyOutput     = $(Ids.PopoverAppBarMoreCopy) as HTMLButtonElement
const _ref_downloadOutput = $(Ids.PopoverAppBarMoreDownload) as HTMLButtonElement

function _initEvents(): void {
	delegateEvent(_ref_openFile, 'click', () => {
		pickFile('text/javascript', true).then(async (files) => {
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
				alert("Unable reading selected file")
				return
			}

			Minify.sg_input.set(text)
		})
	})

	delegateEvent(_ref_resetInput, 'click', () => {
		Minify.sg_input.set(Constant.DEFAULT_JAVASCRIPT_INPUT_TEXT)
	})

	delegateEvent(_ref_copyOutput, 'click', () => {
		navigator.clipboard.writeText(Minify.sg_output())
	})

	delegateEvent(_ref_downloadOutput, 'click', () => {
		downloadFile(new Blob([Minify.sg_output()]), 'output.min.js')
	})
}

export default () => {
	_initEvents()
}