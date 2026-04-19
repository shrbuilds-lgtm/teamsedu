export const SITE = {
  name: "TEAMS Tuition Center",
  shortName: "TEAMS",
  city: "Tumakuru",
  phone: "+91 70222 58154",
  whatsappNumber: "917022258154", // E.164 without + for wa.me
  googleReviewsUrl:
    "https://www.google.com/search?q=TEAMS+Tuition+Center+Tumakuru+reviews",
  googleRating: 4.9,
  googleReviewCount: 81,
};

export const ADMIN_EMAIL = "admin.teamsedu@gmail.com";

export const buildWhatsAppLink = (message: string) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
