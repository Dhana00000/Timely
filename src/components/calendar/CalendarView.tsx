"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { Plus } from "lucide-react";
import CalendarHeader from "./CalendarHeader";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import EventModal from "../modals/EventModal";
import styles from "./CalendarView.module.css";

export type ViewMode = "month" | "week" | "day";

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState<Date | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>("month");
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | undefined>();

    useEffect(() => {
        setCurrentDate(new Date());
    }, []);

    const handlePrev = () => {
        if (!currentDate) return;
        if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const handleNext = () => {
        if (!currentDate) return;
        if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const handleNewEvent = () => {
        setSelectedDate(currentDate?.toISOString().split('T')[0]);
        setIsEventModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEventModalOpen(false);
        setSelectedDate(undefined);
    };

    const handleDateClick = (date: Date) => {
        setCurrentDate(date);
        setViewMode("day");
    };

    if (!currentDate) {
        return null; // Or a loading skeleton
    }

    return (
        <div className={styles.container}>
            <CalendarHeader
                currentDate={currentDate}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onPrev={handlePrev}
                onNext={handleNext}
                onToday={handleToday}
                onAddEvent={handleNewEvent}
            />

            <div className={styles.content}>
                {viewMode === "month" && <MonthView currentDate={currentDate} onDateClick={handleDateClick} />}
                {viewMode === "week" && <WeekView currentDate={currentDate} />}
                {viewMode === "day" && <DayView currentDate={currentDate} />}
            </div>

            <button className={styles.fab} onClick={handleNewEvent} title="New Event">
                <Plus size={24} />
            </button>

            <EventModal
                isOpen={isEventModalOpen}
                onClose={handleCloseModal}
                initialDate={selectedDate}
            />
        </div>
    );
}
