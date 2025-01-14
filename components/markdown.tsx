'use client'; // If you're on Next.js 13+ App Router
import Link from 'next/link';
import React, { memo, useState, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImageGallery, { ReactImageGalleryItem } from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';


interface GalleryImage {
  original: string;
  thumbnail: string;
}


const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  /**
   * We collect image URLs from the Markdown:
   */
  const [images, setImages] = useState<string[]>([]);

  /**
   * Track whether react-image-gallery is in fullscreen mode
   */
  const [inFullscreen, setInFullscreen] = useState(false);

  /**
   * Our custom <img> for react-markdown:
   *  - Adds the image's URL to `images` state if not already there
   *  - Renders inline if you want (or return null if you don't)
   */
  function MarkdownImage({
    src = ''
  }: React.ImgHTMLAttributes<HTMLImageElement>) {
    useEffect(() => {
      if (!src) return;
      setImages((prev) => {
        if (prev.includes(src)) return prev;
        return [...prev, src];
      });
    }, [src]);

    return null
  }


  /**
   * Custom components for react-markdown
   */
  const components: Partial<Components> = {
    pre: ({ children }) => <>{children}</>,
    ol: ({ node, children, ...props }) => (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }) => (
      <li className="py-1" {...props}>
        {children}
      </li>
    ),
    ul: ({ node, children, ...props }) => (
      <ul className="list-disc list-outside ml-4" {...props}>
        {children}
      </ul>
    ),
    strong: ({ node, children, ...props }) => (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    ),
    a: ({ node, children, ...props }) => (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    ),
    h1: ({ node, children, ...props }) => (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    ),
    // etc...

    // Our custom <img> to gather images
    img: MarkdownImage,
  };

  /**
   * Convert gathered images into gallery items
   */
  const galleryItems: GalleryImage[] = images.map((url) => ({
    original: url,
    thumbnail: url,
  }));

  /**
   * Called by react-image-gallery when fullscreen changes
   */
  const handleScreenChange = (isFullscreen: boolean) => {
    setInFullscreen(isFullscreen);
  };

  /**
   * We'll conditionally style images differently in normal vs. fullscreen mode.
   * - Non-fullscreen: fixed height (300px), objectFit: 'contain'
   * - Fullscreen: fill the entire screen, but still objectFit: 'contain' to keep aspect ratio
   */
  const renderItem = (item: ReactImageGalleryItem) => {
    if (inFullscreen) {
      // Fullscreen: fill the browser viewport, keep aspect ratio (with letterboxing)
      return (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
          }}
        >
          <img
            src={item.original}
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
            }}
            alt=""
          />
        </div>
      );
    }

    // Normal (non-fullscreen) display:
    return (
      <div style={{ width: '100%', backgroundColor: 'black' }}>
        <img
          src={item.original}
          style={{
            width: '100%',      // Instead of width: 'auto'
            height: '300px',
            objectFit: 'contain'
          }}
          alt=""
        />
      </div>
    );
  };


  return (
    <div dir="auto" style={{ width: '100%' }}>
      {/* Render Markdown with custom image collection */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>

      {/* If images found, show gallery below */}
      {galleryItems.length > 0 && (
        <div className="mt-8">
          <ImageGallery
            items={galleryItems}
            renderItem={renderItem}
            onScreenChange={handleScreenChange}
            showPlayButton={false}
            /**
             * Only show the small strip of thumbnails
             * ("appendix") in fullscreen
             */
            showThumbnails={false}
            showFullscreenButton={true}
            /**
             * Position the thumbnails at the bottom
             * (the default) and size them smaller
             */
            thumbnailPosition="bottom"
          />

    </div>)}
    </div>
  )
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
