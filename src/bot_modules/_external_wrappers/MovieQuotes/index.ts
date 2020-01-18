import * as auth from '../../../user_creds.json'

import Request from 'request'

const url = 'http://movie-quotes-app.herokuapp.com/api/v1/quotes'

var options = {
	url: url,
	method: 'PLACEHOLDER',
	qs: {},
	headers: {
		//authorization: auth.movie_quoter.API_KEY
	}
}

/* Get */

export default class MovieQuotes {

	static async getQuote() {
		let newOptions = JSON.parse(JSON.stringify(options))

		newOptions.method = 'GET'
		newOptions.qs = {
			page: 1
		}

		await this.fetchData(newOptions)
			.catch(error => { throw error })
	}

	static async getQuotes() {
		let newOptions = JSON.parse(JSON.stringify(options))

		newOptions.method = 'GET'
		newOptions.qs = {
			page: 1
		}

		await this.fetchData(newOptions)
	}

	static async getQuotesFromActor(actor: string) {
		let newOptions = JSON.parse(JSON.stringify(options))

		newOptions.method = 'GET'
		newOptions.qs = {
			actor: actor,
			page: 1
		}

		await this.fetchData(newOptions)
	}

	private static fetchData(options, justOne?) {
		return new Promise((resolve, reject) => {
			Request.get(options, (err, res, data) => {
				data = JSON.parse(res.body)

				if (res.statusCode === 200)
					if (justOne)
						resolve(data[0])
					else
						resolve(data)
				else if (res.statusCode >= 400) {
					if (res.statusCode === 429) {
						reject(new Error('Please wait to make more requests.'))
					} else if (res.statusCode === 401) {
						reject(new EvalError('Incorrect credentials found.'))
					} else {
						reject(new EvalError(`Error Quote: ${err.message}`))
					}
				} else resolve('Huh?')
			})
		})
	}
}