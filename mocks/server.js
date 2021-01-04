import { createServer, Model } from "miragejs"

export function makeServer({ environment = "development" } = {}) {

    const events = [{
        id: 0,
        name: 'HaustürWK Köpenick',
        campaign: 'Landtagswahl',
        startTime: '11.05.2021',
        isPublic: true
    }, {
        id: 1,
        name: 'HaustürWK Kreuzberg',
        campaign: 'Landtagswahl',
        startTime: '11.07.2021',
        isPublic: true
    }]

    let server = createServer({
        environment,
        models: {
            event: Model
        },
        seeds(server) {
            events.forEach(event => {
                server.create("event", event)
            })
        },
        routes() {
            this.namespace = "api"

            this.get("/events", (schema) => schema.events.all())

            this.put("/events/:id", (schema, request) => {
                const id = request.params.id
                let event = schema.events.find(id)
                event.update(JSON.parse(request.requestBody))
            })

            this.get("/events/:id", (schema, request) => {
                const id = request.params.id
                return schema.events.find(id)
            })

            this.post("/events", (schema, request) => {
                const event = JSON.parse(request.requestBody)
                return schema.db.events.insert(event)
            })

            this.delete("/events/:id", (schema, request) => {
                const id = request.params.id
                return schema.db.events.remove(id)
            })
        }
    })
    return server
}