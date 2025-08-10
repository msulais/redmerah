import type { NetworkInformation } from "@/interfaces/network-information"
import { ObservableStore } from "@/utils/store"
import { ElementIds } from "../_shared/_ids"
import { $ } from "./_dom-utils"
import type { DialogElement } from "@/components/Dialog"

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

const _downlinkRef = $(ElementIds.bd_downlink) as HTMLSpanElement
const _downlinkMaxRef = $(ElementIds.bd_downlinkMax) as HTMLSpanElement
const _effectiveTypeRef = $(ElementIds.bd_effectiveType) as HTMLSpanElement
const _typeRef = $(ElementIds.bd_type) as HTMLSpanElement
const _rttRef = $(ElementIds.bd_rtt) as HTMLSpanElement
const _saveDataRef = $(ElementIds.bd_saveData) as HTMLSpanElement
const _notSupportDialogRef = $(ElementIds.dlg_browseNotSupported) as DialogElement

function _initSubscriber(): void {
	const isNumber = (v: any) => typeof v === 'number'
	const isString = (v: any) => typeof v === 'string'
	const isBoolean = (v: any) => typeof v === 'boolean'

	NetworkStore.subscribe(v => {
		_downlinkRef.textContent = isNumber(v.downlink)? (v.downlink + ' Mbps')  : 'N/A'
		_downlinkMaxRef.textContent = isNumber(v.downlinkMax)? (v.downlinkMax + ' Mbps') : 'N/A'
		_effectiveTypeRef.textContent = isString(v.effectiveType)? v.effectiveType : 'N/A'
		_typeRef.textContent = isString(v.type)? v.type : 'N/A'
		_rttRef.textContent = isNumber(v.rtt)? (v.rtt + ' ms')  : 'N/A'
		_saveDataRef.textContent = isBoolean(v.dataSaver)? v.dataSaver? 'Yes' : 'No' : 'N/A'
	})
}

function _initNetworkInfo(): void {
	const supported = 'connection' in navigator
	if (!supported) {
		_notSupportDialogRef.showModal()
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