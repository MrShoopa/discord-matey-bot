import Request from 'request'

const url = 'http://disease.sh/v3/covid-19/vaccine/coverage'

var options = {
    url: url,
    method: 'GET',
    qs: {},
    headers: {
        //authorization: auth.movie_quoter.API_KEY
    }
}

export module VaccineCovid {
    export class Getter {

        static async getVaccines(lastDays: number = 30) {
            let newOptions = JSON.parse(JSON.stringify(options))
            newOptions.lastDays = lastDays

            return await this.fetchData(newOptions)
                .catch(error => { throw error })
        }

        static async getVaccinesInCountry(country: string, lastDays: number = 30) {
            let newOptions = JSON.parse(JSON.stringify(options))
            newOptions.lastDays = lastDays
            newOptions.url += `/countries/${country}`

            return await this.fetchData(newOptions)
                .catch(error => { throw error })
        }

        private static fetchData(options, justOne?): Promise<any> {
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
                    } else resolve(null)
                })
            })
        }
    }
}