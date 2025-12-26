"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import styles from "./EventModal.module.css";

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event?: {
        id: string;
        title: string;
        start_time: string;
        end_time: string;
        location?: string;
        color?: string;
        description?: string;
    };
    initialDate?: string;
}

export default function EventModal({ isOpen, onClose, event, initialDate }: EventModalProps) {
    const { createEvent, updateEvent } = useData();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        start_time: "",
        end_time: "",
        location: "",
        color: "#0071e3",
        description: "",
    });

    useEffect(() => {
        if (event) {
            // Edit mode
            setFormData({
                title: event.title,
                start_time: event.start_time,
                end_time: event.end_time,
                location: event.location || "",
                color: event.color || "#0071e3",
                description: event.description || "",
            });
        } else if (initialDate) {
            // New event with initial date
            const defaultStart = `${initialDate}T09:00`;
            const defaultEnd = `${initialDate}T10:00`;
            setFormData(prev => ({
                ...prev,
                start_time: defaultStart,
                end_time: defaultEnd,
            }));
        }
    }, [event, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('🟢 Form submitted with data:', formData);
        setError("");
        setLoading(true);

        try {
            // Validation
            console.log('🟢 Validating form data...');
            if (!formData.title.trim()) {
                console.error('❌ Validation failed: Title is empty');
                throw new Error("Title is required");
            }
            if (!formData.start_time || !formData.end_time) {
                console.error('❌ Validation failed: Times missing');
                throw new Error("Start and end times are required");
            }
            if (new Date(formData.start_time) >= new Date(formData.end_time)) {
                console.error('❌ Validation failed: Invalid time range');
                throw new Error("End time must be after start time");
            }

            console.log('✅ Validation passed');

            if (event) {
                // Update existing event
                console.log('🟢 Updating event:', event.id);
                await updateEvent(event.id, formData);
                console.log('✅ Event updated successfully');
            } else {
                // Create new event
                console.log('🟢 Creating new event...');
                const result = await createEvent(formData);
                console.log('✅ Event creation result:', result);
            }

            console.log('🟢 Closing modal...');
            onClose();
            // Reset form
            setFormData({
                title: "",
                start_time: "",
                end_time: "",
                location: "",
                color: "#0071e3",
                description: "",
            });
        } catch (err: any) {
            console.error('❌ Error in handleSubmit:', err);
            setError(err.message || "Failed to save event");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{event ? "Edit Event" : "New Event"}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                            placeholder="e.g., Team Meeting"
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label>Start Time *</label>
                            <input
                                type="datetime-local"
                                value={formData.start_time}
                                onChange={(e) => handleChange("start_time", e.target.value)}
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>End Time *</label>
                            <input
                                type="datetime-local"
                                value={formData.end_time}
                                onChange={(e) => handleChange("end_time", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            placeholder="e.g., Conference Room A"
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Color</label>
                        <div className={styles.colorPicker}>
                            {["#0071e3", "#ff453a", "#30d158", "#ff9f0a", "#bf5af2", "#5ac8fa"].map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`${styles.colorBtn} ${formData.color === color ? styles.selected : ""}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleChange("color", color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                            placeholder="Add notes, agenda, or details..."
                            rows={3}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "Saving..." : event ? "Update Event" : "Create Event"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
