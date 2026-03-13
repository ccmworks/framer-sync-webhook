import express from "express"
import { connect } from "framer-api"

const app = express()
app.use(express.json())

const API_KEY = process.env.FRAMER_API_KEY
const PROJECT_URL = process.env.FRAMER_PROJECT_URL

app.post("/sync", async (req, res) => {
  try {
    using framer = await connect(PROJECT_URL, API_KEY)
    await framer.publishSite()
    res.json({ success: true, message: "Site publicado com sucesso!" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(3000, () => console.log("Servidor ativo na porta 3000"))
