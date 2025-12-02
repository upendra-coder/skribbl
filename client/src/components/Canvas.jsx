import { useEffect, useCallback } from "react";
import { useDraw } from "../hooks/useDraw";
import socket from "../socket";

const Canvas = ({ roomId, isMyTurn, color, clearTrigger }) => {
  
  const createLine = useCallback(
    ({ prevPoint, currentPoint, ctx }) => {
      if (!isMyTurn) return; 

      socket.emit("draw-line", {
        prevPoint,
        currentPoint,
        color, 
        roomId,
      });

      drawLine({ prevPoint, currentPoint, ctx, color });
    },
    [color, roomId, isMyTurn] 
  );

  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => {
    const drawHandler = ({ prevPoint, currentPoint, color }) => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      drawLine({ prevPoint, currentPoint, ctx, color });
    };

    const clearHandler = () => {
      clear();
    };

    // --- History Handler ---
    const historyHandler = (history) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        
        // Replay every stroke recorded by server
        history.forEach((stroke) => {
            drawLine({ ...stroke, ctx });
        });
    };

    socket.on("draw-line", drawHandler);
    socket.on("clear", clearHandler);
    socket.on("canvas_history", historyHandler); // <--- Listen for history

    return () => {
      socket.off("draw-line", drawHandler);
      socket.off("clear", clearHandler);
      socket.off("canvas_history", historyHandler);
    };
  }, [clear]); 

  useEffect(() => {
      if(clearTrigger > 0) {
          clear();
      }
  }, [clearTrigger, clear]);

  function drawLine({ prevPoint, currentPoint, ctx, color }) {
    const { x: currX, y: currY } = currentPoint;
    const lineColor = color;
    const lineWidth = 5;

    let startPoint = prevPoint ?? currentPoint;
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(currX, currY);
    ctx.stroke();

    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  return (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
      <canvas
        onMouseDown={isMyTurn ? onMouseDown : null}
        ref={canvasRef}
        width={750}
        height={500}
        className="bg-white rounded border border-secondary"
        style={{ cursor: isMyTurn ? "crosshair" : "not-allowed" }}
      />
    </div>
  );
};

export default Canvas;