/**
 * Email service using EmailJS for client-side email sending
 *
 * Setup required:
 * 1. Create account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template with variables: {{to_email}}, {{event_title}}, {{event_date}}, {{event_location}}, {{event_description}}, {{calendar_link}}, {{action_text}}
 * 4. Add your Service ID, Template ID, and Public Key to .env
 */

import emailjs from '@emailjs/browser';

// EmailJS configuration - set these in your .env file
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'demo_service';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'demo_template';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'demo_key';

export interface EventEmailData {
  toEmail: string;
  eventTitle: string;
  eventDate?: string;
  eventLocation?: string;
  eventDescription: string;
  calendarLink?: string;
  actionText: string;
}

/**
 * Send an email notification when user adds event to their to-do list
 */
export async function sendEventEmail(data: EventEmailData): Promise<{ success: boolean; message: string }> {
  // Check if EmailJS is configured
  if (EMAILJS_SERVICE_ID === 'demo_service') {
    console.log('📧 Demo mode: Email would be sent to', data.toEmail);
    console.log('Event:', data.eventTitle);
    console.log('Calendar link:', data.calendarLink);

    // In demo mode, just log and return success
    return {
      success: true,
      message: 'Email logged (demo mode - configure EmailJS for real emails)',
    };
  }

  try {
    const templateParams = {
      to_email: data.toEmail,
      event_title: data.eventTitle,
      event_date: data.eventDate || 'Date TBD',
      event_location: data.eventLocation || 'Location TBD',
      event_description: data.eventDescription,
      calendar_link: data.calendarLink || '',
      action_text: data.actionText,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    return {
      success: true,
      message: 'Email sent successfully!',
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      message: 'Failed to send email. Please try again.',
    };
  }
}

/**
 * Generate Google Calendar URL for an event
 */
export function generateGoogleCalendarUrl(event: {
  title: string;
  description: string;
  location?: string;
  date?: string;
}): string {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.location || 'San Francisco, CA');

  // Default to tomorrow at 10 AM if no specific time
  const now = new Date();
  const eventDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  eventDate.setHours(10, 0, 0, 0);

  const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const startDate = formatDate(eventDate);
  const endDate = formatDate(new Date(eventDate.getTime() + 60 * 60 * 1000));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${startDate}/${endDate}`;
}
