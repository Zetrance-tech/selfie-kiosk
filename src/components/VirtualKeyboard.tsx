import React from 'react';

    interface VirtualKeyboardProps {
      onKeyPress: (key: string) => void;
      onBackspace: () => void;
    }

    const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ onKeyPress, onBackspace }) => {
      const keys = [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '@', '.'],
        ['Backspace', 'Space'], // Removed 'Enter'
      ];

      return (
        <div className="bg-gray-800 p-4 rounded-t-lg shadow-inner">
          {keys.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-2 my-2">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'Backspace') {
                      onBackspace();
                    } else if (key === 'Space') {
                      onKeyPress(' ');
                    } else {
                      onKeyPress(key);
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-gray-700 text-amber-300 rounded-lg text-xl font-semibold uppercase hover:bg-gray-600 transition-colors duration-200"
                  style={{
                    minWidth: key === 'Backspace' ? '120px' : 'auto',
                    maxWidth: key === 'Space' ? '360px' : 'auto'
                  }}
                >
                  {key === 'Backspace' ? '⌫' : key === 'Space' ? ' ' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      );
    };

    export default VirtualKeyboard;
