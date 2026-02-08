import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";
import {PrismaClient, ClientLevel, UserStatus, Prisma, DocumentType, DocumentStatus, AuditAction} from "../generated/prisma/client.js";

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log("🚀 Omnihub: Conectado mediante Adaptador de Red.");
    const roles = await prisma.role.findMany();
    console.log("✅ Datos obtenidos:", roles);
  } catch (e) {
    console.error("❌ Error con el adaptador:", e);
  }
}

main().finally(() => prisma.$disconnect());

export default prisma;
export { ClientLevel, UserStatus, Prisma, DocumentType, DocumentStatus, AuditAction };