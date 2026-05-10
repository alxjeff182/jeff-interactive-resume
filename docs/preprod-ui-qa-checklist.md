# Pre-Production UI/UX QA Checklist

Use this checklist before promoting Vercel preview to production.

## Readability and Overlay
- [ ] Header title/instructions are readable against bright and dark scene backgrounds.
- [ ] Header does not overlap with browser safe area on iOS devices.
- [ ] Bottom hint remains readable and does not overlap touch controls.

## Interaction Affordance
- [ ] Hovering an interactive building shows visible highlight.
- [ ] Interaction badge appears with the target building label.
- [ ] Pointer/touch can still open CV panel reliably.

## Loading and Error Flow
- [ ] Initial loading screen shows stage text updates.
- [ ] Loader hides once critical scene is ready.
- [ ] Error state is readable and retry button is visible on mobile.

## Mobile Controls
- [ ] Joystick and action controls fit within safe area (portrait + landscape).
- [ ] Controls do not overlap CV panel while panel is open.
- [ ] Touch zoom and movement remain responsive without accidental overlap.

## Release Gate
- [ ] `npm run lint`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run perf:budget`
- [ ] `npm run release:check`
