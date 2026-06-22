export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'GUEST' | 'ADMIN';
}

export interface Room {
  id: string;
  name: string;
  type: 'STANDARD' | 'DELUXE' | 'SUITE' | 'PENTHOUSE';
  description: string;
  price: number;
  capacity: number;
  size: number;
  bedType: string;
  amenities: string[];
  images: string[];
  featured: boolean;
  available: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialReq?: string;
  room: Room;
  createdAt: string;
}
