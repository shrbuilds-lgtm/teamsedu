
## TEAMS Tuition Center — Website Plan

A 3-page React + Vite + Tailwind site for TEAMS Tuition Center, Tumakuru. Brand: deep blue `#185FA5` and amber `#EF9F27`, clean and professional, mobile-first.

### Tech & backend
- **Lovable Cloud** for Google sign-in + database (timetable storage)
- Single hard-coded admin email — only that email sees Edit controls (you'll provide it during setup)
- All other visitors see a read-only timetable

### Global layout
- Sticky top nav with TEAMS wordmark (deep blue) and amber accent, links: Home · Timetable · Contact
- Mobile hamburger menu
- Footer: address line "Tumakuru, Karnataka", phone +91 93415 51370, quick links

### Page 1 — Home
- **Hero**: bold headline "Master Maths & Science in Tumakuru", subhead about classes 8–10, two CTAs ("View Timetable", "Contact on WhatsApp"), amber accent shapes on a blue gradient
- **Why TEAMS** strip: 3–4 feature cards (Experienced teachers, Concept clarity, Problem-solving shortcuts, Personal attention)
- **Subjects we teach**: chips/cards for Maths, Physics, Chemistry, Biology × Classes 8, 9, 10
- **Google reviews summary block**:
  - Big "4.9 ★" with star row, "81 Google reviews" badge, rating-distribution bar (5★ majority), topic chips (teachers, teaching methods, understand, tuition centre)
  - "View on Google" link
- **Testimonials carousel/grid**: real reviews you provided — Rakesh Shanbhag, Sunitha Srinivas, Lipika Chetan, Shaima Syedi, Jagadeesh Veer, Mamatha KM, Monisha N, Sumanth, etc. (8–10 picked for variety, with name + relative date + stars)
- **CTA banner**: "Join TEAMS — limited seats" → WhatsApp

### Page 2 — Timetable
- **Public view** (everyone):
  - Tabs/selector for **Class 8 · Class 9 · Class 10**
  - Weekly grid: rows = days (Mon–Sat), columns = time slots; cells show **Subject** (Maths / Physics / Chemistry / Biology) + optional teacher/room
  - Color-coded subject pills
  - Mobile: stacks into day-by-day cards
- **Admin mode** (only the hard-coded admin email, after Google login):
  - "Sign in with Google" button in header when logged out
  - Once signed in as admin: inline Edit on each cell (subject dropdown, teacher text), Add/Remove time slot, Save → writes to Cloud database
  - Non-admin signed-in users see read-only with a polite "view only" notice
  - Sign out button
- Live updates so students see changes immediately

### Page 3 — Contact
- Two-column layout (stacks on mobile):
  - **Left**: address, phone (click-to-call), WhatsApp, hours, embedded Google Map of Tumakuru location
  - **Right**: contact form — Name, Class, Parent phone, Message
    - On submit, opens WhatsApp chat to **+91 93415 51370** with the message pre-filled (`https://wa.me/919341551370?text=...`)
    - No data is stored; pure handoff to WhatsApp
- Big "Chat on WhatsApp" floating button on every page

### Setup I'll handle after approval
- Enable Lovable Cloud + Google auth
- Create `timetable` table (class, day, time_slot, subject, teacher) with RLS: public read, admin-email-only write
- Seed a starter timetable for Classes 8/9/10 you can edit live
- Ask you for the **admin Google email** once I begin
