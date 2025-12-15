/**
 * Display AI explanation as simple paragraphs
 */
export function FormattedAiText({ text }) {
    if (!text) return null;

    // Split by double line breaks for paragraphs
    const paragraphs = text
        .split('\n\n')
        .filter(p => p.trim())
        .map(p => p.trim());

    // Function to parse formatted text (*text* or **text**)
    const parseFormatting = (paragraph) => {
        const parts = [];
        let lastIndex = 0;
        // Match **text** or *text*
        const regex = /(\*{1,2})([^*]+?)\1/g;
        let match;

        while ((match = regex.exec(paragraph)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push({ type: 'text', content: paragraph.slice(lastIndex, match.index) });
            }

            // Add the content inside the stars (without the stars)
            parts.push({ type: 'highlight', content: match[2] });

            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < paragraph.length) {
            parts.push({ type: 'text', content: paragraph.slice(lastIndex) });
        }

        return parts.length > 0 ? parts : [{ type: 'text', content: paragraph }];
    };

    return (
        <div className="space-y-3">
            {paragraphs.map((paragraph, index) => {
                const parts = parseFormatting(paragraph);

                return (
                    <p key={index} className="text-sm text-gray-700 leading-relaxed">
                        {parts.map((part, partIndex) =>
                            part.type === 'highlight' ? (
                                <span key={partIndex} className="font-bold text-violet-800">
                                    {part.content}
                                </span>
                            ) : (
                                <span key={partIndex}>{part.content}</span>
                            )
                        )}
                    </p>
                );
            })}
        </div>
    );
}
