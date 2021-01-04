import { createServer, Model } from "miragejs"

export function makeServer({ environment = "development" } = {}) {

    let server = createServer({
        environment,
        models: {
            event: Model,
            campaign: Model
        },
        routes() {
            this.namespace = "api"

            // events
            this.get("/events", (schema) => schema.events.all())

            this.get("/events/:id", (schema, request) => {
                const id = request.params.id
                return schema.events.find(id)
            })

            this.put("/events/:id", (schema, request) => {
                const id = request.params.id
                let event = schema.events.find(id)
                event.update(JSON.parse(request.requestBody))
            })

            this.post("/events", (schema, request) => {
                const event = JSON.parse(request.requestBody)
                return schema.db.events.insert(event)
            })

            this.delete("/events/:id", (schema, request) => {
                const id = request.params.id
                return schema.db.events.remove(id)
            })

            // campaigns
            this.get("/campaigns", (schema) => schema.campaigns.all())

            this.get("/campaigns/:id", (schema, request) => {
                const id = request.params.id
                return schema.campaigns.find(id)
            })

            this.put("/campaigns/:id", (schema, request) => {
                const id = request.params.id
                let campaign = schema.campaigns.find(id)
                campaign.update(JSON.parse(request.requestBody))
            })

            this.post("/campaigns", (schema, request) => {
                const campaign = JSON.parse(request.requestBody)
                return schema.db.campaigns.insert(campaign)
            })

            this.delete("/campaigns/:id", (schema, request) => {
                const id = request.params.id
                return schema.db.campaigns.remove(id)
            })
        }
    })
    return server
}