export const DELETE_ACCOUNT_CONFIRMATION = "DELETE";

export function isDeleteAccountConfirmation(value: FormDataEntryValue | null) {
  return value === DELETE_ACCOUNT_CONFIRMATION;
}
