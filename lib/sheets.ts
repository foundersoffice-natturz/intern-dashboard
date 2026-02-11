import { google } from "googleapis";

const spreadsheetId = process.env.SPREADSHEET_ID!;

function getJwt() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });
}

async function getSheets() {
  const auth = getJwt();
  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

export async function batchGet(ranges: string[]) {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "FORMATTED_VALUE"
  });
  return res.data.valueRanges || [];
}

export type DailyStatusRow = {
  date: string;
  internEmail: string;
  internName: string;
  manager: string;
  status: string;
  submissionsCount: number;
  firstSubmissionAt: string;
  lastSubmissionAt: string;
  reminderSentAt: string;
  flaggedAt: string;
  finalizedAt: string;
  internEmailSentAt: string;
  notes: string;
  updatedAt: string;
  runId: string;
};

export type GptRow = {
  date: string;
  internEmail: string;
  internName: string;
  manager: string;
  dailySummary: string;
  whatWentWell: string;
  actionPoints: string;
  risks: string;
  nextSteps: string;
  tone: string;
  rawJSON: string;
  createdAt: string;
  model: string;
};

function toNumber(s: any): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export async function getDaily(date: string) {
  const ranges = [
    "Daily_Status!A:O",
    "GPT_Analysis!A:M"
  ];

  const [ds, ga] = await batchGet(ranges);

  const dsRows = (ds.values || []).slice(1).map((r: any[]) => ({
    date: r[0] || "",
    internEmail: (r[1] || "").toLowerCase(),
    internName: r[2] || "",
    manager: r[3] || "",
    status: r[4] || "",
    submissionsCount: toNumber(r[5]),
    firstSubmissionAt: r[6] || "",
    lastSubmissionAt: r[7] || "",
    reminderSentAt: r[8] || "",
    flaggedAt: r[9] || "",
    finalizedAt: r[10] || "",
    internEmailSentAt: r[11] || "",
    notes: r[12] || "",
    updatedAt: r[13] || "",
    runId: r[14] || ""
  })) as DailyStatusRow[];

  const gaRows = (ga.values || []).slice(1).map((r: any[]) => ({
    date: r[0] || "",
    internEmail: (r[1] || "").toLowerCase(),
    internName: r[2] || "",
    manager: r[3] || "",
    dailySummary: r[4] || "",
    whatWentWell: r[5] || "",
    actionPoints: r[6] || "",
    risks: r[7] || "",
    nextSteps: r[8] || "",
    tone: r[9] || "",
    rawJSON: r[10] || "",
    createdAt: r[11] || "",
    model: r[12] || ""
  })) as GptRow[];

  const statusToday = dsRows.filter(r => r.date === date && r.internEmail);
  const gptToday = gaRows.filter(r => r.date === date && r.internEmail);

  const gptByEmail = new Map<string, GptRow>();
  gptToday.forEach(r => gptByEmail.set(r.internEmail, r));

  const interns = statusToday.map(st => {
    const g = gptByEmail.get(st.internEmail);
    return {
      ...st,
      gpt: g ? {
        dailySummary: g.dailySummary,
        whatWentWell: g.whatWentWell,
        actionPoints: g.actionPoints,
        risks: g.risks,
        nextSteps: g.nextSteps,
        tone: g.tone,
        model: g.model,
        createdAt: g.createdAt,
        rawJSON: g.rawJSON
      } : null
    };
  });

  const counts = {
    submitted: interns.filter(i => i.status === "Submitted").length,
    flagged: interns.filter(i => i.status === "Flagged (Not Submitted)").length,
    leave: interns.filter(i => i.status === "Leave").length,
    total: interns.length
  };

  return { date, counts, interns };
}

export async function getInternDetail(date: string, email: string) {
  const daily = await getDaily(date);
  const target = daily.interns.find(i => i.internEmail === email.toLowerCase());
  return target || null;
}

export async function getWeek(weekStart: string) {
  // WeekStart expected yyyy-MM-dd
  const start = new Date(weekStart + "T00:00:00Z");
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    dates.push(iso);
  }

  const ranges = ["Daily_Status!A:O", "GPT_Analysis!A:M"];
  const [ds, ga] = await batchGet(ranges);

  const dsRows = (ds.values || []).slice(1).map((r: any[]) => ({
    date: r[0] || "",
    internEmail: (r[1] || "").toLowerCase(),
    internName: r[2] || "",
    manager: r[3] || "",
    status: r[4] || "",
    submissionsCount: toNumber(r[5]),
    notes: r[12] || ""
  })) as any[];

  const weekRows = dsRows.filter(r => dates.includes(r.date));

  const dailyCounts = dates.map(d => {
    const rows = weekRows.filter(r => r.date === d);
    return {
      date: d,
      submitted: rows.filter(r => r.status === "Submitted").length,
      flagged: rows.filter(r => r.status === "Flagged (Not Submitted)").length,
      leave: rows.filter(r => r.status === "Leave").length,
      total: rows.length
    };
  });

  const compliance = dailyCounts.map(x => ({
    date: x.date,
    compliancePct: x.total ? Math.round((x.submitted / x.total) * 100) : 0
  }));

  return { weekStart, dates, dailyCounts, compliance };
}
