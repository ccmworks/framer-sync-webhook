import express from "express"
import { connect } from "framer-api"

const app = express()
app.use(express.json())

const API_KEY = process.env.FRAMER_API_KEY
const PROJECT_URL = process.env.FRAMER_PROJECT_URL

app.get("/fields", async (req, res) => {
  let framer
  try {
    framer = await connect(PROJECT_URL, API_KEY)
    const collections = await framer.getCollections()
    const result = []
    for (const col of collections) {
      const fields = await col.getFields()
      const items = await col.getItems()
      result.push({
        collectionId: col.id,
        collectionName: col.name,
        fields: fields,
        firstItem: items[0]
      })
    }
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    if (framer) await framer.disconnect()
  }
})

app.listen(3000, () => console.log("Servidor ativo na porta 3000"))
