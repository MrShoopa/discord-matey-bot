import Request from 'request'

const url: string = 'http://quotes.rest'

/* Get */
/**
 * Fetches the quote of the day from quotes.rest.
 * 
 * @param category - Specific genre of quote (see TheySaidSo API for categories)
 */

export default class QuotesAPI {

	static getQuoteOfTheDay = (category: string = '') => {
		let endpoint = category ?
			`/qod.json?category=${category}` : '/qod.json'

		return new Promise((resolve, reject) => {
			Request.get(url + endpoint, (err, res, data) => {
				data = JSON.parse(res.body)

				if (res.statusCode === 200)
					resolve(data.contents.quotes[0])
				else if (res.statusCode >= 400) {
					data = data.error

					if (res.statusCode === 429) {
						let timeMessage =
							data.message.split('.')[data.message.split('.').length - 1]
						reject(new Error('Fetched too many quotes right now.'))
					} else if (res.statusCode === 401) {
						reject(new Error('Incorrect credentials found.'))
					} else {
						reject(new EvalError(`Error fetching Quote of Day: ${err.message}`))
					}
				} else resolve('Huh?')
			})
		})
	}
}