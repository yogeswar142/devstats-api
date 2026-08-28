export interface BaseProvider<T> {
  readonly name: string;
  fetchStats(username?: string): Promise<T>;
}
