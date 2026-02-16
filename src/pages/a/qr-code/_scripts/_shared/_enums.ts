export enum QRVersion {
	Auto = 'auto',
	v1 = '1',
	v2 = '2',
	v3 = '3',
	v4 = '4',
	v5 = '5',
	v6 = '6',
	v7 = '7',
	v8 = '8',
	v9 = '9',
	v10 = '10',
	v11 = '11',
	v12 = '12',
	v13 = '13',
	v14 = '14',
	v15 = '15',
	v16 = '16',
	v17 = '17',
	v18 = '18',
	v19 = '19',
	v20 = '20',
	v21 = '21',
	v22 = '22',
	v23 = '23',
	v24 = '24',
	v25 = '25',
	v26 = '26',
	v27 = '27',
	v28 = '28',
	v29 = '29',
	v30 = '30',
	v31 = '31',
	v32 = '32',
	v33 = '33',
	v34 = '34',
	v35 = '35',
	v36 = '36',
	v37 = '37',
	v38 = '38',
	v39 = '39',
	v40 = '40',
}

export enum ErrorCorrectionLevel {
	Low = 'L',
	Medium = 'M',
	Quartile = 'Q',
	High = 'H'
}

export enum EncodingMode {
	Auto = 'Auto',
	Numeric = 'numeric',
	Alphanumeric = 'alphanumeric',
	Byte = 'byte',
	Kanji = 'kanji'
}

export enum Pages {
	Generate = 'generate',
	Scan = 'scan'
}