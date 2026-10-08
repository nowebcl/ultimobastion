import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

const RadioContext = createContext(null)

const STREAM_URL = 'https://cast235.indax.cl/8002/stream'

export function RadioProvider({ children }) {
  // Starts IN SILENCE upon entering the site (as requested by user)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.85)
  const [isLoading, setIsLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const audioRef = useRef(null)

  // Initialize or get the audio instance
  const getAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(STREAM_URL)
      audioRef.current.preload = 'none'
      audioRef.current.volume = volume

      audioRef.current.addEventListener('waiting', () => setIsLoading(true))
      audioRef.current.addEventListener('playing', () => {
        setIsLoading(false)
        setIsPlaying(true)
      })
      audioRef.current.addEventListener('pause', () => setIsPlaying(false))
      audioRef.current.addEventListener('error', (e) => {
        console.warn('Radio stream reconnection attempt...', e)
        setIsLoading(false)
        setIsPlaying(false)
      })
    }
    return audioRef.current
  }

  // Toggle play / pause
  const togglePlay = () => {
    const audio = getAudio()
    setHasInteracted(true)

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      // If it was paused, re-point stream to live head
      audio.src = `${STREAM_URL}?t=${Date.now()}`
      audio.muted = isMuted
      audio.volume = volume
      
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            setIsLoading(false)
          })
          .catch((err) => {
            console.warn('Audio play prevented or interrupted:', err)
            setIsLoading(false)
            setIsPlaying(false)
          })
      }
    }
  }

  // Toggle mute / unmute
  const toggleMute = () => {
    const audio = getAudio()
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    audio.muted = nextMuted
  }

  // Change volume
  const setAudioVolume = (val) => {
    const clamped = Math.max(0, Math.min(1, val))
    setVolume(clamped)
    const audio = getAudio()
    audio.volume = clamped
    if (clamped === 0) {
      setIsMuted(true)
      audio.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      audio.muted = false
    }
  }

  return (
    <RadioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        isLoading,
        hasInteracted,
        togglePlay,
        toggleMute,
        setAudioVolume,
      }}
    >
      {children}
    </RadioContext.Provider>
  )
}

export function useRadio() {
  const context = useContext(RadioContext)
  if (!context) {
    throw new Error('useRadio must be used within a RadioProvider')
  }
  return context
}
