/**
 * Converts Markdown text to HTML with custom styling
 * Handles tables, headings, bold/italic text, and paragraphs
 * @param {string} text - Raw markdown text
 * @returns {string} HTML string with Tailwind classes
 */
export const convertMarkdownToHTML = (text) => {
  // First, handle markdown tables
  const processedText = text.replace(/(\|.*\|.*\n)+/g, (match) => {
    const lines = match.trim().split('\n');
    if (lines.length < 2) return match;
    
    // Skip separator line (contains :--- or similar)
    const headerLine = lines[0];
    const dataLines = lines.slice(1).filter(line => !line.includes('---'));
    
    if (dataLines.length === 0) return match;
    
    // Parse header
    const headers = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell);
    
    // Parse data rows
    const rows = dataLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    );
    
    // Generate HTML table
    let tableHTML = '<table class="recipe-table mb-6">';
    
    if (headers.length > 0) {
      tableHTML += '<thead><tr>';
      headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
      });
      tableHTML += '</tr></thead>';
    }
    
    tableHTML += '<tbody>';
    rows.forEach(row => {
      tableHTML += '<tr>';
      row.forEach(cell => {
        tableHTML += `<td>${cell}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';
    
    return tableHTML;
  });

  return processedText
    // Remove code block markers
    .replace(/```[\w]*\n?/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Handle horizontal rules
    .replace(/^---$/gim, '<hr class="my-6 border-gray-600">')
    // Handle headings with proper styling
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-blue-300 py-4">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white py-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mt-8 mb-6">$1</h1>')
    // Handle bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-300 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-300 italic">$1</em>')
    // Handle line breaks and paragraphs
    .replace(/\n\n+/g, '</p><p class="mb-4">')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph tags
    .replace(/^/, '<p class="mb-4">')
    .replace(/$/, '</p>')
    // Clean up empty paragraphs and fix table paragraphs
    .replace(/<p[^>]*><\/p>/g, '')
    .replace(/<p[^>]*><br><\/p>/g, '')
    .replace(/<p[^>]*>(<table.*?<\/table>)<\/p>/gs, '$1')
}
