import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@turbopaste/env/server";
import { PrismaClient } from "../prisma/generated/client";

export const createPrismaClient = () => {
	const adapter = new PrismaPg({
		connectionString: env.DATABASE_URL,
	});

	return new PrismaClient({ adapter });
};

const prisma = createPrismaClient();

export default prisma;
