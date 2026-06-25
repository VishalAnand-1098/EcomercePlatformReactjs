import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div',
  'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style'];

const ProductDescription = ({ html }) => {
  if (!html) return null;

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

  return (
    <div
      className="product-description text-gray-700 leading-relaxed prose prose-sm max-w-none
        [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
        [&_li]:mb-1 [&_strong]:font-semibold [&_b]:font-semibold
        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
        [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800
        [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:p-2 [&_td]:border [&_td]:p-2"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default ProductDescription;
