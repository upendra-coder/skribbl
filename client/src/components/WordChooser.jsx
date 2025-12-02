import { useEffect, useState } from "react";

const WordChooser = ({ options, onSelect }) => {
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    // Simple local timer for visuals
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
         style={{ background: "rgba(0,0,0,0.8)", zIndex: 10 }}>
      
      <div className="bg-white p-4 rounded text-center shadow-lg">
        <h3 className="mb-2">Choose a word to draw!</h3>
        
        {/* Visual Countdown */}
        <p className={`fw-bold fs-4 ${timeLeft < 5 ? 'text-danger' : 'text-success'}`}>
           ⏱ {timeLeft}s
        </p>

        <div className="d-flex gap-3 justify-content-center">
          {options.map((word) => (
            <button 
              key={word} 
              className="btn btn-primary btn-lg fw-bold text-uppercase"
              onClick={() => onSelect(word)}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WordChooser;