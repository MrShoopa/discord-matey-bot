import FileSystem from 'fs';
// yeah just write whatever here to test

import { expect } from 'chai';
import 'mocha';
import BotData from './bot_functions/DataHandler';

var test = 'megadork hi'
var testInput = 'megadork! hi'

console.log(`are you cool? ${test.includes(testInput)}`)

describe('calculate', function () {
	it('add', function () {
		let result = 2 + 2
		expect(result)
			.equal(4);
	});
});

describe('Being able to read save data', () => {
	it('access', () => {
		let wholeData = BotData.getUserDataFile()
		expect(wholeData).to.be.not.null
	})
})

describe('Fetching user saves with certain property', () => {
	it('access', () => {
		let pickedData = BotData.getAllUserDataWithAttribute('_id')

		let wholeData = BotData.getUserDataFile()

		expect(Object.keys(pickedData).length)
			.equal(Object.keys(wholeData).length)
	})
})
