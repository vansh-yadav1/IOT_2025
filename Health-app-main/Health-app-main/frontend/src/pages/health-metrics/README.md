# Health Metrics Module

This module provides functionality for patients to track various health metrics including:

- Heart Rate
- Blood Pressure
- Oxygen Level
- Body Temperature

## Components

- **HealthDashboard**: Main dashboard displaying all metrics in a summary view
- **MetricDetail**: Detailed view for a specific metric with history and charts
- **MetricEntry**: Form for adding or editing metric readings
- **MetricsSidebar**: Navigation sidebar for health metrics pages

## Features

- View health metrics in a dashboard layout
- See detailed history for each metric
- Record new readings with date, time, and notes
- Visualize trends with interactive charts
- Filter readings by date ranges
- Export and share health data

## Usage

The module is accessible to users with the PATIENT role through the `/health-metrics` routes:

- `/health-metrics` - Main dashboard
- `/health-metrics/:metricId` - Detailed view for a specific metric
- `/health-metrics/:metricId/add` - Add a new reading
- `/health-metrics/:metricId/edit/:readingId` - Edit an existing reading

## Dependencies

- Material-UI for UI components
- Chart.js for visualizations
- date-fns for date manipulation
- React Router for navigation

## Styling

Styles are defined in `HealthMetrics.css` and include:

- Dashboard layout
- Metric cards with hover effects
- Color-coded icons for different metrics
- Responsive adjustments for mobile devices 