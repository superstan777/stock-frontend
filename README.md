# STOCK Dashboard

A ticketing system with a CMDB (Configuration Management Database) for managing **users**, **devices**, and their **relations**.  

## Features

- Manage **devices** and **users**  
- Assign and end **device-user relations**  
- Track **tickets**  
- **Login** with validation and notifications  

## Tech Stack

- **Frontend:** React, Next.js, TypeScript  
- **State & Data:** Tanstack Query, Zod, react-hook-form  
- **UI:** ShadCN, Tailwind CSS, lucide-react  
- **Notifications:** Sonner  
- **Backend:** Supabase  



## Testing
- Jest + React Testing Library
- Only custom components are tested; UI library components assumed working
- API calls are mocked

Notes
	•	React Query handles data fetching and cache invalidation for real-time updates.
	•	Forms are validated with Zod.
	•	UI is built with ShadCN components and Tailwind CSS.
