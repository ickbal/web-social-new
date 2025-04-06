import { NextApiRequest, NextApiResponse } from 'next';
import { translateText } from '../../lib/translation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const translation = await translateText(text, targetLanguage);
    
    return res.status(200).json({ translation });
  } catch (error: any) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: error.message });
  }
} 