import Request from 'request'

const url = 'https://uwfaculty-api.herokuapp.com/faculty/api/v1/'

var options = {
	url: url,
	method: 'PLACEHOLDER', // None TBH
	qs: {},
	headers: {
		//	authorization if any
	}
}

/* Get */
export module UwFacultyAPI {

	export class Getter {
		/**
		 * Searches the UW Faculty API for any teachers based on a text query
		 * and returns a JSON of any possible results.
		 * @param query name of teacher
		 */
		static async getFacultyMember(query: string) {
			let newOptions = JSON.parse(JSON.stringify(options))

			newOptions.method = 'GET'
			newOptions.url = newOptions.url + query

			let retrieved: any = await this.fetchData(newOptions)
			.then((res: any) => {
				if (res.error) throw res.error
				else return res
			})
			.catch(error => { throw error })

			return retrieved.teacher[0]
		}

		static async getRandomFaculty() {
			let dice: number = Math.floor(Math.random() * 7)

			let page = await this.getAllFaculty(dice)

			dice = Math.floor(Math.random() * 5000)

			return page[dice]
	}

	/**
	 * Fetch the entire database (5k records per page).
	 * There's a known total of 36k as of writing.
	 * @param page index of the search to show results
	 */
	static async getAllFaculty(page: number = 0) {
		let newOptions = JSON.parse(JSON.stringify(options))

		newOptions.method = 'GET'
		newOptions.url = newOptions.url + "allfaculty/" + page

		let retrieved: any = await this.fetchData(newOptions)
			.catch(error => { throw error })

		return retrieved.db
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
}