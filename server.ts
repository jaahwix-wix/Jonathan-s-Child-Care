import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Jonathan Child Care & JCC FC Management System - Bo District' });
  });

  // API Route: AI Academic Student Report Generator
  app.post('/api/gemini/student-report', async (req, res) => {
    try {
      const { studentName, gradeLevel, grades, emotionalNotes } = req.body;
      const ai = getGeminiClient();

      const prompt = `You are a warm, highly respected academic director at Jonathan's Child Care (JCC) in Bo District, Sierra Leone.
Provide a comprehensive, encouraging report card comment and academic growth plan for student ${studentName} in grade ${gradeLevel}.
Grades provided: ${JSON.stringify(grades)}.
Care & Welfare notes: ${emotionalNotes || 'None'}.

Include:
1. Academic Strengths & Key Achievements in subjects like Science, Math, English, etc.
2. Character & Emotional Support Guidance tailored for a student in Bo District.
3. Actionable study recommendations for the upcoming term.
Format the response in clean markdown with clear headings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Gemini Student Report Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate student report card analysis.' });
    }
  });

  // API Route: AI JCC FC Match Tactics & Scouting Assistant
  app.post('/api/gemini/tactical-analysis', async (req, res) => {
    try {
      const { opponentName, competition, venue, squadPlayers, formation } = req.body;
      const ai = getGeminiClient();

      const prompt = `You are the Head Coach and Tactical Analyst for JCC FC (Jonathan's Child Care Women Football Club) based in Bo District, Sierra Leone — Champions of the Bo District First Division and Southern Region Football Association (SRFA).

Generate a tactical match plan for our upcoming match against "${opponentName}" in the ${competition} at ${venue}.
Current Preferred Formation: ${formation || '4-3-3'}.
Squad Highlights: Captain & Top Scorer Kadiatu "Bo Express" Conteh (Forward), Zainab Dumbuya (Midfield General), Isatu "The Wall" Fofanah (Goalkeeper with 16 clean sheets).

Provide:
1. Tactical Approach & Key Match Instructions (e.g. wing play, press triggers, midfield transition).
2. Key Opponent Threat Counter-strategy.
3. Player Motivation & Community Spirit Briefing highlighting Bo District pride.
Format the response in clear, structured markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Gemini Tactics Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate tactical analysis.' });
    }
  });

  // API Route: AI STEM Science & Math Lab Lesson Plan Generator
  app.post('/api/gemini/stem-lab-plan', async (req, res) => {
    try {
      const { topic, subject, targetGrade, durationMinutes, availableEquipment } = req.body;
      const ai = getGeminiClient();

      const prompt = `You are the Head STEM Instructor at the dedicated Science and Math Teaching Laboratory at Jonathan's Child Care (JCC) in Bo District, Sierra Leone.
Create a step-by-step practical STEM laboratory experiment lesson plan for:
Topic: "${topic}"
Subject: "${subject}"
Grade Level: "${targetGrade}"
Duration: ${durationMinutes || 60} minutes
Available Lab Equipment in Bo: ${availableEquipment?.join(', ') || 'Compound Microscopes, Vernier Calipers, Titration Burettes, Solar Circuit Kits'}.

Include:
1. Learning Objectives & Core Concepts.
2. Safety Instructions & Lab Apparatus Setup.
3. Step-by-Step Practical Student Activity.
4. Discussion Questions & Real-World Local Application in Sierra Leone (e.g., renewable energy, local agriculture, health science).
Format in clean markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Gemini Lab Plan Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate STEM lab lesson plan.' });
    }
  });

  // API Route: AI Community Grant & Sponsorship Writer
  app.post('/api/gemini/grant-writer', async (req, res) => {
    try {
      const { initiativeTitle, targetFundingUSD, fundingCategory, projectDescription } = req.body;
      const ai = getGeminiClient();

      const prompt = `You are the Director of Community Engagement & Strategic Partnerships for Jonathan's Child Care (JCC) and JCC FC in Bo District, Sierra Leone (operating for over 20 years).

Draft a professional, compelling Grant & Sponsorship Proposal Letter addressed to international donors, corporate partners, and diaspora sponsors.
Initiative Title: "${initiativeTitle}"
Funding Target: $${targetFundingUSD} USD
Focus Area: "${fundingCategory}"
Project Details: "${projectDescription}"

Include:
1. Institutional Background & 20-Year Track Record in Bo District (high academic standards, Science & Math teaching lab, champion women's football team JCC FC).
2. Core Need & Community Impact Statement.
3. Specific Resource Allocation Breakdown.
4. Call to Action & Appreciation.
Format in clear, formal business proposal markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error('Gemini Grant Writer Error:', error);
      res.status(500).json({ error: error.message || 'Failed to generate grant proposal.' });
    }
  });

  // Vite Middleware for Development vs Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JCC & JCC FC Management System running on http://localhost:${PORT}`);
  });
}

startServer();
