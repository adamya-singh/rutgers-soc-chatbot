// File: /app/api/functions/get_classes/route.ts
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const description       = searchParams.get('description')
    const starttimemilitary = searchParams.get('starttimemilitary')
    const endtimemilitary   = searchParams.get('endtimemilitary')
    const meetingday        = searchParams.get('meetingday')

    // initialize Supabase client with Next.js cookies (for auth/RLS if needed)
    const supabase = createClient(cookies())

    // base query: join sections → courses, sectioncampuslocations, meetingtimes
    let query = supabase
      .from('sections')
      .select(`
        *,
        courses (*),
        campuslocations:sectioncampuslocations!inner (*),
        meetingtimes:meetingtimes!inner (*)
      `)
      .limit(10)

    // apply filters only if provided
    if (description)       query = query.eq('campuslocations.description', description)
    if (starttimemilitary) query = query.gte('meetingtimes.starttimemilitary', starttimemilitary)
    if (endtimemilitary)   query = query.lte('meetingtimes.endtimemilitary', endtimemilitary)
    if (meetingday)        query = query.eq('meetingtimes.meetingday', meetingday)

    const { data, error } = await query

    if (error) {
      console.error('get_classes failed:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err: any) {
    console.error('Unexpected error in get_classes route:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
