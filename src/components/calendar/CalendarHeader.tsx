"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Plus } from "lucide-react";
import { format } from "date-fns";
import { ViewMode } from "./CalendarView";
import styles from "./CalendarHeader.module.css";

interface CalendarHeaderProps {
    currentDate: Date;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    onAddEvent: () => void;
}

export default function CalendarHeader({
    currentDate,
    viewMode,
    onViewModeChange,
    onPrev,
    onNext,
    onToday,
    onAddEvent,
}: CalendarHeaderProps) {
    return (
        <div className={styles.header}>
            <div className={styles.left}>
                <div className={styles.navigation}>
                    <button className={styles.navBtn} onClick={onPrev}>
                        <ChevronLeft size={20} />
                    </button>
                    <button className={styles.todayBtn} onClick={onToday}>
                        Today
                    </button>
                    <button className={styles.navBtn} onClick={onNext}>
                        <ChevronRight size={20} />
                    </button>
                </div>
                <h2 className={styles.title}>
                    {format(currentDate, "MMMM yyyy")}
                </h2>
            </div>

            <div className={styles.right}>
                <div className={styles.viewSelector}>
                    {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            className={`${styles.viewBtn} ${viewMode === mode ? styles.active : ""}`}
                            onClick={() => onViewModeChange(mode)}
                        >
                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                    ))}
                </div>

                <button className={styles.iconBtn} aria-label="Filter events">
                    <Filter size={18} />
                </button>

                <button className={styles.addBtn} onClick={onAddEvent}>
                    <Plus size={18} />
                    <span>Add Event</span>
                </button>
            </div>
        </div>
    );
}
