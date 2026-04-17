'use client';

import { useState, useRef, useEffect } from 'react';
import { useCalendarStore } from '@/stores/calendarStore';
import { useTaskStore } from '@/stores/taskStore';
import { useHabitStore } from '@/stores/habitStore';
import { useGoalStore } from '@/stores/goalStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import { useCoachStore } from '@/stores/coachStore';
import { CATEGORY_COLORS } from '@/lib/types';
import { Send, Loader2, CalendarPlus, Check, Sparkles, Mic, MicOff, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// Web Speech API types
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEvent extends Event {
  results: { [index: number]: SpeechRecognitionResult; length: number };
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
}

interface ScheduleBlock {
  title: string;
  start: string;
  end: string;
  category: string;
}

export default function CoachPage() {
  const events = useCalendarStore((s) => s.events);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useHabitStore((s) => s.habits);
  const goals = useGoalStore((s) => s.goals);
  const profile = usePreferencesStore((s) => s.profile);
  const categories = usePreferencesStore((s) => s.categories);
  const incrementAI = useRewardsStore((s) => s.incrementAI);
  const messages = useCoachStore((s) => s.messages);
  const addMessage = useCoachStore((s) => s.addMessage);
  const markBlockAccepted = useCoachStore((s) => s.markBlockAccepted);
  const clearMessages = useCoachStore((s) => s.clearMessages);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
    if (SR) setVoiceSupported(true);
  }, []);

  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      incrementAI('voiceInputsUsed');
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayEvents = events
      .filter((e) => e.start.startsWith(today))
      .map((e) => `${e.title} (${format(new Date(e.start), 'h:mm a')} - ${format(new Date(e.end), 'h:mm a')}, ${e.category})`);

    const upcomingEvents = events
      .filter((e) => e.start > new Date().toISOString())
      .slice(0, 10)
      .map((e) => `${e.title} on ${format(new Date(e.start), 'EEE MMM d, h:mm a')} - ${format(new Date(e.end), 'h:mm a')} (${e.category})`);

    const activeTasks = tasks
      .filter((t) => !t.completed)
      .map((t) => `${t.title} (${t.category}, est. ${t.estimatedDuration}min${t.deadline ? `, due ${t.deadline}` : ''}${t.isTopThree ? ', TOP 3' : ''})`);

    const activeHabits = habits
      .filter((h) => h.isActive)
      .map((h) => h.name);

    const activeGoals = goals.map(
      (g) => `${g.title}: ${g.progress}/${g.target} ${g.unit} (${Math.round((g.progress / g.target) * 100)}%)`
    );

    return `Today: ${today} (${format(new Date(), 'EEEE')})
Current time: ${format(new Date(), 'h:mm a')}

User Profile:
- Name: ${profile.name || 'User'}
- Wake: ${profile.wakeTime}, Sleep: ${profile.sleepTime}
- Work: ${profile.workStartTime}-${profile.workEndTime} on ${profile.workDays.map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
- Preferred workout: ${profile.preferredWorkoutTime}
- Best focus time: ${profile.focusHours}
${profile.bio ? `- Notes: ${profile.bio}` : ''}

Today's Events:
${todayEvents.length ? todayEvents.join('\n') : 'No events today'}

Upcoming Events (next 10):
${upcomingEvents.length ? upcomingEvents.join('\n') : 'No upcoming events'}

Active Tasks (${activeTasks.length}):
${activeTasks.length ? activeTasks.join('\n') : 'No tasks'}

Active Habits: ${activeHabits.join(', ') || 'None'}

Goals:
${activeGoals.length ? activeGoals.join('\n') : 'No goals set'}

Categories: ${categories.join(', ')}`;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text,
    };

    addMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      incrementAI('coachMessages');
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            text: m.text,
          })),
          context: buildContext(),
        }),
      });

      const data = await res.json();

      if (data.error) {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: `Sorry, I encountered an error: ${data.error}`,
        });
      } else {
        addMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.text,
          scheduleBlocks: data.scheduleBlocks?.length ? data.scheduleBlocks : undefined,
          acceptedBlocks: [],
        });
      }
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "Sorry, I couldn't connect to the AI service. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSchedule = (messageId: string, blockIndex: number, block: ScheduleBlock) => {
    addEvent({
      title: block.title,
      start: block.start,
      end: block.end,
      category: block.category || 'personal',
    });

    markBlockAccepted(messageId, blockIndex);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
          <Sparkles size={18} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold tracking-tight">AI Coach</h1>
          <p className="text-xs text-muted">Your personal productivity assistant</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear chat history? This cannot be undone.')) clearMessages();
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
            title="Clear chat history"
          >
            <Trash2 size={14} />
            Clear chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-2xl glass p-4 mb-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles size={40} className="text-accent/30 mb-4" />
            <h2 className="font-semibold text-lg mb-2">How can I help you today?</h2>
            <p className="text-sm text-muted max-w-md mb-6">
              I can help you plan your day, schedule events, track goals, and stay productive.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {[
                'Plan my day for me',
                'Schedule gym 3 times this week',
                'What should I focus on today?',
                'Help me find time to study',
                'Review my goals progress',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-md'
                  : 'bg-surface rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

              {/* Schedule blocks */}
              {msg.scheduleBlocks && msg.scheduleBlocks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.scheduleBlocks.map((block, i) => {
                    const accepted = msg.acceptedBlocks?.includes(i);
                    return (
                      <div
                        key={i}
                        className={`rounded-xl border p-3 ${
                          accepted
                            ? 'border-emerald-500/30 bg-emerald-500/10'
                            : 'border-border bg-background/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    CATEGORY_COLORS[block.category] || CATEGORY_COLORS.custom,
                                }}
                              />
                              <span className="text-xs font-semibold">{block.title}</span>
                            </div>
                            <p className="text-[10px] text-muted mt-1">
                              {(() => {
                                try {
                                  return `${format(new Date(block.start), 'EEE MMM d, h:mm a')} - ${format(new Date(block.end), 'h:mm a')}`;
                                } catch {
                                  return `${block.start} - ${block.end}`;
                                }
                              })()}
                            </p>
                          </div>
                          {accepted ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                              <Check size={12} /> Added
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcceptSchedule(msg.id, i, block)}
                              className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-[10px] font-medium text-white hover:bg-accent-hover transition-colors"
                            >
                              <CalendarPlus size={12} />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 size={16} className="animate-spin text-muted" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="glass rounded-2xl p-3 flex items-end gap-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask your AI coach..."
          className="flex-1 resize-none bg-transparent text-sm focus:outline-none max-h-32"
          rows={1}
          style={{ minHeight: '24px' }}
        />
        {voiceSupported && (
          <button
            onClick={toggleVoice}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
              listening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-surface hover:bg-surface-hover text-muted'
            }`}
            title={listening ? 'Stop recording' : 'Start voice input'}
          >
            {listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-30"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
