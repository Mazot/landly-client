/**
 * Length in Unicode code points — how landly-server counts (`chars().count()`) every
 * `*_MAX_CHARS` limit. Not `value.length`: UTF-16 counts an emoji as 2.
 */
export const charCount = (value: string) => [...value].length
