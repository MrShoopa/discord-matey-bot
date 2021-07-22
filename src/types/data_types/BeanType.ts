import * as FileSystem from 'fs'

export default class Bean {
    name: string
    toString() { return 'bean' }
    toEmoji() { return '🥫' }
    toImage() { return FileSystem.readFileSync((FileSystem.realpathSync('.') + '..\\bot_knowledge\\images\\bean.png')) }
}

export class BeanContainer {
    private beans: { [key: string]: Bean }

    constructor() {
        this.beans = {}
    }

    add(key: string, value: Bean): void {
        this.beans[key] = value
    }

    has(key: string): boolean {
        return key in this.beans
    }

    get(key: string): Bean {
        return this.beans[key]
    }

    addNewBean(): void {
        let beanNumber = (Math.random() * 100).toString()
        this.add(beanNumber, new Bean())
        console.log(`Added Bean ${beanNumber}`)
    }

    toString() { return 'beans' }

}