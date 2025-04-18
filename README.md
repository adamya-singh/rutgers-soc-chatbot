# Rutgers SOC Chatbot

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)

An intelligent chatbot interface for querying Rutgers University course information using natural language. Built with Next.js, OpenAI, Supabase, and TypeScript.

## Overview

This project provides a web-based chat interface allowing users to ask questions about Rutgers University course schedules. The chatbot leverages the OpenAI API (specifically the Responses API with tool calling) to understand user queries and interact with a Supabase database containing course data.

It features a sophisticated two-phase filtering mechanism for retrieving class information:
1.  **Initial Database Filtering:** Uses structured parameters (like campus, day, time) extracted by the AI to perform an initial query against the Supabase database.
2.  **LLM Refinement:** If the initial results are numerous, a secondary LLM call refines the results based on the user's natural language query (`user_query`), ensuring relevance even with broad initial database queries.

## Features

*   **Conversational Interface:** Ask about Rutgers classes in natural language.
*   **Tool Calling:** Uses OpenAI's tool calling feature to interact with a custom `get_classes` function.
*   **Structured Filtering:** Supports filtering classes by campus, meeting day, and start/end times.
*   **LLM Refinement:** Employs a secondary LLM call to intelligently filter broad database results based on the specific user query.
*   **Streaming Responses:** Uses Server-Sent Events (SSE) for real-time response streaming from the AI.
*   **Supabase Integration:** Fetches course data directly from a Supabase database.
*   **Configurable:** Easily configure the AI model, developer prompt, and tool definitions.

## Technology Stack

*   **Framework:** [Next.js](https://nextjs.org/) (React)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **AI:** [OpenAI API](https://platform.openai.com/) (Responses API, gpt-4o-mini)
*   **Database:** [Supabase](https://supabase.io/) (PostgreSQL)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (styling patterns)
*   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)

## Architecture Overview

1.  **Frontend (React/Next.js):** User interacts with the chat interface (`components/chat.tsx`, `components/assistant.tsx`).
2.  **Message Processing (`lib/assistant.ts`):** User messages are sent to the custom backend API.
3.  **Backend API (`app/api/turn_response/route.ts`):**
    *   Receives conversation history and available tool definitions.
    *   Calls the OpenAI Responses API (`openai.responses.create`).
    *   Streams responses (text, tool call requests) back to the frontend via SSE.
4.  **Frontend Tool Handling (`lib/assistant.ts`, `lib/tools/tools-handling.ts`):**
    *   Receives tool call requests from the backend stream.
    *   Parses arguments provided by the AI.
    *   Calls the appropriate frontend tool wrapper function (`config/functions.ts`).
5.  **Frontend Tool Wrapper (`config/functions.ts`):**
    *   Constructs the URL with parameters for the specific tool's backend API.
    *   Calls the tool's backend API route.
6.  **Tool Backend API (`app/api/functions/get_classes/route.ts`):**
    *   Receives the request with parameters (including `user_query`).
    *   **Phase 1:** Queries Supabase (`meetingtimes` table, `get_filtered_sections` RPC) based on structured filters (day, time, campus).
    *   **Phase 2 (Optional):** If results exceed a threshold (`REFINEMENT_THRESHOLD`), calls OpenAI API again to refine the results based on the `user_query`.
    *   Returns the final list of class sections (full data) to the frontend tool wrapper.
7.  **Frontend (`lib/assistant.ts`):**
    *   Receives the tool execution result.
    *   Sends the result back to the `/api/turn_response` backend to continue the conversation turn.
    *   Displays the final AI response and tool results in the UI.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory by copying the example:
    ```bash
    cp .env.example .env.local
    ```
    Populate `.env.local` with your credentials:
    ```env
    # Required: Your OpenAI API Key
    OPENAI_API_KEY=sk-...

    # Required: Your Supabase Project URL and Anon Key
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

4.  **Set up Supabase Database:**
    *   Ensure you have a Supabase project created.
    *   The application expects specific tables and functions to exist in your Supabase database:
        *   A table containing meeting time information (likely named `meetingtimes` or similar, used in Phase 1 filtering).
        *   A table containing detailed section information.
        *   A PostgreSQL RPC function named `get_filtered_sections` that accepts section IDs (`p_section_ids`) and an optional campus description (`p_description`) and returns detailed section records.
    *   You will need to populate these tables with the relevant Rutgers course data.

## Running the Project

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  Open your browser and navigate to `http://localhost:3000`.

## Configuration

*   **AI Model & Prompt:** Modify `config/constants.ts` to change the OpenAI model (`MODEL`) or the main developer prompt (`DEVELOPER_PROMPT`).
*   **Tools:** Define available tools, their descriptions, and parameters in `config/tools-list.ts`.
*   **Tool Execution Logic:** Frontend wrappers that call the backend tool APIs are in `config/functions.ts`.
*   **Environment Variables:** API keys and Supabase connection details are managed in `.env.local`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
