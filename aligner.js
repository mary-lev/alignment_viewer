import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, AlertCircle } from 'lucide-react';

const TEIAligner = () => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterContent, setChapterContent] = useState(null);
  const [commentsFile, setCommentsFile] = useState(null);
  const [alignedComments, setAlignedComments] = useState([]);
  const [orphanedComments, setOrphanedComments] = useState([]);
  const [error, setError] = useState(null);

  // Load chapter content
  const handleChapterSelect = async (chapter) => {
    try {
      // In real app, this would load from your TEI files
      setSelectedChapter(chapter);
      setChapterContent(`Sample content for chapter ${chapter}`);
    } catch (err) {
      setError("Error loading chapter content");
    }
  };

  // Handle comments file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      setCommentsFile(text);
      // Here we would process the alignment
      processAlignment(text);
    } catch (err) {
      setError("Error processing comments file");
    }
  };

  // Process alignment between chapter and comments
  const processAlignment = (commentsText) => {
    // Placeholder for alignment logic
    // In real app, this would use your Python alignment code
    setAlignedComments([
      {
        text: "Sample text from chapter",
        comment: "This is a comment about that text",
        id: 1
      }
    ]);
    setOrphanedComments([
      {
        text: "Unaligned comment",
        id: 2
      }
    ]);
  };

  // Handle manual alignment
  const handleManualAlign = (commentId, textSelection) => {
    // Logic for manual alignment
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>TEI Comment Aligner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chapter Selection */}
            <div>
              <h3 className="text-lg font-medium mb-2">Select Chapter</h3>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    variant={selectedChapter === num ? "default" : "outline"}
                    onClick={() => handleChapterSelect(num)}
                  >
                    Chapter {num}
                  </Button>
                ))}
              </div>
            </div>

            {/* File Upload */}
            {selectedChapter && (
              <div>
                <h3 className="text-lg font-medium mb-2">Upload Comments File</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="relative">
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      accept=".txt"
                    />
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  {commentsFile && (
                    <span className="text-sm text-green-600 flex items-center">
                      <FileText className="w-4 h-4 mr-1" /> File uploaded
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {alignedComments.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Aligned Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alignedComments.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg">
                  <div className="font-medium text-blue-600">{item.text}</div>
                  <div className="mt-2">{item.comment}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orphaned Comments */}
      {orphanedComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unaligned Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orphanedComments.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg">
                  <div>{item.text}</div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleManualAlign(item.id)}
                  >
                    Align Manually
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TEIAligner;