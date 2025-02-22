"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Loader2 } from 'lucide-react';
import {
  AVAILABLE_CHAPTERS,
  loadTEIContent,
  extractSourceTextFromTEI,
  parseTranslationNotes
} from '../utils/teiLoader';

const AVAILABLE_VIEWS = [
  {
    id: 'Russian_1854_sentence',
    title: 'Russian (1854) - Sentence Level',
    folder: 'Russian_1854'
  },
  {
    id: 'Russian_1854_segment',
    title: 'Russian (1854) - Segment Level',
    folder: 'Russian_1854_segments'
  }
  // Easy to add more translations in the future:
  // { 
  //   id: 'French_1850_sentence',
  //   title: 'French (1850) - Sentence Level',
  //   folder: 'French_1850'
  // }
];

const DEFAULT_VIEW = 'Russian_1854_segment';


const SimplifiedAligner = () => {
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedView, setSelectedView] = useState(DEFAULT_VIEW);

  const [alignedContent, setAlignedContent] = useState<Array<{
    sourceText: string;
    translationText: string;
    ids: { start: string; end: string };
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadContent = async (chapterId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const view = AVAILABLE_VIEWS.find(v => v.id === selectedView);
      if (!view) throw new Error('Invalid view selection');

      // Load both source and translation files
      const [sourceXML, translationXML] = await Promise.all([
        loadTEIContent(chapterId),
        loadTEIContent(chapterId, view.folder)
      ]);

      // Parse translation notes
      const translationNotes = parseTranslationNotes(translationXML);

      // For each translation note, extract corresponding source text
      const alignedSegments = translationNotes.map(note => {
        // Extract IDs from target attributes
        const [, startId] = note.target.split('#');
        const [, endId] = note.targetEnd.split('#');

        const sourceText = extractSourceTextFromTEI(sourceXML, startId, endId);

        return {
          sourceText,
          translationText: note.text,
          ids: {
            start: startId,
            end: endId
          }
        };
      });

      setAlignedContent(alignedSegments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading content');
      console.error('Error loading content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChapter) {
      loadContent(selectedChapter);
    }
  }, [selectedChapter, selectedView]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e9] to-[#f0e8d5] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="bg-white shadow-lg rounded-lg">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl font-bold">Translation Viewer</CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <Select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-[200px]"
              >
                <option value="">Select chapter</option>
                {AVAILABLE_CHAPTERS.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.title}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedView}
                onChange={(e) => setSelectedView(e.target.value)}
                className="w-[300px]"
              >
                {AVAILABLE_VIEWS.map(view => (
                  <option key={view.id} value={view.id}>
                    {view.title}
                  </option>
                ))}
              </Select>
            </div>

            {error && (
              <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : (
              <div className="border border-accent/30 rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-accent/5">
                    <tr>
                      <th className="px-4 py-2 text-left text-primary font-semibold w-1/2">Source</th>
                      <th className="px-4 py-2 text-left text-primary font-semibold w-1/2">Translation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent/30">
                    {alignedContent.map((segment, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-accent/5 ${!segment.sourceText || !segment.translationText
                          ? 'bg-yellow-50/50'
                          : ''
                          }`}
                      >
                        <td className={`px-4 py-3 align-top ${!segment.sourceText ? 'italic text-accent/70' : ''}`}>
                          <div className="text-secondary-foreground">
                            {segment.sourceText || ''}
                          </div>
                          <div className="text-xs text-accent/60 mt-2 font-mono">
                            IDs: {segment.ids.start} - {segment.ids.end}
                          </div>
                        </td>
                        <td className={`px-4 py-3 align-top text-secondary-foreground ${!segment.translationText ? 'italic text-accent/70' : ''}`}>
                          {segment.translationText || ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimplifiedAligner;