import express from "express"
import { connect } from "framer-api"

const app = express()
app.use(express.json())

const API_KEY = process.env.FRAMER_API_KEY
const PROJECT_URL = process.env.FRAMER_PROJECT_URL

app.post("/sync", async (req, res) => {
  let framer
  try {
    framer = await connect(PROJECT_URL, API_KEY)
    const result = await framer.publish()
    res.json({ success: true, result })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message })
  } finally {
    if (framer) await framer.disconnect()
  }
})

app.listen(3000, () => console.log("Servidor ativo na porta 3000"))
