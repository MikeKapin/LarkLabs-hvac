import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ProbePosition } from '../../types';

interface ProbeControllerProps {
  probeType: 'red' | 'black';
  position: ProbePosition;
  onPositionChange: (position: ProbePosition) => void;
  isEnabled?: boolean;
  testPoints?: Array<{ id: string; x: number; y: number; label: string }>;
  className?: string;
}

export const ProbeController: React.FC<ProbeControllerProps> = ({
  probeType,
  position,
  onPositionChange,
  isEnabled = true,
  testPoints = [],
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [connectionIndicator, setConnectionIndicator] = useState<string | null>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle probe dragging start
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isEnabled) return;
    
    e.preventDefault();
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    });

    // Add haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [isEnabled, position]);

  // Handle probe dragging
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !isEnabled) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragOffset.x;
    const newY = clientY - dragOffset.y;
    
    // Check for test point connections
    const nearbyTestPoint = findNearbyTestPoint(newX, newY, testPoints);
    
    const newPosition: ProbePosition = {
      x: newX,
      y: newY,
      connectedTo: nearbyTestPoint?.id || '',
      isConnected: !!nearbyTestPoint
    };
    
    setConnectionIndicator(nearbyTestPoint?.label || null);
    onPositionChange(newPosition);
  }, [isDragging, isEnabled, dragOffset, testPoints, onPositionChange]);

  // Handle probe dragging end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setConnectionIndicator(null);
    
    // Add haptic feedback for connection
    if ('vibrate' in navigator && position.isConnected) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [position.isConnected]);

  // Set up event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
      const handleMouseUp = () => handleDragEnd();
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault(); // Prevent scrolling
        handleDragMove(e);
      };
      const handleTouchEnd = () => handleDragEnd();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  const getProbeStyles = (): React.CSSProperties => ({
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -50%)',
    zIndex: isDragging ? 1000 : 10,
    transition: isDragging ? 'none' : 'all 0.2s ease',
    cursor: isEnabled ? (isDragging ? 'grabbing' : 'grab') : 'not-allowed'
  });

  const getProbeColor = () => {
    if (!isEnabled) return 'bg-gray-400';
    if (position.isConnected) return probeType === 'red' ? 'bg-red-600' : 'bg-gray-800';
    return probeType === 'red' ? 'bg-red-500' : 'bg-gray-700';
  };

  const getWireColor = () => {
    return probeType === 'red' ? 'border-red-500' : 'border-gray-700';
  };

  return (
    <div className={`probe-controller ${className}`} ref={containerRef}>
      {/* Probe Wire */}
      <svg
        className="probe-wire absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      >
        <path
          d={`M 50 50 Q ${position.x} ${position.y - 50} ${position.x} ${position.y}`}
          stroke={probeType === 'red' ? '#dc2626' : '#374151'}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="drop-shadow-sm"
        />
      </svg>

      {/* Probe Tip */}
      <div
        ref={probeRef}
        style={getProbeStyles()}
        className={`probe-tip w-8 h-8 rounded-full border-2 border-gray-900 shadow-lg transition-all duration-200 ${getProbeColor()} ${
          isDragging ? 'scale-110 shadow-2xl' : ''
        } ${isHovering ? 'scale-105' : ''} ${
          position.isConnected ? 'ring-4 ring-yellow-400 ring-opacity-60 animate-pulse' : ''
        }`}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        role="button"
        tabIndex={isEnabled ? 0 : -1}
        aria-label={`${probeType} probe`}
        aria-describedby={`probe-${probeType}-status`}
      >
        {/* Probe Tip Inner Detail */}
        <div className={`absolute inset-1 rounded-full ${
          probeType === 'red' ? 'bg-red-400' : 'bg-gray-600'
        } opacity-60`} />
        
        {/* Connection Indicator */}
        {position.isConnected && (
          <div className="absolute -inset-2 rounded-full bg-yellow-400 opacity-30 animate-ping" />
        )}
        
        {/* Probe Label */}
        <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold ${
          probeType === 'red' ? 'text-red-600' : 'text-gray-700'
        }`}>
          {probeType.toUpperCase()}
        </div>
      </div>

      {/* Connection Status */}
      <div
        id={`probe-${probeType}-status`}
        className="sr-only"
        aria-live="polite"
      >
        {position.isConnected 
          ? `${probeType} probe connected to ${position.connectedTo}`
          : `${probeType} probe not connected`
        }
      </div>

      {/* Connection Indicator Tooltip */}
      {connectionIndicator && isDragging && (
        <div
          className="connection-tooltip absolute bg-black text-white px-2 py-1 rounded text-xs font-semibold pointer-events-none z-20"
          style={{
            left: position.x + 20,
            top: position.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {connectionIndicator}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black" />
        </div>
      )}

      {/* Test Point Indicators */}
      {testPoints.map((testPoint) => (
        <div
          key={testPoint.id}
          className="test-point absolute w-4 h-4 bg-yellow-500 border-2 border-yellow-700 rounded-full"
          style={{
            left: testPoint.x,
            top: testPoint.y,
            transform: 'translate(-50%, -50%)'
          }}
          title={testPoint.label}
        >
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-yellow-700 whitespace-nowrap">
            {testPoint.label}
          </div>
        </div>
      ))}

      {/* Probe Instructions */}
      {!position.isConnected && isEnabled && (
        <div className="probe-instructions absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center text-sm text-gray-600 max-w-xs">
          <p>Drag the {probeType} probe to test points on the circuit</p>
          {testPoints.length === 0 && (
            <p className="text-xs mt-1 text-gray-500">Load a circuit to see available test points</p>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to find nearby test points
function findNearbyTestPoint(
  x: number,
  y: number,
  testPoints: Array<{ id: string; x: number; y: number; label: string }>,
  threshold: number = 30
): { id: string; x: number; y: number; label: string } | null {
  for (const testPoint of testPoints) {
    const distance = Math.sqrt(
      Math.pow(x - testPoint.x, 2) + Math.pow(y - testPoint.y, 2)
    );
    
    if (distance <= threshold) {
      return testPoint;
    }
  }
  
  return null;
}