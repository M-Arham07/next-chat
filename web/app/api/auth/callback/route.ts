import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('exchangeCodeForSession failed:', error.message)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth`)
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}