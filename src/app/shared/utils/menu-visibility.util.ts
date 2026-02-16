export type HasDirection = { direction?: number | null };

/**
 * Règle existante :
 * - dir === 0 => voit tout
 * - item.direction === dir => voit
 * - item.direction === 0 => visible pour tous
 * - si direction non renseignée => on considère visible (optionnel)
 */
export function filterByDirection<T extends HasDirection>(
  items: T[] | null | undefined,
  dir: number | null | undefined
): T[] {
  return (items || []).filter((sm: any) =>
    dir === 0 || sm.direction === dir || sm.direction === 0 || sm.direction === null
  );
}
