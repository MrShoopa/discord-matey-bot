const auth = require('../../../auth.json')

var request = require('request')

const url = 'http://movie-quotes-app.herokuapp.com/api/v1/quotes'

var options = {
    url: url,
    method: 'PLACEHOLDER',
    qs: {},
    headers: {
        authorization: auth.movie_quoter.API_KEY
    }
}

/* Get */

module.exports.getQuote = () => {
    let newOptions = JSON.parse(JSON.stringify(options))

    newOptions.method = 'GET'
    newOptions.qs = {
        page: 1
    }

    return request.get(newOptions)[0]
}

module.exports.getQuotes = () => {
    let newOptions = JSON.parse(JSON.stringify(options))

    newOptions.method = 'GET'
    newOptions.qs = {
        page: 1
    }

    return request.get(newOptions)
}

module.exports.getQuotesFromActor = (actor) => {
    let newOptions = JSON.parse(JSON.stringify(options))

    newOptions.method = 'GET'
    newOptions.qs = {
        actor: actor,
        page: 1
    }

    return request.get(newOptions)[0]
}

module.exports.getQuotesFromActor = (actor) => {
    let newOptions = JSON.parse(JSON.stringify(options))

    newOptions.method = 'GET'
    newOptions.qs = {
        actor: actor,
        page: 1
    }

    return request.get(newOptions)
}