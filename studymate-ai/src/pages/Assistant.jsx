import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import {
  getAssistantResponse,
  SUGGESTED_PROMPTS,
  TYPING_DELAY,
  CHAT_STORAGE_KEY,
} from '../utils/assistantLogic'
import './Assistant.css'

const MAX_INPUT_LENGTH = 500

// ── Helpers ──────────────────────────────────────────────────────────────────

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function makeWelcome() {
  return {
    id: 'welcome',
    role: 'assistant',
    content: [
      '👋 Hi! I\'m the **StudyMate AI Assistant** — a local demo assistant built for this hackathon.',
      '',
      '⚠️ **Note:** I use pre-programmed local responses and am not connected to an external AI service. All responses are generated on-device with no data sent anywhere.',
      '',
      'Here\'s what I can help you with:',
      '- 📅 Build a personalised **study plan**',
      '- ❓ Generate **quiz questions** for any subject',
      '- 📝 Techniques for **summarising notes**',
      '- 🎯 Step-by-step **exam preparation** guides',
      '- 💻 Frameworks for solving **programming problems**',
      '- 💡 Explain any **topic in simple words**',
      '- 🧠 Study techniques: Pomodoro, spaced repetition, active recall',
      '',
      'Tap a suggestion below or type your own question to get started!',
    ].join('\n'),
    time: nowTime(),
    isWelcome: true,
  }
}

// Lightweight markdown renderer: bold, italic, line-breaks, bullet lists
function renderMarkdown(raw) {
  return raw
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text* (not caught by bold)
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
    // Newlines → <br>
    .replace(/\n/g, '<br/>')
}

function loadPersistedMessages() {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return null
}

