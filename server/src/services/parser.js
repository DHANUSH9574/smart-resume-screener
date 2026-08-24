import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts plain text from an uploaded file buffer or path
 * @param {Buffer} buffer 
 * @param {string} originalname 
 * @param {string} mimetype 
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(buffer, originalname, mimetype) {
  const ext = path.extname(originalname || '').toLowerCase();

  try {
    if (ext === '.pdf' || mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return cleanExtractedText(data.text);
    } else if (ext === '.docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return cleanExtractedText(result.value);
    } else if (ext === '.doc') {
      // DOC fallback to raw text reading or mammoth
      try {
        const result = await mammoth.extractRawText({ buffer });
        return cleanExtractedText(result.value);
      } catch {
        return cleanExtractedText(buffer.toString('utf8'));
      }
    } else {
      // Default to UTF-8 text (txt, md, rtf)
      return cleanExtractedText(buffer.toString('utf8'));
    }
  } catch (error) {
    console.error(`Error parsing file ${originalname}:`, error);
    // Fallback: extract any printable strings from buffer
    const raw = buffer.toString('utf8');
    return cleanExtractedText(raw);
  }
}

/**
 * Cleans and normalizes extracted text from documents
 * @param {string} text 
 * @returns {string}
 */
export function cleanExtractedText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
