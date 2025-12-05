import { readFileSync } from 'fs';
import { join } from 'path';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Read version from package.json
    // In Vercel, we need to read from the correct path
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf-8')
    );

    res.status(200).json({
      version: packageJson.version,
      name: packageJson.name,
      deployment: {
        platform: 'vercel',
        timestamp: new Date().toISOString(),
        // Vercel provides these environment variables
        commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read version',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
