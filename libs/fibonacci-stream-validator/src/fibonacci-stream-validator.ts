import * as stream from 'stream'

export type SeqItem = {
	n: number
	valid?: boolean | null
}

export class FibonacciStreamValidatorError extends Error {
	constructor (message: string) {
		super(message)

		this.name = 'FibonacciStreamValidatorError'
	}
}

export class FibonacciStreamValidator extends stream.Transform {
	constructor(
		private prev: number[], // reference to the last 2 items in the fibonacci sequence
	) {
		super({
			objectMode: true,
			highWaterMark: 10,
		})

		if (
			!prev ||
			prev.length > 2 ||
			prev.filter(n => typeof n !== 'number' || isNaN(n) || !isFinite(n)).length
		) {
			throw new FibonacciStreamValidatorError(
				'Expected an array of the previous two items in the Fibonacci sequence'
			)
		}
	}

	_transform(
		item: SeqItem,
		encoding: string,
		callback: (err: Error | null, item: SeqItem) => void,
	): void {
		item = { ...item, valid: this.isValid(item.n) }

		// Push the next sequence item into the queue
		if (this.prev.length < 2) {
			this.prev.push(1)
		} else {
			this.prev.push(this.prev[0] + this.prev[1])
			this.prev.shift()
		}

		callback(null, item)
	}

	isValid(n: number): boolean {
		if (this.prev.length < 2) {
			return n === 1
		}

		return n === this.prev.reduce((s, x) => s + x, 0)
	}
}
