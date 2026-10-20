import { TextField, type TextFieldProps } from './TextField'

/** Search input: magnifier icon, `type="search"`, filled by default. */
export function SearchField({ variant = 'filled', ...rest }: Omit<TextFieldProps, 'icon' | 'type'>) {
  return <TextField icon="search" type="search" variant={variant} {...rest} />
}
