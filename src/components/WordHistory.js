export function WordHistory({ items }) {
  return (
    <section>
      <h2>Word History</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <span>{item.word}</span> - {item.valid ? 'Valid' : 'Invalid'} - {item.definition}
          </li>
        ))}
      </ul>
    </section>
  );
}
