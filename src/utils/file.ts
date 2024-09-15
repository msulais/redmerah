import { _input, _oncancel, _onchange, _remove, _multiple, _type, _accept, _file, _files, _click, _onabort, _onerror, _onload, _readAsText, _result, _target } from "@/constants/string"
import { createElement } from "./element"
import { createObjectURL, downloadFileByURL, revokeObjectURL } from "./url"

export async function openFile(accept: string | null, multiple: boolean = false): Promise<FileList | null> {
    return new Promise<FileList | null>((ok) => {
        const filePickerRef = createElement(_input)
        filePickerRef[_type] = _file
        if (accept != null) filePickerRef[_accept] = accept
        filePickerRef[_multiple] = multiple
        filePickerRef[_click]()

        filePickerRef[_onchange] = () => {
            ok(filePickerRef[_files])
            filePickerRef[_remove]()
        }
        filePickerRef[_oncancel] = () =>{
            ok(null)
            filePickerRef[_remove]()
        }
    })
}

export function downloadFile(blob: Blob, filename: string): void {
    const url = createObjectURL(blob)
    downloadFileByURL(url, filename)
    revokeObjectURL(url)
}

export function readFileAsText(blob: Blob, encoding?: string): Promise<string> {
    return new Promise((ok) => {
        const reader = new FileReader()
        reader[_readAsText](blob, encoding)
        reader[_onload] = (ev) => {
            const t = ev[_target]
            if (!t) return ok('');

            ok(t[_result] as string)
        }
        reader[_onerror] = () => ok('')
        reader[_onabort] = () => ok('')
    })
}