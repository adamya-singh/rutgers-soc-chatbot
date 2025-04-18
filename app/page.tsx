"use client";
import Assistant from "@/components/assistant";
// import ToolsPanel from "@/components/tools-panel";
// import { Menu, X } from "lucide-react";
import { useState } from "react";
import useFiltersStore from "@/stores/useFiltersStore";

// Define options for the dropdowns
const descriptionOptions = [
  { value: "", label: "Any Campus" },
  { value: "Busch", label: "Busch" },
  { value: "College Avenue", label: "College Avenue" },
  { value: "Cook/Douglass", label: "Cook/Douglass" },
  { value: "Livingston", label: "Livingston" },
];

const meetingDayOptions = [
  { value: "", label: "Any Day" },
  { value: "M", label: "Monday" },
  { value: "T", label: "Tuesday" },
  { value: "W", label: "Wednesday" },
  { value: "H", label: "Thursday" },
  { value: "F", label: "Friday" },
];

// Generate time options from 8:00 AM to 10:30 PM in 30-minute intervals
const timeOptions = [
  { value: "", label: "Any Time" },
  ...Array.from({ length: 30 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    const timeStr = `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`;
    const displayTime = `${hour % 12 || 12}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
    return { value: timeStr, label: displayTime };
  })
];

export default function Main() {
  const { 
    selectedDescription, 
    selectedMeetingDay, 
    selectedStartTime,
    selectedEndTime,
    setSelectedDescription, 
    setSelectedMeetingDay,
    setSelectedStartTime,
    setSelectedEndTime
  } = useFiltersStore();
  // const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);

  return (
    <div className="flex flex-col items-center h-screen">
      {/* Dropdown Controls */}
      <div className="grid grid-cols-2 gap-4 mb-4 w-full md:w-[70%] p-4">
        <div>
          <label htmlFor="description-select" className="block text-sm font-medium text-gray-700 mb-1">Campus:</label>
          <select
            id="description-select"
            value={selectedDescription}
            onChange={(e) => setSelectedDescription(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            {descriptionOptions.map(option => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="meetingday-select" className="block text-sm font-medium text-gray-700 mb-1">Day:</label>
          <select
            id="meetingday-select"
            value={selectedMeetingDay}
            onChange={(e) => setSelectedMeetingDay(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            {meetingDayOptions.map(option => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="starttime-select" className="block text-sm font-medium text-gray-700 mb-1">Start Time:</label>
          <select
            id="starttime-select"
            value={selectedStartTime}
            onChange={(e) => setSelectedStartTime(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            {timeOptions.map(option => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="endtime-select" className="block text-sm font-medium text-gray-700 mb-1">End Time:</label>
          <select
            id="endtime-select"
            value={selectedEndTime}
            onChange={(e) => setSelectedEndTime(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            {timeOptions.map(option => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assistant Component Container */}
      <div className="w-full md:w-[50%] max-w-4xl mx-auto h-[35vh] mt-[10vh] flex items-center justify-center">
        <div className="w-full h-full bg-white rounded-lg shadow-lg p-6 transform scale-105">
          <Assistant />
        </div>
      </div>
      {/* <div className="hidden md:block w-[30%]">
        <ToolsPanel />
      </div> */}
      {/* Hamburger menu for small screens */}
      {/* <div className="absolute top-4 right-4 md:hidden">
        <button onClick={() => setIsToolsPanelOpen(true)}>
          <Menu size={24} />
        </button>
      </div> */}
      {/* Overlay panel for ToolsPanel on small screens */}
      {/* {isToolsPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30">
          <div className="w-full bg-white h-full p-4">
            <button className="mb-4" onClick={() => setIsToolsPanelOpen(false)}>
              <X size={24} />
            </button>
            <ToolsPanel />
          </div>
        </div>
      )} */}
    </div>
  );
}
