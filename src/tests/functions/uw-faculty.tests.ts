import { expect } from 'chai'
import 'mocha'

import Bot from '../../Bot.js'
import { UwFacultyAPI } from '../../bot_modules/_external_wrappers/UWCourse/index.js'

let bot = new Bot()
globalThis.bot = bot

describe('UW Faculty API works', function () {
    it('Fetched a specific teacher', async () => {
        let result = await UwFacultyAPI.Getter.getFacultyMember(`Robert Dimpsey`)
            .then((data) => {
                console.log(data)
                expect(data.name).to.not.be.null

                expect(data.name).contains('Robert Dimpsey')
                expect(data.email[0]).contains('uw.edu')
            }).catch((err) => {
                console.error(err)
                throw err
            })
    })

    it('Fetched 2 random teachers', async () => {
        let result = await UwFacultyAPI.Getter.getRandomFaculty()
            .then((data) => {
                console.log(data)
                expect(data.name).to.not.be.null
                expect(data.email[0])

                return data
            }).catch((err) => {
                console.error(err)
                throw err
            })

        let result2 = await UwFacultyAPI.Getter.getRandomFaculty()
            .then((data) => {
                console.log(data)
                expect(data.name).to.not.be.null
                expect(data.email[0])

                return data
            }).catch((err) => {
                console.error(err)
                throw err
            })

        expect(result.name).to.not.equal(result2.name)
    })
})
