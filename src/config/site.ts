export const SITE = {
  name: "TEAMS Tuition Center",
  shortName: "TEAMS",
  city: "Tumakuru",
  phone: "+91 93415 51370",
  whatsappNumber: "919341551370", // E.164 without + for wa.me
  googleReviewsUrl:
    "https://www.google.com/search?q=TEAMS+Tuition+Center+Tumakuru+reviews",
  googleRating: 4.9,
  googleReviewCount: 81,
};

export const ADMIN_EMAIL = "admin.teamsedu@gmail.com";

export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
