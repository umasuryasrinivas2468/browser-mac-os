
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock } from 'lucide-react';

type EventCategory = 'work' | 'personal' | 'meeting' | 'other';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  category: EventCategory;
  description?: string;
}

const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    category: 'personal',
    description: ''
  });

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('calendar-updated'));
  }, [events]);

  const categoryColors = {
    work: 'bg-blue-500',
    personal: 'bg-green-500',
    meeting: 'bg-purple-500',
    other: 'bg-gray-500'
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      // Check if the selected date is in the past
      const selectedDate = new Date(newEvent.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        alert('Cannot schedule events in the past. Please select a future date.');
        return;
      }

      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        category: newEvent.category as EventCategory,
        description: newEvent.description
      };
      setEvents(prev => [...prev, event]);
      setNewEvent({
        title: '',
        date: '',
        time: '',
        category: 'personal',
        description: ''
      });
      setShowAddEvent(false);
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      const isToday = dateStr === formatDateForInput(new Date());

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 ${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded text-white ${categoryColors[event.category]} truncate`}
                title={`${event.time} - ${event.title}`}
              >
                {event.time} {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  // Get minimum date (today) for date input
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Calendar
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold min-w-[200px] text-center">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600 border border-gray-200 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200">
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 pointer-events-auto">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Add New Event
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEvent.date || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    min={getMinDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newEvent.category || 'personal'}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, category: e.target.value as EventCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="Enter event description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddEvent(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;
