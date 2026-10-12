import { LayoutDashboard, CalendarDays, Users, Car, Droplets, UserCog } from 'lucide-react';

export const navLinks = [
  { to: '/', label: 'Pregled', icon: LayoutDashboard, end: true },
  { to: '/appointments', label: 'Termini', icon: CalendarDays },
  { to: '/clients', label: 'Klijenti', icon: Users },
  { to: '/vehicles', label: 'Vozila', icon: Car },
  { to: '/services', label: 'Usluge', icon: Droplets },
  { to: '/workers', label: 'Radnici', icon: UserCog },
];
