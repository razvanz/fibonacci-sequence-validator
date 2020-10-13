import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from './../src/app.module'

describe('AppController (e2e)', () => {
	let app: INestApplication

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()

		await app.init()
	})

	describe('/ (POST)', () => {
		it('valid', () => {
			return request(app.getHttpServer())
				.post('/')
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 1, valid: null },
					{ n: 1, valid: null },
					{ n: 2, valid: null },
					{ n: 3, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 1, valid: true },
					{ n: 1, valid: true },
					{ n: 2, valid: true },
					{ n: 3, valid: true },
					{ n: 5, valid: true },
				])
		})

		it('invalid', () => {
			return request(app.getHttpServer())
				.post('/')
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 1, valid: null },
					{ n: 1, valid: null },
					{ n: 3, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 1, valid: true },
					{ n: 1, valid: true },
					{ n: 3, valid: false },
					{ n: 5, valid: false },
				])
		})
	})

	describe('/?prev=1 (POST)', () => {
		it('valid', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 1, valid: null },
					{ n: 2, valid: null },
					{ n: 3, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 1, valid: true },
					{ n: 2, valid: true },
					{ n: 3, valid: true },
					{ n: 5, valid: true },
				])
		})

		it('invalid', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 2, valid: null },
					{ n: 3, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 2, valid: false },
					{ n: 3, valid: false },
					{ n: 5, valid: false },
				])
		})
	})

	describe('/?prev=1&prev=1 (POST)', () => {
		it('valid', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1, 1] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 2, valid: null },
					{ n: 3, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 2, valid: true },
					{ n: 3, valid: true },
					{ n: 5, valid: true },
				])
		})

		it('invalid - start', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1, 1] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 1, valid: null },
					{ n: 2, valid: null },
					{ n: 3, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 1, valid: false },
					{ n: 2, valid: false },
					{ n: 3, valid: false },
				])
		})

		it('invalid - mid', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1, 1] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 2, valid: null },
					{ n: 5, valid: null },
					{ n: 8, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 2, valid: true },
					{ n: 5, valid: false },
					{ n: 8, valid: false },
				])
		})
	})

	describe('/?prev=1&prev=2 (POST)', () => {
		it('valid ', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1, 2] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 3, valid: null },
					{ n: 5, valid: null },
					{ n: 8, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 3, valid: true },
					{ n: 5, valid: true },
					{ n: 8, valid: true },
				])
		})

		it('valid - reverse query params (prev=2&prev=1)', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [2, 1] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 3, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 3, valid: true },
					{ n: 5, valid: true },
				])
		})

		it('invalid - start', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1, 2] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 2, valid: null },
					{ n: 3, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 2, valid: false },
					{ n: 3, valid: false },
					{ n: 5, valid: false },
				])
		})

		it('invalid - mid', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1, 2] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 3, valid: null },
					{ n: 2, valid: null },
					{ n: 5, valid: null },
				])
				.expect(200)
				.expect([
					{ n: 3, valid: true },
					{ n: 2, valid: false },
					{ n: 5, valid: false },
				])
		})
	})

	describe('/?prev=1&prev=2&prev=3 (POST)', () => {
		it('fails', () => {
			return request(app.getHttpServer())
				.post('/')
				.query({ prev: [1, 2, 3] })
				.set('content-type', 'application/json')
				.set('accept', 'application/json')
				.send([
					{ n: 5, valid: null },
					{ n: 8, valid: null },
					{ n: 13, valid: null },
				])
				.expect(400)
				.expect({
					statusCode: 400,
					message: 'Expected an array of the previous two items in the Fibonacci sequence',
					error: 'Bad Request',
				})
		})
	})
})
