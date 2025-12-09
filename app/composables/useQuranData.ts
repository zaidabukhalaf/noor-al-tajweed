/**
 * useQuranData Composable
 *
 * Handles loading and accessing Qur'an text from static JSON.
 * The text is NEVER modified - all highlighting is done via CSS.
 */

import type { Surah, Ayah, WordToken } from "~/types";
import quranData from "~/data/quran-subset.json";

export function useQuranData() {
  // Load surahs from static JSON
  const surahs = ref<Surah[]>(quranData.surahs as Surah[]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Get a surah by its number
   */
  function getSurah(surahNumber: number): Surah | undefined {
    return surahs.value.find((s) => s.number === surahNumber);
  }

  /**
   * Get a specific ayah from a surah
   */
  function getAyah(surahNumber: number, ayahNumber: number): Ayah | undefined {
    const surah = getSurah(surahNumber);
    if (!surah) return undefined;
    return surah.ayat.find((a) => a.number === ayahNumber);
  }

  /**
   * Get all ayat for a surah
   */
  function getAyat(surahNumber: number): Ayah[] {
    const surah = getSurah(surahNumber);
    return surah?.ayat ?? [];
  }

  /**
   * Get ayat within a specific range
   */
  function getAyatRange(
    surahNumber: number,
    startAyah: number,
    endAyah: number
  ): Ayah[] {
    const surah = getSurah(surahNumber);
    if (!surah) return [];
    return surah.ayat.filter(
      (a) => a.number >= startAyah && a.number <= endAyah
    );
  }

  /**
   * Tokenize an ayah's text into individual words
   *
   * CRITICAL: This preserves EXACT whitespace from the original text.
   * Each token includes its trailing whitespace (if any) so that when
   * all tokens are concatenated, the result is identical to the original.
   *
   * This ensures that wrapping words in <span> elements does NOT change
   * the visual rendering of the Qur'an text.
   */
  function tokenizeAyah(text: string): WordToken[] {
    const tokens: WordToken[] = [];

    // Use regex to match word + following whitespace as a single unit
    // This preserves exact spacing when rendering with spans
    const regex = /(\S+)(\s*)/g;
    let match;
    let index = 0;

    while ((match = regex.exec(text)) !== null) {
      const word = match[1]; // The word itself
      const trailingSpace = match[2]; // Any trailing whitespace
      const fullToken = match[0]; // Word + whitespace

      tokens.push({
        index,
        word,
        // Include trailing space in the display text
        // This ensures exact spacing is preserved
        displayText: fullToken,
        startOffset: match.index,
        endOffset: match.index + fullToken.length,
      });

      index++;
    }

    return tokens;
  }

  /**
   * Get the word at a specific index in an ayah
   */
  function getWordAtIndex(
    ayahText: string,
    wordIndex: number
  ): string | undefined {
    const tokens = tokenizeAyah(ayahText);
    return tokens[wordIndex]?.word;
  }

  /**
   * Count words in an ayah
   */
  function countWords(ayahText: string): number {
    return tokenizeAyah(ayahText).length;
  }

  /**
   * Get a list of surah names for selection UI
   */
  const surahList = computed(() => {
    return surahs.value.map((s) => ({
      number: s.number,
      name: s.name,
      nameArabic: s.nameArabic,
      ayahCount: s.ayahCount,
    }));
  });

  return {
    // Data
    surahs: readonly(surahs),
    surahList,
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Methods
    getSurah,
    getAyah,
    getAyat,
    getAyatRange,
    tokenizeAyah,
    getWordAtIndex,
    countWords,
  };
}
