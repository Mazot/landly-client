/**
 * Length in Unicode code points — how landly-server counts (`chars().count()`) every
 * `*_MAX_CHARS` limit. Not `value.length`: UTF-16 counts an emoji as 2.
 */
export const charCount = (value: string) => [...value].length

/** The first word of a name ("Daria Kuznetsova" → "Daria"): how people talk about someone they know. */
export const firstName = (name: string) => name.trim().match(/^\S*/)![0]
