// Browser compatibility: https://caniuse.com/webusb
// API source           : https://wicg.github.io/webusb

export interface USB extends EventTarget {
	onconnect(ev: USBConnectionEvent): any
	ondisconnect(ev: USBConnectionEvent): any
	getDevices(): Promise<USBDevice[]>
	requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>
}

export interface USBAlternateInterface {
	readonly alternateSetting: number
	readonly interfaceClass: number
	readonly interfaceSubclass: number
	readonly interfaceProtocol: number
	readonly interfaceName?: string
	readonly endpoints: USBEndpoint[]
}

export interface USBConfiguration {
	readonly configurationValue: number
	readonly configurationName?: string
	readonly interfaces: USBInterface[]
}

export interface USBConnectionEvent extends Event {
	readonly device: USBDevice
}

export interface USBControlTransferParameters {
	requestType: USBRequestType
	recipient: USBRecipient
	request: number
	value: number
	index: number
}

export interface USBDevice {
	readonly configuration: USBConfiguration
	readonly configurations: USBConfiguration[]
	readonly deviceClass: number
	readonly deviceProtocol: number
	readonly deviceSubclass: number
	readonly deviceVersionMajor: number
	readonly deviceVersionMinor: number
	readonly deviceVersionSubminor: number
	readonly manufacturerName: string
	readonly opened: boolean
	readonly productId: number
	readonly productName: string
	readonly serialNumber: string
	readonly usbVersionMajor: number
	readonly usbVersionMinor: number
	readonly usbVersionSubminor: number
	readonly vendorId: number
	open(): Promise<any>
	close(): Promise<any>
	forget(): Promise<any>
	selectConfiguration(configurationValue: number): Promise<any>
	claimInterface(interfaceNumber: number): Promise<any>
	releaseInterface(interfaceNumber: number): Promise<any>
	selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<any>
	controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>
	controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource): Promise<USBOutTransferResult>
	clearHalt(direction: USBDirection, endpointNumber: number): Promise<any>
	transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>
	transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>
	isochronousTransferIn(endpointNumber: number, packetLength: number): Promise<USBIsochronousInTransferResult>
	isochronousTransferOut(endpointNumber: number, data: BufferSource, packetLength: number): Promise<USBIsochronousOutTransferResult>
	reset(): Promise<any>
}

export interface USBDeviceFilter {
	venderId: number
	productId: number
	classCode: number
	subclassCode: number
	protocolCode: number
	serialNumber: string
}

export interface USBDeviceRequestOptions {
	filters: USBDeviceFilter[]
	exclusionFilters?: USBDeviceFilter[]
}

export type USBDirection = 'in' | 'out'

export interface USBEndpoint {
	readonly endpointNumber: number
	readonly direction: USBDirection
	readonly type: USBEndpointType
	readonly packetSize: number
}

export type USBEndpointType = 'bulk' | 'interrupt' | 'isochronous'

export interface USBEventTargetEventMap {
	connect: Event
	disconnect: Event
}

export interface USBInterface {
	readonly interfaceNumber: number
	readonly alternate: USBAlternateInterface
	readonly alternates: USBAlternateInterface[]
	readonly claimed: boolean
}

export interface USBIsochronousInTransferPacket {
	readonly data?: DataView
	readonly status: USBTransferStatus
}

export interface USBIsochronousInTransferResult {
	readonly data?: DataView
	readonly packets: USBIsochronousInTransferPacket[]
}

export interface USBIsochronousOutTransferPacket {
	readonly bytesWritten: number
	readonly status: USBTransferStatus
}

export interface USBIsochronousOutTransferResult {
	readonly packets: USBIsochronousOutTransferPacket[]
}

export interface USBOutTransferResult {
	readonly bytesWritten: number
	status: USBTransferStatus
}

export type USBRecipient = 'device' | 'interface' | 'endpoint' | 'other'

export type USBRequestType = 'standard' | 'class' | 'vendor'

export interface USBInTransferResult {
	readonly data: DataView
	readonly status: USBTransferStatus
}

export type USBTransferStatus = 'ok' | 'stall' | 'babble'