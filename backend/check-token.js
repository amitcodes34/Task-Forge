// Quick debug script to check latest password reset token in DB
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tokens = await prisma.verificationToken.findMany({
    where: { type: 'PASSWORD_RESET' },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { user: { select: { email: true } } },
  });

  if (tokens.length === 0) {
    console.log('❌ No PASSWORD_RESET tokens found in DB.');
    return;
  }

  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

  tokens.forEach((t, i) => {
    const isExpired = t.expiresAt < new Date();
    const isUsed = t.usedAt !== null;
    console.log(`\n--- Token #${i + 1} ---`);
    console.log(`User   : ${t.user.email}`);
    console.log(`Token  : ${t.token}`);
    console.log(`Expired: ${isExpired} (expires at ${t.expiresAt.toISOString()})`);
    console.log(`Used   : ${isUsed}`);
    if (!isExpired && !isUsed) {
      console.log(`\n✅ VALID RESET LINK:`);
      console.log(`${CLIENT_URL}/reset-password?token=${t.token}`);
    } else {
      console.log(`⚠️ This token is ${isExpired ? 'EXPIRED' : ''} ${isUsed ? 'ALREADY USED' : ''}`);
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
