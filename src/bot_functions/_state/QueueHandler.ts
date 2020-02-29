/**
 * Class for simulating enhanced Queues in the program.
 * 
 * Addtional features on top of standard queue: multi-lookup and index-based addition/removal.
 */
class QueueHandler<T> {
    private queue: T[];

    /**
     * @param  {T} item
     * @param  {number} index where to add item in queue
     */
    add(item: T, index: number) {
        if (!index)
            this.queue.unshift(item);
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

    dequeue() {
        return this.queue.splice(0, 1)[0]
    }

    peek(end?: boolean) {
        if (end)
            return this.queue[this.queue.length - 1]
        else
            return this.queue[0]
    }

    peekMultiple(depth: number, reverse?: boolean) {
        if (reverse)
            return this.queue.slice().reverse().map((item, i) => {
                if (i <= depth)
                    return item
            })
        else
            return this.queue.map((item, i) => {
                if (i <= depth)
                    return item
            })
    }
}
