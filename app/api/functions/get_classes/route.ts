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

// Number of records to fetch per page
const PAGE_SIZE = 15

// Type for section data
interface Section {
  id: number
  [key: string]: any // Allow other fields since we're using *
}

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
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    //const supabase = createClient(cookies())

    // Function to fetch a single page of results
    const fetchPage = async (start: number) => {
      let query = supabase
        .from('sections')
        .select(`
          *,
          courses (*),
          campuslocations:sectioncampuslocations!inner (*),
          meetingtimes:meetingtimes!inner (*)
        `)
        .range(start, start + PAGE_SIZE - 1)

      // apply filters only if provided
      if (description)       query = query.eq('campuslocations.description', description)
      if (starttimemilitary) query = query.gte('meetingtimes.starttimemilitary', starttimemilitary)
      if (endtimemilitary)   query = query.lte('meetingtimes.endtimemilitary', endtimemilitary)
      if (meetingday)        query = query.eq('meetingtimes.meetingday', meetingday)

      return await query
    }

    // Fetch all pages
    let allResults: Section[] = []
    let currentStart = 0
    let hasMore = true
    let totalRecords = 0

    console.log('Starting to fetch matching records...')

    while (hasMore) {
      const { data, error } = await fetchPage(currentStart)
      
      if (error) {
        console.error('get_classes failed:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      if (!data || data.length === 0) {
        hasMore = false
        console.log(`Finished fetching records. Total found: ${totalRecords}`)
      } else {
        allResults = [...allResults, ...data]
        totalRecords += data.length
        currentStart += PAGE_SIZE
        
        console.log(`Fetched ${data.length} records. Total so far: ${totalRecords}`)
        
        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return new Response(JSON.stringify(allResults), { status: 200 })
  } catch (err: any) {
    console.error('Unexpected error in get_classes route:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
