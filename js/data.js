// ============================================================
//  EDIT THIS FILE to change the site's content.
//  Photos: put files in /assets/photos/ using the names below.
//  Until a file exists, a labelled placeholder is shown instead.
// ============================================================

export const GYM = {
  name: "On The C Fitness Club",
  short: "OTC",
  tagline: "Train hard. Build the version of you that shows up.",
  // TODO: replace with the real details from the Google Business listing
  phone: "+91 00000 00000",
  address: "Address — add from Google Business listing",
  hours: "Mon–Sat 5:30 AM – 10:30 PM · Sun 7 AM – 12 PM",
  instagram: "https://www.instagram.com/onthecfitnessclub/",
  maps: "https://share.google/b0rVfXWvsB81rc02B",
};

export const STATS = [
  { value: 5, suffix: "", label: "Expert coaches" },
  { value: 3, suffix: "", label: "Training floors" },
  { value: 17, suffix: "h", label: "Open every day" },
  { value: 500, suffix: "+", label: "Members trained" }, // TODO: confirm the real number
];

// TODO: replace names, photos and bios with the real coaches.
export const COACHES = [
  {
    id: "c1",
    name: "Coach One",
    role: "Head Coach · Strength",
    photo: "assets/photos/coach-1.jpg",
    years: 10,
    certs: ["Strength & Conditioning", "Powerlifting"],
    bio: "Leads the floor and the programming. Builds progressive strength plans around the big lifts and teaches technique before load, so progress lasts.",
    focus: ["Squat · Bench · Deadlift", "Strength blocks", "Technique reset"],
  },
  {
    id: "c2",
    name: "Coach Two",
    role: "Bodybuilding & Physique",
    photo: "assets/photos/coach-2.jpg",
    years: 8,
    certs: ["Certified Personal Trainer", "Sports Nutrition"],
    bio: "Specialises in muscle gain and body recomposition, from split design to meal structure, with a focus on form, tempo and recovery.",
    focus: ["Hypertrophy splits", "Diet planning", "Contest prep"],
  },
  {
    id: "c3",
    name: "Coach Three",
    role: "Functional & CrossFit",
    photo: "assets/photos/coach-3.jpg",
    years: 7,
    certs: ["CrossFit L1", "Functional Movement"],
    bio: "Runs the high-energy functional sessions: kettlebells, ropes, sleds and circuits that build engine, agility and real-world strength.",
    focus: ["HIIT circuits", "Kettlebell & sled", "Conditioning"],
  },
  {
    id: "c4",
    name: "Coach Four",
    role: "Fat Loss & Cardio",
    photo: "assets/photos/coach-4.jpg",
    years: 6,
    certs: ["Weight Management", "Exercise Science"],
    bio: "Designs sustainable fat-loss programmes that mix resistance training, cardio and habits, without crash diets or burnout.",
    focus: ["Fat-loss plans", "Cardio programming", "Habit coaching"],
  },
  {
    id: "c5",
    name: "Coach Five",
    role: "Mobility & Rehab",
    photo: "assets/photos/coach-5.jpg",
    years: 9,
    certs: ["Mobility Specialist", "Injury Prevention"],
    bio: "Keeps members moving well. Mobility work, warm-up systems and return-to-training plans after injury or long breaks.",
    focus: ["Mobility flows", "Injury prevention", "Beginner onboarding"],
  },
];

// TODO: confirm what is actually on each floor.
export const FLOORS = [
  {
    n: "01",
    title: "Ground Floor",
    sub: "Cardio & Reception",
    photo: "assets/photos/floor-1.jpg",
    text: "Treadmills, bikes, cross-trainers and the welcome desk. Warm up here, check in, grab your plan.",
    tags: ["Cardio zone", "Reception", "Locker area"],
  },
  {
    n: "02",
    title: "First Floor",
    sub: "Strength & Free Weights",
    photo: "assets/photos/floor-2.jpg",
    text: "Racks, platforms, dumbbells to the heavy end, and plate-loaded machines. The iron floor.",
    tags: ["Squat racks", "Dumbbells", "Machines"],
  },
  {
    n: "03",
    title: "Second Floor",
    sub: "Functional & Studio",
    photo: "assets/photos/floor-3.jpg",
    text: "Open turf, sleds, ropes, kettlebells and the studio space for classes and mobility.",
    tags: ["Turf", "Classes", "Mobility"],
  },
];

// Prices in INR
export const PLANS = [
  { id: "m3", name: "Quarterly", duration: "3 months", price: 6000, per: "₹2,000 / month", perks: ["All floors access", "Free fitness assessment", "Group floor guidance"] },
  { id: "m6", name: "Half-Yearly", duration: "6 months", price: 9000, per: "₹1,500 / month", featured: true, perks: ["All floors access", "Free fitness assessment", "Personalised workout plan", "Diet guidance"] },
  { id: "m12", name: "Annual", duration: "12 months", price: 18000, per: "₹1,500 / month", perks: ["All floors access", "Free fitness assessment", "Personalised workout plan", "Diet guidance", "Quarterly progress check-ins"] },
];

export const GALLERY = [
  "assets/photos/gallery-1.jpg",
  "assets/photos/gallery-2.jpg",
  "assets/photos/gallery-3.jpg",
  "assets/photos/gallery-4.jpg",
  "assets/photos/gallery-5.jpg",
  "assets/photos/gallery-6.jpg",
];
