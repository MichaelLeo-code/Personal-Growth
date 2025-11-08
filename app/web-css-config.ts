export const webCssConfig = `
        *, *::before, *::after {
          touch-action: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-text-size-adjust: none !important;
          -moz-text-size-adjust: none !important;
          -ms-text-size-adjust: none !important;
          text-size-adjust: none !important;
          pointer-events: auto !important;
        }
        
        body, html {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          overflow: hidden !important;
        }

        input, textarea {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
        }

        /* Prevent image dragging which can interfere with cell dragging */
        img {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
        }

        /* Ensure dragging doesn't get stuck */
        * {
          -webkit-user-drag: none !important;
          -moz-user-drag: none !important;
          user-drag: none !important;
        }

        /* Prevent context menu during long press/drag */
        .cell-container, .cell-grid-container {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }

        /* Ensure smooth dragging performance */
        .cell-grid-container {
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000;
        }
      `;