export type RootStackParamList = {
  Welcome: undefined;
  UserTypeSelection: undefined;
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
