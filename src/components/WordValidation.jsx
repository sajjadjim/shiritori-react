import React from 'react';

export function WordValidation({ wordDetails }) {
  // Ensure wordDetails is defined and has the properties we're expecting
  if (!wordDetails) {
    return (
      <div className="text-red-500">
        No word details available. Please submit a valid word.
      </div>
    );
  }

  const { word, definition, phonetic, origin } = wordDetails;

  // Render the word details (only if they are available)
  return (
    <section className="text-white mt-4">
      {/* Display the word */}
      <div className="text-2xl font-bold mb-3">
        <span className="text-white">Word:</span> <span className="text-yellow-400">{word}</span>
      </div>

      {/* Display word details */}
      {definition ? (
        <>
          <h3 className="text-xl font-semibold mb-2">Word Details</h3>
          <p><strong>Definition:</strong> {definition}</p>
          <p><strong>Phonetic:</strong> {phonetic || "No phonetic available"}</p>
          <p><strong>Origin:</strong> {origin || "No origin available"}</p>
        </>
      ) : (
        <div className="text-red-500">Word not found in dictionary.</div>
      )}
    </section>
  );
}
