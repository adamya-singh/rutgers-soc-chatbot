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

    // Get cookies and create Supabase client
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    console.log('Starting two-phase query optimization...')

    // Phase 1: Find matching section IDs using meetingtimes filters
    console.log('Phase 1: Finding matching section IDs...')
    let sectionIdsQuery = supabase
      .from('meetingtimes')
      .select('section_id')
      .order('section_id', { ascending: true })

    if (meetingday)        sectionIdsQuery = sectionIdsQuery.eq('meetingday', meetingday)
    if (starttimemilitary) sectionIdsQuery = sectionIdsQuery.gte('starttimemilitary', starttimemilitary)
    if (endtimemilitary)   sectionIdsQuery = sectionIdsQuery.lte('endtimemilitary', endtimemilitary)

    const { data: sectionIdsData, error: sectionIdsError } = await sectionIdsQuery

    if (sectionIdsError) {
      console.error('Phase 1 failed:', sectionIdsError)
      return new Response(JSON.stringify({ error: sectionIdsError.message }), { status: 500 })
    }

    // Log the raw number of meeting time entries fetched
    console.log(`Phase 1 raw results: Fetched ${sectionIdsData?.length ?? 0} meeting time entries.`)

    if (!sectionIdsData || sectionIdsData.length === 0) {
      console.log('No matching sections found in Phase 1')
      return new Response(JSON.stringify([]), { status: 200 })
    }

    // Extract unique section IDs
    const sectionIds = [...new Set(sectionIdsData.map(row => row.section_id))]
    console.log(`Phase 1 deduplication: Found ${sectionIds.length} unique section IDs.`)

    // Phase 2: Call RPC function to fetch full section records
    console.log('Phase 2: Calling RPC function get_filtered_sections...')
    const { data: sectionsData, error: sectionsError } = await supabase.rpc(
      'get_filtered_sections',
      {
        p_section_ids: sectionIds,
        p_description: description || null
      }
    )

    if (sectionsError) {
      console.error('Phase 2 RPC failed:', sectionsError)
      return new Response(JSON.stringify({ error: sectionsError.message }), { status: 500 })
    }

    // Return the fetched data
    console.log(`Phase 2 complete. Fetched ${sectionsData?.length ?? 0} full section records`)
    return new Response(JSON.stringify(sectionsData || []), { status: 200 })

  } catch (err: any) {
    console.error('Unexpected error in get_classes route:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
