/** A submission failure whose message is safe to display to the user. */
class FormSubmissionError extends Error {
  public override name = "FormSubmissionError";
}

export { FormSubmissionError };
