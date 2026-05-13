import { Chat, Message, UserSettings } from './types'

const CHATS_KEY = 'muymuy_chats'
const SETTINGS_KEY = 'muymuy_settings'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function getChats(): Chat[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(CHATS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function saveChats(chats: Chat[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
}

export function getChat(id: string): Chat | null {
  const chats = getChats()
  return chats.find(c => c.id === id) || null
}

export function createChat(): Chat {
  const chat: Chat = {
    id: generateId(),
    title: 'Nuevo Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  const chats = getChats()
  chats.unshift(chat)
  saveChats(chats)
  return chat
}

export function updateChat(chatId: string, updates: Partial<Chat>): void {
  const chats = getChats()
  const index = chats.findIndex(c => c.id === chatId)
  if (index !== -1) {
    chats[index] = { ...chats[index], ...updates, updatedAt: Date.now() }
    saveChats(chats)
  }
}

export function deleteChat(chatId: string): void {
  const chats = getChats().filter(c => c.id !== chatId)
  saveChats(chats)
}

export function addMessage(chatId: string, message: Message): void {
  const chats = getChats()
  const index = chats.findIndex(c => c.id === chatId)
  if (index !== -1) {
    chats[index].messages.push(message)
    chats[index].updatedAt = Date.now()
    if (chats[index].messages.length === 1 && message.role === 'user') {
      chats[index].title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '')
    }
    saveChats(chats)
  }
}

export function updateMessage(chatId: string, messageId: string, content: string): void {
  const chats = getChats()
  const chatIndex = chats.findIndex(c => c.id === chatId)
  if (chatIndex !== -1) {
    const msgIndex = chats[chatIndex].messages.findIndex(m => m.id === messageId)
    if (msgIndex !== -1) {
      chats[chatIndex].messages[msgIndex].content = content
      chats[chatIndex].updatedAt = Date.now()
      saveChats(chats)
    }
  }
}

export function removeMessagesFromIndex(chatId: string, fromIndex: number): void {
  const chats = getChats()
  const chatIndex = chats.findIndex(c => c.id === chatId)
  if (chatIndex !== -1) {
    chats[chatIndex].messages = chats[chatIndex].messages.slice(0, fromIndex)
    chats[chatIndex].updatedAt = Date.now()
    saveChats(chats)
  }
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return { customPrompt: '' }
  const stored = localStorage.getItem(SETTINGS_KEY)
  return stored ? JSON.parse(stored) : { customPrompt: '' }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}
