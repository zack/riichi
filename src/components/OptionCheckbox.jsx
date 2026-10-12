import { Checkbox, Flex, Text } from '@radix-ui/themes';

// An option that can't be used is aria-disabled instead of disabled because
// someone tabbing through would never land on it or hear the note that says why
// it's off.
function OptionCheckbox({
  checked,
  id,
  indented,
  label,
  note,
  onChange,
  unavailableNote,
}) {
  const unavailable = unavailableNote !== undefined;
  const descriptionId = `${id}-description`;
  const noteId = `${id}-note`;
  const describedBy = [
    note !== undefined && descriptionId,
    unavailable && noteId,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={indented ? 'option-indented' : undefined}>
      <Text as='label' color={unavailable ? 'gray' : undefined} size='3'>
        <Flex align='center' className='option-row' gap='2'>
          <Checkbox
            aria-describedby={describedBy || undefined}
            aria-disabled={unavailable || undefined}
            checked={checked}
            className={unavailable ? 'option-unavailable' : undefined}
            color={unavailable ? 'gray' : undefined}
            onCheckedChange={(newChecked) => {
              if (!unavailable) {
                onChange(newChecked === true);
              }
            }}
            size='3'
            variant={unavailable ? 'soft' : undefined}
          />
          {label}
        </Flex>
      </Text>
      {note !== undefined && (
        <Text
          as='p'
          className='option-note'
          color='gray'
          id={descriptionId}
          size='2'
        >
          {note}
        </Text>
      )}
      {unavailable && (
        <Text as='p' className='option-note' color='gray' id={noteId} size='2'>
          {unavailableNote}
        </Text>
      )}
    </div>
  );
}

export { OptionCheckbox };
