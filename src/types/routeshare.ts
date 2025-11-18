export type UserType = "rider" | "driver";

export type VerificationLevel = "basic" | "standard" | "community" | "premium";

export type TripStatus =
  | "requesting"
  | "pending"
  | "matched"
  | "accepted"
  | "driver_arriving"
  | "in_progress"
  | "completed"
  | "cancelled";

export type RouteStatus = "active" | "in_progress" | "completed" | "cancelled";

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  profilePhoto?: string;
  userType: UserType;
  verificationLevel: VerificationLevel;
  rating: number;
  totalTrips: number;
  createdAt: string;
}

export interface DriverProfile {
  userId: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleColor: string;
  licensePlate: string;
  seats: number;
  licenseVerified: boolean;
  insuranceVerified: boolean;
  backgroundCheckStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  totalEarnings: number;
}

export interface Route {
  id: string;
  driverId: string;
  driver?: User;
  driverProfile?: DriverProfile;
  origin: Location;
  destination: Location;
  departureTime: string;
  availableSeats: number;
  isRecurring: boolean;
  recurrencePattern?: string;
  status: RouteStatus;
  estimatedDuration: number; // minutes
  distance: number; // miles
  createdAt: string;
}

export interface TripRequest {
  id: string;
  riderId: string;
  rider?: User;
  pickup: Location;
  dropoff: Location;
  requestedTime: string;
  passengers: number;
  status: TripStatus;
  createdAt: string;
}

export interface Trip {
  id: string;
  routeId: string;
  requestId: string;
  driverId: string;
  riderId: string;
  driver?: User;
  rider?: User;
  driverProfile?: DriverProfile;
  pickup: Location;
  dropoff: Location;
  fare: number;
  driverEarnings: number;
  platformFee: number;
  status: TripStatus;
  startedAt?: string;
  completedAt?: string;
  estimatedPickupTime?: string;
  estimatedArrival?: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export interface RouteMatch {
  route: Route;
  detourDistance: number; // extra miles
  detourTime: number; // extra minutes
  matchScore: number; // 0-100
  estimatedPickup: string;
  fare: number;
}

export interface SavedLocation {
  id: string;
  name: string;
  location: Location;
  icon?: string;
}

export interface Rating {
  id: string;
  tripId: string;
  raterId: string;
  ratedId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}
