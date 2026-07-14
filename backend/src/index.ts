import "dotenv/config";
import { createApp } from "./app";

const PORT = Number(process.env.PORT) || 3333;
const app = createApp();

app.listen(PORT, () => {
  console.log(`✓ CifraStudio API rodando em http://localhost:${PORT}`);
  console.log(`✓ Ambiente: ${process.env.NODE_ENV || "development"}`);
});
