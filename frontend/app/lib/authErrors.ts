const APPLICATION_IDENTITY_REQUIRED_TYPE =
  'urn:matchday:problem:authentication-required';
const APPLICATION_IDENTITY_REQUIRED_TITLE = 'Authentication required';

export function isApplicationIdentityRequiredProblem(
  body: unknown,
): boolean {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const type = 'type' in body ? body.type : undefined;
  const title = 'title' in body ? body.title : undefined;

  return (
    type === APPLICATION_IDENTITY_REQUIRED_TYPE ||
    title === APPLICATION_IDENTITY_REQUIRED_TITLE
  );
}
