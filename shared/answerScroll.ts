/** The newest turn added since the previous render. */
export function latestNewTurnId(
  turns: readonly { id: string }[],
  knownIds: ReadonlySet<string>,
): string | undefined {
  for (let index = turns.length - 1; index >= 0; index--) {
    if (!knownIds.has(turns[index].id)) return turns[index].id;
  }
  return undefined;
}

/** Convert a turn's viewport position into the scroll container's target top. */
export function scrollTopForTurn(
  currentScrollTop: number,
  containerTop: number,
  turnTop: number,
): number {
  return Math.max(0, currentScrollTop + turnTop - containerTop);
}
