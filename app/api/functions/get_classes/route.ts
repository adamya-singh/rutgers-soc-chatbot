// File: /app/api/functions/get_classes/route.ts
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'

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

// Threshold for when to apply LLM refinement
const REFINEMENT_THRESHOLD = 50

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface Section {
  section_id: string;
  course_title: string;
  course_expanded_title: string;
  course_subject_description: string;
  campus_location_description: string;
  meeting_time_meeting_day: string;
  meeting_time_start_time_military: string;
  meeting_time_end_time_military: string;
  meeting_time_building_code: string;
  meeting_time_room_number: string;
}

interface LlmSection {
  section_id: string;
  title: string;
  subject: string;
  campus: string;
  meeting_day: string;
  start_time: string;
  end_time: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const description       = searchParams.get('description')
    const starttimemilitary = searchParams.get('starttimemilitary')
    const endtimemilitary   = searchParams.get('endtimemilitary')
    const meetingday        = searchParams.get('meetingday')
    const user_query        = searchParams.get('user_query')

    // Validate user_query parameter
    if (!user_query) {
      return new Response(
        JSON.stringify({
          error: 'user_query parameter is required'
        }),
        { status: 400 }
      )
    }

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
      //.limit(100)

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

    console.log(`Phase 2 complete. Fetched ${sectionsData?.length ?? 0} full section records.`)

    // Apply LLM refinement if needed
    let refinedSectionsData = sectionsData
    if (sectionsData && sectionsData.length > REFINEMENT_THRESHOLD) {
      console.log('Applying LLM refinement due to large result set...')
      
      try {
        // Prepare simplified data for LLM
        const dataForLlm = sectionsData.map((section: Section) => ({
          section_id: section.section_id,
          title: section.course_title
        }))

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant tasked with filtering course data based on a user query. Analyze the provided JSON array of course sections (containing only section ID and title) and the user's query. Return ONLY the JSON objects from the input array that directly and relevantly answer the user's request. Preserve the original structure of the objects you return. Respond ONLY with the filtered JSON array, nothing else. If no sections are relevant, return an empty array []."
            },
            {
              role: "user",
              content: `User Query: "${user_query}"\n\nCourse Data:\n${JSON.stringify(dataForLlm)}\n\nFiltered JSON Array:`
            }
          ],
          temperature: 0.2
        })

        // Parse and process LLM response
        const llmResponse = completion.choices[0]?.message?.content
        if (llmResponse) {
          const filteredData = JSON.parse(llmResponse) as { section_id: string; title: string }[]
          const filteredIds = new Set(filteredData.map(item => item.section_id))
          refinedSectionsData = sectionsData.filter((section: Section) => filteredIds.has(section.section_id))
          console.log(`LLM refinement complete. Reduced from ${sectionsData.length} to ${refinedSectionsData.length} records.`)
        }
      } catch (error) {
        console.error('LLM refinement failed:', error)
        // On error, keep original data
        refinedSectionsData = sectionsData
      }
    }

    console.log(`Returning ${refinedSectionsData?.length ?? 0} records with full data.`)
    return new Response(JSON.stringify(refinedSectionsData || []), { status: 200 })

  } catch (err: any) {
    console.error('Unexpected error in get_classes route:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
