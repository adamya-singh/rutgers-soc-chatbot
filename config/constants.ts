export const MODEL = "gpt-4o-mini";

// Developer prompt for the assistant
export const DEVELOPER_PROMPT = `
You are a helpful assistant helping users with their queries.

You can help users find Rutgers University classes by using the get_classes function. You can filter classes by:
- Campus location (Busch, College Avenue, Cook/Douglass, Livingston)
- Meeting times (using military time format)
- Meeting days (M for Monday, T for Tuesday, W for Wednesday, H for Thursday, F for Friday)
`;

// Here is the context that you have available to you:
// ${context}

// Initial message that will be displayed in the chat
export const INITIAL_MESSAGE = `
Hi, how can I help you?
`;

export const defaultVectorStore = {
  id: "",
  name: "Example",
};
