import { createStore } from "solid-js/store"
import { batch, createSignal, onMount, type VoidComponent } from "solid-js"

import type { CubicBezier, Keyframes, Position } from "./_types"
import { removeSplashScreen } from "@/utils/splash"
import { DatabaseNames } from "@/enums/storage"
import { IDB } from "@/utils/indexeddb"
import { AnimationType, Commands } from "./_enums"
import { IDBStoreKeysLastInput, IDBStoreNames, type IDBStoreLastInput } from "./_storage"

import App from "@/components/App"
import AppBar from './_AppBar'
import Body from './_Body'

const _: VoidComponent = () => {
	const db = new IDB(DatabaseNames.cubicBezier)
	const [cubicBezier, setCubicBezier] = createSignal<CubicBezier>([0.75, 0, 0.25, 1])
	const [startPoint, setStartPoint] = createStore<Position>([0, 0])
	const [endPoint, setEndPoint] = createStore<Position>([1, 1])
	const [startHandlePoint, setStartHandlePoint] = createStore<Position>([.75, 0])
	const [endHandlePoint, setEndHandlePoint] = createStore<Position>([.25, 1])
	const [duration, setDuration] = createSignal<number>(1000)
	const [animationTypes, setAnimationTypes] = createSignal<AnimationType[]>([
		AnimationType.move
	])
	const [keyframes, setKeyframes] = createStore<Keyframes>({
		scale: ['0%', '100%'],
		rotate: ['0deg', '360deg'],
		move: [
			['8px', '8px'],
			['200px', '8px'],
		],
		color: ['#000000', '#FFFFFF'],
		opacity: ['0%', '100%'],
		height: ['32px', '200px'],
		width: ['32px', '400px'],
	})
	let timerSaveLastInputId: number | NodeJS.Timeout | null = null

	function saveLastInput(): void {
		if (timerSaveLastInputId !== null) {
			clearTimeout(timerSaveLastInputId)
		}

		timerSaveLastInputId = setTimeout(() => {
			const store = db.writeStore(IDBStoreNames.lastInput)
			if (!store) return

			const items: [key: IDBStoreKeysLastInput, value: any][] = [
				[IDBStoreKeysLastInput.animationDuration, duration()],
				[IDBStoreKeysLastInput.animationTypes, [...animationTypes()]],
				[IDBStoreKeysLastInput.cubicBezier, [...cubicBezier()]],
				[IDBStoreKeysLastInput.keyframeColor, [...keyframes.color]],
				[IDBStoreKeysLastInput.keyframeHeight, [...keyframes.height]],
				[IDBStoreKeysLastInput.keyframeMove, [...keyframes.move.map(v => [...v])]],
				[IDBStoreKeysLastInput.keyframeOpacity, [...keyframes.opacity]],
				[IDBStoreKeysLastInput.keyframeRotate, [...keyframes.rotate]],
				[IDBStoreKeysLastInput.keyframeScale, [...keyframes.scale]],
				[IDBStoreKeysLastInput.keyframeWidth, [...keyframes.width]],
			]

			for (const item of items) {
				store.put({
					key: item[0],
					value: item[1]
				})
			}
		}, 300)
	}

	function command(type: Commands, ...args: unknown[]): unknown {
		switch (type) {
		case Commands.updateCubicBezier: {
			const [value] = args as [CubicBezier]
			setCubicBezier(value)
			saveLastInput()
			break
		}
		case Commands.updateStartPoint: {
			const [value] = args as [Position]
			setStartPoint(value)
			saveLastInput()
			break
		}
		case Commands.updateEndPoint: {
			const [value] = args as [Position]
			setEndPoint(value)
			saveLastInput()
			break
		}
		case Commands.updateStartHandlePoint: {
			const [value] = args as [Position]
			setStartHandlePoint(value)
			saveLastInput()
			break
		}
		case Commands.updateEndHandlePoint: {
			const [value] = args as [Position]
			setEndHandlePoint(value)
			saveLastInput()
			break
		}
		case Commands.updateAnimationTypes: {
			const [types] = args as [AnimationType[]]
			setAnimationTypes(types)
			saveLastInput()
			break
		}
		case Commands.updateDuration: {
			const [ms] = args as [number]
			setDuration(ms)
			saveLastInput()
			break
		}
		case Commands.updateKeyframes: {
			const [key, values] = args as [keyof Keyframes, string[] | string[][]]
			setKeyframes(key, values)
			saveLastInput()
			break
		}
		default: return}
	}

	function initDatabase(): void {
		db.open({
			onSuccess() {
				initLastInput()
			},
			onUpgrade(_, db) {
				db.createStore<IDBStoreLastInput>({
					name: IDBStoreNames.lastInput,
					keyPath: 'key',
					indexs: ['key', 'value']
				})
			},
		})
	}

	function initLastInput(): void {
		const store = db.readStore(IDBStoreNames.lastInput)
		if (!store) return

		db.get<IDBStoreLastInput<CubicBezier>>(
			store,
			IDBStoreKeysLastInput.cubicBezier
		).then(result => {
			if (!result) return

			const value = result.value
			let [x1, y1, x2, y2] = value
			batch(() => {
				let endPointY = 1
				let startPointY = 0

				const max = Math.max(startPointY, endPointY, y1, y2)
				if (max > 1) {
					const d = (max - 1) / max
					y1 -= (y1 * d)
					y2 -= (y2 * d)
					startPointY -= (startPointY * d)
					endPointY -= (endPointY * d)
				}

				const min = Math.min(startPointY, endPointY, y1, y2)
				if (min < 0) {
					const d = Math.abs(min) / (Math.abs(min) + 1)
					y1 += (Math.abs(1 - y1) * d)
					y2 += (Math.abs(1 - y2) * d)
					startPointY += ((1 - startPointY) * d)
					endPointY += ((1 - endPointY) * d)
				}

				setCubicBezier(value)
				setStartHandlePoint([x1, y1])
				setEndHandlePoint([x2, y2])
				setStartPoint([0, startPointY])
				setEndPoint([1, endPointY])
			})
		})

		db.get<IDBStoreLastInput<AnimationType[]>>(
			store,
			IDBStoreKeysLastInput.animationTypes
		).then(result => setAnimationTypes(d => result?.value ?? d))

		db.get<IDBStoreLastInput<number>>(
			store,
			IDBStoreKeysLastInput.animationDuration
		).then(result => setDuration(d => result?.value ?? d))

		db.get<IDBStoreLastInput<string[]>>(
			store,
			IDBStoreKeysLastInput.keyframeColor
		).then(result => setKeyframes('color', d => result?.value ?? d))

		db.get<IDBStoreLastInput<string[][]>>(
			store,
			IDBStoreKeysLastInput.keyframeMove
		).then(result => setKeyframes('move', d => result?.value ?? d))

		db.get<IDBStoreLastInput<string[]>>(
			store,
			IDBStoreKeysLastInput.keyframeOpacity
		).then(result => setKeyframes('opacity', d => result?.value ?? d))

		db.get<IDBStoreLastInput<string[]>>(
			store,
			IDBStoreKeysLastInput.keyframeScale
		).then(result => setKeyframes('scale', d => result?.value ?? d))

		db.get<IDBStoreLastInput<string[]>>(
			store,
			IDBStoreKeysLastInput.keyframeRotate
		).then(result => setKeyframes('rotate', d => result?.value ?? d))

		db.get<IDBStoreLastInput<string[]>>(
			store,
			IDBStoreKeysLastInput.keyframeWidth
		).then(result => setKeyframes('width', d => result?.value ?? d))

		db.get<IDBStoreLastInput<string[]>>(
			store,
			IDBStoreKeysLastInput.keyframeHeight
		).then(result => setKeyframes('height', d => result?.value ?? d))
	}

	onMount(() => {
		initDatabase()
		removeSplashScreen()
	})

	return (<App c:appBar={<AppBar/>}>
		<Body
			animationTypes={animationTypes()}
			duration={duration()}
			endHandlePoint={endHandlePoint}
			endPoint={endPoint}
			keyframes={keyframes}
			startHandlePoint={startHandlePoint}
			startPoint={startPoint}
			cubicBezier={cubicBezier()}
			command={command}
		/>
	</App>)
}

export default _