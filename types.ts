
export interface BibleBook {
  name: string;
  id: string;
  chapters: number;
  testament: 'Velho' | 'Novo';
}

export interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleApiResponse {
  reference: string;
  verses: Verse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface Explanation {
  historicalContext: string;
  linguisticInsights: string;
  spiritualMeaning: string;
  practicalApplication: string;
}
