export interface ExpireStore {
  expirePastDeadlines(asOf: Date): Promise<number>;
}

export async function expirePastDeadlines(
  store: ExpireStore,
  asOf: Date = new Date(),
): Promise<number> {
  return store.expirePastDeadlines(asOf);
}
