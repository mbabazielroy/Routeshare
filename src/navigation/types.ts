export type RootStackParamList = {
  Welcome: undefined;
  PhoneAuth: undefined;
  OTPVerification: { phone: string };
  UserTypeSelection: { phone?: string; isNewUser?: boolean } | undefined;
  RiderTabs: undefined;
  DriverTabs: undefined;
  TripRequest: undefined;
  DriverSelection: undefined;
  LiveTrip: { tripId: string };
  PublishRoute: undefined;
  RiderRequest: { requestId: string };
  TripRating: { tripId: string; otherUserId: string };
  EditProfile: undefined;
  PaymentMethods: undefined;
  SavedPlaces: undefined;
  InAppMessaging: { conversationId: string };
  VehicleInformation: undefined;
  Documents: undefined;
  BankAccount: undefined;
  TaxInformation: undefined;
  NotificationSettings: undefined;
  HelpCenter: undefined;
  ScheduleRide: undefined;
};

export type RiderTabParamList = {
  RiderHome: undefined;
  MyRides: undefined;
  RiderAccount: undefined;
  Safety: undefined;
};

export type DriverTabParamList = {
  DriverHome: undefined;
  MyRoutes: undefined;
  Earnings: undefined;
  DriverAccount: undefined;
};