function persistMessages(msgs) {
  try {
    // Don't persist typing placeholders
    const clean = msgs.filter(m => !m.typing)
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(clean))
  } catch { /* ignore */ }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      // Strip HTML tags before copying
      const plain = text.replace(/<[^>]+>/g, '').replace(/\n/g, '\n')
      await navigator.clipboard.writeText(plain)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea')
      ta.value = text.replace(/<[^>]+>/g, '')
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [text])

  return (
    <button
      className={`copy-btn${copied ? ' copy-btn--copied' : ''}`}
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy response'}
      title={copied ? 'Copied!' : 'Copy response'}
    >
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

function Message({ msg, isLast }) {
  const isBot = msg.role === 'assistant'
  const html  = isBot && !msg.typing ? renderMarkdown(msg.content) : null

  return (
    <div
      className={`chat-message${isBot ? ' chat-message--bot' : ' chat-message--user'}${isLast ? ' chat-message--last' : ''}`}
      aria-label={isBot ? 'Assistant message' : 'Your message'}
    >
      {isBot && (
        <div className="chat-avatar chat-avatar--bot" aria-hidden="true">🤖</div>
      )}

      <div className={`chat-bubble${isBot ? ' chat-bubble--bot' : ' chat-bubble--user'}`}>
        {msg.typing ? (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <span /><span /><span />
          </div>
        ) : isBot ? (
          <div
            className="chat-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="chat-content">{msg.content}</p>
        )}

        {!msg.typing && (
          <div className="chat-bubble-footer">
            <span className="chat-time">{msg.time}</span>
            {isBot && !msg.isWelcome && <CopyButton text={msg.content} />}
          </div>
        )}
      </div>

      {!isBot && (
        <div className="chat-avatar chat-avatar--user" aria-hidden="true">👤</div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Assistant() {
  const { subjects, assignments, exams } = useApp()

  const [messages, setMessages] = useState(() => loadPersistedMessages() ?? [makeWelcome()])
  const [input, setInput]       = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const context   = { subjects, assignments, exams }

  // Persist messages whenever they change (skip typing placeholders)
  useEffect(() => {
    persistMessages(messages)
  }, [messages])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = useCallback((textOverride) => {
    const trimmed = (textOverride ?? input).trim()
    if (!trimmed || isTyping) return

    const userMsg = {
      id:      crypto.randomUUID(),
      role:    'user',
      content: trimmed,
      time:    nowTime(),
    }
    const typingId = crypto.randomUUID()

    setMessages(prev => [...prev, userMsg, { id: typingId, role: 'assistant', typing: true }])
    setInput('')
    setIsTyping(true)

    // Realistic delay: base + slight scaling with message length
    const delay = TYPING_DELAY + Math.min(trimmed.length * 6, 900)

    setTimeout(() => {
      const responseText = getAssistantResponse(trimmed, context)
        ?? "I'm not sure about that. Try one of the suggested prompts, or ask about study strategies, exam prep, or a specific subject!"

      const botMsg = {
        id:      crypto.randomUUID(),
        role:    'assistant',
        content: responseText,
        time:    nowTime(),
      }

      setMessages(prev => prev.filter(m => m.id !== typingId).concat(botMsg))
      setIsTyping(false)
      inputRef.current?.focus()
    }, delay)
  }, [input, isTyping, context])

  // ── Suggestion clicked: place text into input (don't auto-send) ───────
  const handleSuggestion = useCallback((promptText) => {
    if (isTyping) return
    setInput(promptText)
    inputRef.current?.focus()
  }, [isTyping])

  // ── Clear chat ────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    const fresh = [makeWelcome()]
    setMessages(fresh)
    setIsTyping(false)
    persistMessages(fresh)
    inputRef.current?.focus()
  }, [])

  // ── Input change ──────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    if (e.target.value.length <= MAX_INPUT_LENGTH) setInput(e.target.value)
  }

  // ── Key handler: Enter sends, Shift+Enter newline ─────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const charsLeft    = MAX_INPUT_LENGTH - input.length
  const charsWarning = charsLeft <= 60
  const messageCount = messages.filter(m => !m.isWelcome && !m.typing).length

  return (
    <div className="assistant-page">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="assistant-header card">
        <div className="assistant-header-left">
          <div className="assistant-avatar-xl" aria-hidden="true">🤖</div>
          <div className="assistant-header-info">
            <h2 className="assistant-title">StudyMate AI Assistant</h2>
            <p className="assistant-subtitle">
              <span className="assistant-status-dot" aria-hidden="true" />
              Local demo · Always available · No internet required
            </p>
          </div>
        </div>
        <div className="assistant-header-actions">
          {messageCount > 0 && (
            <span className="assistant-msg-count">{messageCount} message{messageCount !== 1 ? 's' : ''}</span>
          )}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClear}
            disabled={isTyping}
            aria-label="Clear conversation"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* ── Capability chips (collapsed capabilities overview) ──────── */}
      <div className="assistant-caps card">
        <p className="assistant-caps-title">What I can help with:</p>
        <div className="assistant-caps-row">
          {[
            { icon: '📅', label: 'Study Plans' },
            { icon: '❓', label: 'Quiz Questions' },
            { icon: '📝', label: 'Note Summaries' },
            { icon: '🎯', label: 'Exam Prep' },
            { icon: '💻', label: 'Programming' },
            { icon: '💡', label: 'Explain Topics' },
            { icon: '🧠', label: 'Study Techniques' },
            { icon: '💪', label: 'Motivation' },
          ].map(c => (
            <span key={c.label} className="capability-chip">
              <span aria-hidden="true">{c.icon}</span> {c.label}
            </span>
          ))}
        </div>
        <p className="assistant-local-note">
          ⚠️ This is a <strong>local demo assistant</strong> — responses are pre-programmed and no data is sent externally. A real AWS AI service (e.g. Amazon Q or Bedrock) would be integrated in production.
        </p>
      </div>

      {/* ── Chat window ─────────────────────────────────────────────── */}
      <div className="chat-window card" role="log" aria-live="polite" aria-label="Chat conversation">
        <div className="chat-messages" id="chat-messages-list">
          {messages.map((msg, idx) => (
            <Message
              key={msg.id}
              msg={msg}
              isLast={idx === messages.length - 1}
            />
          ))}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {/* ── Suggested prompts ────────────────────────────────────────── */}
      <div className="suggestions-section">
        <p className="suggestions-label">Suggested prompts — click to fill the input:</p>
        <div className="suggestions-grid">
          {SUGGESTED_PROMPTS.map(p => (
            <button
              key={p.text}
              className={`suggestion-chip${isTyping ? ' suggestion-chip--disabled' : ''}`}
              onClick={() => handleSuggestion(p.text)}
              disabled={isTyping}
              aria-label={`Use prompt: ${p.label}`}
              title="Click to place this in the input"
            >
              <span className="suggestion-icon" aria-hidden="true">{p.icon}</span>
              <span className="suggestion-label">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Input bar ───────────────────────────────────────────────── */}
      <div className="chat-input-section card">
        <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); sendMessage() }}>
          <div className="chat-input-wrap">
            <textarea
              ref={inputRef}
              className="chat-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about studying… (Enter to send, Shift+Enter for new line)"
              disabled={isTyping}
              rows={2}
              maxLength={MAX_INPUT_LENGTH}
              aria-label="Chat input"
              aria-describedby="chat-char-count"
            />
            <div className="chat-input-footer">
              <span
                id="chat-char-count"
                className={`char-counter${charsWarning ? ' char-counter--warn' : ''}`}
                aria-live="polite"
                aria-label={`${charsLeft} characters remaining`}
              >
                {charsLeft} / {MAX_INPUT_LENGTH}
              </span>
              <button
                type="submit"
                className="btn btn-primary chat-send-btn"
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
              >
                <span className="chat-send-text">Send</span>
                <span className="chat-send-icon" aria-hidden="true">↑</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Footer disclaimer ────────────────────────────────────────── */}
      <p className="assistant-disclaimer">
        StudyMate AI uses built-in local responses only — no data is transmitted externally.
        For subject-specific academic advice, always consult your professor or course materials.
      </p>
    </div>
  )
}
