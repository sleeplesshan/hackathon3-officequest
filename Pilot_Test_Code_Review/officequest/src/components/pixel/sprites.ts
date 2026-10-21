import type { TierKey } from '@/lib/types';
import { TIER_ORDER } from '@/lib/formulas';
export interface Sprite { w:number; h:number; palette:Record<string,string>; rows:string[] }
// Pixel-perfect palette encoding of source/mock/sprites.js, including its 16x14 head crops.
export const SPRITES:Record<string,Sprite> = {
  "char0": {
    "w": 24,
    "h": 24,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#f6c7a0",
      "d": "#18181b",
      "e": "#d99a73",
      "f": "#3f4a6b",
      "g": "#f4f4f5",
      "h": "#7c3aed",
      "i": "#cd7f32",
      "j": "#2b3350",
      "k": "#2a2a35",
      "l": "#121216"
    },
    "rows": [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........aaaaaaaa........",
      ".......abbbbbbbba.......",
      "......abbbbbbbbbba......",
      "......abbccccccbba......",
      "......abccccccccba......",
      "......accddccddcca......",
      "......acccccccccca......",
      ".......accceeccca.......",
      "........aaccccaa........",
      "......afffghhgfffa......",
      ".....affifghhgfiffa.....",
      ".....acffffhhffffca.....",
      ".....aaajjjjjjjjaaa.....",
      ".......akkkkkkkka.......",
      ".......akkkaakkka.......",
      ".......alllaallla.......",
      "........................",
      "........................"
    ]
  },
  "char1": {
    "w": 24,
    "h": 24,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#f6c7a0",
      "d": "#18181b",
      "e": "#64748b",
      "f": "#d99a73",
      "g": "#cbd5e1",
      "h": "#3f4a6b",
      "i": "#f4f4f5",
      "j": "#7c3aed",
      "k": "#e2e8f0",
      "l": "#2b3350",
      "m": "#2a2a35",
      "n": "#121216"
    },
    "rows": [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........aaaaaaaa........",
      ".......abbbbbbbba.......",
      "......abbbbbbbbbba......",
      "......abbccccccbba......",
      "......abccccccccba......",
      "......accddccddcca......",
      "......acccccccccca......",
      "......eacccffcccae......",
      ".....eggaaccccaagge.....",
      ".....eahhhijjihhhae.....",
      ".....ahhkhijjihkhha.....",
      "....eachhhhjjhhhhcae....",
      "....eaaallllllllaaae....",
      "....eggammmmmmmmagge....",
      "...egggammmaammmaggge...",
      "...egggannnaannnaggge...",
      "........................",
      "........................"
    ]
  },
  "char2": {
    "w": 24,
    "h": 24,
    "palette": {
      "a": "#1c1528",
      "b": "#fcd34d",
      "c": "#3b2718",
      "d": "#f6c7a0",
      "e": "#18181b",
      "f": "#d99a73",
      "g": "#f5b301",
      "h": "#7f1d1d",
      "i": "#f4f4f5",
      "j": "#b91c1c",
      "k": "#fff7cc",
      "l": "#b7791f",
      "m": "#2a2a35",
      "n": "#121216"
    },
    "rows": [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........aabababa........",
      ".......acccccccca.......",
      "......acccccccccca......",
      "......accddddddcca......",
      "......acddddddddca......",
      "......addeeddeedda......",
      "......adddddddddda......",
      "......aadddffdddaa......",
      ".....aggaaddddaagga.....",
      ".....hagggijjigggah.....",
      ".....aggkgijjigkgga.....",
      "....hadggggjjggggdah....",
      "....haaallllllllaaah....",
      "....hjjammmmmmmmajjh....",
      "...hjjjammmaammmajjjh...",
      "...hjjjannnaannnajjjh...",
      "........................",
      "........................"
    ]
  },
  "char3": {
    "w": 24,
    "h": 24,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#f6c7a0",
      "d": "#1f2937",
      "e": "#ffffff",
      "f": "#22d3ee",
      "g": "#d99a73",
      "h": "#e5e7eb",
      "i": "#334155",
      "j": "#f4f4f5",
      "k": "#7c3aed",
      "l": "#67e8f9",
      "m": "#9ca3af",
      "n": "#64748b",
      "o": "#2a2a35",
      "p": "#121216"
    },
    "rows": [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........aaaaaaaa........",
      ".......abbbbbbbba.......",
      "......abbbbbbbbbba......",
      "......abbccccccbba......",
      "......abccccccccba......",
      "......adeffddeffda......",
      "......acccccccccca......",
      "......aacccggcccaa......",
      ".....ahhaaccccaahha.....",
      ".....iahhhjkkjhhhai.....",
      ".....ahhlhjkkjhlhha.....",
      "....iachhhhkkhhhhcai....",
      "....iaaammmmmmmmaaai....",
      "....innaooooooooanni....",
      "...innnaoooaaoooannni...",
      "...innnapppaapppannni...",
      "........................",
      "........................"
    ]
  },
  "char4": {
    "w": 24,
    "h": 24,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#67e8f9",
      "d": "#0e9fbf",
      "e": "#f6c7a0",
      "f": "#f0fdff",
      "g": "#1f2937",
      "h": "#ffffff",
      "i": "#d99a73",
      "j": "#a5f3fc",
      "k": "#f4f4f5",
      "l": "#7c3aed",
      "m": "#0891b2",
      "n": "#2a2a35",
      "o": "#121216"
    },
    "rows": [
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........................",
      "........aaaaaaaa........",
      ".......abbbbbbbba.......",
      ".....cabbbbbbbbbbac.....",
      "...ccdabbeeeeeebbadcc...",
      "..cddfabeeeeeeeebafddc..",
      ".cddfdaghccgghccgadfddc.",
      "cddfddaeeeeeeeeeeaddfddc",
      "cdfdd.aaeeeiieeeaa.ddfdc",
      "cddd.ajjaaeeeeaajja.dddc",
      "cdd...ajjjkllkjjja...ddc",
      "cd...ajjhjkllkjhjja...dc",
      "c....aejjjjlljjjjea....c",
      ".....aaammmmmmmmaaa.....",
      ".......annnnnnnna.......",
      ".......annnaannna.......",
      ".......aoooaaoooa.......",
      "........................",
      "........................"
    ]
  },
  "char5": {
    "w": 24,
    "h": 24,
    "palette": {
      "a": "#f5f3ff",
      "b": "#c084fc",
      "c": "#f0abfc",
      "d": "#e879f9",
      "e": "#1c1528",
      "f": "#2e1065",
      "g": "#7e22ce",
      "h": "#f6c7a0",
      "i": "#faf5ff",
      "j": "#18181b",
      "k": "#ffffff",
      "l": "#d99a73",
      "m": "#7c3aed",
      "n": "#3b0764",
      "o": "#f4f4f5",
      "p": "#a855f7",
      "q": "#4c1d95",
      "r": "#581c87",
      "s": "#2a2a35",
      "t": "#121216"
    },
    "rows": [
      "........................",
      "........................",
      "....................a...",
      "....................a...",
      "....................ab..",
      "...........c..d.....ab..",
      "........ecedecee....ab..",
      ".......effffffffe...ab..",
      ".....beffffffffffeb.ab..",
      "...bbgeffhhhhhhffegbab..",
      "..bggiefhhhhhhhhfeigab..",
      ".bggigejkccjjkccjegiabb.",
      "bggiggehhhhhhhhhheggabgb",
      "bgigg.eehhhllhhhee.gabgb",
      "bggg.emmeehhhheemme.abgb",
      "bgg..nemmmommommmen.abgb",
      "bg...emmcmommomcmmcpppcb",
      "b...nehmmmmmmmmmmhhhn..b",
      "....neeeqqqqqqqqeeenn...",
      "....nrresssssssserrnc...",
      "...nrrressseessserrrn...",
      "...nrrrettteettterrrn...",
      "........................",
      "........................"
    ]
  },
  "head0": {
    "w": 16,
    "h": 14,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#f6c7a0",
      "d": "#18181b",
      "e": "#d99a73",
      "f": "#3f4a6b",
      "g": "#f4f4f5",
      "h": "#7c3aed",
      "i": "#cd7f32"
    },
    "rows": [
      "................",
      "................",
      "....aaaaaaaa....",
      "...abbbbbbbba...",
      "..abbbbbbbbbba..",
      "..abbccccccbba..",
      "..abccccccccba..",
      "..accddccddcca..",
      "..acccccccccca..",
      "...accceeccca...",
      "....aaccccaa....",
      "..afffghhgfffa..",
      ".affifghhgfiffa.",
      ".acffffhhffffca."
    ]
  },
  "head1": {
    "w": 16,
    "h": 14,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#f6c7a0",
      "d": "#18181b",
      "e": "#64748b",
      "f": "#d99a73",
      "g": "#cbd5e1",
      "h": "#3f4a6b",
      "i": "#f4f4f5",
      "j": "#7c3aed",
      "k": "#e2e8f0"
    },
    "rows": [
      "................",
      "................",
      "....aaaaaaaa....",
      "...abbbbbbbba...",
      "..abbbbbbbbbba..",
      "..abbccccccbba..",
      "..abccccccccba..",
      "..accddccddcca..",
      "..acccccccccca..",
      "..eacccffcccae..",
      ".eggaaccccaagge.",
      ".eahhhijjihhhae.",
      ".ahhkhijjihkhha.",
      "eachhhhjjhhhhcae"
    ]
  },
  "head2": {
    "w": 16,
    "h": 14,
    "palette": {
      "a": "#1c1528",
      "b": "#fcd34d",
      "c": "#3b2718",
      "d": "#f6c7a0",
      "e": "#18181b",
      "f": "#d99a73",
      "g": "#f5b301",
      "h": "#7f1d1d",
      "i": "#f4f4f5",
      "j": "#b91c1c",
      "k": "#fff7cc"
    },
    "rows": [
      "................",
      "................",
      "....aabababa....",
      "...acccccccca...",
      "..acccccccccca..",
      "..accddddddcca..",
      "..acddddddddca..",
      "..addeeddeedda..",
      "..adddddddddda..",
      "..aadddffdddaa..",
      ".aggaaddddaagga.",
      ".hagggijjigggah.",
      ".aggkgijjigkgga.",
      "hadggggjjggggdah"
    ]
  },
  "head3": {
    "w": 16,
    "h": 14,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#f6c7a0",
      "d": "#1f2937",
      "e": "#ffffff",
      "f": "#22d3ee",
      "g": "#d99a73",
      "h": "#e5e7eb",
      "i": "#334155",
      "j": "#f4f4f5",
      "k": "#7c3aed",
      "l": "#67e8f9"
    },
    "rows": [
      "................",
      "................",
      "....aaaaaaaa....",
      "...abbbbbbbba...",
      "..abbbbbbbbbba..",
      "..abbccccccbba..",
      "..abccccccccba..",
      "..adeffddeffda..",
      "..acccccccccca..",
      "..aacccggcccaa..",
      ".ahhaaccccaahha.",
      ".iahhhjkkjhhhai.",
      ".ahhlhjkkjhlhha.",
      "iachhhhkkhhhhcai"
    ]
  },
  "head4": {
    "w": 16,
    "h": 14,
    "palette": {
      "a": "#1c1528",
      "b": "#3b2718",
      "c": "#67e8f9",
      "d": "#0e9fbf",
      "e": "#f6c7a0",
      "f": "#f0fdff",
      "g": "#1f2937",
      "h": "#ffffff",
      "i": "#d99a73",
      "j": "#a5f3fc",
      "k": "#f4f4f5",
      "l": "#7c3aed"
    },
    "rows": [
      "................",
      "................",
      "....aaaaaaaa....",
      "...abbbbbbbba...",
      ".cabbbbbbbbbbac.",
      "cdabbeeeeeebbadc",
      "dfabeeeeeeeebafd",
      "fdaghccgghccgadf",
      "ddaeeeeeeeeeeadd",
      "d.aaeeeiieeeaa.d",
      ".ajjaaeeeeaajja.",
      "..ajjjkllkjjja..",
      ".ajjhjkllkjhjja.",
      ".aejjjjlljjjjea."
    ]
  },
  "head5": {
    "w": 16,
    "h": 14,
    "palette": {
      "a": "#f0abfc",
      "b": "#e879f9",
      "c": "#1c1528",
      "d": "#2e1065",
      "e": "#c084fc",
      "f": "#7e22ce",
      "g": "#f6c7a0",
      "h": "#faf5ff",
      "i": "#18181b",
      "j": "#ffffff",
      "k": "#d99a73",
      "l": "#7c3aed",
      "m": "#3b0764",
      "n": "#f4f4f5",
      "o": "#a855f7"
    },
    "rows": [
      "................",
      ".......a..b.....",
      "....cacbcacc....",
      "...cddddddddc...",
      ".ecddddddddddce.",
      "efcddggggggddcfe",
      "fhcdggggggggdchf",
      "hfcijaaiijaaicfh",
      "ffcggggggggggcff",
      "f.ccgggkkgggcc.f",
      ".cllccggggccllc.",
      ".mclllnllnlllcm.",
      ".cllalnllnlallao",
      "mcgllllllllllggg"
    ]
  },
  "coin": {
    "w": 8,
    "h": 8,
    "palette": {
      "a": "#7c4a03",
      "b": "#fbbf24",
      "c": "#fff7cc",
      "d": "#d97706"
    },
    "rows": [
      "..aaaa..",
      ".abbbba.",
      "abbcbbda",
      "abcbbbda",
      "abbbbbda",
      "abbbbdda",
      ".adddda.",
      "..aaaa.."
    ]
  },
  "gem": {
    "w": 7,
    "h": 7,
    "palette": {
      "a": "#3b0764",
      "b": "#a855f7",
      "c": "#f5d0fe",
      "d": "#6d28d9"
    },
    "rows": [
      "..aaa..",
      ".abcba.",
      "abcbbba",
      "abbbbda",
      ".abbda.",
      "..aba..",
      "...a..."
    ]
  },
  "star": {
    "w": 7,
    "h": 7,
    "palette": {
      "a": "#fde047",
      "b": "#ffffff"
    },
    "rows": [
      "...a...",
      "..aaa..",
      "aaabaaa",
      ".aaaaa.",
      "..aaa..",
      ".aa.aa.",
      "a.....a"
    ]
  },
  "scroll": {
    "w": 12,
    "h": 10,
    "palette": {
      "a": "#5b3a1e",
      "b": "#c9a86a",
      "c": "#f3e2b3",
      "d": "#a07a45",
      "e": "#7c3aed"
    },
    "rows": [
      "aaaaaaaaaaaa",
      "abccccccccba",
      ".acccccccca.",
      ".acddddddca.",
      ".acccccccca.",
      ".acddddccca.",
      ".acccccccca.",
      ".aceeccccca.",
      "abceecccccba",
      "aaaaaaaaaaaa"
    ]
  },
  "slime": {
    "w": 16,
    "h": 12,
    "palette": {
      "a": "#14321f",
      "b": "#4ade80",
      "c": "#dcfce7",
      "d": "#0b0b10",
      "e": "#ffffff",
      "f": "#166534"
    },
    "rows": [
      "......aaaa......",
      "....aabbbbaa....",
      "...abbccbbbba...",
      "..abbcbbbbbbba..",
      "..abbbbbbbbbba..",
      ".abbddbbbbddbba.",
      ".abbdebbbbdebba.",
      ".abbbbbbbbbbbba.",
      "abbbbbffffbbbbba",
      "abbbbbbffbbbbbba",
      ".aabbbbbbbbbbaa.",
      "...aaaaaaaaaa..."
    ]
  },
  "monitor": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#0b0b10",
      "b": "#7c3aed",
      "c": "#ddd6fe",
      "d": "#5b21b6",
      "e": "#71717a"
    },
    "rows": [
      "aaaaaaaaaaaa",
      "abbbbbbbbbba",
      "abcbbbbbbbba",
      "abbcbbbbbbba",
      "abbbbbbbbbda",
      "abbbbbbbbdda",
      "abbbbbbbddda",
      "aaaaaaaaaaaa",
      ".....aa.....",
      "....aeea....",
      "..aaaaaaaa..",
      "............"
    ]
  },
  "mug": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#d4d4d8",
      "b": "#1c1917",
      "c": "#fb923c"
    },
    "rows": [
      "............",
      "..a..a..a...",
      "...a..a..a..",
      "............",
      ".bbbbbbbbb..",
      ".bcccccccbbb",
      ".bcccccccb.b",
      ".bcacccccb.b",
      ".bcccccccbbb",
      ".bcccccccb..",
      "..bbbbbbb...",
      "............"
    ]
  },
  "book": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#1c1917",
      "b": "#b91c1c",
      "c": "#fef3c7"
    },
    "rows": [
      ".aaaaaaaaa..",
      ".abbbbbbbaa.",
      ".abcccccbaca",
      ".abbbbbbbaca",
      ".abcccbbbaca",
      ".abbbbbbbaca",
      ".abbbbbbbaca",
      ".abbbbbbbaca",
      ".abbbbbbbaca",
      ".aaaaaaaaaca",
      "..acccccccca",
      "...aaaaaaaa."
    ]
  },
  "pad": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#0b0b10",
      "b": "#52525b",
      "c": "#e4e4e7",
      "d": "#a855f7"
    },
    "rows": [
      "............",
      "............",
      "..aaaaaaaa..",
      ".abbbbbbbba.",
      "abbcbbbbdbba",
      "abcccbbdbdba",
      "abbcbbbbdbba",
      "abbbbaabbbba",
      "abbba..abbba",
      ".aaa....aaa.",
      "............",
      "............"
    ]
  },
  "house": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#1c1528",
      "b": "#a855f7",
      "c": "#f4f4f5",
      "d": "#fde047",
      "e": "#6d28d9"
    },
    "rows": [
      ".....aa.....",
      "....abba....",
      "...abbbba...",
      "..abbbbbba..",
      ".abbbbbbbba.",
      "aaaaaaaaaaaa",
      ".acccccccca.",
      ".acdccccdca.",
      ".acccaaccca.",
      ".acccaeacca.",
      ".acccaaacca.",
      ".aaaaaaaaaa."
    ]
  },
  "keyboard": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#0b0b10",
      "b": "#e4e4e7",
      "c": "#7c3aed"
    },
    "rows": [
      "............",
      "............",
      "............",
      "aaaaaaaaaaaa",
      "abcbcbcbcbca",
      "acbcbcbcbcba",
      "abcbcbcbcbca",
      "accbbbbbbcca",
      "aaaaaaaaaaaa",
      "............",
      "............",
      "............"
    ]
  },
  "vest": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#0f172a",
      "b": "#1e40af",
      "c": "#93c5fd"
    },
    "rows": [
      "...a....a...",
      "..aba..aba..",
      ".abbbaabbba.",
      "abbbbbbbbbba",
      "abbcbbbbcbba",
      "abbbbaabbbba",
      "abbcbaabcbba",
      "abbbbaabbbba",
      "abbbbaabbbba",
      "abbbbaabbbba",
      "aaaaaaaaaaaa",
      "............"
    ]
  },
  "ticket": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#4c0519",
      "b": "#f43f5e",
      "c": "#fff1f2"
    },
    "rows": [
      "............",
      "............",
      "aaaaaaaaaaaa",
      "abbbbabbbbba",
      "abccbabbcbba",
      ".abbb.bbbba.",
      ".abbbabbcba.",
      "abccbabbbbba",
      "abbbbabbbbba",
      "aaaaaaaaaaaa",
      "............",
      "............"
    ]
  },
  "chair": {
    "w": 12,
    "h": 12,
    "palette": {
      "a": "#052e16",
      "b": "#16a34a",
      "c": "#86efac"
    },
    "rows": [
      "..aaaaaaaa..",
      "..abbbbbba..",
      "..abcbbbba..",
      "..abbbbbba..",
      "aaaaaaaaaaaa",
      "abbbbbbbbbba",
      "aaaaaaaaaaaa",
      "..a......a..",
      "...a....a...",
      "....a..a....",
      "...a.aa.a...",
      "..a......a.."
    ]
  }
};
export const SOURCE_PIXEL_HASHES:Record<string,string> = {
  "char0": "09c561a4633b689626484449d29c10f7939347486ebfebf3405c34aaa7d141f0",
  "char1": "44572c54327459b2718077511c87dfd8630bcb48b5b4e4603ad58d43d9d366c9",
  "char2": "c9a1a97f24e9dbae6a248c4842164dbfc08a79f308483bb814e647b2faf5234d",
  "char3": "422d48f7ab551bc6c3debf487276c4efb8c759e66f521d607f1e9e6a9297e9cd",
  "char4": "7b44bbc292711ad013fd2db842f1efd827e1737ee5bf4e2dbefd33572bbfac73",
  "char5": "186edbaefe381390c25c185d2ef33ec057caa8c1aaba7cb044c952bb54877a88",
  "head0": "9a98511bdd5e5244b5a4b55e981806de4289ef52db90d64cc827aebca605d011",
  "head1": "8379531eb76693cf1f527710ad775ee2d9f54613fa47b25fd0d67dd4b7e3b16e",
  "head2": "222eefe7c6255917c4cab2f46a700acbd2f5dd70ec4f13d3acfa3c42b7a25393",
  "head3": "cde5638cd743527a09cf6b0c4fb2c950a12999f95bfc53e4748d1a6058fd34f5",
  "head4": "855e8f80d8dd617810902ad20af94125a0dfb0e85e72c8998c795fef64fcba7f",
  "head5": "6ce11f83abe58d12747f114d485d8f1621fef9f1c8f003f869532a17c256989a",
  "coin": "429b28fa57d7db52ae95fc9413567aecfcbebc36cc38e99348312bcf884b7ea5",
  "gem": "92e1e41e260e511817950c475c59c3353e7516e813bdd200ef2e7a4e7d698da6",
  "star": "e24ad650a37ba1c91c80169a29688136950b7f3b3bec10b1d55d43cbc6163211",
  "scroll": "9d72cc461533786a65098e74e6da5737205c12c18a09f77338d9889997d645b4",
  "slime": "87fbc8d9e0cc255881cb17c34730e2a3c4000ac21f821dd2f4d74a364da7b9fa",
  "monitor": "70677ae4883de32a886066e108c8ebfe6f62b6dd6b79a627fecad07044f74f9b",
  "mug": "1503088a7eddd6a0288b87ad9d84e6a83830206a7353899d84ee8b55ce6b6fa4",
  "book": "26e8e68ea1f969d763a9e050615b6c427049749a64c478ba1a800ec7a8c0b9e2",
  "pad": "a7e728d1521cdceb7a8f34aed698c3eab9818acd2bfad8ac5606ec536667b585",
  "house": "e31b202bfbb8f73a17eeec82d2f48cffed79df7919070626538dbbb863a3d6be",
  "keyboard": "b998ff5ae1a110b586769b22a6429741b515ba810bae8820dd716c158896a1d1",
  "vest": "d2659b8485b63c926bd59475556aebc0c670bb9a5362cb3757f687119aa462d1",
  "ticket": "b1287189e05731aedf9789e8ca2ddfe6ac5f111a1b2ecdeacc7c49904a9464c7",
  "chair": "4a5a4f17e5461dde5aa3f5cae2c7def79344258c8a263f549bcfcd7ca29fb1b9"
};
export function getSprite(name='character',tier:TierKey='bronze'):Sprite {const index=TIER_ORDER.indexOf(tier);const key=name==='character'?'char'+index:name==='head'?'head'+index:name;return SPRITES[key]??SPRITES.char0!;}
export function spritePixels(sprite:Sprite):string {return sprite.rows.map(row=>[...row].map(k=>k==='.'?'transparent':sprite.palette[k]).join(',')).join('\n');}
export function drawSprite(ctx:CanvasRenderingContext2D,sprite:Sprite,x=0,y=0,scale=1):void {ctx.imageSmoothingEnabled=false;sprite.rows.forEach((row,yy)=>[...row].forEach((key,xx)=>{if(key!=='.'){ctx.fillStyle=sprite.palette[key]!;ctx.fillRect(x+xx*scale,y+yy*scale,scale,scale);}}));}
