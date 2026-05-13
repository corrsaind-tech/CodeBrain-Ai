'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Chat, Message } from '@/lib/types'
import { 
  getChats, 
  getChat, 
  createChat, 
  deleteChat, 
  addMessage, 
  updateMessage,
  removeMessagesFromIndex,
  getSettings, 
  saveSettings,
  generateId
} from '@/lib/chat-store'
import { sendMessage } from '@/lib/api'

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const storedChats = getChats()
    setChats(storedChats)
    const settings = getSettings()
    setCustomPrompt(settings.customPrompt)
    
    if (storedChats.length > 0) {
      setCurrentChatId(storedChats[0].id)
      setMessages(storedChats[0].messages)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const refreshChats = () => {
    const storedChats = getChats()
    setChats(storedChats)
  }

  const handleNewChat = () => {
    const newChat = createChat()
    setCurrentChatId(newChat.id)
    setMessages([])
    refreshChats()
  }

  const handleSelectChat = (chatId: string) => {
    const chat = getChat(chatId)
    if (chat) {
      setCurrentChatId(chatId)
      setMessages(chat.messages)
    }
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChat(chatId)
    refreshChats()
    if (currentChatId === chatId) {
      const remaining = getChats()
      if (remaining.length > 0) {
        setCurrentChatId(remaining[0].id)
        setMessages(remaining[0].messages)
      } else {
        setCurrentChatId(null)
        setMessages([])
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    let chatId = currentChatId
    if (!chatId) {
      const newChat = createChat()
      chatId = newChat.id
      setCurrentChatId(chatId)
      refreshChats()
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    }

    addMessage(chatId, userMessage)
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    refreshChats()

    try {
      const response = await sendMessage(userMessage.content, customPrompt || undefined)
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
      addMessage(chatId, assistantMessage)
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: Date.now()
      }
      addMessage(chatId, errorMessage)
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      refreshChats()
    }
  }

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
  }

  const handleSaveEdit = async (messageId: string) => {
    if (!currentChatId || !editContent.trim()) return

    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return

    updateMessage(currentChatId, messageId, editContent.trim())
    
    const updatedMessages = [...messages]
    updatedMessages[messageIndex] = { ...updatedMessages[messageIndex], content: editContent.trim() }
    
    removeMessagesFromIndex(currentChatId, messageIndex + 1)
    const truncatedMessages = updatedMessages.slice(0, messageIndex + 1)
    setMessages(truncatedMessages)
    
    setEditingMessageId(null)
    setEditContent('')

    if (messages[messageIndex].role === 'user') {
      setIsLoading(true)
      try {
        const response = await sendMessage(editContent.trim(), customPrompt || undefined)
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        }
        addMessage(currentChatId, assistantMessage)
        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          timestamp: Date.now()
        }
        addMessage(currentChatId, errorMessage)
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
        refreshChats()
      }
    }
  }

  const handleRegenerate = async (messageIndex: number) => {
    if (!currentChatId || messageIndex < 1) return

    const userMessage = messages[messageIndex - 1]
    if (userMessage.role !== 'user') return

    removeMessagesFromIndex(currentChatId, messageIndex)
    setMessages(prev => prev.slice(0, messageIndex))
    
    setIsLoading(true)
    try {
      const response = await sendMessage(userMessage.content, customPrompt || undefined)
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      }
      addMessage(currentChatId, assistantMessage)
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        timestamp: Date.now()
      }
      addMessage(currentChatId, errorMessage)
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      refreshChats()
    }
  }

  const handleSaveSettings = () => {
    saveSettings({ customPrompt })
    setShowSettings(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0a0a0a'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: showSidebar ? '280px' : '0',
        background: '#111111',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.2s'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          gap: '8px'
        }}>
          <button 
            onClick={handleNewChat}
            style={{
              flex: 1,
              padding: '12px',
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#e5e5e5',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Chat
          </button>
        </div>

        {/* Chat List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px'
        }}>
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              style={{
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '4px',
                background: currentChatId === chat.id ? '#1a1a1a' : 'transparent',
                border: currentChatId === chat.id ? '1px solid #2a2a2a' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span style={{
                flex: 1,
                fontSize: '14px',
                color: '#a3a3a3',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {chat.title}
              </span>
              <button
                onClick={(e) => handleDeleteChat(chat.id, e)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#525252',
                  opacity: 0.5
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '12px',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              color: '#a3a3a3',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Custom Prompt
          </button>
          <Link href="/home" style={{
            padding: '12px',
            background: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            color: '#a3a3a3',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            textDecoration: 'none'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Ir a Home
          </Link>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <header style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#737373'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #2a2a2a'
            }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#e5e5e5' }}>M</span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '500', color: '#e5e5e5' }}>MuyMuy AI</span>
          </div>
          {customPrompt && (
            <span style={{
              fontSize: '12px',
              color: '#525252',
              background: '#1a1a1a',
              padding: '4px 8px',
              borderRadius: '4px',
              marginLeft: 'auto'
            }}>
              Prompt personalizado activo
            </span>
          )}
        </header>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#525252'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: '#141414',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                border: '1px solid #2a2a2a'
              }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#404040' }}>M</span>
              </div>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>Comienza una conversación</p>
              <p style={{ fontSize: '14px' }}>Escribe un mensaje para empezar</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={message.id}
                style={{
                  marginBottom: '24px',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: message.role === 'user' ? '#2a2a2a' : '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {message.role === 'user' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a3a3a3" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#a3a3a3' }}>M</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#e5e5e5'
                    }}>
                      {message.role === 'user' ? 'Tú' : 'MuyMuy AI'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#525252' }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {editingMessageId === message.id ? (
                    <div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#141414',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          color: '#e5e5e5',
                          fontSize: '14px',
                          resize: 'vertical',
                          minHeight: '80px',
                          fontFamily: 'inherit'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleSaveEdit(message.id)}
                          style={{
                            padding: '8px 16px',
                            background: '#e5e5e5',
                            color: '#0a0a0a',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Guardar y regenerar
                        </button>
                        <button
                          onClick={() => setEditingMessageId(null)}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: '#a3a3a3',
                            border: '1px solid #2a2a2a',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        fontSize: '14px',
                        color: '#a3a3a3',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {message.content}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '12px'
                      }}>
                        <button
                          onClick={() => handleEditMessage(message)}
                          style={{
                            padding: '6px 10px',
                            background: 'transparent',
                            border: '1px solid #2a2a2a',
                            borderRadius: '6px',
                            color: '#737373',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Editar
                        </button>
                        {message.role === 'assistant' && (
                          <button
                            onClick={() => handleRegenerate(index)}
                            style={{
                              padding: '6px 10px',
                              background: 'transparent',
                              border: '1px solid #2a2a2a',
                              borderRadius: '6px',
                              color: '#737373',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="1 4 1 10 7 10"/>
                              <polyline points="23 20 23 14 17 14"/>
                              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                            </svg>
                            Regenerar
                          </button>
                        )}
                        <button
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          style={{
                            padding: '6px 10px',
                            background: 'transparent',
                            border: '1px solid #2a2a2a',
                            borderRadius: '6px',
                            color: '#737373',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                          </svg>
                          Copiar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#a3a3a3' }}>M</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                paddingTop: '8px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#404040',
                  animation: 'pulse 1.5s infinite'
                }}/>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#404040',
                  animation: 'pulse 1.5s infinite 0.2s'
                }}/>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#404040',
                  animation: 'pulse 1.5s infinite 0.4s'
                }}/>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #1a1a1a'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            background: '#141414',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid #2a2a2a'
          }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#e5e5e5',
                fontSize: '14px',
                resize: 'none',
                outline: 'none',
                minHeight: '24px',
                maxHeight: '120px',
                fontFamily: 'inherit'
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              style={{
                padding: '10px 20px',
                background: input.trim() && !isLoading ? '#e5e5e5' : '#2a2a2a',
                color: input.trim() && !isLoading ? '#0a0a0a' : '#525252',
                border: 'none',
                borderRadius: '8px',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Enviar
            </button>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#111111',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            border: '1px solid #2a2a2a'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#e5e5e5'
              }}>
                Configuración de Prompt
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#737373',
                  padding: '4px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <p style={{
              fontSize: '14px',
              color: '#737373',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Añade instrucciones personalizadas que se enviarán con cada mensaje. 
              Por ejemplo: {"\"Responde siempre en español\"'"} o {"\"Sé conciso en tus respuestas\""}.
            </p>
            
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Escribe tus instrucciones personalizadas aquí..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#e5e5e5',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '20px'
              }}
            />
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setCustomPrompt('')
                  saveSettings({ customPrompt: '' })
                }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#a3a3a3',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Limpiar
              </button>
              <button
                onClick={handleSaveSettings}
                style={{
                  padding: '10px 20px',
                  background: '#e5e5e5',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#0a0a0a',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
