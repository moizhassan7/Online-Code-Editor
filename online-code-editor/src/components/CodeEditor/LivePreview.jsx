import { useEffect, useRef } from 'react';

export default function LivePreview({ html, css, js }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const updatePreview = () => {
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Create complete HTML structure
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>${css}</style>
            </head>
            <body>
              ${html}
              <script>
                try {
                  ${js}
                } catch(error) {
                  console.error('Runtime error:', error);
                }
              </script>
            </body>
          </html>
        `);
        doc.close();
      } catch (error) {
        console.error('Preview update failed:', error);
      }
    };

    const debounceTimer = setTimeout(updatePreview, 300);
    return () => clearTimeout(debounceTimer);
  }, [html, css, js]);

  return (
    <iframe 
      ref={iframeRef}
      title="live-preview"
      className="w-full h-full border-none b-white"
      sandbox="allow-scripts allow-modals allow-same-origin"
    />
  );
}