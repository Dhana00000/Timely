"use client";

import { useState } from "react";
import { X, Sparkles, Trash2, Clock, MapPin, Edit3 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import styles from "./EventDetailsModal.module.css";

interface EventDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        id: string;
        title: string;
        start_time: string;
        end_time: string | null;
        location?: string | null;
        color?: string;
        description?: string | null;
        notes?: string | null;
    };
}

export default function EventDetailsModal({ isOpen, onClose, event }: EventDetailsModalProps) {
    const { updateEvent, deleteEvent } = useData();
    const [notes, setNotes] = useState(event.notes || "");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleGenerateNotes = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch("/api/ai/generate-notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: event.title,
                    description: event.description,
                    duration: event.end_time
                        ? (new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000
                        : 60,
                    location: event.location,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setNotes(data.notes);
                await handleSaveNotes(data.notes);
            }
        } catch (error) {
            console.error("Failed to generate notes:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveNotes = async (notesValue: string = notes) => {
        setIsSaving(true);
        try {
            await updateEvent(event.id, { notes: notesValue });
        } catch (error) {
            console.error("Failed to save notes:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this event?")) {
            await deleteEvent(event.id);
            onClose();
        }
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <X size={20} />
                </button>

                <div
                    className={styles.header}
                    style={{ backgroundColor: event.color || "#0071e3" }}
                >
                    <h2>{event.title}</h2>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <div className={styles.info}>
                            <Clock size={18} />
                            <div>
                                <div className={styles.infoLabel}>When</div>
                                <div className={styles.infoValue}>
                                    {formatDate(event.start_time)}
                                </div>
                                <div className={styles.infoValue}>
                                    {formatTime(event.start_time)} - {event.end_time && formatTime(event.end_time)}
                                </div>
                            </div>
                        </div>

                        {event.location && (
                            <div className={styles.info}>
                                <MapPin size={18} />
                                <div>
                                    <div className={styles.infoLabel}>Location</div>
                                    <div className={styles.infoValue}>{event.location}</div>
                                </div>
                            </div>
                        )}

                        {event.description && (
                            <div className={styles.info}>
                                <Edit3 size={18} />
                                <div>
                                    <div className={styles.infoLabel}>Description</div>
                                    <div className={styles.infoValue}>{event.description}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.notesSection}>
                        <div className={styles.notesHeader}>
                            <h3>Smart Notes</h3>
                            <button
                                className={styles.generateBtn}
                                onClick={handleGenerateNotes}
                                disabled={isGenerating}
                            >
                                <Sparkles size={16} />
                                {isGenerating ? "Generating..." : "Generate with Lumi"}
                            </button>
                        </div>

                        <textarea
                            className={styles.notesInput}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            onBlur={() => handleSaveNotes()}
                            placeholder="Add notes about this event... or click 'Generate with Lumi' for AI suggestions"
                            rows={10}
                        />

                        {isSaving && <div className={styles.savingIndicator}>Saving...</div>}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.deleteBtn} onClick={handleDelete}>
                        <Trash2 size={16} />
                        Delete Event
                    </button>
                </div>
            </div>
        </div>
    );
}
