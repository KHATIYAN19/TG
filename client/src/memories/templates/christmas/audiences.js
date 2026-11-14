/*
  WHO THE CHRISTMAS PAGE IS FOR. The sender picks one; it changes the wording of the whole page, the wishes they can pick from
  and the quick replies, so a note to a partner reads romantic and a note to a colleague reads warm and light.
  The ids must exist in PAGE_AUDIENCES in the backend.
*/
export const DEFAULT_AUDIENCE = "friend";

/* the wish the sender asks them to make (also the "message options" the sender can pick from) */
export const WISH_QUESTIONS = [
  "What do you wish for this Christmas?",
  "What's on your Christmas wish list?",
  "What would make your Christmas perfect?",
  "What gift would you love from Santa?",
  "What's your wish for the new year?",
  "How should we celebrate Christmas together?",
];
export const DEFAULT_QUESTION = WISH_QUESTIONS[0];
export const WISH_PREFIX = "🎄 My Christmas wish: ";
export const isWishReply = (r) => String(r?.text || "").startsWith(WISH_PREFIX);

export const AUDIENCES = [
  {
    id: "partner", label: "Partner", emoji: "💕",
    greeting: "Merry Christmas, my love", heroSub: "You are the best gift I could ever unwrap.",
    lines: ["Every Christmas is better with you.", "You are my favourite person to celebrate with.", "All I want for Christmas is you."],
    treeKick: "Wishes for you", treeTitle: "Our wishing tree", treeSub: "Tap an ornament to read what I wish for you.",
    storyKick: "This year", storyTitle: "Our year together", storySub: "My favourite moments, one by one.",
    promiseTitle: "My promises for the new year", promiseSub: "Tap each card to open it.",
    giftTitle: "Under the tree, just for you", letterTitle: "A letter for you",
    wishKick: "Make a wish", wishSub: "Santa is listening. So am I.",
    wishChips: ["More time together", "A cozy night in", "A trip, just us two", "A big hug", "A slow dance", "Hot chocolate by the fire"],
    replies: ["Merry Christmas, my love 💕", "I love you so much 🎄", "Best Christmas gift ever", "Can't wait to see you"],
    finaleBtn: "Ring the bells", signoff: "Yours, always",
  },
  {
    id: "friend", label: "Friend", emoji: "🤝",
    greeting: "Merry Christmas", heroSub: "I'm so glad you're in my life. Happy holidays!",
    lines: ["Wishing you a Christmas full of joy.", "Thank you for being my friend.", "Here's to cozy nights and big laughs."],
    treeKick: "Wishes for you", treeTitle: "The wishing tree", treeSub: "Tap an ornament to read my wish for you.",
    storyKick: "This year", storyTitle: "Our year in moments", storySub: "The ones I'm still smiling about.",
    promiseTitle: "What I promise next year", promiseSub: "Tap each card to open it.",
    giftTitle: "A little something under the tree", letterTitle: "A note from me",
    wishKick: "Make a wish", wishSub: "Tell me. I'll do my best to make it come true.",
    wishChips: ["A relaxing break", "Time with family", "Good health", "A new adventure", "Lots of snacks", "A big win next year"],
    replies: ["Merry Christmas! 🎄", "You're the best 🤗", "Thank you, you made my day!", "Let's celebrate soon!"],
    finaleBtn: "Ring the bells", signoff: "Your friend",
  },
  {
    id: "family", label: "Family", emoji: "🏡",
    greeting: "Merry Christmas", heroSub: "Home is wherever you are. Merry Christmas, family.",
    lines: ["Christmas is better with family.", "Thank you for every memory we've made.", "Home, warmth and all of you."],
    treeKick: "Wishes for you", treeTitle: "Our family wishing tree", treeSub: "Tap an ornament to read what I wish for you.",
    storyKick: "Family moments", storyTitle: "Memories this year", storySub: "The ones I hold closest.",
    promiseTitle: "What I promise", promiseSub: "Tap each card to open it.",
    giftTitle: "Gifts from my heart", letterTitle: "A letter from my heart",
    wishKick: "Make a wish", wishSub: "Tell me what would make your Christmas special.",
    wishChips: ["Everyone together", "A big family dinner", "Good health for all", "Peace and happiness", "A visit home", "Lots of sweets"],
    replies: ["Merry Christmas! Love you 🎄", "Miss you, come home soon", "So happy to hear from you", "God bless you ❤️"],
    finaleBtn: "Ring the bells", signoff: "With love",
  },
  {
    id: "colleague", label: "Colleague", emoji: "💼",
    greeting: "Happy Holidays", heroSub: "Thank you for a great year. Enjoy a well-earned break.",
    lines: ["Thank you for a wonderful year.", "Wishing you a restful holiday.", "Looking forward to what we do next."],
    treeKick: "Season's wishes", treeTitle: "The wishing tree", treeSub: "Tap an ornament to read a wish for you.",
    storyKick: "This year", storyTitle: "Highlights of our year", storySub: "A few moments worth remembering.",
    promiseTitle: "Looking ahead", promiseSub: "Tap each card to open it.",
    giftTitle: "A small token under the tree", letterTitle: "A note of thanks",
    wishKick: "Make a wish", wishSub: "Tell me what you're hoping for this holiday.",
    wishChips: ["A proper break", "Time with loved ones", "A quiet week", "A great start next year", "Good food", "Some sunshine"],
    replies: ["Happy holidays! 🎄", "Thank you, same to you!", "Enjoy your break", "See you in the new year"],
    finaleBtn: "Ring the bells", signoff: "Best wishes",
  },
];

export const audienceFor = (id) => AUDIENCES.find((a) => a.id === id) || AUDIENCES.find((a) => a.id === DEFAULT_AUDIENCE);
