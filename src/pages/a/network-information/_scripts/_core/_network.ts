import type { NetworkInformation } from "@/interfaces/network-information"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import { CDialog } from "@/components/Dialog"
import { isNumberDefined } from "@/utils/number"

// NOTE: not every browser support all these property
export type NetworkStoreType = {
	downlink: NetworkInformation['downlink'] | null
	downlinkMax: NetworkInformation['downlinkMax'] | null
	effectiveType: NetworkInformation['effectiveType'] | null
	rtt: NetworkInformation['rtt'] | null
	dataSaver: NetworkInformation['saveData'] | null
	type: NetworkInformation['type'] | null
}

export const NetworkStore = new ObservableStore<NetworkStoreType>({
	dataSaver: null,
	downlink: null,
	downlinkMax: null,
	effectiveType: null,
	rtt: null,
	type: null
})

const _ref_downlink = $(ElementIds.bd_downlink) as HTMLSpanElement
const _ref_downlinkMax = $(ElementIds.bd_downlinkMax) as HTMLSpanElement
const _ref_effectiveType = $(ElementIds.bd_effectiveType) as HTMLSpanElement
const _ref_type = $(ElementIds.bd_type) as HTMLSpanElement
const _ref_rtt = $(ElementIds.bd_rtt) as HTMLSpanElement
const _ref_saveData = $(ElementIds.bd_saveData) as HTMLSpanElement
const _ref_notSupportDialog = $(ElementIds.dlg_browseNotSupported) as CDialog.CElement

function _initSubscriber(): void {
	const isNumber = (v: any) => typeof v === 'number'
	const isString = (v: any) => typeof v === 'string'
	const isBoolean = (v: any) => typeof v === 'boolean'

	NetworkStore.subscribe(v => {
		const downlink = v.downlink
		_ref_downlink.textContent = isNumber(downlink) && isNumberDefined(downlink)
			? (downlink + ' Mbps')
			: 'N/A'

		const downlinkMax = v.downlinkMax
		_ref_downlinkMax.textContent = isNumber(downlinkMax) && isNumberDefined(downlinkMax)
			? (downlinkMax + ' Mbps')
			: 'N/A'

		const rtt = v.rtt
		_ref_rtt.textContent = isNumber(rtt) && isNumberDefined(rtt)? (rtt + ' ms')  : 'N/A'

		_ref_effectiveType.textContent = isString(v.effectiveType)? v.effectiveType : 'N/A'
		_ref_type.textContent = isString(v.type)? v.type : 'N/A'
		_ref_saveData.textContent = isBoolean(v.dataSaver)? v.dataSaver? 'Yes' : 'No' : 'N/A'
	})
}

function _initNetworkInfo(): void {
	const supported = 'connection' in navigator
	if (!supported) {
		_ref_notSupportDialog.showModal()
		return
	}

	const update = (connection: NetworkInformation) => {
		NetworkStore.update(v => {
			v.dataSaver = connection.saveData ?? null
			v.downlink = connection.downlink ?? null
			v.downlinkMax = connection.downlinkMax ?? null
			v.effectiveType = connection.effectiveType ?? null
			v.rtt = connection.rtt ?? null
			v.type = connection.type ?? null
		})
	}

	const network = () => (navigator as any).connection as NetworkInformation

	update(network())
	network().addEventListener('change', () => {
		update(network())
	})
}

export default () => {
	_initSubscriber()
	_initNetworkInfo()
}