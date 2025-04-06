const API_KEY = 'AIzaSyCQCLJdK_ajCAoiSgp8lrZEu4iiqr5iljM';
const BASE_URL = 'https://translation.googleapis.com/language/translate/v2';

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error: any) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Function to detect the language of a text
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await fetch(`${BASE_URL}/detect?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Language detection API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.detections[0][0].language;
  } catch (error: any) {
    console.error('Language detection error:', error);
    throw new Error(`Language detection failed: ${error.message}`);
  }
}

// Function to get supported languages
export async function getSupportedLanguages(targetLanguage?: string): Promise<Array<{ code: string; name: string }>> {
  try {
    const url = new URL(`${BASE_URL}/languages`);
    url.searchParams.append('key', API_KEY);
    if (targetLanguage) {
      url.searchParams.append('target', targetLanguage);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Languages API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.languages.map((lang: any) => ({
      code: lang.language,
      name: lang.name || lang.language,
    }));
  } catch (error: any) {
    console.error('Error fetching supported languages:', error);
    throw new Error(`Failed to fetch supported languages: ${error.message}`);
  }
} 