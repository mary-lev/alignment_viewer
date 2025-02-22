"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Loader2 } from 'lucide-react';
import {
  AVAILABLE_CHAPTERS,
  loadTEIContent,
  extractSourceTextFromTEI,
  parseTranslationNotes,
  createFastTextExtractor
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

  const [sourceExtractor, setSourceExtractor] = useState<((start: string, end: string) => string) | null>(null);

  const loadContent = async (chapterId: string) => {
    setIsLoading(true);
    setError('');

    try {
      const view = AVAILABLE_VIEWS.find(v => v.id === selectedView);
      if (!view) throw new Error('Invalid view selection');

      // Load files in parallel
      const [sourceXML, translationXML] = await Promise.all([
        loadTEIContent(chapterId),
        loadTEIContent(chapterId, view.folder)
      ]);

      // Create fast extractor
      const extractor = createFastTextExtractor(sourceXML);
      setSourceExtractor(extractor);

      // Parse translation notes
      const translationNotes = parseTranslationNotes(translationXML);

      // Process segments in chunks to avoid blocking
      const chunkSize = 50;
      const alignedSegments: Array<{
        sourceText: string;
        translationText: string;
        ids: { start: string; end: string };
      }> = [];

      for (let i = 0; i < translationNotes.length; i += chunkSize) {
        const chunk = translationNotes.slice(i, i + chunkSize);

        // Process chunk
        const processedChunk = chunk.map(note => {
          const [, startId] = note.target.split('#');
          const [, endId] = note.targetEnd.split('#');

          return {
            sourceText: extractor(startId, endId),
            translationText: note.text,
            ids: { start: startId, end: endId }
          };
        });

        // Update state with chunk
        alignedSegments.push(...processedChunk);

        // Allow UI to update
        if (i + chunkSize < translationNotes.length) {
          setAlignedContent([...alignedSegments]);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      setAlignedContent(alignedSegments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading content');
    } finally {
      setIsLoading(false);
    }
  };

  // Add progressive loading indicator
  const [progress, setProgress] = useState(0);


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
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <div className="mt-4">
                  Processing segments: {progress}%
                </div>
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
                      className={`hover:bg-accent/5 border-accent/30 ${
                        !segment.sourceText
                          ? 'bg-blue-50/80'     // Insertion
                          : !segment.translationText
                          ? 'bg-amber-50/80'    // Omission
                          : ''
                      }`}
                    >
                      <td 
                        className={`px-4 py-3 align-top border-r border-accent/30 ${
                          !segment.sourceText 
                            ? 'italic text-accent/70 border-l-4 border-blue-300' 
                            : ''
                        }`}
                      >
                        <div className="text-secondary-foreground relative">
                          {segment.sourceText || (
                            <span className="text-blue-600/70">
                       
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-accent/60 mt-2 font-mono">
                          IDs: {segment.ids.start} - {segment.ids.end}
                        </div>
                      </td>
                      <td 
                        className={`px-4 py-3 align-top ${
                          !segment.translationText 
                            ? 'italic text-accent/70 border-l-4 border-amber-300' 
                            : ''
                        }`}
                      >
                        {segment.translationText || (
                          <span className="text-amber-600/70">
                      
                          </span>
                        )}
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