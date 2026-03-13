import express from "express"
import { connect } from "framer-api"
const app = express()
app.use(express.json())
const API_KEY = process.env.FRAMER_API_KEY
const PROJECT_URL = process.env.FRAMER_PROJECT_URL
const SHEET_ID = "16G-LL7eAZx43bDYbMfrsfWPb8t9lHTDhV862FJoCOZs"
const SHEET_NAME = "CAEIRO"
async function getSheetData() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}&headers=1`
  const response = await fetch(url)
  const text = await response.text()
  const json = JSON.parse(text.substring(47).slice(0, -2))
  const headers = json.table.cols.map(col => col.label)
  return json.table.rows.map(row => {
    const item = {}
    row.c.forEach((cell, i) => {
      item[headers[i]] = cell ? (cell.v ?? cell.f ?? "") : ""
    })
    return item
  })
}
app.get("/debug", async (req, res) => {
  let framer
  try {
    const rows = await getSheetData()
    framer = await connect(PROJECT_URL, API_KEY)
    const collections = await framer.getCollections()
    const collection = collections.find(c => c.id === "P73xAMQqw")
    const items = await collection.getItems()
    res.json({
      sheetRows: rows.map(r => ({ slug: r["slug"], disponibilidade: r["DISPONIBILIDADE"] })),
      collectionItems: items.map(i => ({ id: i.id, slug: i.slug }))
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  } finally {
    if (framer) await framer.disconnect()
  }
})
app.post("/sync", async (req, res) => {
  let framer
  try {
    const rows = await getSheetData()
    framer = await connect(PROJECT_URL, API_KEY)
    const collections = await framer.getCollections()
    const collection = collections.find(c => c.id === "P73xAMQqw")
    const items = await collection.getItems()
    let updated = 0
    for (const item of items) {
      const row = rows.find(r => String(r["slug"]).trim() === String(item.slug).trim())
      if (!row) continue
      await item.setAttributes({
        fieldData: {
          "JhFj1b3y5": { type: "string", value: String(row["PISO"] ?? "") },
          "CMtCYGORt": { type: "string", value: String(row["Fração"] ?? "") },
          "tReBYY3RW": { type: "string", value: String(row["Tipologia"] ?? "") },
          "Ecrj2HGjI": { type: "string", value: String(row["Área  Fração"] ?? "") },
          "vWCvjnEku": { type: "string", value: String(row["Área  Varanda"] ?? "") },
          "ArUmVhHs5": { type: "string", value: String(row["Área Total"] ?? "") },
          "ZBJiXG14h": { type: "string", value: String(row["ORIENTAÇÃO"] ?? "") },
          "CztqyTR8j": { type: "string", value: String(row["DISPONIBILIDADE"] ?? "") },
          "Jyj3TXCmg": { type: "string", value: String(row["PLANTA DOWNLOAD"] ?? "") },
        }
      })
      updated++
    }
    // await framer.publish()
    res.json({ success: true, message: `${updated} apartamentos sincronizados!` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, error: error.message })
  } finally {
    if (framer) await framer.disconnect()
  }
})
app.listen(3000, () => console.log("Servidor ativo na porta 3000"))
