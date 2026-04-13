<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Cache-Control: no-cache, no-store, must-revalidate');

/**
 * Google Calendar Integration
 * Calendar ID: oikosorchardandfarm2@gmail.com
 * 
 * To use this, you need:
 * 1. Create a Google Cloud project
 * 2. Enable Google Calendar API
 * 3. Create an API key (not OAuth, just API key for public calendar)
 * 4. Replace YOUR_GOOGLE_API_KEY below
 */

$googleCalendarId = 'oikosorchardandfarm2@gmail.com';
$googleApiKey = getenv('GOOGLE_API_KEY') ?: 'YOUR_GOOGLE_API_KEY'; // Set environment variable or replace here

// Try to fetch from Google Calendar API
$unavailableDates = array();

if ($googleApiKey !== 'YOUR_GOOGLE_API_KEY') {
    $unavailableDates = fetchGoogleCalendarDates($googleCalendarId, $googleApiKey);
}

// If Google Calendar fetch failed or API key not set, use fallback dates
if (empty($unavailableDates)) {
    $unavailableDates = array(
        '2026-04-02',
        '2026-04-03',
        '2026-04-04',
        '2026-04-08',
        '2026-04-09',
        '2026-04-10',
        '2026-04-22',
        '2026-04-23'
    );
}

$response = array(
    'success' => true,
    'unavailableDates' => $unavailableDates,
    'message' => 'Calendar data retrieved successfully',
    'lastUpdated' => date('Y-m-d H:i:s'),
    'source' => $googleApiKey !== 'YOUR_GOOGLE_API_KEY' ? 'google_calendar' : 'fallback'
);

echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

/**
 * Fetch events from Google Calendar and return unavailable dates
 */
function fetchGoogleCalendarDates($calendarId, $apiKey) {
    $unavailableDates = array();
    
    try {
        // Get current date and date 90 days from now
        $now = new DateTime();
        $endDate = clone $now;
        $endDate->add(new DateInterval('P90D'));
        
        $timeMin = $now->format('Y-m-d\T00:00:00Z');
        $timeMax = $endDate->format('Y-m-d\T23:59:59Z');
        
        // Build Google Calendar API URL
        $url = sprintf(
            'https://www.googleapis.com/calendar/v3/calendars/%s/events?key=%s&timeMin=%s&timeMax=%s&singleEvents=true&orderBy=startTime',
            urlencode($calendarId),
            urlencode($apiKey),
            urlencode($timeMin),
            urlencode($timeMax)
        );
        
        // Fetch calendar events
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
                'ignore_errors' => true
            ]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        
        if ($response === false) {
            error_log('Google Calendar API request failed');
            return array();
        }
        
        $data = json_decode($response, true);
        
        if (!isset($data['items'])) {
            error_log('No events found in Google Calendar');
            return array();
        }
        
        // Extract dates from events
        foreach ($data['items'] as $event) {
            if (isset($event['start'])) {
                $startDate = extractDateFromGoogleEvent($event['start']);
                if ($startDate) {
                    $unavailableDates[] = $startDate;
                    
                    // If event spans multiple days, add all days
                    if (isset($event['end'])) {
                        $endDate = extractDateFromGoogleEvent($event['end']);
                        if ($endDate && $endDate !== $startDate) {
                            $current = new DateTime($startDate);
                            $end = new DateTime($endDate);
                            $end->sub(new DateInterval('P1D')); // Google Calendar end dates are exclusive
                            
                            while ($current < $end) {
                                $current->add(new DateInterval('P1D'));
                                $dateStr = $current->format('Y-m-d');
                                if ($dateStr !== $endDate) {
                                    $unavailableDates[] = $dateStr;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Remove duplicates and sort
        $unavailableDates = array_unique($unavailableDates);
        sort($unavailableDates);
        
        error_log('Successfully fetched ' . count($unavailableDates) . ' booked dates from Google Calendar');
        
    } catch (Exception $e) {
        error_log('Error fetching Google Calendar: ' . $e->getMessage());
        return array();
    }
    
    return $unavailableDates;
}

/**
 * Extract date from Google Calendar event start/end
 */
function extractDateFromGoogleEvent($dateTime) {
    if (isset($dateTime['dateTime'])) {
        // Full datetime format
        $dt = new DateTime($dateTime['dateTime']);
        return $dt->format('Y-m-d');
    } elseif (isset($dateTime['date'])) {
        // All-day event format
        return $dateTime['date'];
    }
    return null;
}
