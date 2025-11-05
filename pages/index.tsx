import { useState } from 'react'
import Head from 'next/head'

interface AgentStatus {
  id: number
  name: string
  status: 'pending' | 'active' | 'completed' | 'error'
  message: string
}

export default function Home() {
  const [script, setScript] = useState('')
  const [customIdea, setCustomIdea] = useState('')
  const [useGoogleSheets, setUseGoogleSheets] = useState(false)
  const [sheetsId, setSheetsId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [agents, setAgents] = useState<AgentStatus[]>([
    { id: 1, name: 'Agent 1: Script Generator', status: 'pending', message: 'Waiting to start...' },
    { id: 2, name: 'Agent 2: Content Creator', status: 'pending', message: 'Waiting to start...' },
    { id: 3, name: 'Agent 3: Video Producer', status: 'pending', message: 'Waiting to start...' },
    { id: 4, name: 'Agent 4: YouTube Publisher', status: 'pending', message: 'Waiting to start...' },
  ])

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const updateAgent = (id: number, status: AgentStatus['status'], message: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === id ? { ...agent, status, message } : agent
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setProgress(0)
    setLogs([])
    setVideoUrl('')

    try {
      // Reset all agents
      setAgents(prev => prev.map(agent => ({ ...agent, status: 'pending', message: 'Waiting to start...' })))

      // Agent 1: Script Generator
      updateAgent(1, 'active', 'Fetching ideas and generating script...')
      addLog('Starting Agent 1: Script Generator', 'info')
      setProgress(10)

      const scriptResponse = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customIdea: customIdea || null,
          useGoogleSheets,
          sheetsId: useGoogleSheets ? sheetsId : null,
          customScript: script || null,
        }),
      })

      if (!scriptResponse.ok) throw new Error('Script generation failed')
      const scriptData = await scriptResponse.json()
      addLog(`Generated script: ${scriptData.script.substring(0, 100)}...`, 'success')
      addLog(`Generated ${scriptData.imagePrompts.length} image prompts`, 'success')
      updateAgent(1, 'completed', `Script generated (${scriptData.duration}s estimated)`)
      setProgress(25)

      // Agent 2: Content Creator
      updateAgent(2, 'active', 'Creating voiceover and generating images...')
      addLog('Starting Agent 2: Content Creator', 'info')
      setProgress(30)

      const contentResponse = await fetch('/api/create-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptData.script,
          imagePrompts: scriptData.imagePrompts,
        }),
      })

      if (!contentResponse.ok) throw new Error('Content creation failed')
      const contentData = await contentResponse.json()
      addLog(`Voiceover created: ${contentData.voiceoverUrl}`, 'success')
      addLog(`Generated ${contentData.images.length} animated images`, 'success')
      updateAgent(2, 'completed', 'Voiceover and images ready')
      setProgress(50)

      // Agent 3: Video Producer
      updateAgent(3, 'active', 'Combining assets and producing video...')
      addLog('Starting Agent 3: Video Producer', 'info')
      setProgress(55)

      const videoResponse = await fetch('/api/produce-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceoverUrl: contentData.voiceoverUrl,
          images: contentData.images,
          duration: scriptData.duration,
        }),
      })

      if (!videoResponse.ok) throw new Error('Video production failed')
      const videoData = await videoResponse.json()
      addLog(`Video produced: ${videoData.videoUrl}`, 'success')
      setVideoUrl(videoData.videoUrl)
      updateAgent(3, 'completed', 'High-quality video ready')
      setProgress(75)

      // Agent 4: YouTube Publisher
      updateAgent(4, 'active', 'Uploading to YouTube...')
      addLog('Starting Agent 4: YouTube Publisher', 'info')
      setProgress(80)

      const uploadResponse = await fetch('/api/upload-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoData.videoUrl,
          script: scriptData.script,
        }),
      })

      if (!uploadResponse.ok) throw new Error('YouTube upload failed')
      const uploadData = await uploadResponse.json()
      addLog(`Video uploaded to YouTube: ${uploadData.youtubeUrl}`, 'success')
      addLog(`Title: ${uploadData.title}`, 'success')
      updateAgent(4, 'completed', 'Published to YouTube successfully!')
      setProgress(100)

      addLog('All agents completed successfully!', 'success')
    } catch (error: any) {
      addLog(`Error: ${error.message}`, 'error')
      const activeAgent = agents.find(a => a.status === 'active')
      if (activeAgent) {
        updateAgent(activeAgent.id, 'error', error.message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Head>
        <title>AI YouTube Automation Workflow</title>
        <meta name="description" content="Automated YouTube video creation with AI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="header">
        <h1>🎬 AI YouTube Automation</h1>
        <p>Create unlimited YouTube videos with zero cost using AI agents</p>
      </div>

      <div className="container">
        <div className="card">
          <h2 style={{ marginBottom: '20px', color: '#333' }}>Create Your Video</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={useGoogleSheets}
                  onChange={(e) => setUseGoogleSheets(e.target.checked)}
                  style={{ width: 'auto', marginRight: '10px' }}
                />
                Fetch ideas from Google Sheets
              </label>
            </div>

            {useGoogleSheets && (
              <div className="form-group">
                <label>Google Sheets ID</label>
                <input
                  type="text"
                  value={sheetsId}
                  onChange={(e) => setSheetsId(e.target.value)}
                  placeholder="Enter your Google Sheets ID"
                />
              </div>
            )}

            {!useGoogleSheets && (
              <div className="form-group">
                <label>Custom Idea (Optional)</label>
                <input
                  type="text"
                  value={customIdea}
                  onChange={(e) => setCustomIdea(e.target.value)}
                  placeholder="e.g., AI automation tools for 2024"
                />
              </div>
            )}

            <div className="form-group">
              <label>Video Script (Optional - AI will generate if empty)</label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter your video script here... The video length will match your script duration."
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                💡 Leave empty to auto-generate, or paste your script to control exact video length
              </small>
            </div>

            <button
              type="submit"
              className="button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : '🚀 Start Workflow'}
            </button>
          </form>
        </div>

        {isProcessing && (
          <div className="card">
            <h3 style={{ color: '#333', marginBottom: '20px' }}>Workflow Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}>
                {progress}%
              </div>
            </div>

            <div className="status-box">
              <h3>Agent Status</h3>
              {agents.map(agent => (
                <div key={agent.id} className={`agent-status ${agent.status}`}>
                  <div className="agent-icon">{agent.id}</div>
                  <div className="agent-info">
                    <h4>{agent.name}</h4>
                    <p>{agent.message}</p>
                  </div>
                  {agent.status === 'completed' && <span style={{ color: '#28a745', fontSize: '24px' }}>✓</span>}
                  {agent.status === 'active' && <div className="spinner" style={{ width: '24px', height: '24px', margin: '0' }}></div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="card">
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Process Log</h3>
            <div className="log-container">
              {logs.map((log, index) => (
                <div key={index} className="log-entry">{log}</div>
              ))}
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="card">
            <h3 style={{ color: '#333', marginBottom: '15px' }}>Video Preview</h3>
            <div className="video-preview">
              <video controls src={videoUrl} style={{ maxWidth: '100%', borderRadius: '8px' }} />
            </div>
            <div className="alert alert-success" style={{ marginTop: '20px' }}>
              ✅ Video created and uploaded successfully!
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: '40px' }}>
          <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '30px' }}>
            How It Works
          </h2>
          <div className="workflow-grid">
            <div className="workflow-card">
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <h3>Agent 1</h3>
              <p>Fetches ideas from Google Sheets or uses custom ideas to generate video scripts and image prompts</p>
            </div>
            <div className="workflow-card">
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎨</div>
              <h3>Agent 2</h3>
              <p>Converts script to voiceover and creates animated images from the generated prompts</p>
            </div>
            <div className="workflow-card">
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎬</div>
              <h3>Agent 3</h3>
              <p>Combines voiceover, images, and background music into a high-quality video</p>
            </div>
            <div className="workflow-card">
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📺</div>
              <h3>Agent 4</h3>
              <p>Schedules on YouTube with optimized title, keywords, description, and thumbnail</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
