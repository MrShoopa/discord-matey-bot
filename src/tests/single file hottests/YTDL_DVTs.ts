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

samples.forEach(async thing => {
    await YTDL.getInfo(thing).then(video => {
        console.log(`Success with url: ${thing}`)
    }).catch((e: Error) => { console.log(e.message) })
})