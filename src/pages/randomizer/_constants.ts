import { _string, _words, _numbers, _colors, _selection, _teams } from "@/constants/string";
import { RandomizerType } from "./_enums";

export const
    ANIMALS = [ "Lion", "Elephant", "Tiger", "Bear", "Wolf", "Gorilla", "Chimpanzee", "Orangutan", "Dolphin", "Whale", "Zebra", "Giraffe", "Kangaroo", "Koala", "Panda", "Snake", "Eagle", "Owl", "Parrot", "Komodo", "Anoa", ],
    COLORS = [ "Red", "Green", "Blue", "Yellow", "Purple", "Orange", "Pink", "Black", "White", "Gray" ],
    TEAMS_NAMES = [ 'Alpha', 'Beta', 'Delta' ],
    PERSON_NAMES = [ "Alice", "Bob", "Charlie", "David", "Emily", "Frank", "Grace", "Henry", "Isabella", "Jack", "Kevin", "Lily", "Michael", "Noah", "Olivia", "Peter", "Sophia", "William", "Ava", "Charlotte", "James", "Luna", "Mia", "Owen", "Sophia" ],
    LOREM_IPSUM = [ 'Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet', 'Consectetur', 'Adipiscing', 'Elit', 'Sed', 'Do', 'Eiusmod', 'Tempor', 'Incididunt', 'Ut', 'Labore', 'Et', 'Dolore', 'Magna', 'Aliqua', 'Enim', 'Ad', 'Minim', 'Veniam', 'Quis', 'Nostrud', 'Exercitation', 'Ullamco', 'Laboris', 'Nisi', 'Aliquip', 'Ex', 'Ea', 'Commodo', 'Consequat', 'Duis', 'Aute', 'Irure', 'In', 'Reprehenderit', 'Voluptate', 'Velit', 'Esse', 'Cillum', 'Eu', 'Fugiat', 'Nulla', 'Pariatur', 'Excepteur', 'Sint', 'Occaecat', 'Cupidatat', 'Non', 'Proident', 'Sunt', 'Culpa', 'Qui', 'Officia', 'Deserunt', 'Mollit', 'Anim', 'Id', 'Est', 'Laborum' ],
    SIZE_SIDE_NAVIGATION_NONE = 640,
    RANDOMIZER_TYPES = [
        { icon: 0xF155, type: RandomizerType[_string], text: 'String' },
        { icon: 0xE4AE, type: RandomizerType[_words], text: 'Words' },
        { icon: 0xEB49, type: RandomizerType[_numbers], text: 'Numbers' },
        { icon: 0xE4B6, type: RandomizerType[_colors], text: 'Colors' },
        { icon: 0xF098, type: RandomizerType[_selection], text: 'Selection' },
        { icon: 0xEBC6, type: RandomizerType[_teams], text: 'Teams' },
    ],
    DEFAULT_LISTS = [
        { id: 1, name: 'Person'     , items: [...PERSON_NAMES] },
        { id: 2, name: 'Teams'      , items: [...TEAMS_NAMES ] },
        { id: 3, name: 'Colors'     , items: [...COLORS      ] },
        { id: 4, name: 'Animals'    , items: [...ANIMALS     ] },
        { id: 5, name: 'Lorem Ipsum', items: [...LOREM_IPSUM ] },
    ]
;
