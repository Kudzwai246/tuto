// pages/api/apply.js

export default async function handler(req, res) {
  // Allow requests from your GitHub Pages domain:
  res.setHeader('Access-Control-Allow-Origin', 'https://kudzwai246.github.io');
  // Handle preflight:
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // (Insert your actual form‐parsing and email logic here.
  // For now, just return a success JSON:)

  return res.status(200).json({
    success: true,
    message: 'Application submitted successfully.',
  });
}
