import { Console } from 'node:console'
import YTDL from 'ytdl-core'

//YTDL('http://www.youtube.com/watch?v=aqz-KE-bpKQ').pipe(fs.createWriteStream('video.mp4'));

let samples = [
    'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    'http://www.youtube.com/watch?v=aqz-KE-bpKQ',
    'www.youtube.com/watch?v=aqz-KE-bpKQ',
    'youtube.com/watch?v=aqz-KE-bpKQ',
    'watch?v=aqz-KE-bpKQ',
    '?v=aqz-KE-bpKQ',
    'v=aqz-KE-bpKQ',
    'aqz-KE-bpKQ',
]

function testUrls() {
    console.group('Testing possible URLS against YTDL...')
    let successes: number = 0

    samples.forEach(async thing => {
        await YTDL.getInfo(thing).then(video => {
            console.log(`Success with url: ${thing}`)
            successes++
        }).catch((e: Error) => {
            console.log(e.message)
            successes--
        })
    })

    console.log(`Successes: ${successes} out of ${samples.length} samples.`)
    console.groupEnd()
}


function runFunctions() {
    testUrls()
}

runFunctions()