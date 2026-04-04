---
name: "nexus-maps-routes"
description: "Visualizes trip routes and key points on a map. Invoke when rendering polylines, geofences, or generating route visuals."
---

# Nexus Maps & Routes

## Objective
- Render trip polylines on a map.
- Mark key locations: company, client, start/end service.
- Visualize geofence radius and sampled points.

## Technology
- Leaflet or MapLibre (no paid vendors required).
- Graceful fallback: show points list when map is not available.

## Inputs
- TripSegments/TripPoints from GPS Trip Logger.
- Company/client coordinates and geofence settings.

## Outputs
- Map component with polyline and markers.
- Optional export: static capture of the map area for reports (best-effort).

## Tips
- Use clustering or thinning for dense points.
- Color segments (outbound vs return) for clarity.
