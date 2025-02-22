// types/index.ts

export interface Chapter {
  id: string;
  title: string;
}

export interface Translation {
  id: string;
  title: string;
}

export interface AlignedContent {
  id: string;
  text: string;
  target?: string;
  targetEnd?: string;
}

export interface AlignedSegment {
  source_text: string;
  translation_text: string;
  start_id?: string;
  end_id?: string;
}

export interface ChapterSelectorProps {
  chapters: Chapter[];
  selectedChapter: Chapter | null;
  onChange: (chapter: Chapter) => void;  // Changed from onChapterSelect to onChange
}
