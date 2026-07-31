/**
 * Helper to download an array of objects as a CSV file.
 * @param {Array} rows - Array of objects representing the rows.
 * @param {String} filename - Name of the output CSV file.
 */
export function exportToCSV(rows, filename) {
  if (!rows || !rows.length) return;

  // Extract headers
  const headers = Object.keys(rows[0]);
  
  // Format rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(fieldName => {
        let val = row[fieldName] ?? '';
        // Escape quotes
        val = String(val).replace(/"/g, '""');
        // Wrap in quotes if it contains comma, quote, or newline
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      }).join(',')
    )
  ].join('\n');

  // Create a Blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  a.style.visibility = 'hidden';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
