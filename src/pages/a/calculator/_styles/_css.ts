import CSS from './_index.module.scss'

export class CSSClasses {
	static readonly body = CSS.body

	// bd = body
	static readonly bd_inField = CSS.bodyInputField
	static readonly bd_outField = CSS.bodyOutputField
	static readonly bd_page = CSS.bodyPage

	// bdPage = body page
	static readonly bdPage_memoPreview = CSS.bodyPageMemoryPreview
	static readonly bdPage_buttons = CSS.bodyPageButtons
	static readonly bdPage_date = CSS.bodyPageDate
	static readonly bdPage_input = CSS.bodyPageInput
	static readonly bdPage_options = CSS.bodyPageOptions
	static readonly bdPage_optionGroup = CSS.bodyPageOptionsGroup

	// bdPageSci = body page scientific
	static readonly bdPageSci_menuGrid = CSS.bodyPageScientificMenuGrid
	static readonly bdPageSci_trigonometry = CSS.bodyPageScientificTrigonometry

	// bdPageProg = body page programmer
	static readonly bdPageProg_btnValue = 'bppb-value'
	static readonly bdPageProg_btnHex = 'bppb-hex'
	static readonly bdPageProg_btnDec = 'bppb-dec'
	static readonly bdPageProg_btnOct = 'bppb-oct'
	static readonly bdPageProg_btnBin = 'bppb-bin'
	static readonly bdPageProg_outputGroup = CSS.bodyPageProgrammerOutputGroup

	// nav = navigation
	static readonly nav_sideBar = CSS.navigationSideBar
}