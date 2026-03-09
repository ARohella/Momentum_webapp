'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useCalendarStore } from '@/stores/calendarStore';
import { EventModal } from '@/components/EventModal';
import { CalendarEvent, CATEGORY_COLORS } from '@/lib/types';
import { Plus } from 'lucide-react';
import { RRule } from 'rrule';
import { differenceInMinutes, addMinutes } from 'date-fns';
import type { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import type { EventResizeDoneArg } from '@fullcalendar/interaction';

function expandRecurringEvents(events: CalendarEvent[]) {
  const expanded: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
    backgroundColor: string;
    borderColor: string;
    allDay?: boolean;
    extendedProps: { description?: string; category: string; recurrence?: string; sourceId: string };
  }> = [];

  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  for (const event of events) {
    if (!event.recurrence) {
      expanded.push({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.color,
        borderColor: 'transparent',
        allDay: event.allDay,
        extendedProps: {
          description: event.description,
          category: event.category,
          recurrence: event.recurrence,
          sourceId: event.id,
        },
      });
      continue;
    }

    try {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const durationMin = differenceInMinutes(eventEnd, eventStart);

      const rule = RRule.fromString(
        `DTSTART:${eventStart.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nRRULE:${event.recurrence}`
      );

      const occurrences = rule.between(rangeStart, rangeEnd, true);

      for (let i = 0; i < occurrences.length; i++) {
        const occStart = occurrences[i];
        const occEnd = addMinutes(occStart, durationMin);
        expanded.push({
          id: `${event.id}__${i}`,
          title: event.title,
          start: occStart.toISOString(),
          end: occEnd.toISOString(),
          backgroundColor: event.color,
          borderColor: 'transparent',
          allDay: event.allDay,
          extendedProps: {
            description: event.description,
            category: event.category,
            recurrence: event.recurrence,
            sourceId: event.id,
          },
        });
      }
    } catch {
      // If rrule parsing fails, show the original event
      expanded.push({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: event.color,
        borderColor: 'transparent',
        allDay: event.allDay,
        extendedProps: {
          description: event.description,
          category: event.category,
          recurrence: event.recurrence,
          sourceId: event.id,
        },
      });
    }
  }

  return expanded;
}

export default function CalendarPage() {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const calendarRef = useRef<FullCalendar>(null);

  const fcEvents = useMemo(() => expandRecurringEvents(events), [events]);

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setEditingEvent(undefined);
    setSelectedRange({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const sourceId = clickInfo.event.extendedProps?.sourceId || clickInfo.event.id;
    const event = events.find((e) => e.id === sourceId);
    if (event) {
      setEditingEvent(event);
      setSelectedRange(null);
      setModalOpen(true);
    }
  }, [events]);

  const handleEventDrop = useCallback((dropInfo: EventDropArg) => {
    const sourceId = dropInfo.event.extendedProps?.sourceId || dropInfo.event.id;
    updateEvent(sourceId, {
      start: dropInfo.event.startStr,
      end: dropInfo.event.endStr,
    });
  }, [updateEvent]);

  const handleEventResize = useCallback((resizeInfo: EventResizeDoneArg) => {
    const sourceId = resizeInfo.event.extendedProps?.sourceId || resizeInfo.event.id;
    updateEvent(sourceId, {
      start: resizeInfo.event.startStr,
      end: resizeInfo.event.endStr,
    });
  }, [updateEvent]);

  const handleSave = (eventData: Omit<CalendarEvent, 'id' | 'color'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, {
        ...eventData,
        color: CATEGORY_COLORS[eventData.category] || CATEGORY_COLORS.custom,
      });
    } else {
      addEvent(eventData);
    }
    setModalOpen(false);
    setEditingEvent(undefined);
    setSelectedRange(null);
  };

  const handleDelete = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
    }
    setModalOpen(false);
    setEditingEvent(undefined);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <button
          onClick={() => {
            setEditingEvent(undefined);
            setSelectedRange(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
        >
          <Plus size={16} />
          New Event
        </button>
      </div>

      <div className="glass rounded-2xl p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={fcEvents}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          nowIndicator={true}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="01:00:00"
          snapDuration="00:15:00"
          allDaySlot={true}
          height="calc(100vh - 160px)"
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
        />
      </div>

      {modalOpen && (
        <EventModal
          event={
            editingEvent ||
            (selectedRange
              ? { start: selectedRange.start, end: selectedRange.end }
              : undefined)
          }
          onSave={handleSave}
          onDelete={editingEvent ? handleDelete : undefined}
          onClose={() => {
            setModalOpen(false);
            setEditingEvent(undefined);
            setSelectedRange(null);
          }}
        />
      )}
    </div>
  );
}
