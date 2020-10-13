import * as stream from 'stream'
import { promisify } from 'util'
import {
	FibonacciStreamValidator,
	FibonacciStreamValidatorError
} from './fibonacci-stream-validator'

const pipeline = promisify(stream.pipeline)

describe('FibonacciStreamValidator', () => {
	let writerMock: stream.Writable
	let res
	const mockReadNumbers = function* mockReadNumbers(numbers: number[]) {
		for (let i = 0; i < numbers.length; i++) {
			yield { n: numbers[i] }
		}
	}

	beforeEach(() => {
		res = []

		writerMock = new stream.Writable({
			objectMode: true,
			write(item: any, encoding: string, callback: (err: Error | null) => void) {
				res.push(item)

				callback(null)
			},
		})
	})

	describe('initialization', () => {
		it('throws if prev argument length > 2', () => {
			expect(() => new FibonacciStreamValidator([1, 2, 3])).toThrow(FibonacciStreamValidatorError)
		})

		it('throws if prev argument is not int', () => {
			expect(() => new FibonacciStreamValidator([1, NaN])).toThrow(FibonacciStreamValidatorError)
		})
	})

	describe('success', () => {
		it('0 prev', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([1, 1, 2, 3, 5]), { objectMode: true }),
				new FibonacciStreamValidator([]),
				writerMock,
			)

			expect(res.length).toEqual(5)
			res.forEach(item => {
				expect(item.valid).toEqual(true)
			})
		})

		it('1 prev', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([1, 2, 3, 5]), { objectMode: true }),
				new FibonacciStreamValidator([1]),
				writerMock,
			)

			expect(res.length).toEqual(4)
			res.forEach(item => {
				expect(item.valid).toEqual(true)
			})
		})

		it('2 prev', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([2, 3, 5]), { objectMode: true }),
				new FibonacciStreamValidator([1, 1]),
				writerMock,
			)

			expect(res.length).toEqual(3)
			res.forEach(item => {
				expect(item.valid).toEqual(true)
			})
		})

		it('mid-sequence', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([8, 13, 21]), { objectMode: true }),
				new FibonacciStreamValidator([3, 5]),
				writerMock,
			)

			expect(res.length).toEqual(3)
			res.forEach(item => {
				expect(item.valid).toEqual(true)
			})
		})
	})

	describe('failure', () => {
		it('0 prev', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([1, 1, 2, 5, 8]), { objectMode: true }),
				new FibonacciStreamValidator([]),
				writerMock,
			)

			expect(res.length).toEqual(5)
			res.forEach(item => {
				item.n < 5 ? expect(item.valid).toEqual(true) : expect(item.valid).toEqual(false)
			})
		})

		it('1 prev', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([1, 2, 5, 8]), { objectMode: true }),
				new FibonacciStreamValidator([1]),
				writerMock,
			)

			expect(res.length).toEqual(4)
			res.forEach(item => {
				item.n < 5 ? expect(item.valid).toEqual(true) : expect(item.valid).toEqual(false)
			})
		})

		it('2 prev', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([2, 5, 8]), { objectMode: true }),
				new FibonacciStreamValidator([1, 1]),
				writerMock,
			)

			expect(res.length).toEqual(3)
			res.forEach(item => {
				item.n < 5 ? expect(item.valid).toEqual(true) : expect(item.valid).toEqual(false)
			})
		})

		it('gap with prev', async () => {
			await pipeline(
				stream.Readable.from(mockReadNumbers([8, 13, 21]), { objectMode: true }),
				new FibonacciStreamValidator([2, 3]),
				writerMock,
			)

			expect(res.length).toEqual(3)
			res.forEach(item => {
				expect(item.valid).toEqual(false)
			})
		})
	})
})
