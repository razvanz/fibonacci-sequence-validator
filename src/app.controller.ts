import {
	Controller,
	Post, HttpCode,
	Query, Body,
	BadRequestException
} from '@nestjs/common'
import * as stream from 'stream'
import { promisify } from 'util'
import { FibonacciStreamValidator } from '@app/fibonacci-stream-validator'

const pipeline = promisify(stream.pipeline)

export type QueryDto = {
	prev?: string[]
}

export type SeqItem = {
	n: number
	valid: boolean | null
}

@Controller()
export class AppController {
	@Post()
	@HttpCode(200)
	async validate(@Query() query: QueryDto, @Body() body: SeqItem[]): Promise<SeqItem[]> {
		let prev = []

		if (query.prev) {
			if (!Array.isArray(query.prev)) {
				prev = [query.prev]
			} else {
				prev = query.prev
			}
		}

		prev = prev.map(n => parseInt(n, 10)).sort()

		try {
			// TODO: to avoid having to buffer the req and the response data, a streamable serialization
			// sould be used instead (eg: CSV).
			const resultBuffer = []
			const readable = stream.Readable.from(
				(function* items() {
					yield* body
				})(),
				{ objectMode: true },
			)
			const writable = new stream.Writable({
				objectMode: true,
				write(item: SeqItem, encoding, callback) {
					resultBuffer.push(item)
					process.nextTick(() => callback(null))
				},
			})
			const transformer = new FibonacciStreamValidator(prev)

			await pipeline(readable, transformer, writable)

			return resultBuffer
		} catch (e) {
			if (e.name === 'FibonacciStreamValidatorError') {
				throw new BadRequestException(e.message)
			}

			throw e
		}
	}
}
