import SCSS from './index.module.scss'

export const CSSClasses = {
	body: SCSS.body,

	// bd: body
	bd_inField: SCSS.bodyInputField,
	bd_outField: SCSS.bodyOutputField,
	bd_page: SCSS.bodyPage,

	// bdPage: body page
	bdPage_memoPreview: SCSS.bodyPageMemoryPreview,
	bdPage_buttons: SCSS.bodyPageButtons,
	bdPage_date: SCSS.bodyPageDate,
	bdPage_input: SCSS.bodyPageInput,
	bdPage_options: SCSS.bodyPageOptions,
	bdPage_optionGroup: SCSS.bodyPageOptionsGroup,

	// bdPageSci: body page scientific
	bdPageSci_menuGrid: SCSS.bodyPageScientificMenuGrid,
	bdPageSci_trigonometry: SCSS.bodyPageScientificTrigonometry,

	// bdPageProg: body page programmer
	bdPageProg_btnValue: 'bppb-value',
	bdPageProg_btnHex: 'bppb-hex',
	bdPageProg_btnDec: 'bppb-dec',
	bdPageProg_btnOct: 'bppb-oct',
	bdPageProg_btnBin: 'bppb-bin',
	bdPageProg_outputGroup: SCSS.bodyPageProgrammerOutputGroup,

	// nav: navigation
	nav_sideBar: SCSS.navigationSideBar,

	smallScreenOnly: SCSS.smallScreenOnly,
}