/**
 * Class for simulating enhanced Queues in the program.
 * 
 * Addtional features on top of standard queue: multi-lookup and index-based addition/removal.
 */
export default class QueueHandler<T> {
    private queue: T[];

    constructor() {
        this.queue = new Array<T>()
    }

    /**
     * @param  {T} item
     * @param  {number} index where to add item in queue
     */
    add(item: T, index?: number) {
        if (!index)
            this.queue.push(item);
        else {
            if (index > this.queue.length - 1) {
                throw new ReferenceError(`Index out of length`)
            } else if (index < 0) {
                throw new ReferenceError(`Index invalid`)
            } else {
                this.queue = this.queue.splice(index, 0, item)
            }
        }
    }

    /**
     * @param  {T|number} request Item or index of item to be removed from queue.
     */
    remove(request: T | number) {
        let index: number

        if (typeof request === "number")
            index = request
        else
            index = this.queue.indexOf(request)

        if (index > this.queue.length - 1) {
            throw new ReferenceError(`Index out of length`)
        } else if (index < 0) {
            throw new ReferenceError(`Element doesn't exist in this queue`)
        } else {
            this.queue = this.queue.splice(index, 1)
        }
    }

    empty() {
        this.queue = new Array<T>()
    }

    dequeue() {
        return this.queue.splice(0, 1)[0]
    }

    peek(end?: boolean) {
        let pseudo = Array.from(this.queue)

        if (end)
            return pseudo[this.queue.length - 1]
        else
            return pseudo[0]
    }

    peekMultiple(depth: number, reverse?: boolean) {
        let pseudo = Array.from(this.queue)

        if (reverse)
            return pseudo.slice().reverse().map((item, i) => {
                if (i <= depth)
                    return item
            })
        else
            return pseudo.map((item, i) => {
                if (i <= depth)
                    return item
            })
    }

    peekAll() {
        let pseudo = Array.from(this.queue)
        return pseudo
    }

    size() {
        return Array.from(this.queue).length
    }
}
