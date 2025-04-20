import React, { memo, useCallback } from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface DraggableItemProps {
  id: string;
  index: number;
  isDragDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const DraggableItem: React.FC<DraggableItemProps> = memo(function DraggableItem({
  id,
  index,
  isDragDisabled = false,
  className = '',
  children,
}) {
  // Use a callback for stable identity
  const renderDraggable = useCallback((provided: any, snapshot: any) => {
    return (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{
          ...provided.draggableProps.style,
          // Fix for React 19 and drag-drop issues
          width: snapshot.isDragging ? 'auto' : undefined,
          // Ensure the element doesn't disappear during drag
          opacity: 1,
          zIndex: snapshot.isDragging ? 9999 : 'auto',
          // Prevent flashing/glitching
          transition: snapshot.isDragging ? 'none' : provided.draggableProps.style?.transition,
          // Force GPU acceleration for smoother drags
          transform: provided.draggableProps.style?.transform,
          WebkitTransform: provided.draggableProps.style?.transform,
        }}
        className={`
          p-2 mb-1 rounded border select-none
          ${snapshot.isDragging ? 'shadow-lg bg-blue-50' : 'bg-white'}
          ${isDragDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'}
          ${className}
        `}
        data-id={id}
        data-index={index}
        data-testid={`draggable-item-${id}`}
      >
        {children}
      </div>
    );
  }, [id, index, isDragDisabled, className, children]);

  return (
    <Draggable 
      draggableId={id} 
      index={index} 
      isDragDisabled={isDragDisabled}
    >
      {renderDraggable}
    </Draggable>
  );
});

export default DraggableItem;
