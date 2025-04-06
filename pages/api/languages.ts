import { NextApiRequest, NextApiResponse } from 'next';
import { getSupportedLanguages } from '../../lib/translation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const languages = await getSupportedLanguages('en'); // Get language names in English
    res.status(200).json(languages);
  } catch (error: any) {
    console.error('Error fetching languages:', error);
    res.status(500).json({ error: 'Failed to fetch languages' });
  }
} 