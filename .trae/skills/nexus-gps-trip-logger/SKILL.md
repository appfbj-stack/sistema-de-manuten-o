---
name: "nexus-gps-trip-logger"
description: "Logs technician trips with GPS, time and km per Work Order. Invoke when enabling check-out/check-in, geofence, and offline trip logs."
---

# Nexus GPS Trip Logger

## Objective
- Track field trips linked to a Work Order (OS): departure, arrival, service, return.
- Collect GPS samples, compute distance (Haversine) and elapsed time.
- Geofence for company and client locations.
- Offline-first storage using IndexedDB and later sync.

## Flow
- Check-out from company: start session + `watchPosition` (15–30s interval).
- Arrival at client: geofence detection (e.g. 100 m radius).
- Service window: mark start/end.
- Check-in at company: geofence detection; close session.

## Data Model
- `TripSession { id, osId, technician, startedAt, endedAt, status }`
- `TripSegment { sessionId, type: "outbound" | "return", startAt, endAt, distanceKm, points[] }`
- `TripPoint { lat, lon, timestamp, accuracy }`
- `Geofence { type: "company" | "client", lat, lon, radiusM }`

## Rules
- Ignore points with poor accuracy (e.g. > 50–80 m).
- Filter implausible jumps (e.g. speed > 300 km/h).
- Geofence requires at least 2 consecutive samples inside the radius.

## Offline
- Save all trip data in IndexedDB.
- Sync to backend when online is available.

## Limitations
- PWA background tracking is limited on iOS/Android; prefer active screen during trip.
- For robust background, consider native wrapper (Capacitor/React Native).
