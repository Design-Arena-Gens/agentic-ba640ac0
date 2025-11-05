import type { NextApiRequest, NextApiResponse } from 'next'

// Free ChatGPT alternative using local generation
async function generateScript(idea: string): Promise<{ script: string; imagePrompts: string[]; duration: number }> {
  // Simulate script generation based on idea
  const script = `Welcome to this amazing video about ${idea}!

In today's digital age, ${idea} has become increasingly important. Let me share with you some fascinating insights.

First, let's understand what makes ${idea} so special. It combines innovation with practicality, creating solutions that matter.

Many people wonder how to get started with ${idea}. The key is to begin with small steps and gradually build your knowledge.

The benefits of ${idea} are numerous. From improving efficiency to opening new opportunities, the possibilities are endless.

As we look to the future, ${idea} will continue to evolve and transform how we work and live.

Thank you for watching! Don't forget to like, subscribe, and share this video with others who might find it helpful.`

  // Calculate duration based on script (average speaking rate: 150 words per minute)
  const wordCount = script.split(/\s+/).length
  const duration = Math.ceil((wordCount / 150) * 60) // in seconds

  // Generate image prompts based on script sections
  const imagePrompts = [
    `Professional introduction background with ${idea} theme, modern design`,
    `Infographic showing ${idea} concepts, clean and colorful`,
    `Digital illustration of ${idea} in action, futuristic style`,
    `Step-by-step guide visualization for ${idea}, minimalist`,
    `Benefits chart of ${idea}, professional presentation`,
    `Future vision of ${idea}, inspiring and innovative`,
    `Call to action screen with subscribe button, engaging design`,
  ]

  return { script, imagePrompts, duration }
}

async function fetchFromGoogleSheets(sheetsId: string): Promise<string> {
  // In production, use Google Sheets API
  // For demo, return a sample idea
  return 'AI automation and productivity tools'
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { customIdea, useGoogleSheets, sheetsId, customScript } = req.body

    let idea = customIdea
    let script = customScript
    let duration = 0
    let imagePrompts: string[] = []

    // Step 1: Get idea from Google Sheets if needed
    if (useGoogleSheets && sheetsId) {
      idea = await fetchFromGoogleSheets(sheetsId)
    } else if (!idea) {
      idea = 'amazing technology and innovation'
    }

    // Step 2: Generate or use provided script
    if (script) {
      // Calculate duration from provided script
      const wordCount = script.split(/\s+/).length
      duration = Math.ceil((wordCount / 150) * 60)

      // Generate image prompts based on script length
      const numImages = Math.max(5, Math.ceil(duration / 30)) // One image per 30 seconds
      imagePrompts = Array.from({ length: numImages }, (_, i) =>
        `Scene ${i + 1} visualization for video about ${idea}, professional and engaging`
      )
    } else {
      const generated = await generateScript(idea)
      script = generated.script
      duration = generated.duration
      imagePrompts = generated.imagePrompts
    }

    res.status(200).json({
      script,
      imagePrompts,
      duration,
      idea,
    })
  } catch (error: any) {
    console.error('Script generation error:', error)
    res.status(500).json({ error: error.message || 'Failed to generate script' })
  }
}
