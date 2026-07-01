import * as Ids from '../shared/ids.enum.js'
import type { NetworkInformation } from "@/interfaces/network-information"
import { batch, signal } from "@/utils/signal"
import { $ } from "./dom-utils.js"
import { isNumberDefined } from '@/utils/number'

export const sg_downlink      = signal<NetworkInformation['downlink'] | null>(null)
export const sg_downlinkMax   = signal<NetworkInformation['downlinkMax'] | null>(null)
export const sg_effectiveType = signal<NetworkInformation['effectiveType'] | null>(null)
export const sg_rtt           = signal<NetworkInformation['rtt'] | null>(null)
export const sg_dataSaver     = signal<NetworkInformation['saveData'] | null>(null)
export const sg_type          = signal<NetworkInformation['type'] | null>(null)

const _ref_downlink      = $(Ids.Downlink) as HTMLSpanElement
const _ref_downlinkMax   = $(Ids.DownlinkMax) as HTMLSpanElement
const _ref_effectiveType = $(Ids.EffectiveType) as HTMLSpanElement
const _ref_type          = $(Ids.Type) as HTMLSpanElement
const _ref_rtt           = $(Ids.RoundTripTime) as HTMLSpanElement
const _ref_dataSaver     = $(Ids.DataSaver) as HTMLSpanElement

function _initSubscriber(): void {
	const isNumber = (v: any) => typeof v === 'number'
	const isString = (v: any) => typeof v === 'string'
	const isBoolean = (v: any) => typeof v === 'boolean'

	sg_downlink.subscribe(v =>
		_ref_downlink.textContent = isNumber(v) && isNumberDefined(v)? (v + ' Mbps') : 'N/A'
	)

	sg_downlinkMax.subscribe(v =>
		_ref_downlinkMax.textContent = isNumber(v) && isNumberDefined(v)? (v + ' Mbps') : 'N/A'
	)

	sg_effectiveType.subscribe(v =>
		_ref_effectiveType.textContent = isString(v)? v : 'N/A'
	)

	sg_rtt.subscribe(v =>
		_ref_rtt.textContent = isNumber(v) && isNumberDefined(v)? (v + ' ms')  : 'N/A'
	)

	sg_dataSaver.subscribe(v =>
		_ref_dataSaver.textContent = isBoolean(v)? v? 'Yes' : 'No' : 'N/A'
	)

	sg_type.subscribe(v =>
		_ref_type.textContent = isString(v)? v : 'N/A'
	)
}

function _initNetworkInfo(): void {
	const supported = 'connection' in navigator
	if (!supported) {
		alert("NetworkInformation API is not supported in this browser. Some network-dependent features will be disabled. Try use other browser or use a Chromium-based browser (like Chrome or Edge) for full functionality.")
		return
	}

	const update = (connection: NetworkInformation) => {
		batch(() => {
			sg_dataSaver.set(connection.saveData ?? null)
			sg_downlink.set(connection.downlink ?? null)
			sg_downlinkMax.set(connection.downlinkMax ?? null)
			sg_effectiveType.set(connection.effectiveType ?? null)
			sg_rtt.set(connection.rtt ?? null)
			sg_type.set(connection.type ?? null)
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