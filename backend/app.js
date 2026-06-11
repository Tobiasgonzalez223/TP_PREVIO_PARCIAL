import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.js"
import ordenesRoutes from "./routes/ordenes.js"
import errorMiddleware from "./middlewares/errorMiddleware.js"

const app = express()
app.use(cors())
app.use(express.json)

//Rutas
app.use("api/auth", authRoutes)
app.use("/api/ordenes", ordenesRoutes)

//Middleware de errores
app.use(errorMiddleware)

export default app
