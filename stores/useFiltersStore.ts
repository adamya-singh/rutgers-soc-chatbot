import { create } from "zustand";

interface FiltersState {
  selectedDescription: string;
  selectedMeetingDay: string;
  selectedStartTime: string;
  selectedEndTime: string;
  setSelectedDescription: (description: string) => void;
  setSelectedMeetingDay: (meetingDay: string) => void;
  setSelectedStartTime: (startTime: string) => void;
  setSelectedEndTime: (endTime: string) => void;
}

const useFiltersStore = create<FiltersState>((set) => ({
  selectedDescription: "", // Empty string means "Any Campus"
  selectedMeetingDay: "", // Empty string means "Any Day"
  selectedStartTime: "", // Empty string means "Any Time"
  selectedEndTime: "", // Empty string means "Any Time"
  setSelectedDescription: (description) => set({ selectedDescription: description }),
  setSelectedMeetingDay: (meetingDay) => set({ selectedMeetingDay: meetingDay }),
  setSelectedStartTime: (startTime) => set({ selectedStartTime: startTime }),
  setSelectedEndTime: (endTime) => set({ selectedEndTime: endTime }),
}));

export default useFiltersStore; 