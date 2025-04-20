import React, { memo, useCallback } from 'react';
import { Droppable } from '@hello-pangea/dnd';

interface DroppableAreaProps {
  id: string;
  type?: string;
  isDropDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const DroppableArea: React.FC<DroppableAreaProps> = memo(function DroppableArea({
  id,
  type,
  isDropDisabled = false,
  className = '',
  children,
}) {
  const isInlineDroppable = className.includes('inline-block');
  
  // Use a callback for rendering to maintain stable identity
  const renderDroppable = useCallback((provided: any, snapshot: any) => {
    return (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        style={{
          // Ensure consistent positioning for drop targets
          position: isInlineDroppable ? 'relative' : undefined,
          // Add minimum height to ensure drop area is visible
          minHeight: !className.includes('min-h') ? '40px' : undefined,
        }}
        className={`
          ${isInlineDroppable ? 'p-1' : 'p-2'} rounded border
          ${snapshot.isDraggingOver ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-300'}
          ${isDropDisabled ? 'opacity-50' : ''}
          ${className}
          ${snapshot.isDraggingOver ? 'z-10' : ''}
        `}
        data-droppable-id={id}
        data-testid={`droppable-area-${id}`}
      >
        {children}
        {provided.placeholder}
      </div>
    );
  }, [id, isInlineDroppable, className, isDropDisabled]);
  
  return (
    <Droppable 
      droppableId={id} 
      type={type} 
      isDropDisabled={isDropDisabled}
    >
      {renderDroppable}
    </Droppable>
  );
});

export default DroppableArea;
