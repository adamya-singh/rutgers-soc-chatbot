// Functions mapping to tool calls
// Define one function per tool call - each tool call should have a matching function
// Parameters for a tool call are passed as an object to the corresponding function

/* Commented out functions - can be uncommented if needed
export const get_weather = async ({
  location,
  unit,
}: {
  location: string;
  unit: string;
}) => {
  console.log("location", location);
  console.log("unit", unit);
  const res = await fetch(
    `/api/functions/get_weather?location=${location}&unit=${unit}`
  ).then((res) => res.json());

  console.log("executed get_weather function", res);

  return res;
};

export const get_joke = async () => {
  const res = await fetch(`/api/functions/get_joke`).then((res) => res.json());
  return res;
};
*/

export const get_classes = async ({
  description,
  starttimemilitary,
  endtimemilitary,
  meetingday,
}: {
  description?: string;
  starttimemilitary?: string;
  endtimemilitary?: string;
  meetingday?: string;
}) => {
  const params = new URLSearchParams();
  if (description) params.append('description', description);
  if (starttimemilitary) params.append('starttimemilitary', starttimemilitary);
  if (endtimemilitary) params.append('endtimemilitary', endtimemilitary);
  if (meetingday) params.append('meetingday', meetingday);
  
  const res = await fetch(`/api/functions/get_classes?${params.toString()}`).then(res => res.json());
  return res;
};

export const functionsMap = {
  // get_weather: get_weather,
  // get_joke: get_joke,
  get_classes: get_classes,
};
