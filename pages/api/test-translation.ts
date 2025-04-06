import { NextApiRequest, NextApiResponse } from 'next';
import { translateText } from '../../lib/translation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const text = 'Hello, how are you?';
    const targetLanguage = 'es'; // Spanish
    const translation = await translateText(text, targetLanguage);
    
    return res.status(200).json({
      original: text,
      translated: translation,
      targetLanguage
    });
  } catch (error: any) {
    console.error('Translation test error:', error);
    return res.status(500).json({ 
      message: 'Translation test failed',
      error: error.message 
    });
  }
} 