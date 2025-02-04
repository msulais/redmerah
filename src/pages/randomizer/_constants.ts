import { ICON_CODE_TEXT, ICON_COLOR, ICON_NUMBER_ROW, ICON_PEOPLE, ICON_TEXT_BULLET_LIST_SQUARE, ICON_TEXT_NUMBER_FORMAT } from "@/constants/icons";
import { RandomizerType } from "./_enums"

export const
	ANIMALS = [ "Lion", "Elephant", "Tiger", "Bear", "Wolf", "Gorilla", "Chimpanzee", "Orangutan", "Dolphin", "Whale", "Zebra", "Giraffe", "Kangaroo", "Koala", "Panda", "Snake", "Eagle", "Owl", "Parrot", "Komodo", "Anoa", ],
	COLORS = [ "Red", "Green", "Blue", "Yellow", "Purple", "Orange", "Pink", "Black", "White", "Gray" ],
	TEAMS_NAMES = [ 'Alpha', 'Beta', 'Delta' ],
	PERSON_NAMES = [ "Alice", "Bob", "Charlie", "David", "Emily", "Frank", "Grace", "Henry", "Isabella", "Jack", "Kevin", "Lily", "Michael", "Noah", "Olivia", "Peter", "Sophia", "William", "Ava", "Charlotte", "James", "Luna", "Mia", "Owen", "Sophia" ],
	LOREM_IPSUM = [ 'Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet', 'Consectetur', 'Adipiscing', 'Elit', 'Sed', 'Do', 'Eiusmod', 'Tempor', 'Incididunt', 'Ut', 'Labore', 'Et', 'Dolore', 'Magna', 'Aliqua', 'Enim', 'Ad', 'Minim', 'Veniam', 'Quis', 'Nostrud', 'Exercitation', 'Ullamco', 'Laboris', 'Nisi', 'Aliquip', 'Ex', 'Ea', 'Commodo', 'Consequat', 'Duis', 'Aute', 'Irure', 'In', 'Reprehenderit', 'Voluptate', 'Velit', 'Esse', 'Cillum', 'Eu', 'Fugiat', 'Nulla', 'Pariatur', 'Excepteur', 'Sint', 'Occaecat', 'Cupidatat', 'Non', 'Proident', 'Sunt', 'Culpa', 'Qui', 'Officia', 'Deserunt', 'Mollit', 'Anim', 'Id', 'Est', 'Laborum' ],
	SIZE_SIDE_NAVIGATION_NONE = 640,
	RANDOMIZER_TYPES = [
		{ icon: ICON_TEXT_NUMBER_FORMAT, type: RandomizerType.string, text: 'String' },
		{ icon: ICON_CODE_TEXT, type: RandomizerType.words, text: 'Words' },
		{ icon: ICON_NUMBER_ROW, type: RandomizerType.numbers, text: 'Numbers' },
		{ icon: ICON_COLOR, type: RandomizerType.colors, text: 'Colors' },
		{ icon: ICON_TEXT_BULLET_LIST_SQUARE, type: RandomizerType.selection, text: 'Selection' },
		{ icon: ICON_PEOPLE, type: RandomizerType.teams, text: 'Teams' },
	],
	DEFAULT_LISTS = [
		{ id: 1, name: 'Person'     , items: [...PERSON_NAMES] },
		{ id: 2, name: 'Teams'      , items: [...TEAMS_NAMES ] },
		{ id: 3, name: 'Colors'     , items: [...COLORS      ] },
		{ id: 4, name: 'Animals'    , items: [...ANIMALS     ] },
		{ id: 5, name: 'Lorem Ipsum', items: [...LOREM_IPSUM ] },
	]
;
