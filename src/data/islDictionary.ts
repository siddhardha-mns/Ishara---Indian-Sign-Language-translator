import { ISLGestureDefinition } from '../types/isl';

export const ISL_GESTURES: ISLGestureDefinition[] = [
  // Greetings & Cultural Essentials
  {
    id: 'namaste',
    name: 'Namaste / Hello',
    hindiName: 'नमस्ते',
    category: 'greetings',
    description: 'Traditional Indian greeting. Palms pressed together in front of the chest with fingers pointing upward.',
    handsRequired: 'two',
    culturalNote: 'In Indian culture and ISL, Namaste represents deep respect and is the universal greeting for hello, goodbye, and reverence.',
    imagePath: '/src/assets/images/isl_namaste_guide_1790772669913.jpg',
    tips: [
      'Bring both palms together at chest level',
      'Keep fingers straight and pointing upward',
      'Thumbs close to the sternum'
    ],
    keyPointsGuide: 'Both hands close, palm vectors facing inward, fingers extended vertically'
  },
  {
    id: 'thank_you',
    name: 'Thank You',
    hindiName: 'धन्यवाद',
    category: 'greetings',
    description: 'Open flat hand touching or starting near chin/mouth, moving gently outward toward the other person.',
    handsRequired: 'single',
    culturalNote: 'Used widely across Indian schools and institutions for the deaf (ISLRTC standard).',
    tips: [
      'Keep fingers together and flat',
      'Touch fingertips near chin or lower lip',
      'Move hand outward and slightly downward toward the listener'
    ],
    keyPointsGuide: 'Open flat hand, thumb alongside fingers, palm facing inward then forward'
  },
  {
    id: 'water',
    name: 'Water',
    hindiName: 'पानी',
    category: 'daily',
    description: 'Hand forms a "W" shape (index, middle, and ring fingers extended upward) or fingers cupping to mouth.',
    handsRequired: 'single',
    culturalNote: 'One of the most essential survival signs in ISL community centers and transport.',
    imagePath: '/src/assets/images/isl_water_guide_1790776696956.jpg',
    tips: [
      'Extend index, middle, and ring fingers up',
      'Hold pinky down with your thumb',
      'Tap gently near the side of the mouth/chin'
    ],
    keyPointsGuide: 'Three central fingers extended in W formation, palm facing outward'
  },
  {
    id: 'food',
    name: 'Food / Eat',
    hindiName: 'खाना',
    category: 'daily',
    description: 'Fingertips brought together in a cluster (mimicking Indian traditional eating with fingers) touching the lips.',
    handsRequired: 'single',
    culturalNote: 'Reflects authentic Indian eating etiquette where all five fingertips gather food with care.',
    imagePath: '/src/assets/images/isl_food_guide_1790776710715.jpg',
    tips: [
      'Gather thumb and all four fingertips into a pinch cone',
      'Orient palm upward or toward face',
      'Bring fingertips near mouth twice in a rhythmic motion'
    ],
    keyPointsGuide: 'All 5 fingertips close together in a pinched dome, positioned in upper frame'
  },
  {
    id: 'help',
    name: 'Help / Assist',
    hindiName: 'मदद',
    category: 'emergency',
    description: 'Non-dominant palm held flat facing upward, dominant fist with thumb pointing upward resting on it and moving forward.',
    handsRequired: 'two',
    culturalNote: 'Standard ISL sign indicating lifting someone up and offering emergency or everyday aid.',
    imagePath: '/src/assets/images/isl_help_guide_1790776722122.jpg',
    tips: [
      'Hold left hand flat like an open base/tray',
      'Make a thumbs-up fist with right hand',
      'Rest right fist on left palm and move both slightly upward'
    ],
    keyPointsGuide: 'Two hands: bottom hand flat horizontal, top hand thumbs-up fist in contact'
  },
  {
    id: 'yes',
    name: 'Yes / Agree',
    hindiName: 'हाँ',
    category: 'daily',
    description: 'Fist held up and nodding gently up and down, mimicking a head nod.',
    handsRequired: 'single',
    culturalNote: 'Universal sign recognized throughout India in regional deaf associations.',
    tips: [
      'Form a relaxed fist',
      'Keep wrist loose',
      'Tilt fist downward and back up smoothly'
    ],
    keyPointsGuide: 'Closed fist with wrist tilting forward/downward'
  },
  {
    id: 'no',
    name: 'No / Decline',
    hindiName: 'नहीं',
    category: 'daily',
    description: 'Index finger or index and middle finger waving side to side, or open palm facing outward.',
    handsRequired: 'single',
    culturalNote: 'A clear, firm rejection or negative answer sign in Indian daily life.',
    tips: [
      'Extend index finger upward',
      'Curl other fingers into palm',
      'Gently shake index finger left and right'
    ],
    keyPointsGuide: 'Single index extended, other fingers folded, side-to-side oscillation'
  },
  {
    id: 'good',
    name: 'Good / Best of Luck',
    hindiName: 'बढ़िया / शुभकामना',
    category: 'daily',
    description: 'Thumb pointing straight up with fingers curled firmly into a fist.',
    handsRequired: 'single',
    culturalNote: 'Widely used in India for "Shabaash" (well done), "Badhiya", and good luck wishes.',
    tips: [
      'Fold all four fingers tightly into palm',
      'Extend thumb straight upwards',
      'Palm facing sideways'
    ],
    keyPointsGuide: 'Thumb extended vertically upwards, other 4 fingers curled'
  },
  {
    id: 'bad',
    name: 'Bad / Dislike',
    hindiName: 'खराब / नापसंद',
    category: 'daily',
    description: 'Thumb pointing down with fingers curled into a fist.',
    handsRequired: 'single',
    culturalNote: 'Indicates dissatisfaction or negative condition.',
    tips: [
      'Fold four fingers into palm',
      'Point thumb downward towards ground'
    ],
    keyPointsGuide: 'Thumb pointing down, 4 fingers curled'
  },
  {
    id: 'peace',
    name: 'Peace / Victory',
    hindiName: 'शान्ति / जीत',
    category: 'daily',
    description: 'Index and middle fingers extended apart in a V shape, thumb holding ring and pinky.',
    handsRequired: 'single',
    culturalNote: 'Symbol of harmony, friendship, and success.',
    tips: [
      'Extend index and middle fingers in a V',
      'Keep ring and pinky folded with thumb holding them',
      'Palm facing outward'
    ],
    keyPointsGuide: 'Index and middle extended in V, ring and pinky folded'
  },
  {
    id: 'love',
    name: 'I Love You',
    hindiName: 'प्यार',
    category: 'daily',
    description: 'Thumb, index finger, and pinky finger extended simultaneously, middle and ring fingers folded.',
    handsRequired: 'single',
    culturalNote: 'Universal sign embraced warmly by deaf communities across India.',
    imagePath: '/src/assets/images/isl_love_guide_1790776732976.jpg',
    tips: [
      'Extend thumb out to side',
      'Extend index straight up',
      'Extend pinky finger up',
      'Keep middle and ring fingers folded down'
    ],
    keyPointsGuide: 'Thumb, index, and pinky extended; middle and ring curled'
  },
  {
    id: 'stop',
    name: 'Stop / Wait',
    hindiName: 'रुको / ठहरो',
    category: 'emergency',
    description: 'Open hand with all five fingers straight, palm facing outward toward camera.',
    handsRequired: 'single',
    culturalNote: 'Clear directive signal used on roads, stations, and during urgent instructions.',
    tips: [
      'Extend all five fingers straight',
      'Keep fingers slightly spread or together',
      'Push palm firmly outward toward viewer'
    ],
    keyPointsGuide: 'All 5 fingers extended, palm facing forward'
  },
  {
    id: 'call_me',
    name: 'Call Me / Phone',
    hindiName: 'फ़ोन करना',
    category: 'daily',
    description: 'Thumb and pinky extended with other three fingers curled, brought near ear.',
    handsRequired: 'single',
    culturalNote: 'Common shorthand for mobile phone call or asking someone to get in touch.',
    tips: [
      'Extend thumb and pinky wide',
      'Curl index, middle, and ring fingers',
      'Thumb near ear, pinky towards mouth'
    ],
    keyPointsGuide: 'Thumb and pinky extended, middle three curled'
  },
  {
    id: 'ok',
    name: 'OK / Perfect',
    hindiName: 'ठीक है / उत्तम',
    category: 'daily',
    description: 'Index fingertip and thumb tip touching to form a circular ring, remaining three fingers extended straight.',
    handsRequired: 'single',
    culturalNote: 'Expresses understanding, agreement, or high quality.',
    tips: [
      'Touch tip of thumb to tip of index finger to make an "O"',
      'Keep middle, ring, and pinky upright and spread'
    ],
    keyPointsGuide: 'Thumb and index tips touching in ring, middle/ring/pinky extended'
  },

  // ISL Numbers
  {
    id: 'num_1',
    name: 'Number 1',
    hindiName: '१ (एक)',
    category: 'numbers',
    description: 'Index finger pointing straight up, remaining fingers folded into palm with thumb over them.',
    handsRequired: 'single',
    tips: ['Only index finger extended straight up', 'All other fingers curled'],
    keyPointsGuide: 'Index finger extended vertically, thumb and other fingers curled'
  },
  {
    id: 'num_2',
    name: 'Number 2',
    hindiName: '२ (दो)',
    category: 'numbers',
    description: 'Index and middle fingers extended straight up together.',
    handsRequired: 'single',
    tips: ['Index and middle fingers straight up', 'Thumb holding ring and pinky'],
    keyPointsGuide: 'Index and middle fingers extended, others curled'
  },
  {
    id: 'num_3',
    name: 'Number 3',
    hindiName: '३ (तीन)',
    category: 'numbers',
    description: 'Index, middle, and ring fingers extended upward.',
    handsRequired: 'single',
    tips: ['Index, middle, and ring fingers up', 'Thumb holding pinky'],
    keyPointsGuide: 'Index, middle, ring extended; pinky folded'
  },
  {
    id: 'num_4',
    name: 'Number 4',
    hindiName: '४ (चार)',
    category: 'numbers',
    description: 'Four fingers (index, middle, ring, pinky) extended upward with thumb folded across palm.',
    handsRequired: 'single',
    tips: ['Four fingers extended upward', 'Thumb tucked across palm'],
    keyPointsGuide: '4 fingers extended, thumb folded across palm'
  },
  {
    id: 'num_5',
    name: 'Number 5',
    hindiName: '५ (पांच)',
    category: 'numbers',
    description: 'All five fingers extended and spread outward.',
    handsRequired: 'single',
    tips: ['All five fingers open and clearly separated'],
    keyPointsGuide: 'All 5 digits extended and spread'
  },

  // ISL Alphabet (Core fingerspelling letters)
  {
    id: 'letter_a',
    name: 'Letter A',
    hindiName: 'अक्षर A',
    category: 'alphabet',
    description: 'Fist with thumb resting straight upright along the side of the index finger.',
    handsRequired: 'single',
    tips: ['Make a tight fist', 'Keep thumb resting upright along the outer edge of index finger'],
    keyPointsGuide: 'All 4 fingers curled into palm, thumb straight against index side'
  },
  {
    id: 'letter_b',
    name: 'Letter B',
    hindiName: 'अक्षर B',
    category: 'alphabet',
    description: 'Four fingers held straight up and pressed together, thumb folded across palm.',
    handsRequired: 'single',
    tips: ['Hold four fingers straight up touching each other', 'Tuck thumb across lower palm'],
    keyPointsGuide: 'Four fingers upright and flat, thumb across palm'
  },
  {
    id: 'letter_c',
    name: 'Letter C',
    hindiName: 'अक्षर C',
    category: 'alphabet',
    description: 'Hand curved to form the shape of the letter "C".',
    handsRequired: 'single',
    tips: ['Curve fingers and thumb as if holding a medium cup'],
    keyPointsGuide: 'Curved arch from thumb tip to fingertips, opening sideways'
  },
  {
    id: 'letter_d',
    name: 'Letter D',
    hindiName: 'अक्षर D',
    category: 'alphabet',
    description: 'Index finger pointing straight up, thumb touching middle, ring, and pinky fingertips in an "O" shape.',
    handsRequired: 'single',
    tips: ['Index finger straight up', 'Thumb and other fingertips touch forming a circle'],
    keyPointsGuide: 'Index finger extended, thumb touching other tips in circle'
  },
  {
    id: 'letter_i',
    name: 'Letter I',
    hindiName: 'अक्षर I',
    category: 'alphabet',
    description: 'Pinky finger extended straight up, other three fingers curled with thumb over them.',
    handsRequired: 'single',
    tips: ['Extend only the pinky finger straight up', 'Curl index, middle, ring with thumb over them'],
    keyPointsGuide: 'Pinky extended vertically, other 4 fingers curled'
  },
  {
    id: 'letter_l',
    name: 'Letter L',
    hindiName: 'अक्षर L',
    category: 'alphabet',
    description: 'Thumb and index finger held at 90 degrees forming an "L" shape.',
    handsRequired: 'single',
    tips: ['Index finger points straight up', 'Thumb extends horizontally at 90 degrees'],
    keyPointsGuide: 'Index upright, thumb horizontal forming 90-degree L, others curled'
  },
  {
    id: 'letter_o',
    name: 'Letter O',
    hindiName: 'अक्षर O',
    category: 'alphabet',
    description: 'All fingertips curved down to touch the thumb tip, creating a full "O" circle.',
    handsRequired: 'single',
    tips: ['Curve all fingers to meet the thumb at their tips'],
    keyPointsGuide: 'All fingertips meet thumb tip in circular loop'
  },
  {
    id: 'letter_v',
    name: 'Letter V',
    hindiName: 'अक्षर V',
    category: 'alphabet',
    description: 'Index and middle fingers extended upward in a sharp "V" shape.',
    handsRequired: 'single',
    tips: ['Index and middle fingers extended and spread', 'Ring and pinky curled with thumb over them'],
    keyPointsGuide: 'Index and middle spread in V, others curled'
  },
  {
    id: 'letter_w',
    name: 'Letter W',
    hindiName: 'अक्षर W',
    category: 'alphabet',
    description: 'Index, middle, and ring fingers extended and spread upward.',
    handsRequired: 'single',
    tips: ['Index, middle, and ring spread upward in a "W"', 'Thumb holds pinky down'],
    keyPointsGuide: '3 central fingers spread in W formation'
  },
  {
    id: 'letter_y',
    name: 'Letter Y',
    hindiName: 'अक्षर Y',
    category: 'alphabet',
    description: 'Thumb and pinky extended far apart, index, middle, and ring curled.',
    handsRequired: 'single',
    tips: ['Thumb and pinky wide open like horns', 'Middle three fingers curled into palm'],
    keyPointsGuide: 'Thumb and pinky extended, middle three curled'
  }
];

export const GESTURE_BY_ID = new Map<string, ISLGestureDefinition>(
  ISL_GESTURES.map(g => [g.id, g])
);
