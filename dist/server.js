"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const candidatos_1 = __importDefault(require("./routes/candidatos"));
const votantes_1 = __importDefault(require("./routes/votantes"));
const votar_1 = __importDefault(require("./routes/votar"));
const resultados_1 = __importDefault(require("./routes/resultados"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', mensaje: 'API de votaciones SENA funcionando' });
});
app.use('/api/candidatos', candidatos_1.default);
app.use('/api/votante', votantes_1.default);
app.use('/api/votar', votar_1.default);
app.use('/api/resultados', resultados_1.default);
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
