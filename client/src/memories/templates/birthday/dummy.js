/*
  DUMMY DATA for the birthday page. The shape matches what the live page will be given later:
  names + message from the page, photos/video from the page's media, gifts and wishes from the template.
  A photo/video with a `url` is shown for real; one without gets a pretty placeholder.
*/
export const DEFAULT_WISHES = ["You make everything brighter!", "Make a big wish!", "Cake time!", "Today is all yours", "Smile, it's your day!"];

export const DUMMY_BIRTHDAY = {
  recipientName: "Anu",
  senderName: "Ravi",
  age: 21,
  message:
    "Happy Birthday, Anu! Another year older, and somehow even more wonderful. Thank you for every laugh, every late-night chat and every time you made a bad day better just by showing up. I hope today is full of cake, chocolate, silly photos and everything you love. You deserve all the happiness in the world, and I'll be right here cheering the loudest. Now make a wish, you've earned it!",
  wishes: [
    "You make everything brighter!",
    "Make a big wish!",
    "Cake time!",
    "You're one in a million",
    "Happy Birthday!",
    "Today is all yours",
    "Smile, it's your day!",
    "Best friend energy",
  ],
  gifts: [
    { id: 1, title: "Movie date", note: "Pick any film. Snacks and blankets are on me." },
    { id: 2, title: "Coffee on me", note: "One coffee, any time you need a friend. No expiry." },
    { id: 3, title: "Weekend getaway", note: "Pack your bag. We're going somewhere beautiful." },
    { id: 4, title: "A giant hug", note: "Redeemable the moment we meet." },
  ],
  photos: [
    { id: "p1", caption: "Our first trip", tone: ["#ffb3d1", "#ff8fa3"], emoji: "🏖️" },
    { id: "p2", caption: "That silly selfie", tone: ["#ffd27d", "#ff9d5c"], emoji: "🤪" },
    { id: "p3", caption: "Coffee and gossip", tone: ["#c7b8ff", "#8f9bff"], emoji: "☕" },
    { id: "p4", caption: "Sunset walk", tone: ["#ffb199", "#ff6b9d"], emoji: "🌇" },
    { id: "p5", caption: "Your 20th birthday", tone: ["#9be7d0", "#4cc9f0"], emoji: "🎂" },
    { id: "p6", caption: "Road trip songs", tone: ["#fbc2eb", "#a6c1ee"], emoji: "🚗" },
    { id: "p7", caption: "Best day ever", tone: ["#ffe29f", "#ffa99f"], emoji: "🌈" },
  ],
  mainPhotoId: "p1",
  video: { id: "v1", caption: "A little message for you", tone: ["#a18cd1", "#fbc2eb"] },
};
