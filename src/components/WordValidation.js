export function WordValidation({ wordDetails }) {
  return (
    <section>
      <h3>Word Details</h3>
      <p><strong>Definition:</strong> {wordDetails.definition}</p>
      <p><strong>Phonetic:</strong> {wordDetails.phonetic}</p>
      <p><strong>Origin:</strong> {wordDetails.origin}</p>
    </section>
  );
}
