"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = globalSetup;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Run once before ALL test suites
async function globalSetup() {
    // Ensure the test DB is clean (use a test DB in real CI)
    // For development, we simply connect and verify
    await prisma.$connect();
    console.log('🧪 Test DB connected');
    await prisma.$disconnect();
}
//# sourceMappingURL=globalSetup.js.map