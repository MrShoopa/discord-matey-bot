var request = require('request')

const url = 'http://quotes.rest'

/* Get */

module.exports.getQuoteOfTheDay = () => {
	let endpoint = '/qod.json'

	return new Promise((resolve, reject) => {

		request.get(url + endpoint, (err, res, data) => {
			data = JSON.parse(res.body)

			if (res.statusCode === 200)
				resolve(data.contents.quotes[0])
			else if (res.statusCode >= 400) {
				data = data.error

				if (res.statusCode === 429) {
					let timeMessage =
                        data.message.split('.')[data.message.split('.').length - 1]
					reject ({
						code: 429,
						timeMessage: timeMessage
					})
				} else {
					reject (`Error fetching Quote of Day: ${data.error.message}`)
				}
			} else resolve ('Huh?')
		})
	})
}