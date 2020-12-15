import { createServer, Model } from "miragejs"

export function makeServer({ environment = "development" } = {}) {

    const events = [{
        id: 0,
        name: 'HautürWK Köpenick',
        campaign: 'Landtagswahl',
        startTime: '11.05.2021',
        isPublic: true
    }, {
        id: 1,
        name: 'HautürWK Kreuzberg',
        campaign: 'Landtagswahl',
        startTime: '11.07.2021',
        isPublic: true
    }]

    let server = createServer({
        environment,

        models: {
            event: Model,
        },

        seeds(server) {
            events.forEach(event => {
                server.create("event", event)
            });
        },

        routes() {
            this.namespace = "api"

            this.get("/events", (schema) => {
                return schema.events.all()
            })
        },
    })

    return server
}