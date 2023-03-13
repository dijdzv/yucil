import { useState } from 'react';
import {
  Box,
  List as MuiList,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Divider,
} from '@mui/material';
import { Inbox as InboxIcon, Drafts as DraftsIcon } from '@mui/icons-material';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

function List() {
  const [rows, setRows] = useState([
    { name: 'item1', index: 0, order: 0 },
    { name: 'item2', index: 1, order: 1 },
    { name: 'item3', index: 2, order: 2 },
    { name: 'item4', index: 3, order: 3 },
    { name: 'item5', index: 4, order: 4 },
  ]);

  const reorder = (startIndex: number, endIndex: number) => {
    const result = Array.from(rows);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    result.map((row, index) => (row.order = index));
    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const update = reorder(source.index, destination.index);
    setRows(update);
  };

  return (
    <MuiList
      sx={{ width: '100%', maxWidth: '30%', bgcolor: 'background.paper' }}
      subheader={<ListSubheader>Settings</ListSubheader>}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'dndList'}>
          {(provided) => (
            <Box ref={provided.innerRef} {...provided.droppableProps}>
              {rows.map((row, index) => (
                <>
                  <Divider />
                  <Draggable
                    draggableId={row.name}
                    index={index}
                    key={row.name}
                  >
                    {(provided) => (
                      <ListItem
                        disablePadding
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ListItemButton>
                          <ListItemIcon>
                            <InboxIcon />
                          </ListItemIcon>
                          <ListItemText primary={row.name} />
                        </ListItemButton>
                      </ListItem>
                    )}
                  </Draggable>
                </>
              ))}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </MuiList>
  );
}

export default function Lists() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
      <List />
      <List />
    </Box>
  );
}
