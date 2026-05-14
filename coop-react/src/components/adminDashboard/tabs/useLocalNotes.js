import { useCallback, useState } from 'react';

const readNotes = (storageKey) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}');
  } catch {
    return {};
  }
};

export default function useLocalNotes(storageKey) {
  const [notes, setNotes] = useState(() => readNotes(storageKey));

  const updateNote = useCallback((id, value) => {
    setNotes((currentNotes) => {
      const nextNotes = { ...currentNotes, [id]: value };

      if (!value.trim()) {
        delete nextNotes[id];
      }

      localStorage.setItem(storageKey, JSON.stringify(nextNotes));
      return nextNotes;
    });
  }, [storageKey]);

  return { notes, updateNote };
}
