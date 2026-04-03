export function createId() {
  return Date.now().toString();
}

export function notFound(message: string) {
  return {
    error: message
  };
}
