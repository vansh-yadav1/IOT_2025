# Aceternity UI Integration Guide

This guide outlines how Aceternity UI components have been integrated into our Hospital Management System.

## Installation

The following packages have been added to support Aceternity UI:

```bash
# Core dependencies
npm install aceternity clsx framer-motion tailwindcss tailwindcss-animate tailwind-merge
```

## Configuration

### Tailwind CSS Configuration

Tailwind CSS has been configured in `tailwind.config.js` with custom settings for:
- Colors
- Animations
- Keyframes
- Border radius

### CSS Setup

The base CSS file (`src/index.css`) has been updated with Tailwind directives and CSS variables for theming.

## Components

Aceternity UI components are available in `src/components/ui/aceternity/index.tsx`:

1. **Card3D** - Interactive 3D card effect with mouse movement
2. **MeteorEffect** - Animated meteor background effect
3. **ShimmerButton** - Button with animated shimmer effect
4. **SpotlightEffect** - Spotlight hover effect for containers
5. **FloatingAnimation** - Gentle floating animation for elements
6. **GlowingBorder** - Border with glow effect
7. **NavbarPill** - Navigation pill with highlight

## Utils

The `cn` utility for merging Tailwind CSS classes is available at `src/utils/cn.ts`.

## Usage Example

Here's an example of using Aceternity UI components from `src/pages/dashboard/WelcomeCard.tsx`:

```tsx
import { Card3D, MeteorEffect, SpotlightEffect, ShimmerButton } from '../../components/ui/aceternity';

const WelcomeCard = ({ userName, upcomingAppointments, pendingResults }) => {
  return (
    <Card3D className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <MeteorEffect number={10} />
      <SpotlightEffect className="h-full">
        {/* Content */}
        <ShimmerButton onClick={() => navigate('/appointments')}>
          View Appointments
        </ShimmerButton>
      </SpotlightEffect>
    </Card3D>
  );
};
```

## Customization

You can customize the components by:
1. Modifying the Tailwind theme in `tailwind.config.js`
2. Updating CSS variables in `src/index.css`
3. Extending or modifying components in `src/components/ui/aceternity/index.tsx`

## Working with Material UI

Since our project uses Material UI, you can combine Aceternity UI with Material UI components:

```tsx
import { Typography, Box } from '@mui/material';
import { Card3D } from '../../components/ui/aceternity';

<Card3D>
  <Box sx={{ p: 2 }}>
    <Typography variant="h5">Material UI inside Aceternity UI</Typography>
  </Box>
</Card3D>
``` 