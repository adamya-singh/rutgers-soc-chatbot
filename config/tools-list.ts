// List of tools available to the assistant
// No need to include the top-level wrapper object as it is added in lib/tools/tools.ts
// More information on function calling: https://platform.openai.com/docs/guides/function-calling

export const toolsList = [
  {
    name: "get_weather",
    description: "Get the weather for a given location",
    parameters: {
      location: {
        type: "string",
        description: "Location to get weather for",
      },
      unit: {
        type: "string",
        description: "Unit to get weather in",
        enum: ["celsius", "fahrenheit"],
      },
    },
  },
  {
    name: "get_joke",
    description: "Get a programming joke",
    parameters: {},
  },
  {
    name: "get_classes",
    description: "Get Rutgers classes based on optional filters for location, time, and day",
    parameters: {
      description: {
        type: "string",
        description: "Campus location description (e.g. 'College Avenue', 'Busch', 'Livingston', 'Cook/Douglass')",
        optional: true
      },
      starttimemilitary: {
        type: "string",
        description: "Start time in military format (e.g. '1400' for 2:00 PM)",
        optional: true
      },
      endtimemilitary: {
        type: "string",
        description: "End time in military format (e.g. '1520' for 3:20 PM)",
        optional: true
      },
      meetingday: {
        type: "string",
        description: "Day of the week (M for Monday, T for Tuesday, W for Wednesday, H for Thursday, F for Friday)",
        optional: true
      }
    }
  }
];
