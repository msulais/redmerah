export type ConnectionType = 'bluetooth'
	| 'cellular'
	| 'ethernet'
	| 'mixed'
	| 'none'
	| 'other'
	| 'unknown'
	| 'wifi'
	| 'wimax'

export type EffectiveConnectionType = '2g'
	| '3g'
	| '4g'
	| 'slow-2g'

export interface NetworkInformationSaveData {
  readonly saveData: boolean
};

export interface NetworkInformation extends EventTarget, NetworkInformationSaveData {
	readonly type: ConnectionType
	readonly effectiveType: EffectiveConnectionType
	readonly downlinkMax: number
	readonly downlink: number
	readonly rtt: number
	onchange: (ev: Event) => unknown
}

export interface NavigatorNetworkInformation {
	readonly connection: NetworkInformation
}