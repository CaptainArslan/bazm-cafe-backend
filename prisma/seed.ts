import 'dotenv/config';

import bcrypt from 'bcrypt';

import { prisma } from '../src/config/database.js';

const ADMIN_EMAIL = 'admin@bazm.local';
const ADMIN_PASSWORD = 'password';
const ADMIN_NAME = 'BAZM Administrator';

async function seedAdmin(): Promise<void> {
    const bcryptRounds = Number(process.env.BCRYPT_ROUNDS ?? 12);

    if (!Number.isInteger(bcryptRounds) || bcryptRounds < 10) {
        throw new Error('BCRYPT_ROUNDS must be an integer of at least 10.');
    }

    const passwordHash = await bcrypt.hash(
        ADMIN_PASSWORD,
        bcryptRounds,
    );

    const admin = await prisma.user.upsert({
        where: {
            email: ADMIN_EMAIL,
        },

        update: {
            name: ADMIN_NAME,
            passwordHash,
            role: 'ADMIN',
            isActive: true,
            failedLoginAttempts: 0,
            lockedUntil: null,
            deletedAt: null,
            passwordChangedAt: new Date(),
        },

        create: {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            passwordHash,
            role: 'ADMIN',
            isActive: true,
            emailVerifiedAt: new Date(),
            passwordChangedAt: new Date(),
        },

        select: {
            uuid: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
        },
    });

    console.log('Admin account seeded successfully:');
    console.table(admin);
}

async function main(): Promise<void> {
    await seedAdmin();
}

main()
    .catch((error: unknown) => {
        console.error('Database seeding failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });