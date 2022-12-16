import { immerable } from 'immer'
import { CSSProperties, ReactNode } from 'react'
import { mapStyleToKebabCaseStyle } from '../../api/mapper'
import { uuid } from '../../utils'
import { Controller } from '../controllers/controller'
import { Expression } from '../states/expression'
import { ElementEvent } from './event'
import { Style } from './style'

export type RenderFn = (element: Element) => ReactNode

export abstract class Element {
	[immerable] = true

	abstract readonly name: string
	abstract readonly icon: ReactNode
	abstract render(renderFn: RenderFn): ReactNode
	abstract renderOptions(options: RenderOptions): ReactNode
	id: string = uuid()
	style: Style = {}
	classes: string[] = []
	events: ElementEvent[] = []
	bindings: Bindings = {}
	children: Element[] | null = null
	repeatFrom: RepeatFrom | null = null
	controller: Controller | null = null
	data?: Record<string, unknown>
	elementId?: string
	hidden?: boolean

	isContainer() {
		return !(this.children === null || this.children === undefined)
	}

	hasChildren() {
		return this.children && this.children.length > 0
	}

	serialize(): any {
		return {
			kind: this.name,
			id: this.id,
			components: this.children?.map((child) => child.serialize()),
			classNames: this.classes,
			repeatFrom: this.repeatFrom,
			events: this.events.map((event) => ({
				...event,
				actions: event.actions.map((action) => action.serialize()),
			})),
			bindings: this.bindings,
			controller: this.controller?.serialize(),
			data: { ...this.data, style: mapStyleToKebabCaseStyle(this.style) },
			elementId: this.elementId,
		}
	}

	generateClasses() {
		return `${this.classes.join(' ')} ${this.id}`.trim()
	}

	renderPreview(renderFn: RenderFn, style: CSSProperties = {}) {
		return (
			<div style={style} className={this.generateClasses()} id={this.elementId}>
				{this.render(renderFn)}
			</div>
		)
	}

	onDelete() {
		// noop
	}
}

export interface RenderOptions {
	set: Setter
}

export type Setter<T extends Element = Element> = (element: T) => void

type Bindings = Partial<Record<BindingKind, Binding | null>>

export interface Binding {
	fromStateName: string
	condition?: Condition
	value?: Expression
	class?: string
}

export enum BindingKind {
	Hide = 'hide',
	Show = 'show',
	Class = 'class',
}

export const bindingKinds = [BindingKind.Hide, BindingKind.Show, BindingKind.Class]

export interface RepeatFrom {
	name: string
	iterator: string
}

export enum Condition {
	Equals = 'equals',
	NotEquals = 'not equals',
	Contains = 'contains',
	NotContains = 'not contains',
}

export const CONDITIONS = [
	Condition.Equals,
	Condition.NotEquals,
	Condition.Contains,
	Condition.NotContains,
]