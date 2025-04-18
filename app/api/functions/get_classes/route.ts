// File: /app/api/functions/get_classes/route.ts
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

// Valid meetingday values from database scan
const VALID_MEETING_DAYS = ['', 'F', 'H', 'M', 'T', 'W']

// Valid description values from database scan
const VALID_DESCRIPTIONS = [
  'Busch',
  'College Avenue',
  'Cook/Douglass',
  'Downtown New Brunswick',
  'Livingston',
  'N/A',
  'O',
  'Study Abroad'
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const description       = searchParams.get('description')
    const starttimemilitary = searchParams.get('starttimemilitary')
    const endtimemilitary   = searchParams.get('endtimemilitary')
    const meetingday        = searchParams.get('meetingday')

    // Validate meetingday parameter
    if (meetingday && !VALID_MEETING_DAYS.includes(meetingday)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid meetingday value. Must be one of: ${VALID_MEETING_DAYS.filter(d => d !== '').join(', ')}` 
        }), 
        { status: 400 }
      )
    }

    // Validate description parameter
    if (description && !VALID_DESCRIPTIONS.includes(description)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid description value. Must be one of: ${VALID_DESCRIPTIONS.join(', ')}` 
        }), 
        { status: 400 }
      )
    }

    // initialize Supabase client with Next.js cookies (for auth/RLS if needed)
    const supabase = createClient(cookies())

    // TEMPORARY CODE - SCAN FOR UNIQUE VALUES
    // This can be removed after we get the values we need
    const scanQuery = supabase
      .from('sections')
      .select(`
        campuslocations:sectioncampuslocations!inner (description)
      `)
      .limit(1000) // Adjust this number if needed

    const { data: scanData, error: scanError } = await scanQuery
    
    if (!scanError) {
      // Extract unique description values
      const uniqueDescriptions = new Set(
        scanData
          .map(section => section.campuslocations?.[0]?.description)
          .filter(desc => desc !== undefined)
      )
      
      console.log('Unique description values:', Array.from(uniqueDescriptions).sort())
    } else {
      console.error('Scan failed:', scanError)
    }
    // END TEMPORARY CODE

    // base query: join sections → courses, sectioncampuslocations, meetingtimes
    let query = supabase
      .from('sections')
      .select(`
        *,
        courses (*),
        campuslocations:sectioncampuslocations!inner (*),
        meetingtimes:meetingtimes!inner (*)
      `)
      .limit(1000)

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
