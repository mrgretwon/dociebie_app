enum SalonNavbarElementType {
  SalonServicesScreen = "SalonServicesScreen",
  SalonReviewsScreen = "SalonReviewsScreen",
  SalonDetailsScreen = "SalonDetailsScreen",
}

type PossibleRoutes = "/salon/services" | "/salon/reviews" | "/salon/details";

export const salonNavbarElementTypeToScreen = (
  elementType: SalonNavbarElementType
): PossibleRoutes => {
  switch (elementType) {
    case SalonNavbarElementType.SalonDetailsScreen:
      return "/salon/details";
    case SalonNavbarElementType.SalonReviewsScreen:
      return "/salon/reviews";
    default:
      return "/salon/services";
  }
};

export default SalonNavbarElementType;
