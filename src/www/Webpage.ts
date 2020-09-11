// Web Page redirect
import Express from 'express'
import Path from 'path'

let webapp = globalThis.webWorker
var port = process.env.PORT || 3669;

export default class WebServices {
    static startWebpage() {
        webapp = Express()

        webapp.get("/", (request, response) => {
            response.sendFile(Path.join(__dirname + '../../index.html'));
        })
        webapp.listen(port, () => {
            console.log(`Webpage listening at http://localhost:${port}`)
        })
    }
}