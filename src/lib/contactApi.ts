import { getJson, postJson } from './apiClient'

export type ContactMessage = {
  contactId: string
  userId: string | null
  userEmail: string | null
  subject: string
  message: string
  pageUrl: string | null
  userAgent: string | null
  status: string
  createdAt: string
  updatedAt?: string | null
}

export async function submitContactMessage(input: {
  subject: string
  message: string
  pageUrl?: string | null
}) {
  return postJson<{
    contactMessage: ContactMessage
  }>('/api/contact', input)
}

export async function fetchAdminContactMessages() {
  return getJson<{
    contactMessages: ContactMessage[]
  }>('/api/admin/contact-messages')
}
