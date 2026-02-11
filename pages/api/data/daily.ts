import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]";
import { isAllowedEmail } from "../../../lib/authz";
import { getDaily } from "../../../lib/sheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  const email = session?.user?.email?.toLowerCase();

  if (!email || !isAllowedEmail(email)) return res.status(401).json({ error: "Unauthorized" });

  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Invalid date" });

  const data = await getDaily(date);
  res.status(200).json(data);
}
