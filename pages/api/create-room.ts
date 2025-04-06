import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Function to generate a random room ID
function generateRoomId(length: number = 4): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check if user is authenticated
    const session = await getSession({ req });
    
    if (!session) {
      // If not authenticated, redirect to sign in page
      console.log("User not authenticated, redirecting to signin");
      const baseUrl = process.env.PUBLIC_DOMAIN || 'http://localhost:3005';
      return res.redirect(307, `${baseUrl}/auth/signin`);
    }
    
    // Generate a random room ID (4 characters)
    const roomId = generateRoomId();
    console.log(`Created new room with ID: ${roomId} for user: ${session.user?.email}`);
    
    // Get the base URL from environment or default to localhost
    const baseUrl = process.env.PUBLIC_DOMAIN || 'http://localhost:3005';
    const roomUrl = `${baseUrl}/room/${roomId}`;
    
    console.log(`Redirecting to: ${roomUrl}`);
    
    // Redirect to the newly created room with absolute URL
    return res.redirect(307, roomUrl);
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ error: "Failed to create room" });
  }
} 