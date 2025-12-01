import { CompletionNoteDto } from 'src/api/model/CompletionNoteDto'

/**
 * Remove all data from completion note, that is not required for creating a new completion note
 *
 * @param note - Completion note to copy the data from
 * @returns Cleaned completion note data
 */
export function clearCompletionNote(
  note: CompletionNoteDto
): Partial<CompletionNoteDto> {
  return {
    completed: note.completed,
    target_id: note.target_id
  }
}
