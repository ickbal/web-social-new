import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY
    console.log('Testing Giphy API with key:', apiKey)

    // Test search endpoint
    const searchResponse = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=fun&limit=1`
    )
    
    if (!searchResponse.ok) {
      throw new Error(`Giphy API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    return res.status(200).json({
      success: true,
      apiKey: apiKey?.substring(0, 5) + '...',  // Only show first 5 chars for security
      searchData
    })
  } catch (error: any) {
    console.error('Error testing Giphy API:', error)
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      apiKey: process.env.NEXT_PUBLIC_GIPHY_API_KEY?.substring(0, 5) + '...'
    })
  }
} 