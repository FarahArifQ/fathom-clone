export class SummaryError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}
