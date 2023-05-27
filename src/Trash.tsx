import { Droppable } from 'react-beautiful-dnd';
import { Box, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Trash() {
  return (
    <Droppable droppableId="trash">
      {(provided) => (
        <div ref={provided.innerRef} style={{ height: '24px' }}>
          <DeleteIcon />
        </div>
      )}
    </Droppable>
  );
}
