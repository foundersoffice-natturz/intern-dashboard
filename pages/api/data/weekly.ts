import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import authOptions from "../auth/[...nextauth]";
import { isAllowedEmail } from "../../../lib/authz";
import { getWeek } from "../../../lib/sheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  const email = session?.user?.email?.toLowerCase();
  if (!email || !isAllowedEmail(email)) return res.status(401).json({ error: "Unauthorized" });

  const weekStart = String(req.query.weekStart || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return res.status(400).json({ error: "Invalid weekStart" });

  const data = await getWeek(weekStart);
  res.status(200).json(data);
}
