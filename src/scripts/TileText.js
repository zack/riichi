// 0 is the red five
export const RED_FIVE = '0';

export function getTileTextClass(text) {
  const classNames = ['tile-text'];
  if (text.startsWith(RED_FIVE)) {
    classNames.push('red');
  }
  if ([...text].length === 1) {
    classNames.push('single');
  }

  return classNames.join(' ');
}
