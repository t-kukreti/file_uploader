require('dotenv').config();

const { PrismaClient } = require('../generated/prisma/client.js');
const dbHost = process.env.DB_HOST || "localhost";

const prisma = new PrismaClient({
    datasources: {
        db:{
            url: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${dbHost}:5432/${process.env.DB_NAME}?schema=public`

        }
    },
});

module.exports = prisma;








