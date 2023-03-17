import { Droppable } from 'react-beautiful-dnd';
import { Box, Card, CardContent } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Trash() {
  return (
    <Box sx={{ position: 'absolute', top: 0, right: 0, height: '3rem', m: 1 }}>
      <Droppable droppableId="trash">
        {(provided) => (
          <div ref={provided.innerRef} style={{ height: '100%' }}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                  bgcolor: '#1d1d1d',
                },
              }}
            >
              <CardContent sx={{ pb: '16px !important', display: 'flex', alignItems: 'center' }}>
                <DeleteIcon />
              </CardContent>
            </Card>
          </div>
        )}
      </Droppable>
    </Box>
  );
}
