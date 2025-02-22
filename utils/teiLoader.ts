// utils/teiLoader.ts
import { Chapter, AlignedContent, AlignedSegment } from "../types/index";

export const AVAILABLE_CHAPTERS: Chapter[] = [
  { id: 'intro', title: 'Introduction' },
  { id: 'cap1', title: 'Chapter 1' },
  { id: 'cap2', title: 'Chapter 2' },
  { id: 'cap3', title: 'Chapter 3' },
  { id: 'cap4', title: 'Chapter 4' },
  { id: 'cap5', title: 'Chapter 5' },
  { id: 'cap6', title: 'Chapter 6' },
  { id: 'cap7', title: 'Chapter 7' },
  { id: 'cap8', title: 'Chapter 8' },
  { id: 'cap9', title: 'Chapter 9' },
  { id: 'cap10', title: 'Chapter 10' },
  { id: 'cap11', title: 'Chapter 11' },
  { id: 'cap12', title: 'Chapter 12' },
  { id: 'cap13', title: 'Chapter 13' },
  { id: 'cap14', title: 'Chapter 14' },
  { id: 'cap15', title: 'Chapter 15' },
  { id: 'cap16', title: 'Chapter 16' },
  { id: 'cap17', title: 'Chapter 17' },
  { id: 'cap18', title: 'Chapter 18' },
  { id: 'cap19', title: 'Chapter 19' },
];

export const AVAILABLE_TRANSLATIONS = [
  { id: 'Russian_1854', title: 'Russian (1854)' },
  { id: 'Russian_1854_segments', title: 'Russian (1854) segments' },
];


export const loadTEIContent = async (
  chapterId: string, 
  folder?: string
): Promise<string> => {
  console.log(chapterId, folder);
  try {
    const response = await fetch(
      folder 
        ? `/data/translations/${folder}/${folder}_${chapterId}.xml`
        : `/data/Ventisettana/${chapterId}.xml`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to load ${folder ? 'translation' : 'source'} TEI file`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error loading TEI file:', error);
    throw error;
  }
};

export const parseTEIContent = (xmlContent: string): AlignedContent[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  // For translation files
  const notes = xmlDoc.getElementsByTagName('note');
  if (notes.length > 0) {
    return Array.from(notes).map(note => ({
      id: note.getAttribute('xml:id') || '',
      text: note.textContent?.trim() || '',
      target: note.getAttribute('target') || '',
      targetEnd: note.getAttribute('targetEnd') || ''
    }));
  }
  
  // For source files
  const segments = xmlDoc.getElementsByTagName('seg');
  return Array.from(segments).map(seg => ({
    id: seg.getAttribute('xml:id') || '',
    text: seg.textContent?.trim() || ''
  }));
};

export const alignContent = (
  sourceContent: AlignedContent[], 
  translationContent: AlignedContent[]
): AlignedSegment[] => {
  return translationContent.map(trans => {
    const sourceSegment = sourceContent.find(src => 
      trans.target?.includes(src.id) || trans.targetEnd?.includes(src.id)
    );
    
    return {
      source_text: sourceSegment?.text || '',
      translation_text: trans.text || '',
      start_id: sourceSegment?.id,
      end_id: sourceSegment?.id
    };
  });
};

export const extractSourceTextFromTEI = (xmlContent: string, targetId: string, targetEndId: string) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Function to get just the numeric part of an ID
    const getNumericId = (id: string): number => {
      const matches = id.match(/(\d+)$/);
      return matches ? parseInt(matches[1]) : NaN;
    };

    // Get numeric IDs for range
    const startNum = getNumericId(targetId);
    const endNum = getNumericId(targetEndId);
    
    if (isNaN(startNum) || isNaN(endNum)) {
      console.error('Invalid ID format:', { targetId, targetEndId });
      return '';
    }
    
    // Function to collect all w elements recursively
    const collectWords = (node: Node): Array<{id: string, text: string}> => {
      const words: Array<{id: string, text: string}> = [];
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        if (element.tagName.toLowerCase() === 'w') {
          const id = element.getAttribute('xml:id');
          if (id) {
            // Get text content including any nested elements
            const text = Array.from(element.childNodes)
              .map(child => child.textContent)
              .join('');
              
            words.push({
              id,
              text: text.trim()
            });
          }
        }
        
        // Process all child nodes recursively
        Array.from(element.childNodes).forEach(child => {
          words.push(...collectWords(child));
        });
      }
      
      return words;
    };

    // Collect and filter words based on numeric IDs
    const selectedWords = collectWords(xmlDoc.documentElement)
      .filter(word => {
        const num = getNumericId(word.id);
        return !isNaN(num) && num >= startNum && num <= endNum;
      })
      .sort((a, b) => getNumericId(a.id) - getNumericId(b.id))
      .map(word => word.text)
      .join(' ');
      
    return selectedWords;
  } catch (error) {
    console.error('Error extracting source text:', error);
    return '';
  }
};

export const parseTranslationNotes = (xmlContent: string) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const notes = xmlDoc.getElementsByTagName('note');
    
    return Array.from(notes).map(note => ({
      text: note.textContent?.trim() || '',
      target: note.getAttribute('target') || '',
      targetEnd: note.getAttribute('targetEnd') || ''
    }));
  } catch (error) {
    console.error('Error parsing translation notes:', error);
    return [];
  }
};