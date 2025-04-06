import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY
    
    // First test: Check if API key exists
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key is missing',
        step: 'key_check'
      })
    }

    // Second test: Try to fetch trending GIFs
    const trendingUrl = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=1&rating=g`
    const trendingResponse = await fetch(trendingUrl)
    const trendingData = await trendingResponse.json()

    // Third test: Try to search for GIFs
    const searchUrl = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=test&limit=1&rating=g`
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    return res.status(200).json({
      success: true,
      apiKeyPrefix: apiKey.substring(0, 5) + '...',
      trending: {
        status: trendingResponse.status,
        meta: trendingData.meta,
        count: trendingData.data?.length || 0
      },
      search: {
        status: searchResponse.status,
        meta: searchData.meta,
        count: searchData.data?.length || 0
      }
    })
  } catch (error: any) {
    console.error('Error testing Giphy API:', error)
    return res.status(500).json({
      success: false,
      error: error.message,
      apiKeyPrefix: process.env.NEXT_PUBLIC_GIPHY_API_KEY?.substring(0, 5) + '...'
    })
  }
} 