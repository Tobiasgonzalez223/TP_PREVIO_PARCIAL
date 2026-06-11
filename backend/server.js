import app from "./app.js"
import { Sequelize } from "sequelize"

const PORT = 3000

sequelize.sync({ force: false }).then(() => {
    console.log("Base de datos sincronizada")
    app.listen(PORT, () => console.log("Servidor corriendo en http://localhost:${PORT}"))
})

